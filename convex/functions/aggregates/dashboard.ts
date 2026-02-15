import { internal } from '../../_generated/api';
import { query } from '../../_generated/server';
import type { Disruption, Market } from '../../types';

/** Market summary with computed stats */
export type MarketSummary = Market & {
  activeBookings: number;
  todaySpend: number;
  pendingCount: number;
};

/** Recent audit log entry for dashboard */
export type RecentActivityItem = {
  _id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  createdAt: number;
};

/** Dashboard stats */
export type DashboardStats = {
  activeBookings: number;
  pendingBookings: number;
  todaySpend: number;
  avgRatePerNight: number;
};

export type DashboardData = {
  disruptions: Disruption[];
  stats: DashboardStats;
  markets: MarketSummary[];
  recentActivity: RecentActivityItem[];
};

const ACTIVE_STATUSES = ['confirmed', 'checked_in'];
const PENDING_STATUS = 'pending';

/**
 * Single aggregated query for dashboard - fetches all needed data efficiently.
 * Use with preloadQuery for server-side loading.
 */
export const getDashboard = query({
  args: {},
  handler: async (ctx): Promise<DashboardData> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);

    // 1. Active disruptions (status not resolved)
    const allDisruptions = await ctx.db
      .query('disruptions')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();
    const disruptions = allDisruptions.filter(
      d => !d.status || d.status !== 'resolved'
    );

    // 2. All bookings for org
    const bookings = await ctx.db
      .query('bookings')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();

    // 3. Markets
    const markets = await ctx.db
      .query('markets')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();

    // Compute stats
    const activeBookings = bookings.filter(b =>
      ACTIVE_STATUSES.includes(b.status)
    ).length;
    const pendingBookings = bookings.filter(
      b => b.status === PENDING_STATUS
    ).length;
    const today = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const todayBookings = bookings.filter(
      b =>
        b.checkInDate <= endOfToday.getTime() &&
        b.checkOutDate >= startOfToday.getTime() &&
        b.status !== 'cancelled'
    );
    const todaySpend = todayBookings.reduce(
      (s, b) => s + (b.totalCost ?? 0),
      0
    );
    const bookingsWithRate = bookings.filter(
      b => (b.ratePerRoom ?? 0) > 0 && b.status !== 'cancelled'
    );
    const avgRatePerNight =
      bookingsWithRate.length > 0
        ? Math.round(
            bookingsWithRate.reduce((s, b) => s + (b.ratePerRoom ?? 0), 0) /
              bookingsWithRate.length
          )
        : 0;

    // Market summaries
    const marketMap = new Map(
      markets.map(m => [
        m._id,
        {
          ...m,
          activeBookings: 0,
          todaySpend: 0,
          pendingCount: 0,
        },
      ])
    );
    for (const b of bookings) {
      const sum = marketMap.get(b.marketId);
      if (sum) {
        if (ACTIVE_STATUSES.includes(b.status)) {
          sum.activeBookings += 1;
        }
        if (b.status === PENDING_STATUS) {
          sum.pendingCount += 1;
        }
        if (
          b.checkInDate <= endOfToday.getTime() &&
          b.checkOutDate >= startOfToday.getTime() &&
          b.status !== 'cancelled'
        ) {
          sum.todaySpend += b.totalCost ?? 0;
        }
      }
    }
    const marketSummaries: MarketSummary[] = Array.from(marketMap.values());

    // 4. Recent activity from audit log
    const auditEntries = await ctx.db
      .query('auditLog')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();
    // Sort by creation time desc and take most recent
    auditEntries.sort((a, b) => b._creationTime - a._creationTime);
    const recentActivity: RecentActivityItem[] = auditEntries
      .slice(0, 15)
      .map(e => ({
        _id: e._id,
        action: e.action,
        entityType: e.entityType,
        entityId: e.entityId,
        createdAt: e._creationTime,
      }));

    return {
      disruptions,
      stats: {
        activeBookings,
        pendingBookings,
        todaySpend,
        avgRatePerNight,
      },
      markets: marketSummaries,
      recentActivity,
    };
  },
});

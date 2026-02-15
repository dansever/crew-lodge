import type { Id } from '../../_generated/dataModel';
import { internal } from '../../_generated/api';
import { query } from '../../_generated/server';
import type { CrewMember, Hotel } from '../../types';

/** Single hotel stay for a crew member */
export type CrewMemberStay = {
  bookingId: Id<'bookings'>;
  hotel: Hotel;
  checkInDate: number;
  checkOutDate: number;
  status: string;
  roomNumber?: string;
};

/** Crew member with their current/upcoming hotel stays */
export type CrewMemberWithStays = CrewMember & {
  stays: CrewMemberStay[];
};

/** Overview of all personnel and where they are staying */
export type CrewMembersPageData = {
  crewMembers: CrewMemberWithStays[];
};

/** Statuses for active stays (not cancelled, not past) */
const ACTIVE_BOOKING_STATUSES = ['confirmed', 'checked_in', 'pending'];

/**
 * Page-specific aggregate: crew overview with hotel stays.
 * Cross-table read: crewMembers + bookings + hotels.
 * Use with preloadQuery for server-side loading.
 */
export const getCrewMembersPageData = query({
  args: {},
  handler: async (ctx): Promise<CrewMembersPageData> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayMs = startOfToday.getTime();

    // 1. All crew members
    const crewMembers = await ctx.db
      .query('crewMembers')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();

    // 2. All bookings for org (current + future; exclude old checked-out)
    const allBookings = await ctx.db
      .query('bookings')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();

    const relevantBookings = allBookings.filter(
      b =>
        b.checkOutDate >= startOfTodayMs &&
        ACTIVE_BOOKING_STATUSES.includes(b.status)
    );

    // 3. Hotels for those bookings
    const hotelIds = [...new Set(relevantBookings.map(b => b.hotelId))];
    const hotels = new Map(
      await Promise.all(
        hotelIds.map(async id => {
          const h = await ctx.db.get(id);
          return [id, h] as const;
        })
      )
    );

    // 4. Build crewMemberId -> stays map
    const staysByCrew: Map<Id<'crewMembers'>, CrewMemberStay[]> = new Map();

    for (const b of relevantBookings) {
      const hotel = hotels.get(b.hotelId);
      if (!hotel) continue;

      const crewAssignments = b.crewMembers ?? [];
      for (const ca of crewAssignments) {
        const stay: CrewMemberStay = {
          bookingId: b._id,
          hotel,
          checkInDate: b.checkInDate,
          checkOutDate: b.checkOutDate,
          status: b.status,
          roomNumber: ca.roomNumber,
        };
        const existing = staysByCrew.get(ca.crewMemberId) ?? [];
        existing.push(stay);
        staysByCrew.set(ca.crewMemberId, existing);
      }
    }

    // 5. Assemble crew with stays (sort stays by check-in)
    const crewMembersWithStays: CrewMemberWithStays[] = crewMembers.map(cm => {
      const stays = (staysByCrew.get(cm._id) ?? []).sort(
        (a, b) => a.checkInDate - b.checkInDate
      );
      return { ...cm, stays };
    });

    return { crewMembers: crewMembersWithStays };
  },
});

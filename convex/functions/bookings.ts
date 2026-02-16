import { crud } from 'convex-helpers/server/crud';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { query } from '../_generated/server';
import schema from '../schema';
import type { Booking } from '../types';

export const { create, read, update, destroy } = crud(schema, 'bookings');

export const getBookingById = query({
  args: { id: v.id('bookings') },
  handler: async (ctx, args): Promise<Booking | null> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const booking = await ctx.db.get(args.id);
    if (!booking || booking.orgId !== orgId) {
      return null;
    }
    return booking;
  },
});

/**
 * List bookings for the current user's org
 * Optionally filter by marketId (via hotels in that market)
 */
export const listMyBookings = query({
  handler: async (ctx): Promise<Booking[]> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const bookings = ctx.db
      .query('bookings')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();
    return bookings;
  },
});

/**
 * List bookings for hotels in the given market with check-in dates within [checkInStart, checkInEnd]
 */
export const listMyBookingsByMarketAndDateRange = query({
  args: {
    marketId: v.id('markets'),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args): Promise<Booking[]> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const hotels = await ctx.db
      .query('hotels')
      .withIndex('by_market_id', q => q.eq('marketId', args.marketId))
      .filter(q => q.eq(q.field('orgId'), orgId))
      .collect();
    const hotelIds = new Set(hotels.map(h => h._id));
    if (hotelIds.size === 0) return [];

    const allBookings = await ctx.db
      .query('bookings')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();

    return allBookings.filter(
      b =>
        hotelIds.has(b.hotelId) &&
        b.checkInDate >= args.startDate &&
        b.checkInDate <= args.endDate
    );
  },
});

export type BookingWithDetails = Booking & {
  airportCode: string;
  hotelName: string;
};

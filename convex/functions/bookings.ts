import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { query } from '../_generated/server';
import type { Airport, Booking, Hotel } from '../types';

/**
 * List bookings for the current user's org
 * Optionally filter by marketId
 */
export const listMyBookings = query({
  args: { marketId: v.optional(v.id('markets')) },
  handler: async (ctx, args): Promise<Booking[]> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const q = ctx.db
      .query('bookings')
      .withIndex('by_org_id', q => q.eq('orgId', orgId));
    // Note: by_org_id doesn't include marketId, so we filter in memory if needed
    const bookings = await q.collect();
    if (args.marketId) {
      return bookings.filter(b => b.marketId === args.marketId);
    }
    return bookings;
  },
});

export type BookingWithDetails = Booking & {
  airportCode: string;
  hotelName: string;
};

/**
 * Preload-friendly page payload for bookings.
 */
export const getMyBookingsPage = query({
  args: {},
  handler: async (ctx): Promise<BookingWithDetails[]> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const [bookings, hotels, airports] = await Promise.all([
      ctx.db
        .query('bookings')
        .withIndex('by_org_id', q => q.eq('orgId', orgId))
        .collect(),
      ctx.db
        .query('hotels')
        .withIndex('by_org_id', q => q.eq('orgId', orgId))
        .collect(),
      ctx.db
        .query('airports')
        .withIndex('by_org_id', q => q.eq('orgId', orgId))
        .collect(),
    ]);

    const hotelById = new Map(hotels.map((h: Hotel) => [h._id, h]));
    const airportById = new Map(airports.map((a: Airport) => [a._id, a]));

    return bookings.map(b => {
      const airport = airportById.get(b.airportId);
      const hotel = hotelById.get(b.hotelId);
      return {
        ...b,
        airportCode: airport?.iata ?? airport?.icao ?? airport?.name ?? '-',
        hotelName: hotel?.name ?? 'Unknown Hotel',
      };
    });
  },
});

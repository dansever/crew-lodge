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

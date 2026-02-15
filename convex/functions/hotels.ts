import { crud } from 'convex-helpers/server/crud';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { mutation, query } from '../_generated/server';
import schema from '../schema';
import type { Hotel, HotelId } from '../types';
import { hotelValidator } from '../validators';

export const { create, read, update, destroy } = crud(schema, 'hotels');

/**
 * Get a hotel by ID (must belong to current user's org)
 */
export const getHotelById = query({
  args: { id: v.id('hotels') },
  handler: async (ctx, args): Promise<Hotel | null> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const hotel = await ctx.db.get(args.id);
    if (!hotel || hotel.orgId !== orgId) {
      return null;
    }
    return hotel;
  },
});

/**
 * Get hotels for the given market (for current user's org)
 */
export const listHotelsByMarket = query({
  args: { marketId: v.id('markets') },
  handler: async (ctx, args): Promise<Hotel[]> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    return ctx.db
      .query('hotels')
      .withIndex('by_market_id', q => q.eq('marketId', args.marketId))
      .filter(q => q.eq(q.field('orgId'), orgId))
      .collect();
  },
});

/**
 * List all hotels for the current user's org
 */
export const listMyHotels = query({
  args: {},
  handler: async (ctx): Promise<Hotel[]> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    return ctx.db
      .query('hotels')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();
  },
});

/**
 * Create a hotel for the current user's org
 */
export const createHotel = mutation({
  args: { hotel: hotelValidator },
  handler: async (ctx, args): Promise<HotelId> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const hotel = await ctx.runMutation(internal.functions.hotels.create, {
      ...args.hotel,
      orgId,
      updatedAt: Date.now(),
    });
    return hotel._id;
  },
});

/**
 * Update a hotel
 */
export const updateHotel = mutation({
  args: {
    id: v.id('hotels'),
    hotel: hotelValidator.partial(),
  },
  handler: async (ctx, args): Promise<void> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const existingHotel = await ctx.db.get(args.id);
    if (!existingHotel || existingHotel.orgId !== orgId) {
      throw new Error('Hotel not found or access denied');
    }
    const patch = { ...args.hotel, updatedAt: Date.now() };
    await ctx.db.patch(args.id, patch as Partial<Hotel>);
  },
});

/**
 * Delete a hotel (must belong to current user's org)
 */
export const deleteHotel = mutation({
  args: { id: v.id('hotels') },
  handler: async (ctx, args): Promise<void> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const existingHotel = await ctx.db.get(args.id);
    if (!existingHotel || existingHotel.orgId !== orgId) {
      throw new Error('Hotel not found or access denied');
    }
    await ctx.db.delete(args.id);
  },
});

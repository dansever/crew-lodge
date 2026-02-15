import { crud } from 'convex-helpers/server/crud';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { mutation, query } from '../_generated/server';
import schema from '../schema';
import type { Market, MarketId } from '../types';
import { marketValidator } from '../validators';

export const { create, read, update, destroy } = crud(schema, 'markets');

/**
 * Get a market by ID
 */
export const getMarketById = query({
  args: { id: v.id('markets') },
  handler: async (ctx, args): Promise<Market | null> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const market = await ctx.db.get(args.id);
    if (!market || market.orgId !== orgId) {
      return null;
    }
    return market;
  },
});

/**
 * List all markets for the current user's org
 */
export const listMyMarkets = query({
  args: {},
  handler: async (ctx): Promise<Market[]> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    return ctx.db
      .query('markets')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();
  },
});

/**
 * Create a market for the current user's org
 */
export const createMarket = mutation({
  args: { market: marketValidator },
  handler: async (ctx, args): Promise<MarketId> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const market = await ctx.runMutation(internal.functions.markets.create, {
      ...args.market,
      orgId,
      updatedAt: Date.now(),
    });
    return market._id;
  },
});

/**
 * Update a market
 */
export const updateMarket = mutation({
  args: {
    id: v.id('markets'),
    market: marketValidator.partial(),
  },
  handler: async (ctx, args): Promise<void> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const existingMarket = await ctx.db.get(args.id);
    if (!existingMarket || existingMarket.orgId !== orgId) {
      throw new Error('Market not found or access denied');
    }
    await ctx.db.patch(args.id, {
      ...args.market,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete a market (must belong to current user's org)
 */
export const deleteMarket = mutation({
  args: { id: v.id('markets') },
  handler: async (ctx, args): Promise<void> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const existingMarket = await ctx.db.get(args.id);
    if (!existingMarket || existingMarket.orgId !== orgId) {
      throw new Error('Market not found or access denied');
    }
    await ctx.db.delete(args.id);
  },
});

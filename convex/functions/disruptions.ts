import { crud } from 'convex-helpers/server/crud';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { mutation, query } from '../_generated/server';
import schema from '../schema';
import type { Airport, Disruption, DisruptionId } from '../types';

export const { create, read, update, destroy } = crud(schema, 'disruptions');

export type DisruptionsPageData = {
  disruptions: Disruption[];
  airports: Airport[];
};

/**
 * Get disruptions page data: active disruptions + airports for dropdown.
 * Use with preloadQuery for server-side loading.
 */
export const getDisruptionsPage = query({
  args: {},
  handler: async (ctx): Promise<DisruptionsPageData> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);

    const [disruptions, airports] = await Promise.all([
      ctx.db
        .query('disruptions')
        .withIndex('by_org_id', (q) => q.eq('orgId', orgId))
        .filter((q) =>
          q.or(
            q.eq(q.field('status'), undefined),
            q.neq(q.field('status'), 'resolved')
          )
        )
        .collect(),
      ctx.db
        .query('airports')
        .withIndex('by_org_id', (q) => q.eq('orgId', orgId))
        .collect(),
    ]);

    return { disruptions, airports };
  },
});

/**
 * Create a new disruption for the current user's org
 */
export const createDisruption = mutation({
  args: {
    location: v.string(),
    marketId: v.id('markets'),
    eventType: v.string(),
    crewSize: v.number(),
    nights: v.number(),
    eventReason: v.optional(v.string()),
    eventLocation: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<DisruptionId> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const disruption = await ctx.runMutation(internal.functions.disruptions.create, {
      orgId,
      location: args.location,
      marketId: args.marketId,
      eventType: args.eventType,
      crewSize: args.crewSize,
      nights: args.nights,
      eventReason: args.eventReason,
      eventLocation: args.eventLocation,
      notes: args.notes,
      status: 'open',
      updatedAt: Date.now(),
    });
    return disruption._id;
  },
});

/**
 * List active (unresolved) disruptions for the current user's org
 */
export const listActiveByOrg = query({
  args: {},
  handler: async (ctx): Promise<Disruption[]> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    return ctx.db
      .query('disruptions')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .filter(q =>
        q.or(
          q.eq(q.field('status'), undefined),
          q.neq(q.field('status'), 'resolved')
        )
      )
      .collect();
  },
});

import { crud } from 'convex-helpers/server/crud';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { mutation, query } from '../_generated/server';
import schema from '../schema';
import type { Disruption, DisruptionId } from '../types';
import { disruptionValidator } from '../validators';

export const { create, read, update, destroy } = crud(schema, 'disruptions');

/**
 * Create a new disruption for the current user's org
 */
export const createDisruption = mutation({
  args: { disruption: disruptionValidator },
  handler: async (ctx, args): Promise<DisruptionId> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const disruption = await ctx.runMutation(
      internal.functions.disruptions.create,
      {
        ...args.disruption,
        orgId,
      }
    );
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

/**
 * Get a single disruption by ID (must belong to current user's org)
 */
export const getDisruptionById = query({
  args: { id: v.id('disruptions') },
  handler: async (ctx, args): Promise<Disruption | null> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const disruption = await ctx.db.get(args.id);
    if (!disruption || disruption.orgId !== orgId) {
      return null;
    }
    return disruption;
  },
});

/**
 * List all disruptions for the current user's org, optionally filtered by status
 */
export const listAllByOrg = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args): Promise<Disruption[]> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const disruptions = await ctx.db
      .query('disruptions')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();
    if (args.status !== undefined) {
      return disruptions.filter(d => d.status === args.status);
    }
    return disruptions;
  },
});

/**
 * Update a disruption (must belong to current user's org)
 */
export const updateDisruption = mutation({
  args: {
    id: v.id('disruptions'),
    patch: v.object({
      airportId: v.optional(v.id('airports')),
      location: v.optional(v.string()),
      marketId: v.optional(v.id('markets')),
      eventType: v.optional(v.string()),
      crewSize: v.optional(v.number()),
      nights: v.optional(v.number()),
      status: v.optional(v.string()),
      resolutionType: v.optional(v.string()),
      resolvedAt: v.optional(v.number()),
      notes: v.optional(v.string()),
      eventReason: v.optional(v.string()),
      eventSummary: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args): Promise<void> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.orgId !== orgId) {
      throw new Error('Disruption not found or access denied');
    }
    const patchObj: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, v] of Object.entries(args.patch)) {
      if (v !== undefined) patchObj[k] = v;
    }
    await ctx.db.patch(args.id, patchObj as Partial<Disruption>);
  },
});

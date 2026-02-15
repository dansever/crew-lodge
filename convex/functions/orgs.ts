import { crud } from 'convex-helpers/server/crud';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { internalQuery, mutation, query } from '../_generated/server';
import schema from '../schema';
import { Org, OrgId } from '../types';
import { orgValidator } from '../validators';

// ------------------------------------------------
// -------------- INTERNAL FUNCTIONS --------------
// ------------------------------------------------

export const { create, read, update, destroy } = crud(schema, 'orgs');

/**
 * Get the current user's DB Org ID
 */
export const getMyOrgId = internalQuery({
  args: {},
  handler: async (ctx): Promise<OrgId> => {
    const identity = await ctx.runQuery(
      internal.functions.auth.getAuthInternal
    );
    // get the org id from the clerk org id
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_clerk_org_id', q =>
        q.eq('clerkOrgId', identity.clerkOrgId as string)
      )
      .first();
    if (!org) {
      throw new Error('Org not found for clerk org ID: ' + identity.clerkOrgId);
    }
    return org._id;
  },
});

// ------------------------------------------------
// -------------- PUBLIC FUNCTIONS --------------
// ------------------------------------------------

/**
 * Get an org by ID
 */
export const getOrgById = query({
  args: { orgId: v.id('orgs') },
  handler: async (ctx, args): Promise<Org | null> => {
    const org = await ctx.db.get(args.orgId);
    return org;
  },
});

/**
 * Get the current user's org
 */
export const getMyOrg = query({
  args: {},
  handler: async (ctx): Promise<Org | null> => {
    const identity = await ctx.runQuery(
      internal.functions.auth.getAuthInternal
    );
    const clerkOrgId = identity.clerkOrgId as string;
    if (!clerkOrgId) {
      throw new Error('Clerk org ID not found in auth identity');
    }
    const org = await ctx.db
      .query('orgs')
      .withIndex('by_clerk_org_id', q => q.eq('clerkOrgId', clerkOrgId))
      .first();
    if (!org) {
      throw new Error('Org not found for clerk org ID: ' + clerkOrgId);
    }
    return org;
  },
});

/**
 * Create a new org
 */
export const createOrg = mutation({
  args: { org: orgValidator },
  handler: async (ctx, args): Promise<OrgId> => {
    const identity = await ctx.runQuery(
      internal.functions.auth.getAuthInternal
    );
    const clerkOrgId = identity.clerkOrgId as string;
    if (!clerkOrgId) {
      throw new Error('Clerk org ID not found in auth identity');
    }
    args.org.clerkOrgId = clerkOrgId;
    const org = await ctx.runMutation(internal.functions.orgs.create, args.org);
    return org._id;
  },
});

/**
 * Update an org
 */
export const updateOrg = mutation({
  args: { orgId: v.id('orgs'), patch: orgValidator.partial() },
  handler: async (ctx, args): Promise<void> => {
    await ctx.runMutation(internal.functions.orgs.update, {
      id: args.orgId,
      patch: args.patch,
    });
  },
});

/**
 * Delete an org
 */
export const deleteOrg = mutation({
  args: { orgId: v.id('orgs') },
  handler: async (ctx, args): Promise<void> => {
    // delete all users in this org
    await ctx.runMutation(internal.functions.users.deleteAllUsersByOrgId, {
      orgId: args.orgId,
    });
    // delete the org
    await ctx.runMutation(internal.functions.orgs.destroy, {
      id: args.orgId,
    });
  },
});

/**
 * Update org token usage
 * Increments the org's tokensUsed field by the provided amount
 */
export const updateOrgTokens = mutation({
  args: { tokensUsed: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('User not authenticated');
    }
    const dbOrgId = identity.dbOrgId;
    const org = await ctx.runQuery(internal.functions.orgs.read, {
      id: dbOrgId as OrgId,
    });
    const currentTokensUsed = org?.tokensUsed || 0;
    const updatedTokensUsed = currentTokensUsed + args.tokensUsed;
    await ctx.runMutation(internal.functions.orgs.update, {
      id: dbOrgId as OrgId,
      patch: { tokensUsed: updatedTokensUsed },
    });
    console.log('Org token usage updated');
  },
});

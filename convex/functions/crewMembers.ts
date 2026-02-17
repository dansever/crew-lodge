import { crud } from 'convex-helpers/server/crud';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { mutation, query } from '../_generated/server';
import schema from '../schema';
import type { CrewMember, CrewMemberId } from '../types';
import { crewMemberValidator } from '../validators';

export const { create, read, update, destroy } = crud(schema, 'crewMembers');

/**
 * Get a crew member by ID (must belong to current user's org)
 */
export const getCrewMemberById = query({
  args: { id: v.id('crewMembers') },
  handler: async (ctx, args): Promise<CrewMember | null> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const crewMember = await ctx.db.get(args.id);
    if (!crewMember || crewMember.orgId !== orgId) {
      return null;
    }
    return crewMember;
  },
});

/**
 * List all crew members for the current user's org
 */
export const listMyCrewMembers = query({
  args: {},
  handler: async (ctx): Promise<CrewMember[]> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    return ctx.db
      .query('crewMembers')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();
  },
});

/**
 * Create a crew member for the current user's org
 */
export const createCrewMember = mutation({
  args: { crewMember: crewMemberValidator },
  handler: async (ctx, args): Promise<CrewMemberId> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const crewMember = await ctx.runMutation(
      internal.functions.crewMembers.create,
      {
        ...args.crewMember,
        orgId,
        updatedAt: Date.now(),
      }
    );
    return crewMember._id;
  },
});

/**
 * Update a crew member (must belong to current user's org)
 */
export const updateCrewMember = mutation({
  args: {
    id: v.id('crewMembers'),
    crewMember: crewMemberValidator.partial(),
  },
  handler: async (ctx, args): Promise<void> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.orgId !== orgId) {
      throw new Error('Crew member not found or access denied');
    }
    const patch = { ...args.crewMember, updatedAt: Date.now() };
    await ctx.db.patch(args.id, patch as Partial<CrewMember>);
  },
});

/**
 * Delete a crew member (must belong to current user's org)
 */
export const deleteCrewMember = mutation({
  args: { id: v.id('crewMembers') },
  handler: async (ctx, args): Promise<void> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.orgId !== orgId) {
      throw new Error('Crew member not found or access denied');
    }
    await ctx.db.delete(args.id);
  },
});

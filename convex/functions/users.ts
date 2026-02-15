import { logger } from '@/utils/logger';
import { crud } from 'convex-helpers/server/crud';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from '../_generated/server';
import schema from '../schema';
import { User, UserId } from '../types';
import { userValidator } from '../validators';

// ------------------------------------------------
// -------------- INTERNAL FUNCTIONS --------------
// ------------------------------------------------

export const { create, read, update, destroy } = crud(schema, 'users');

// Get a user by Clerk user ID
export const getUserByClerkUserId = internalQuery({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', q => q.eq('clerkUserId', args.clerkUserId))
      .first();
    return user;
  },
});

// Delete all users by org ID
export const deleteAllUsersByOrgId = internalMutation({
  args: { orgId: v.id('orgs') },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query('users')
      .withIndex('by_org_id', q => q.eq('orgId', args.orgId))
      .collect();
    logger.info(`Deleting ${users.length} users for org: ${args.orgId}:`);
    for await (const user of users) {
      logger.info(`Deleting user: ${user.firstName} ${user.lastName}`, {
        userId: user._id,
      });
      await ctx.runMutation(internal.functions.users.destroy, {
        id: user._id,
      });
    }
  },
});

//
// ------------------------------------------------
// -------------- PUBLIC FUNCTIONS --------------
// ------------------------------------------------

/**
 * Get a user by ID
 */
export const getUserById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args): Promise<User | null> => {
    const user = await ctx.runQuery(internal.functions.users.read, {
      id: args.userId,
    });
    return user;
  },
});

/**
 * Get the current user
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx): Promise<User | null> => {
    const identity = await ctx.runQuery(
      internal.functions.auth.getAuthInternal
    );
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', q => q.eq('clerkUserId', identity.subject))
      .first();
    return user;
  },
});

/**
 * Create a new user
 */
export const createUser = mutation({
  args: { user: userValidator },
  handler: async (ctx, args): Promise<UserId> => {
    const user = await ctx.runMutation(
      internal.functions.users.create,
      args.user
    );
    return user._id;
  },
});

/**
 * Update a user
 * @param userId - The ID of the user to update
 * @param patch - The patch to apply to the user
 */
export const updateUser = mutation({
  args: { id: v.id('users'), patch: userValidator.partial() },
  handler: async (ctx, args): Promise<void> => {
    await ctx.runMutation(internal.functions.users.update, {
      id: args.id,
      patch: args.patch,
    });
  },
});

/**
 * Delete a user
 */
export const deleteUser = mutation({
  args: { id: v.id('users') },
  handler: async (ctx, args): Promise<void> => {
    await ctx.runMutation(internal.functions.users.destroy, {
      id: args.id,
    });
  },
});

/**
 * Update user token usage
 * Increments the user's tokensUsed field by the provided amount
 */
export const updateUserTokens = mutation({
  args: { tokensUsed: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('User not authenticated');
    }

    const clerkUserId = identity.subject;
    const user = await ctx.runQuery(
      internal.functions.users.getUserByClerkUserId,
      {
        clerkUserId,
      }
    );

    if (!user) {
      throw new Error('User not found');
    }

    const currentTokensUsed = user.tokensUsed || 0;
    const updatedTokensUsed = currentTokensUsed + args.tokensUsed;
    await ctx.runMutation(internal.functions.users.update, {
      id: user._id,
      patch: { tokensUsed: updatedTokensUsed },
    });
    console.log('User token usage updated');
  },
});

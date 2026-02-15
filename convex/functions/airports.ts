import { crud } from 'convex-helpers/server/crud';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { mutation, query } from '../_generated/server';
import schema from '../schema';
import type { Airport, AirportId, OrgId } from '../types';
import { airportValidator } from '../validators';

export const { create, read, update, destroy } = crud(schema, 'airports');

/**
 * Get an airport by ID (must belong to current user's org)
 * @param id - The ID of the airport
 * @returns The airport or null if not found
 */
export const getAirportById = query({
  args: { id: v.id('airports') },
  handler: async (ctx, args): Promise<Airport | null> => {
    const identity = await ctx.runQuery(
      internal.functions.auth.getAuthInternal
    );
    const orgId = identity.dbOrgId as OrgId;
    const airport = await ctx.db.get(args.id);
    if (!airport || airport.orgId !== orgId) {
      return null;
    }
    return airport;
  },
});

/**
 * List all airports for the current user's org
 * @returns The list of airports
 */
export const listMyAirports = query({
  args: {},
  handler: async (ctx): Promise<Airport[]> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);

    const airports = await ctx.db
      .query('airports')
      .withIndex('by_org_id', q => q.eq('orgId', orgId))
      .collect();

    return airports;
  },
});

/**
 * Create an airport for the current user's org
 * @param airport - The airport to create (orgId is overwritten from auth)
 * @returns The created airport ID
 */
export const createAirport = mutation({
  args: { airport: airportValidator },
  handler: async (ctx, args): Promise<AirportId> => {
    const orgId = await ctx.runQuery(internal.functions.orgs.getMyOrgId);
    const airport = await ctx.runMutation(internal.functions.airports.create, {
      ...args.airport,
      orgId,
    });
    return airport._id;
  },
});

/**
 * Update an airport
 * @param id - The ID of the airport
 * @param airport - Partial airport fields to update
 */
export const updateAirport = mutation({
  args: {
    id: v.id('airports'),
    airport: airportValidator.partial(),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.runQuery(
      internal.functions.auth.getAuthInternal
    );
    const orgId = identity.dbOrgId as OrgId;
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.orgId !== orgId) {
      throw new Error('Airport not found or access denied');
    }
    const patch = { ...args.airport, updatedAt: Date.now() };
    await ctx.db.patch(args.id, patch);
  },
});

/**
 * Delete an airport (must belong to current user's org)
 * @param id - The ID of the airport
 */
export const deleteAirport = mutation({
  args: { id: v.id('airports') },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.runQuery(
      internal.functions.auth.getAuthInternal
    );
    const orgId = identity.dbOrgId as OrgId;
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.orgId !== orgId) {
      throw new Error('Airport not found or access denied');
    }
    await ctx.db.delete(args.id);
  },
});

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { updatedAtValidator } from './common';

/* -------------------- Airports -------------------- */
export const airports = defineTable({
  orgId: v.id('orgs'),
  marketId: v.id('markets'),

  // Airport identifiers
  name: v.string(),
  icao: v.optional(v.string()),
  iata: v.optional(v.string()),

  // location
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  country: v.string(),

  updatedAt: updatedAtValidator,
})
  .index('by_org_id', ['orgId'])
  .index('by_market_id', ['marketId'])
  .index('by_city_state_country', ['city', 'state', 'country']);

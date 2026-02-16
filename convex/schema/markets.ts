import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { updatedAtValidator } from './common';

/* -------------------- Markets -------------------- */
export const markets = defineTable({
  orgId: v.id('orgs'),

  // basic info
  name: v.string(), // "New York Metro", "Chicago", "Los Angeles"
  country: v.string(), // "USA", "UK", "Canada"
  isActive: v.boolean(), // Can deactivate markets airline no longer serves
  updatedAt: updatedAtValidator,
})
  .index('by_org_id', ['orgId'])
  .index('by_country', ['orgId', 'country'])
  .index('by_active', ['orgId', 'isActive']);

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { updatedAtValidator } from './common';

/* -------------------- Organizations -------------------- */
export const orgs = defineTable({
  // identifiers
  clerkOrgId: v.string(),
  // data
  name: v.string(),
  // subscription
  subscriptionTier: v.optional(v.string()),
  subscriptionStatus: v.optional(v.string()),
  // settings
  defaultCurrency: v.optional(v.string()),
  timezone: v.optional(v.string()),

  // AI policy configuration
  aiSettings: v.optional(v.any()), // Policy thresholds, auto-approval limits

  // usage metrics
  tokensUsed: v.optional(v.number()),
  pagesProcessed: v.optional(v.number()),
  filesUploaded: v.optional(v.number()),
  // timestamp
  updatedAt: updatedAtValidator,
}).index('by_clerk_org_id', ['clerkOrgId']);

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { updatedAtValidator } from './common';

export const users = defineTable({
  // identifiers
  clerkUserId: v.string(),
  orgId: v.id('orgs'),
  // data
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  position: v.optional(v.string()),
  // role & permissions
  role: v.optional(v.string()),
  department: v.optional(v.string()),
  // status
  isActive: v.optional(v.boolean()),
  onboardingComplete: v.optional(v.boolean()),
  lastLoginAt: v.optional(v.number()),
  // usage metrics
  tokensUsed: v.optional(v.number()),

  // AI personalization
  preferences: v.optional(v.any()), // UI settings, notification preferences

  // timestamp
  updatedAt: updatedAtValidator,
})
  .index('by_org_id', ['orgId'])
  .index('by_clerk_user_id', ['clerkUserId'])
  .index('by_email', ['email']);

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { addressValidator, updatedAtValidator } from './common';

/* -------------------- Hotels -------------------- */
export const hotels = defineTable({
  orgId: v.id('orgs'),
  marketId: v.id('markets'),

  // basic info
  name: v.string(),
  chain: v.optional(v.string()),
  address: addressValidator,
  fullAddress: v.optional(v.string()),
  googleMapsPlaceId: v.optional(v.string()),

  // contact info
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  website: v.optional(v.string()),
  contactPerson: v.optional(v.string()),
  bookingEmail: v.optional(v.string()),

  // hotel details
  slaCompliance: v.optional(v.number()), // SLA compliance percentage
  ytdNights: v.optional(v.number()), // YTD nights
  ytdSpend: v.optional(v.number()), // YTD spend
  isActive: v.optional(v.boolean()), // Whether the hotel is active
  notes: v.optional(v.string()), // Notes about the hotel
  isPreferred: v.optional(v.boolean()), // Whether the hotel is preferred

  // timestamp
  updatedAt: updatedAtValidator,
})
  .index('by_org_id', ['orgId'])
  .index('by_market_id', ['marketId'])
  .index('by_is_active', ['isActive']);

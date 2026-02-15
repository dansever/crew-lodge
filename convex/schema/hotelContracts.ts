import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { updatedAtValidator } from './common';

/* -------------------- Hotel Contracts -------------------- */
export const hotelContracts = defineTable({
  // identifiers
  orgId: v.id('orgs'),
  hotelId: v.id('hotels'),
  documentId: v.optional(v.id('documents')), // Link to the original contract document

  // contract details
  contractNumber: v.optional(v.string()),
  contractType: v.optional(v.string()),
  // dates
  effectiveFrom: v.number(),
  effectiveTo: v.number(),
  autoRenew: v.optional(v.boolean()),
  noticePeriodDays: v.optional(v.number()),
  // rates
  baseRateSingle: v.optional(v.number()),
  baseRateDouble: v.optional(v.number()),
  currency: v.optional(v.string()),
  // capacity
  guaranteedRooms: v.optional(v.number()),
  blockRooms: v.optional(v.number()),
  maxRoomsPerNight: v.optional(v.number()),

  // AI fields
  summary: v.optional(v.string()), // AI-generated summary of key terms

  // terms
  cancellationPolicy: v.optional(v.string()),
  paymentTerms: v.optional(v.string()),
  // status
  status: v.string(),
  notes: v.optional(v.string()),
  // timestamp
  updatedAt: updatedAtValidator,
})
  .index('by_org_id', ['orgId'])
  .index('by_org_hotel', ['orgId', 'hotelId'])
  .index('by_hotel_id', ['hotelId'])
  .index('by_status', ['status']);

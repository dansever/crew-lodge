import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { updatedAtValidator } from './common';

/* -------------------- Disruptions -------------------- */
export const disruptions = defineTable({
  // identifiers
  orgId: v.id('orgs'),
  // data
  // flight info
  airportId: v.optional(v.id('airports')),
  location: v.optional(v.string()), // legacy; prefer airportId
  marketId: v.id('markets'),
  // disruption details
  eventType: v.string(),
  eventReason: v.optional(v.string()),
  eventSummary: v.optional(v.string()),
  // crew
  crewSize: v.number(),
  nights: v.number(),
  // resolution
  status: v.optional(v.string()),
  resolutionType: v.optional(v.string()),
  resolvedAt: v.optional(v.number()),

  // AI insights
  weatherSummary: v.optional(v.string()), // Weather at time of disruption
  aiAnalysis: v.optional(v.any()), // Structured analysis of the situation
  recommendedHotels: v.optional(v.array(v.id('hotels'))), // AI-ranked suggestions

  notes: v.optional(v.string()),
  updatedAt: updatedAtValidator,
})
  .index('by_org_id', ['orgId'])
  .index('by_airport_id', ['airportId'])
  .index('by_status', ['status']);

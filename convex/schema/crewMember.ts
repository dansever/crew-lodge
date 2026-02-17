import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { updatedAtValidator } from './common';

/* -------------------- Crew Members -------------------- */
export const crewMembers = defineTable({
  // identifiers
  orgId: v.id('orgs'),

  // data
  name: v.string(),
  passportNumber: v.optional(v.string()),
  seniorityCode: v.optional(v.string()),
  position: v.optional(v.string()), // captain, first_officer, flight_attendant
  phone: v.optional(v.string()),
  email: v.optional(v.string()),

  // AI personalization
  preferences: v.optional(v.any()), // JSON of dietary, room, and travel preferences

  updatedAt: updatedAtValidator,
})
  .index('by_org_id', ['orgId'])
  .index('by_email', ['email'])
  .index('by_passport_number', ['passportNumber']);

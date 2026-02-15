import { v } from 'convex/values';

// ========================================================================
// Common Field Structures
// ========================================================================

// -------------------- Last Updated Validator --------------------
export const updatedAtValidator = v.optional(v.number());

// -------------------- Attributes Validator --------------------
// Example: { attributes: { name: "John Doe", age: 30 } } */
export const attributesValidator = v.object({
  attributes: v.optional(v.array(v.record(v.string(), v.any()))),
});

// -------------------- Booking crew assignment --------------------
// References crewMembers table; stores only booking-specific fields
export const bookingCrewAssignmentValidator = v.object({
  crewMemberId: v.id('crewMembers'),
  roomNumber: v.optional(v.string()),
  checkedInAt: v.optional(v.number()),
  checkedOutAt: v.optional(v.number()),
  specialRequirements: v.optional(v.string()),
});

export const addressValidator = v.object({
  street: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  country: v.string(),
});

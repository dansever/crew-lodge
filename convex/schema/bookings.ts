import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { bookingCrewAssignmentValidator, updatedAtValidator } from './common';

/* -------------------- Bookings -------------------- */
export const bookings = defineTable({
  orgId: v.id('orgs'),

  // References
  marketId: v.id('markets'),
  airportId: v.id('airports'), // Which airport the crew is at
  hotelId: v.id('hotels'),

  // data
  confirmationNumber: v.optional(v.string()),
  bookingType: v.optional(v.string()),
  bookingSource: v.optional(v.string()),
  checkInDate: v.number(),
  checkOutDate: v.number(),
  nights: v.optional(v.number()),
  roomsBooked: v.number(),
  roomType: v.optional(v.string()),
  // crew
  crewSize: v.number(),
  crewMembers: v.optional(v.array(bookingCrewAssignmentValidator)),
  crewType: v.optional(v.string()),
  flightNumber: v.optional(v.string()),
  // financial
  ratePerRoom: v.optional(v.number()),
  totalCost: v.optional(v.number()),
  currency: v.optional(v.string()),

  // AI reasoning for this booking choice
  aiReasoning: v.optional(v.string()), // Explanation of why this hotel was selected

  // status
  status: v.string(),
  confirmedAt: v.optional(v.number()),
  cancelledAt: v.optional(v.number()),
  cancellationReason: v.optional(v.string()),
  // payment
  paymentStatus: v.optional(v.string()),
  invoiceNumber: v.optional(v.string()),
  invoiceDocumentId: v.optional(v.id('documents')), // Scanned invoice
  paidAt: v.optional(v.number()),
  // special requests
  specialRequests: v.optional(v.string()),
  requiresShuttle: v.optional(v.boolean()),
  requiresLateCheckout: v.optional(v.boolean()),
  // relations
  createdBy: v.optional(v.id('users')),
  disruptionId: v.optional(v.id('disruptions')),
  notes: v.optional(v.string()),
  // timestamp
  updatedAt: updatedAtValidator,
})
  .index('by_org_id', ['orgId'])
  .index('by_hotel_id', ['hotelId'])
  .index('by_dates', ['checkInDate', 'checkOutDate'])
  .index('by_status', ['status'])
  .index('by_flight_number', ['flightNumber'])
  .index('by_updated_at', ['updatedAt']);

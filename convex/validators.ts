// convex/validators.ts

import schema from './schema';

export const orgValidator = schema.tables.orgs.validator;
export const userValidator = schema.tables.users.validator;
export const hotelValidator = schema.tables.hotels.validator;
export const airportValidator = schema.tables.airports.validator;
export const crewMemberValidator = schema.tables.crewMembers.validator;
export const hotelContractValidator = schema.tables.hotelContracts.validator;
export const bookingValidator = schema.tables.bookings.validator;
export const disruptionValidator = schema.tables.disruptions.validator;
export const auditLogValidator = schema.tables.auditLog.validator;
export const marketValidator = schema.tables.markets.validator;

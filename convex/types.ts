// convex/types.ts

import { WithoutSystemFields } from 'convex/server';
import { Doc, Id, TableNames } from './_generated/dataModel';

type DocOf<T extends TableNames> = Doc<T>;
type IdOf<T extends TableNames> = Id<T>;
type NewDocOf<T extends TableNames> = WithoutSystemFields<Doc<T>>;
type UpdateDocOf<T extends TableNames> = Partial<NewDocOf<T>>;

// Orgs
export type Org = DocOf<'orgs'>;
export type OrgId = IdOf<'orgs'>;
export type NewOrg = NewDocOf<'orgs'>;
export type UpdateOrg = UpdateDocOf<'orgs'>;

// Users
export type User = DocOf<'users'>;
export type UserId = IdOf<'users'>;
export type NewUser = NewDocOf<'users'>;
export type UpdateUser = UpdateDocOf<'users'>;

// Hotels
export type Hotel = DocOf<'hotels'>;
export type HotelId = IdOf<'hotels'>;
export type NewHotel = NewDocOf<'hotels'>;
export type UpdateHotel = UpdateDocOf<'hotels'>;

// Airports
export type Airport = DocOf<'airports'>;
export type AirportId = IdOf<'airports'>;
export type NewAirport = NewDocOf<'airports'>;
export type UpdateAirport = UpdateDocOf<'airports'>;

// Crew Members
export type CrewMember = DocOf<'crewMembers'>;
export type CrewMemberId = IdOf<'crewMembers'>;
export type NewCrewMember = NewDocOf<'crewMembers'>;
export type UpdateCrewMember = UpdateDocOf<'crewMembers'>;

// Markets
export type Market = DocOf<'markets'>;
export type MarketId = IdOf<'markets'>;
export type NewMarket = NewDocOf<'markets'>;
export type UpdateMarket = UpdateDocOf<'markets'>;

// Hotel Contracts
export type HotelContract = DocOf<'hotelContracts'>;
export type HotelContractId = IdOf<'hotelContracts'>;
export type NewHotelContract = NewDocOf<'hotelContracts'>;
export type UpdateHotelContract = UpdateDocOf<'hotelContracts'>;

// Bookings
export type Booking = DocOf<'bookings'>;
export type BookingId = IdOf<'bookings'>;
export type NewBooking = NewDocOf<'bookings'>;
export type UpdateBooking = UpdateDocOf<'bookings'>;

// Disruptions
export type Disruption = DocOf<'disruptions'>;
export type DisruptionId = IdOf<'disruptions'>;
export type NewDisruption = NewDocOf<'disruptions'>;
export type UpdateDisruption = UpdateDocOf<'disruptions'>;

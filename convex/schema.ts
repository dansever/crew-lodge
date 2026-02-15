import { defineSchema } from 'convex/server';
import { airports } from './schema/airports';
import { auditLog } from './schema/auditLog';
import { bookings } from './schema/bookings';
import { crewMembers } from './schema/crewMember';
import { disruptions } from './schema/disruptions';
import { documents } from './schema/documents';
import { hotelContracts } from './schema/hotelContracts';
import { hotels } from './schema/hotels';
import { markets } from './schema/markets';
import { orgs } from './schema/orgs';
import { users } from './schema/users';

export default defineSchema(
  {
    orgs,
    users,
    hotels,
    airports,
    crewMembers,
    hotelContracts,
    bookings,
    disruptions,
    auditLog,
    documents,
    markets,
  },
  {
    schemaValidation: false,
  }
);

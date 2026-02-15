/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_aggregates_dashboard from "../functions/aggregates/dashboard.js";
import type * as functions_aggregates_disruptionsPage from "../functions/aggregates/disruptionsPage.js";
import type * as functions_airports from "../functions/airports.js";
import type * as functions_auth from "../functions/auth.js";
import type * as functions_bookings from "../functions/bookings.js";
import type * as functions_disruptions from "../functions/disruptions.js";
import type * as functions_hotels from "../functions/hotels.js";
import type * as functions_markets from "../functions/markets.js";
import type * as functions_orgs from "../functions/orgs.js";
import type * as functions_users from "../functions/users.js";
import type * as schema_airports from "../schema/airports.js";
import type * as schema_auditLog from "../schema/auditLog.js";
import type * as schema_bookings from "../schema/bookings.js";
import type * as schema_common from "../schema/common.js";
import type * as schema_crewMember from "../schema/crewMember.js";
import type * as schema_disruptions from "../schema/disruptions.js";
import type * as schema_documents from "../schema/documents.js";
import type * as schema_hotelContracts from "../schema/hotelContracts.js";
import type * as schema_hotels from "../schema/hotels.js";
import type * as schema_markets from "../schema/markets.js";
import type * as schema_orgs from "../schema/orgs.js";
import type * as schema_users from "../schema/users.js";
import type * as types from "../types.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "functions/aggregates/dashboard": typeof functions_aggregates_dashboard;
  "functions/aggregates/disruptionsPage": typeof functions_aggregates_disruptionsPage;
  "functions/airports": typeof functions_airports;
  "functions/auth": typeof functions_auth;
  "functions/bookings": typeof functions_bookings;
  "functions/disruptions": typeof functions_disruptions;
  "functions/hotels": typeof functions_hotels;
  "functions/markets": typeof functions_markets;
  "functions/orgs": typeof functions_orgs;
  "functions/users": typeof functions_users;
  "schema/airports": typeof schema_airports;
  "schema/auditLog": typeof schema_auditLog;
  "schema/bookings": typeof schema_bookings;
  "schema/common": typeof schema_common;
  "schema/crewMember": typeof schema_crewMember;
  "schema/disruptions": typeof schema_disruptions;
  "schema/documents": typeof schema_documents;
  "schema/hotelContracts": typeof schema_hotelContracts;
  "schema/hotels": typeof schema_hotels;
  "schema/markets": typeof schema_markets;
  "schema/orgs": typeof schema_orgs;
  "schema/users": typeof schema_users;
  types: typeof types;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

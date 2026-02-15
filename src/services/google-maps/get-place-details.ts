/**
 * Google Place Details service.
 * Calls the Places API (New) REST endpoint for server-side place details.
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/place-details
 */

import { serverEnv } from '@/lib/env/server';

/** Commonly used fields for place details. Add more as needed. */
const DEFAULT_FIELD_MASK = [
  'id',
  'name',
  'displayName',
  'formattedAddress',
  'location',
  'googleMapsUri',
  'types',
  'viewport',
  'nationalPhoneNumber',
  'internationalPhoneNumber',
  'websiteUri',
  'rating',
  'userRatingCount',
  'businessStatus',
].join(',');

/** Options for place details requests */
export interface GetPlaceDetailsOptions {
  /** Fields to return (comma-separated). Omit to use default field mask. */
  fields?: string;
  /** Preferred language (IETF BCP-47). Default: en */
  languageCode?: string;
  /** Region code for response formatting (e.g. us, uk). */
  regionCode?: string;
  /** Session token from Autocomplete session for billing optimization. */
  sessionToken?: string;
}

/** Localized text from the API */
export interface LocalizedText {
  text: string;
  languageCode?: string;
}

/** Lat/lng coordinates */
export interface LatLng {
  latitude: number;
  longitude: number;
}

/** Place details returned from the API */
export interface PlaceDetails {
  id: string;
  name: string;
  displayName?: LocalizedText;
  formattedAddress?: string;
  location?: LatLng;
  googleMapsUri?: string;
  types?: string[];
  viewport?: {
    low?: LatLng;
    high?: LatLng;
  };
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  /** Additional fields from the API (when using custom field mask) */
  [key: string]: unknown;
}

const PLACES_BASE = 'https://places.googleapis.com/v1/places';

/**
 * Fetches full place details by place ID using the Places API (New) Web Service.
 * Use this from server-side code or API routes—keeps the API key secure.
 *
 * @param placeId - Place ID from Autocomplete, Text Search, or Geocoding (e.g. ChIJj61dQgK6j4AR4GeTYWZsKWw)
 * @param options - Optional field mask, language, region, session token
 * @returns Place details object with requested fields
 */
export async function getPlaceDetails(
  placeId: string,
  options: GetPlaceDetailsOptions = {},
): Promise<PlaceDetails> {
  const trimmed = placeId.trim();
  if (!trimmed) {
    throw new Error('placeId is required');
  }

  const {
    fields = DEFAULT_FIELD_MASK,
    languageCode = 'en',
    regionCode,
    sessionToken,
  } = options;

  const url = new URL(`${PLACES_BASE}/${encodeURIComponent(trimmed)}`);
  if (languageCode) url.searchParams.set('languageCode', languageCode);
  if (regionCode) url.searchParams.set('regionCode', regionCode);
  if (sessionToken) url.searchParams.set('sessionToken', sessionToken);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': serverEnv.GOOGLE_MAPS_PLATFORM_API_KEY,
      'X-Goog-FieldMask': fields,
    },
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(
      `Place Details API error ${response.status}: ${errBody}`,
    );
  }

  const data = (await response.json()) as PlaceDetails;
  return data;
}

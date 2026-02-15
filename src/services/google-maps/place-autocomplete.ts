/**
 * Google Places Autocomplete service.
 * Calls the Places API (New) REST endpoint for server-side place predictions.
 */

import { serverEnv } from '@/lib/env/server';

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';

/** Place prediction from the Autocomplete API */
export interface PlacePrediction {
  placeId: string;
  place: string;
  text: string;
  mainText?: string;
  secondaryText?: string;
}

/** Options for autocomplete requests */
export interface PlaceAutocompleteOptions {
  languageCode?: string;
  regionCode?: string;
  sessionToken?: string;
  includedRegionCodes?: string[];
  locationBias?: {
    circle?: {
      center: { latitude: number; longitude: number };
      radius: number;
    };
    rectangle?: {
      low: { latitude: number; longitude: number };
      high: { latitude: number; longitude: number };
    };
  };
  includeQueryPredictions?: boolean;
}

/** Raw API response types */
interface FormattableText {
  text: string;
  matches?: { startOffset: number; endOffset: number }[];
}

interface RawPlacePrediction {
  place?: string;
  placeId?: string;
  text?: FormattableText;
  structuredFormat?: {
    mainText?: FormattableText;
    secondaryText?: FormattableText;
  };
  types?: string[];
  distanceMeters?: number;
}

interface RawQueryPrediction {
  text?: FormattableText;
  structuredFormat?: {
    mainText?: FormattableText;
    secondaryText?: FormattableText;
  };
}

interface RawSuggestion {
  placePrediction?: RawPlacePrediction;
  queryPrediction?: RawQueryPrediction;
}

interface AutocompleteApiResponse {
  suggestions?: RawSuggestion[];
}

/**
 * Fetches place autocomplete suggestions from the Google Places API (New).
 * Use this from server-side code or API routes—keeps the API key secure.
 *
 * @param input - Search string (e.g. user-typed query)
 * @param options - Optional language, region, session token, location bias, etc.
 * @returns Array of place predictions suitable for autocomplete UI
 */
export async function fetchPlaceAutocomplete(
  input: string,
  options: PlaceAutocompleteOptions = {}
): Promise<PlacePrediction[]> {
  const trimmed = input.trim();
  if (!trimmed) {
    return [];
  }

  const {
    languageCode = 'en-US',
    regionCode = 'us',
    sessionToken,
    includedRegionCodes,
    locationBias,
    includeQueryPredictions = false,
  } = options;

  const body: Record<string, unknown> = {
    input: trimmed,
    languageCode,
    regionCode,
    includeQueryPredictions,
  };

  if (sessionToken) {
    body.sessionToken = sessionToken;
  }
  if (includedRegionCodes?.length) {
    body.includedRegionCodes = includedRegionCodes;
  }
  if (locationBias) {
    body.locationBias = locationBias;
  }

  const response = await fetch(AUTOCOMPLETE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': serverEnv.GOOGLE_MAPS_PLATFORM_API_KEY,
      'X-Goog-FieldMask':
        'suggestions.placePrediction(placeId,place,text,structuredFormat)',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(
      `Places Autocomplete API error ${response.status}: ${errBody}`
    );
  }

  const data = (await response.json()) as AutocompleteApiResponse;
  const suggestions = data.suggestions ?? [];

  const results: PlacePrediction[] = [];

  for (const suggestion of suggestions) {
    const pp = suggestion.placePrediction;
    if (!pp) continue;

    const displayText = pp.text?.text ?? '';
    const mainText = pp.structuredFormat?.mainText?.text;
    const secondaryText = pp.structuredFormat?.secondaryText?.text;

    results.push({
      placeId: pp.placeId ?? '',
      place: pp.place ?? '',
      text: displayText,
      mainText,
      secondaryText,
    });
  }

  return results;
}

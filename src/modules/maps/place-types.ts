/**
 * Shared types for Google Places data.
 * Use these when saving to DB or passing place data between components.
 */

export interface PlaceLocation {
  latitude: number;
  longitude: number;
}

/**
 * Place details from the Places API (New).
 * Suitable for saving to DB: id as primary key, location for geo queries, etc.
 */
export interface PlaceDetails {
  id: string;
  name: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  location?: PlaceLocation;
  googleMapsUri?: string;
  types?: string[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  [key: string]: unknown;
}

/**
 * Flattened shape for DB storage. Use toPersist() for consistent serialization.
 */
export interface PlacePersist {
  placeId: string;
  displayName: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  types?: string[];
}

/**
 * Convert PlaceDetails to a flat shape suitable for DB storage.
 */
export function toPersist(place: PlaceDetails): PlacePersist {
  return {
    placeId: place.id,
    displayName: place.displayName?.text ?? place.name ?? '',
    formattedAddress: place.formattedAddress,
    latitude: place.location?.latitude,
    longitude: place.location?.longitude,
    types: place.types,
  };
}

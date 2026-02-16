/**
 * Parses Google Place Details into structured address fields.
 * Uses postalAddress when available, falls back to addressComponents or formattedAddress.
 */

import { getCountryName } from '@/lib/constants/countries';

/** Structured address suitable for hotel/contact forms */
export interface ParsedAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/** PostalAddress from Places API (New) */
interface PostalAddress {
  regionCode?: string;
  postalCode?: string;
  administrativeArea?: string;
  locality?: string;
  sublocality?: string;
  addressLines?: string[];
}

/** AddressComponent from Places API (New) */
interface AddressComponent {
  longText?: string;
  shortText?: string;
  types?: string[];
}

interface PlaceWithAddress {
  formattedAddress?: string;
  postalAddress?: PostalAddress;
  addressComponents?: AddressComponent[];
  [key: string]: unknown;
}

/**
 * Extracts structured address fields from Place Details.
 * Prefers postalAddress, then addressComponents, then formattedAddress as fallback.
 */
export function parsePlaceToAddress(place: PlaceWithAddress): ParsedAddress {
  const result: ParsedAddress = {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  };

  const postal = place.postalAddress as PostalAddress | undefined;
  const components = (place.addressComponents ?? []) as AddressComponent[];

  if (postal) {
    result.street =
      postal.addressLines?.join(', ').trim() ?? postal.addressLines?.[0] ?? '';
    result.city = postal.locality ?? '';
    result.state = postal.administrativeArea ?? '';
    result.postalCode = postal.postalCode ?? '';
    const code = postal.regionCode ?? '';
    result.country = getCountryName(code) ?? code;
  }

  if (
    components.length > 0 &&
    (!postal || (!result.street && !result.country))
  ) {
    for (const c of components) {
      const types = c.types ?? [];
      const text = c.longText ?? c.shortText ?? '';
      if (types.includes('street_number') || types.includes('route')) {
        if (!result.street) result.street = text;
        else result.street = `${result.street} ${text}`.trim();
      } else if (types.includes('locality')) result.city = text;
      else if (types.includes('administrative_area_level_1'))
        result.state = text;
      else if (types.includes('postal_code')) result.postalCode = text;
      else if (types.includes('country')) {
        result.country = text;
      }
    }
  }

  if (
    !result.street &&
    !result.city &&
    !result.country &&
    place.formattedAddress
  ) {
    result.street = place.formattedAddress;
  }

  return result;
}

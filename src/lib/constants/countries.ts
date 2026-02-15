import countriesJson from '@/lib/datasets/countries.json';

export const COUNTRIES = countriesJson as Record<string, string>;

export type CountryCode = keyof typeof COUNTRIES;
export type CountryName = (typeof COUNTRIES)[CountryCode];

/**
 * Get country name from ISO code.
 */
export function getCountryName(code?: string | null): string | undefined {
  if (!code) return undefined;
  return COUNTRIES[code.toUpperCase()];
}

/**
 * Array format for dropdowns, selects, etc.
 */
export const COUNTRY_OPTIONS = Object.entries(COUNTRIES).map(
  ([code, name]) => ({
    code,
    name,
  })
);

/**
 * Sorted options (recommended for UI)
 */
export const SORTED_COUNTRY_OPTIONS = [...COUNTRY_OPTIONS].sort((a, b) =>
  a.name.localeCompare(b.name)
);

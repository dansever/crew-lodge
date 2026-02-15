/**
 * @source https://github.com/stephenjjbrown/string-similarity-js
 */

import { stringSimilarity } from 'string-similarity-js';

/**
 * Options for string matching behavior
 */
export interface StringMatcherOptions {
  //Minimum similarity score (0-1) to consider a match. Default: 0.5
  threshold?: number;
  // Score threshold (0-1) for early exit. If a match exceeds this, stop searching. Default: 0.95
  earlyExitThreshold?: number;
  // Whether to normalize input strings (lowercase and trim). Default: true
  normalize?: boolean;
}

// Result of a string match operation
export interface MatchResult<T> {
  // The matched item
  item: T;
  // The similarity score (0-1)
  score: number;
}

/**
 * Generic function to find the best matching item from a list using string similarity
 *
 * @param query - The string to match against (can be null/undefined)
 * @param items - Array of items to match against (can be undefined/empty)
 * @param getSearchStrings - Function that extracts search strings from each item
 * @param getId - Function that extracts the ID from the matched item
 * @param options - Optional configuration for matching behavior
 * @returns The ID of the best matching item, or undefined if no match meets the threshold
 *
 * @example
 * ```typescript
 * // Match airports
 * const airportId = findBestMatch(
 *   "Los Angeles International Airport (LAX)",
 *   airports,
 *   (airport) => [
 *     airport.name.toLowerCase(),
 *     airport.iata.toLowerCase(),
 *     airport.icao.toLowerCase(),
 *   ],
 *   (airport) => airport._id,
 *   { threshold: 0.6 }
 * );
 *
 * // Match cities
 * const cityId = findBestMatch(
 *   "New York",
 *   cities,
 *   (city) => [city.name.toLowerCase(), city.alias.toLowerCase()],
 *   (city) => city.id
 * );
 * ```
 */
export function findBestMatch<T, ID>(
  query: string | null | undefined,
  items: T[] | undefined,
  getSearchStrings: (item: T) => string[],
  getId: (item: T) => ID,
  options: StringMatcherOptions = {}
): ID | undefined {
  const {
    threshold = 0.5,
    earlyExitThreshold = 0.95,
    normalize = true,
  } = options;

  // Return undefined if no query or no items to match against
  if (!query || !items || items.length === 0) {
    return undefined;
  }

  // Normalize the input string for better matching
  const normalizedQuery = normalize ? query.toLowerCase().trim() : query.trim();

  let bestMatch: MatchResult<T> | null = null;

  // Check each item for the best match
  for (const item of items) {
    const searchStrings = getSearchStrings(item);

    // Find the best similarity score for this item across all search strings
    let maxScore = 0;
    for (const searchStr of searchStrings) {
      if (searchStr) {
        const normalizedSearchStr = normalize
          ? searchStr.toLowerCase().trim()
          : searchStr.trim();
        const score = stringSimilarity(normalizedQuery, normalizedSearchStr);
        maxScore = Math.max(maxScore, score);
      }
    }

    // Check if this is the best match so far
    if (maxScore > (bestMatch?.score || 0)) {
      bestMatch = { item, score: maxScore };
    }

    // If we find an exact match or very high similarity, use it immediately
    if (maxScore >= earlyExitThreshold) {
      break;
    }
  }

  // Return the ID of the best match if it meets the threshold
  if (bestMatch && bestMatch.score >= threshold) {
    return getId(bestMatch.item);
  }

  return undefined;
}

/**
 * Get all matches with their similarity scores, sorted by score (descending)
 *
 * @param query - The string to match against
 * @param items - Array of items to match against
 * @param getSearchStrings - Function that extracts search strings from each item
 * @param options - Optional configuration for matching behavior
 * @returns Array of matches with items and scores, sorted by score descending
 *
 * @example
 * ```typescript
 * const matches = getAllMatches(
 *   "Los Angeles",
 *   airports,
 *   (airport) => [airport.name.toLowerCase(), airport.iata.toLowerCase()],
 *   { threshold: 0.3 }
 * );
 * // Returns: [{ item: Airport, score: 0.95 }, { item: Airport, score: 0.72 }, ...]
 * ```
 */
export function getAllMatches<T>(
  query: string | null | undefined,
  items: T[] | undefined,
  getSearchStrings: (item: T) => string[],
  options: StringMatcherOptions = {}
): MatchResult<T>[] {
  const { normalize = true } = options;

  if (!query || !items || items.length === 0) {
    return [];
  }

  const normalizedQuery = normalize ? query.toLowerCase().trim() : query.trim();

  const matches: MatchResult<T>[] = [];

  for (const item of items) {
    const searchStrings = getSearchStrings(item);

    let maxScore = 0;
    for (const searchStr of searchStrings) {
      if (searchStr) {
        const normalizedSearchStr = normalize
          ? searchStr.toLowerCase().trim()
          : searchStr.trim();
        const score = stringSimilarity(normalizedQuery, normalizedSearchStr);
        maxScore = Math.max(maxScore, score);
      }
    }

    matches.push({ item, score: maxScore });
  }

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score);
}

/**
 * Get top N matches with their similarity scores
 *
 * @param query - The string to match against
 * @param items - Array of items to match against
 * @param getSearchStrings - Function that extracts search strings from each item
 * @param topN - Number of top matches to return. Default: 5
 * @param options - Optional configuration for matching behavior
 * @returns Array of top N matches with items and scores, sorted by score descending
 */
export function getTopMatches<T>(
  query: string | null | undefined,
  items: T[] | undefined,
  getSearchStrings: (item: T) => string[],
  topN: number = 5,
  options: StringMatcherOptions = {}
): MatchResult<T>[] {
  return getAllMatches(query, items, getSearchStrings, options).slice(0, topN);
}

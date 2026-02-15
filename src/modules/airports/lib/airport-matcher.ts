/**
 * This file contains the logic for matching airports using string similarity
 * @source https://github.com/stephenjjbrown/string-similarity-js
 */

import { Airport, AirportId } from '@/convex/types';
import { logger } from '@/utils/logger';
import {
  findBestMatch,
  getAllMatches,
  getTopMatches,
} from '@/utils/string-matcher';

/**
 * Extract search strings from an airport for matching
 */
function getAirportSearchStrings(airport: Airport): string[] {
  return [
    airport.name.toLowerCase(),
    airport.icao?.toLowerCase() || '',
    airport.iata?.toLowerCase() || '',
    // Also try combining name and codes
    `${airport.name.toLowerCase()} (${airport.iata?.toLowerCase() || ''})`,
    `${airport.name.toLowerCase()} (${airport.icao?.toLowerCase() || ''})`,
  ];
}

/**
 * Find the best matching airport from a list of airports using string similarity
 * @param airportString - The airport string extracted from the document (e.g., "Los Angeles International Airport (LAX)")
 * @param airports - List of available airports to match against
 * @param threshold - Minimum similarity score (0-1) to consider a match. Default: 0.5
 * @returns The matched airport ID, or undefined if no good match is found
 */
export function matchAirport(
  airportString: string | null | undefined,
  airports: Airport[] | undefined,
  threshold: number = 0.5
): AirportId | undefined {
  // Return undefined if no airport string or no airports to match against
  if (!airportString || !airports || airports.length === 0) {
    logger.info('No airport string or airports available for matching');
    return undefined;
  }

  logger.info(`Matching airport string: "${airportString}"`);
  logger.info(`Comparing against ${airports.length} airports`);

  // Use the generic matching function
  const matchedId = findBestMatch(
    airportString,
    airports,
    getAirportSearchStrings,
    airport => airport._id,
    { threshold, earlyExitThreshold: 0.95 }
  );

  // Get all matches for logging purposes
  const allMatches = getAllMatches(
    airportString,
    airports,
    getAirportSearchStrings
  );

  // Log all matches sorted by score (descending)
  logger.info(`All ${allMatches.length} airports compared (sorted by score):`);
  logger.table(
    allMatches.map(m => ({
      name: m.item.name,
      iata: m.item.iata,
      icao: m.item.icao,
      score: parseFloat(m.score.toFixed(3)),
    }))
  );

  if (matchedId && allMatches.length > 0) {
    const bestMatch = allMatches[0];
    logger.info(
      `✅ Matched: ${bestMatch.item.name} (${
        bestMatch.item.iata
      }) with score ${bestMatch.score.toFixed(3)}`
    );
  } else {
    const bestScore = allMatches[0]?.score;
    logger.warn(
      `❌ No match found above threshold ${threshold}. Best score: ${
        bestScore?.toFixed(3) || 'N/A'
      }`
    );
  }

  return matchedId;
}

/**
 * Get detailed match information for debugging/display
 * @param airportString - The airport string extracted from the document
 * @param airports - List of available airports to match against
 * @param topN - Number of top matches to return. Default: 5
 * @returns Array of matches with airport and similarity score
 */
export function getAirportMatches(
  airportString: string | null | undefined,
  airports: Airport[] | undefined,
  topN: number = 5
): Array<{ airport: Airport; score: number }> {
  const matches = getTopMatches(
    airportString,
    airports,
    getAirportSearchStrings,
    topN
  );

  // Log matches in table format for debugging
  if (matches.length > 0) {
    logger.table(
      matches.map(m => ({
        name: m.item.name,
        iata: m.item.iata,
        icao: m.item.icao,
        score: parseFloat(m.score.toFixed(3)),
      }))
    );
  }

  // Transform to the expected return format
  return matches.map(m => ({
    airport: m.item,
    score: m.score,
  }));
}

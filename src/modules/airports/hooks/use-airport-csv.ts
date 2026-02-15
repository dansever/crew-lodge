'use client';

import { AirportDatasetItem } from '@/modules/airports/types';
import { logger } from '@/utils/logger';
import { useEffect, useMemo, useState } from 'react';

// Re-export for backward compatibility
export type { AirportDatasetItem };

interface UseAirportCsvOptions {
  query?: string;
  enabled?: boolean;
  limit?: number;
}

let cachedAirports: AirportDatasetItem[] | null = null;
let isLoadingCache = false;

async function loadAirports(): Promise<AirportDatasetItem[]> {
  if (cachedAirports) {
    return cachedAirports;
  }

  if (isLoadingCache) {
    // Wait for ongoing load
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (cachedAirports) {
          clearInterval(checkInterval);
          resolve(cachedAirports);
        }
      }, 100);
    });
  }

  isLoadingCache = true;

  try {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('Cannot load airports CSV on server side');
    }

    const csvUrl = '/datasets/airports.csv';
    logger.info('Fetching airports CSV from:', csvUrl);

    const response = await fetch(csvUrl, {
      cache: 'force-cache',
    });

    if (!response.ok) {
      logger.error(
        'Fetch failed:',
        response.status,
        response.statusText,
        'URL:',
        csvUrl
      );
      throw new Error(
        `Failed to load airports CSV (${response.status}): ${response.statusText}`
      );
    }

    const csvText = await response.text();
    logger.info(
      'Successfully loaded CSV, length:',
      csvText.length
    );
    const lines = csvText.split('\n').filter(line => line.trim());

    // Skip header row
    const dataLines = lines.slice(1);

    const airports: AirportDatasetItem[] = dataLines
      .map(line => {
        // Parse CSV line (handling quoted fields with commas inside)
        // More robust CSV parsing that handles quoted fields
        const fields: string[] = [];
        let currentField = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              // Escaped quote
              currentField += '"';
              i++; // Skip next quote
            } else {
              // Toggle quote state
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            // End of field
            fields.push(currentField);
            currentField = '';
          } else {
            currentField += char;
          }
        }
        // Push last field
        fields.push(currentField);

        if (fields.length < 7) return null;

        return {
          country_code: fields[0]?.replace(/^"|"$/g, '') || '',
          region_name: fields[1]?.replace(/^"|"$/g, '') || '',
          iata: fields[2]?.replace(/^"|"$/g, '') || '',
          icao: fields[3]?.replace(/^"|"$/g, '') || '',
          airport: fields[4]?.replace(/^"|"$/g, '') || '',
          latitude: fields[5]?.replace(/^"|"$/g, '') || '',
          longitude: fields[6]?.replace(/^"|"$/g, '') || '',
        };
      })
      .filter((airport): airport is AirportDatasetItem => airport !== null);

    cachedAirports = airports;
    return airports;
  } catch (error) {
    logger.error('Error loading airports CSV:', error);
    return [];
  } finally {
    isLoadingCache = false;
  }
}

export function useAirportCsv({
  query = '',
  enabled = true,
  limit = 20,
}: UseAirportCsvOptions) {
  const [airports, setAirports] = useState<AirportDatasetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    loadAirports()
      .then(loadedAirports => {
        setAirports(loadedAirports);
        setIsLoading(false);
      })
      .catch(() => {
        setAirports([]);
        setIsLoading(false);
      });
  }, [enabled]);

  const suggestions = useMemo(() => {
    if (!query || query.length < 2) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const filtered = airports.filter(airport => {
      const searchableText =
        `${airport.airport} ${airport.iata} ${airport.icao} ${airport.region_name} ${airport.country_code}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });

    return filtered.slice(0, limit);
  }, [airports, query, limit]);

  return {
    airports,
    suggestions,
    isLoading,
  };
}

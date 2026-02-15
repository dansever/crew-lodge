'use client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Airport } from '@/convex/types';
import { useCountryMap } from '@/hooks/use-country-map';
import { cn } from '@/lib/utils';
import { AirportDatasetItem } from '@/modules/airports/types';
import { MapPin, Plane, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

interface AirportAutocompleteInputProps {
  className?: string;
  placeholder?: string;
  airports?: Airport[]; // Airports from organization's database
  csvAirports?: AirportDatasetItem[]; // Airports from CSV dataset
  onAirportSelect?: (airport: Airport | AirportDatasetItem) => void;
  value?: string;
  onChange?: (value: string) => void;
  /** When true (e.g. sheet is visible), allows resetting interaction state when it becomes false */
  isVisible?: boolean;
}

function AirportAutocompleteInput({
  className,
  placeholder = 'Search airports...',
  airports = [],
  csvAirports = [],
  onAirportSelect,
  value: controlledValue,
  onChange: controlledOnChange,
  isVisible = true,
}: AirportAutocompleteInputProps) {
  const [query, setQuery] = useState(controlledValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const [hasUserClickedInput, setHasUserClickedInput] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 200);

  const { map: countryMap } = useCountryMap();

  // Reset interaction state when sheet closes (isVisible goes false)
  useEffect(() => {
    if (!isVisible) {
      setHasUserClickedInput(false);
    }
  }, [isVisible]);

  // Normalize airports to a common format for filtering and display
  const normalizedAirports = useMemo(() => {
    const dbAirports = airports.map(airport => ({
      type: 'database' as const,
      id: airport._id,
      name: airport.name,
      iata: airport.iata || '',
      icao: airport.icao || '',
      city: airport.city || '',
      state: airport.state || '',
      country: airport.country || '',
      data: airport,
    }));

    const csvAirportsNormalized = csvAirports.map((airport, index) => ({
      type: 'csv' as const,
      id: `csv-${index}-${airport.iata}-${airport.icao}`,
      name: airport.airport,
      iata: airport.iata || '',
      icao: airport.icao || '',
      city: '', // CSV doesn't have city
      state: airport.region_name || '',
      country: airport.country_code || '',
      data: airport,
    }));

    return [...dbAirports, ...csvAirportsNormalized];
  }, [airports, csvAirports]);

  // Filter airports based on search query
  // Only show suggestions when user has clicked input or typed 2+ chars (avoids dropdown on sheet auto-focus)
  const suggestions = useMemo(() => {
    if (!isFocused) {
      return [];
    }

    // Require explicit click or 2+ chars to avoid opening on sheet auto-focus
    if (
      !hasUserClickedInput &&
      (!debouncedQuery || debouncedQuery.length < 2)
    ) {
      return [];
    }

    // If query is empty or less than 2 characters, show all airports
    if (!debouncedQuery || debouncedQuery.length < 2) {
      return normalizedAirports.slice(0, 20);
    }

    // Otherwise, filter based on query
    const normalizedQuery = debouncedQuery[0].toLowerCase().trim();
    const filtered = normalizedAirports.filter(airport => {
      const searchableText =
        `${airport.name} ${airport.iata} ${airport.icao} ${airport.city} ${airport.state} ${airport.country}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });

    return filtered.slice(0, 20);
  }, [normalizedAirports, debouncedQuery, isFocused, hasUserClickedInput]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setQuery(newValue);
      controlledOnChange?.(newValue);
      setActiveIndex(-1);
    },
    [controlledOnChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!suggestions.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && suggestions[activeIndex]) {
            const suggestion = suggestions[activeIndex];
            setQuery(suggestion.name);
            controlledOnChange?.(suggestion.name);
            onAirportSelect?.(suggestion.data);
            setIsFocused(false);
            setActiveIndex(-1);
          }
          break;
        case 'Escape':
          setIsFocused(false);
          setActiveIndex(-1);
          break;
      }
    },
    [suggestions, activeIndex, onAirportSelect, controlledOnChange]
  );

  const handleAirportClick = useCallback(
    (suggestion: (typeof normalizedAirports)[0]) => {
      setQuery(suggestion.name);
      controlledOnChange?.(suggestion.name);
      onAirportSelect?.(suggestion.data);
      setIsFocused(false);
      setActiveIndex(-1);
    },
    [onAirportSelect, controlledOnChange, normalizedAirports]
  );

  const handlePointerDown = useCallback(() => {
    setHasUserClickedInput(true);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setActiveIndex(-1);
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsFocused(false);
      setActiveIndex(-1);
    }, 200);
  }, []);

  // Sync controlled value
  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== query) {
      setQuery(controlledValue);
    }
  }, [controlledValue]);

  const showResults = isFocused && suggestions.length > 0;
  const showNoResults =
    isFocused &&
    hasUserClickedInput &&
    query.length >= 2 &&
    suggestions.length === 0;

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isFocused && !!suggestions.length}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `airport-option-${activeIndex}` : undefined
          }
          id="airport-search"
          autoComplete="off"
          className="pl-3 pr-9 py-1.5 h-9 text-sm rounded-lg focus-visible:ring-offset-0"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none">
          {query.length > 0 ? (
            <Plane className="w-4 h-4" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
      </div>

      {showResults && (
        <div
          className="absolute top-full left-0 w-full border rounded-md shadow-lg overflow-hidden dark:border-gray-800 bg-white dark:bg-black mt-1 z-50 max-h-80 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
          role="listbox"
          aria-label="Airport search results"
        >
          <div className="max-h-80 overflow-y-auto">
            <ul role="none" className="py-1">
              {suggestions.map((suggestion, index) => {
                const countryName =
                  countryMap[suggestion.country] || suggestion.country;
                const isActive = index === activeIndex;
                const location = [
                  suggestion.city,
                  suggestion.state,
                  countryName,
                ]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <li
                    key={suggestion.id}
                    id={`airport-option-${index}`}
                    className={cn(
                      'px-3 py-2 flex items-start justify-between hover:bg-gray-200 dark:hover:bg-zinc-900 cursor-pointer transition-colors',
                      isActive ? 'bg-gray-100 dark:bg-zinc-800' : ''
                    )}
                    onClick={() => handleAirportClick(suggestion)}
                    role="option"
                    aria-selected={isActive}
                  >
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Plane className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {suggestion.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {suggestion.iata && (
                              <Badge
                                variant="outline"
                                className="text-xs font-mono shrink-0"
                              >
                                {suggestion.iata}
                              </Badge>
                            )}
                            {suggestion.icao && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-mono shrink-0"
                              >
                                {suggestion.icao}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{location}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <Separator />
          <div className="px-3 py-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Use arrow keys to navigate</span>
              <span>ESC to cancel</span>
            </div>
          </div>
        </div>
      )}

      {showNoResults && (
        <div className="absolute top-full left-0 w-full border rounded-md shadow-lg dark:border-gray-800 bg-white dark:bg-black mt-1 z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 text-center text-sm text-gray-500">
            No airports found for &quot;{query}&quot;
          </div>
        </div>
      )}
    </div>
  );
}

export default AirportAutocompleteInput;

'use client';

import { MapPin, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

import type { PlaceDetails } from '../place-types';

interface PlacePrediction {
  placeId: string;
  place: string;
  text: string;
  mainText?: string;
  secondaryText?: string;
}

interface PlacesAutocompleteProps {
  /** Called with full place details when user selects a place. Use for saving to DB, forms, etc. */
  onSelect: (place: PlaceDetails) => void;
  /** Called when user clears the selection (optional) */
  onClear?: () => void;
  /** Pre-selected place to display (controlled mode) */
  value?: PlaceDetails | null;
  placeholder?: string;
  className?: string;
  minQueryLength?: number;
}

export function PlacesAutocomplete({
  onSelect,
  onClear,
  value,
  placeholder = 'Search for a place...',
  className,
  minQueryLength = 3,
}: PlacesAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(
    value ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debounceMs = 300;
  const [debouncedQuery] = useDebounce(query, debounceMs);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const detailsCacheRef = useRef<Map<string, PlaceDetails>>(new Map());

  // Sync with controlled value
  useEffect(() => {
    setSelectedPlace(value ?? null);
  }, [value]);

  // Fetch suggestions
  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (!trimmed || trimmed.length < minQueryLength) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/places/autocomplete?input=${encodeURIComponent(trimmed)}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setSuggestions(data.suggestions ?? []);
          setHighlightedIndex(-1);
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, minQueryLength]);

  // Handle prediction selection → fetch full details (cached by placeId)
  const handleSelectPrediction = useCallback(
    async (prediction: PlacePrediction) => {
      console.log('[PlacesAutocomplete] Autocomplete selection:', prediction);

      setError(null);
      setSuggestions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);

      const cached = detailsCacheRef.current.get(prediction.placeId);
      if (cached) {
        console.log('[PlacesAutocomplete] Place details (cached):', cached);
        setSelectedPlace(cached);
        setQuery(cached.displayName?.text ?? cached.name ?? prediction.text);
        onSelect(cached);
        return;
      }

      setIsLoadingDetails(true);

      try {
        const res = await fetch(
          `/api/places/details?placeId=${encodeURIComponent(prediction.placeId)}`
        );
        const data = (await res.json()) as PlaceDetails;

        if (!res.ok) {
          throw new Error(
            (data as { error?: string }).error ?? 'Failed to load place'
          );
        }

        console.log('[PlacesAutocomplete] Place details (fetched):', data);
        detailsCacheRef.current.set(prediction.placeId, data);
        setSelectedPlace(data);
        setQuery(data.displayName?.text ?? data.name ?? prediction.text);
        onSelect(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [onSelect]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setSelectedPlace(null);
    setSuggestions([]);
    setError(null);
    setHighlightedIndex(-1);
    onClear?.();
    inputRef.current?.focus();
  }, [onClear]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            handleSelectPrediction(suggestions[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, suggestions, highlightedIndex, handleSelectPrediction]
  );

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightedIndex]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showSuggestions = isOpen && suggestions.length > 0 && !selectedPlace;
  const showLoading = isLoading && query.length >= minQueryLength;
  const displayName = selectedPlace?.displayName?.text ?? selectedPlace?.name;

  return (
    <div ref={containerRef} className={`relative w-full ${className ?? ''}`}>
      {/* Selected place (compact) — click to change */}
      {selectedPlace && !isOpen && (
        <button
          type="button"
          onClick={() => {
            setSelectedPlace(null);
            setQuery(displayName ?? '');
            setIsOpen(true);
            onClear?.();
            inputRef.current?.focus();
          }}
          className="flex w-full items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1 truncate">
            <span className="font-medium text-foreground">{displayName}</span>
            {selectedPlace.formattedAddress && (
              <span className="text-muted-foreground">
                {' · '}
                <span className="truncate">
                  {selectedPlace.formattedAddress}
                </span>
              </span>
            )}
          </div>
          <span
            role="button"
            tabIndex={0}
            onClick={e => {
              e.stopPropagation();
              handleClear();
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClear();
              }
            }}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            aria-label="Clear place"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        </button>
      )}

      {/* Search input (when no selection or when open) */}
      {(!selectedPlace || isOpen) && (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full border-input bg-transparent py-2.5 pl-10 pr-10 text-sm rounded-md border shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoComplete="off"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {showLoading && (
              <div className="flex gap-1">
                <div
                  className="w-1 h-1 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-1 h-1 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-1 h-1 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            )}
            {isLoadingDetails && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Loading...
              </span>
            )}
            {query && !showLoading && !isLoadingDetails && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <ul
          ref={listRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-border bg-popover shadow-md"
        >
          {suggestions.map((prediction, index) => (
            <li
              key={prediction.placeId}
              onClick={() => handleSelectPrediction(prediction)}
              className={`cursor-pointer px-3 py-2.5 text-sm border-b border-border/40 last:border-0 transition-colors ${
                highlightedIndex === index ? 'bg-muted' : 'hover:bg-muted/80'
              }`}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">
                    {prediction.mainText ?? prediction.text}
                  </div>
                  {prediction.secondaryText && (
                    <div className="text-xs text-muted-foreground truncate">
                      {prediction.secondaryText}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* No results */}
      {isOpen &&
        !isLoading &&
        query.length >= minQueryLength &&
        suggestions.length === 0 &&
        !selectedPlace && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-popover p-3 text-center text-sm text-muted-foreground">
            No places found
          </div>
        )}

      {/* Error */}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export type { PlaceDetails };

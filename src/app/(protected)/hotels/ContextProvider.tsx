'use client';

import { useMarketContext } from '@/app/(protected)/_contexts/MarketContext';
import { api } from '@/convex/_generated/api';
import type { Hotel } from '@/convex/types';
import { Preloaded, usePreloadedQuery } from 'convex/react';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

/** Preloaded hotels for the current org */
export type PreloadedHotels = Preloaded<
  typeof api.functions.hotels.listMyHotels
>;

interface HotelsContextValue {
  /** Hotels for the currently selected market; undefined when no market or still loading */
  hotels: Hotel[] | undefined;
}

const HotelsContext = createContext<HotelsContextValue | null>(null);

interface HotelsContextProviderProps {
  preloadedHotels: PreloadedHotels;
  children: ReactNode;
}

export function HotelsContextProvider({
  preloadedHotels,
  children,
}: HotelsContextProviderProps) {
  const { currentMarket } = useMarketContext();
  const allHotels = usePreloadedQuery(preloadedHotels);

  // Filter by selected market only when we have both; no refetch when market switches
  const hotels = useMemo<Hotel[] | undefined>(() => {
    if (!allHotels || !currentMarket?._id) return undefined;
    return allHotels.filter((h: Hotel) => h.marketId === currentMarket._id);
  }, [allHotels, currentMarket?._id]);

  const value = useMemo<HotelsContextValue>(() => ({ hotels }), [hotels]);

  return (
    <HotelsContext.Provider value={value}>{children}</HotelsContext.Provider>
  );
}

export function useHotelsContext(): HotelsContextValue {
  const ctx = useContext(HotelsContext);
  if (!ctx) {
    throw new Error(
      'useHotelsContext must be used within HotelsContextProvider'
    );
  }
  return ctx;
}

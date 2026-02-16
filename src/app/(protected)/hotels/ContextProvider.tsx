'use client';

import { useMarketContext } from '@/app/(protected)/_contexts/MarketContext';
import { api } from '@/convex/_generated/api';
import type { Booking, Hotel } from '@/convex/types';
import { Preloaded, usePreloadedQuery, useQuery } from 'convex/react';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

/** Preloaded hotels for the current org */
export type PreloadedHotels = Preloaded<
  typeof api.functions.hotels.listMyHotels
>;

interface HotelsContextValue {
  /** Hotels for the currently selected market; undefined when no market or still loading */
  hotels: Hotel[] | undefined;
  /** All bookings for hotels in this market */
  reservations: Booking[] | undefined;
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

  const reservations = useQuery(
    api.functions.bookings.listMyBookingsByMarketAndDateRange,
    currentMarket
      ? {
          marketId: currentMarket._id,
          startDate: new Date().getTime(),
          endDate: new Date().getTime(),
        }
      : 'skip'
  );

  const hotels = useMemo<Hotel[] | undefined>(() => {
    if (!allHotels || !currentMarket) return undefined;
    return allHotels.filter((h: Hotel) => h.marketId === currentMarket._id);
  }, [allHotels, currentMarket]);

  const value = useMemo<HotelsContextValue>(
    () => ({ hotels, reservations: reservations ?? undefined }),
    [hotels, reservations]
  );

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

'use client';

import { useMarketContext } from '@/app/(protected)/_contexts/MarketContext';
import { api } from '@/convex/_generated/api';
import type { Booking, Hotel } from '@/convex/types';
import { Preloaded, usePreloadedQuery, useQuery } from 'convex/react';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface BookingsContextValue {
  hotels: Hotel[];
  bookings: Booking[];
  /** True while market selection or hotel preload is not yet ready */
  isLoading: boolean;
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

interface BookingsContextProviderProps {
  preloadedHotels: Preloaded<typeof api.functions.hotels.listMyHotels>;
  children: ReactNode;
}

/** Stable 6‑month date range for bookings queries (avoids re-querying on every render) */
const getBookingsDateRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now);
  end.setMonth(end.getMonth() + 6);
  return {
    startDate: start.getTime(),
    endDate: end.getTime(),
  };
};

const BOOKINGS_DATE_RANGE = getBookingsDateRange();

export function BookingsContextProvider({
  preloadedHotels,
  children,
}: BookingsContextProviderProps) {
  const { currentMarket, markets } = useMarketContext();
  const allHotelsResult = usePreloadedQuery(preloadedHotels);
  const allHotels = allHotelsResult ?? [];

  const bookingsArgs = useMemo(
    () =>
      currentMarket
        ? {
            marketId: currentMarket._id,
            startDate: BOOKINGS_DATE_RANGE.startDate,
            endDate: BOOKINGS_DATE_RANGE.endDate,
          }
        : 'skip',
    [currentMarket]
  );

  const bookings = useQuery(
    api.functions.bookings.listMyBookingsByMarketAndDateRange,
    bookingsArgs
  );

  const hotels = useMemo(() => {
    if (!markets) return [];
    if (allHotelsResult === undefined) return [];
    if (!currentMarket) return allHotels;
    return allHotels.filter(h => h.marketId === currentMarket._id);
  }, [allHotels, allHotelsResult, currentMarket, markets]);

  const isLoading = markets === undefined || allHotelsResult === undefined;

  const value = useMemo<BookingsContextValue>(
    () => ({
      hotels,
      bookings: bookings ?? [],
      isLoading,
    }),
    [hotels, bookings, isLoading]
  );

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookingsContext(): BookingsContextValue {
  const ctx = useContext(BookingsContext);
  if (!ctx) {
    throw new Error(
      'useBookingsContext must be used within BookingsContextProvider'
    );
  }
  return ctx;
}

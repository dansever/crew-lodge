'use client';

import { api } from '@/convex/_generated/api';
import type { Booking } from '@/convex/types';
import { Preloaded, usePreloadedQuery } from 'convex/react';
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

export type PreloadedBookings = Preloaded<
  typeof api.functions.bookings.listMyBookings
>;

interface BookingsContextValue {
  bookings: Booking[];
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

interface BookingsContextProviderProps {
  preloadedBookings: PreloadedBookings;
  children: ReactNode;
}

export function BookingsContextProvider({
  preloadedBookings,
  children,
}: BookingsContextProviderProps) {
  const data = usePreloadedQuery(preloadedBookings);
  const value = useMemo<BookingsContextValue>(
    () => ({ bookings: data ?? [] }),
    [data]
  );

  return (
    <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>
  );
}

export function useBookingsContext(): BookingsContextValue {
  const ctx = useContext(BookingsContext);
  if (!ctx) {
    throw new Error('useBookingsContext must be used within BookingsContextProvider');
  }
  return ctx;
}

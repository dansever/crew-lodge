'use client';

import { useMarketContext } from '@/app/(protected)/_contexts/MarketContext';
import { useHotelsContext } from '@/app/(protected)/hotels/ContextProvider';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Hotel } from '@/convex/types';
import { HotelCard, HotelSheet } from '@/modules/hotels';
import {
  buildHotelFeatures,
  getBookingStatus,
} from '@/modules/hotels/utils/hotelGantt';
import { Button, PageLayout } from '@/stories';
import { format } from 'date-fns';
import { Building2, Plane, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppHeader } from '../_components/AppHeader';

function HotelCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function HotelsClientPage() {
  const { currentMarket } = useMarketContext();
  const { hotels, reservations } = useHotelsContext();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

  const hotelFeatures = useMemo(
    () => buildHotelFeatures(hotels ?? [], reservations ?? []),
    [hotels, reservations]
  );

  const selectedHotelFeature = useMemo(
    () =>
      selectedHotelId
        ? (hotelFeatures.find(f => f.hotel._id === selectedHotelId) ?? null)
        : null,
    [selectedHotelId, hotelFeatures]
  );

  const isLoading = currentMarket?._id && hotels === undefined;
  const isLoadingBookings = currentMarket?._id && reservations === undefined;
  const hasHotels = Array.isArray(hotels) && hotels.length > 0;
  const hasGanttData = hotelFeatures.length > 0;

  return (
    <PageLayout header={<AppHeader />}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hotels</h1>
          <p className="text-muted-foreground mt-1">
            {currentMarket
              ? `Hotels in ${currentMarket.name ?? 'selected market'}`
              : 'Select a market in the header to view associated hotels'}
          </p>
        </div>
        {currentMarket && (
          <Button
            text="Add Hotel"
            icon={Plus}
            size="sm"
            onClick={() => {
              setSelectedHotel(null);
              setSheetOpen(true);
            }}
          />
        )}
      </div>

      {/* No market selected */}
      {!currentMarket && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 px-6 text-center">
          <Plane className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium">No market selected</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Choose a market from the selector above to see hotels associated
            with that market.
          </p>
        </div>
      )}

      {/* Gantt loading state */}
      {currentMarket && (isLoading || isLoadingBookings) && !hasGanttData && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 py-16 px-6">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">
            Loading reservations for {currentMarket.name}...
          </p>
        </div>
      )}

      {/* Gantt empty state - market selected but no reservations */}
      {currentMarket &&
        !isLoading &&
        !isLoadingBookings &&
        !hasGanttData &&
        hasHotels && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-16 px-6 text-center">
            <p className="text-slate-600 font-medium">No reservations found</p>
            <p className="text-sm text-slate-500 mt-1">
              No hotels in {currentMarket.name} have reservations
            </p>
          </div>
        )}

      {/* Market selected but no hotels - prompt to add */}
      {currentMarket && !isLoading && !hasHotels && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 px-6 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium">No hotels found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            No hotels are associated with this market yet. Add hotels and link
            them to this market to see them here.
          </p>
        </div>
      )}

      {/* Selected hotel details panel */}
      {selectedHotelFeature && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {selectedHotelFeature.hotel.name} – Bookings
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {selectedHotelFeature.bookings.length} reservation
                {selectedHotelFeature.bookings.length !== 1 ? 's' : ''} for this
                hotel
              </p>
            </div>
            <button
              onClick={() => setSelectedHotelId(null)}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-2 transition-all"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {selectedHotelFeature.bookings.map(booking => (
              <div
                key={booking._id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {format(new Date(booking.checkInDate), 'MMM d, yyyy')} –{' '}
                    {format(new Date(booking.checkOutDate), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-slate-500">
                    {booking.roomsBooked} room
                    {booking.roomsBooked !== 1 ? 's' : ''}
                    {booking.roomType ? ` · ${booking.roomType}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                    style={{
                      backgroundColor: `${getBookingStatus(booking.status).color}20`,
                      color: getBookingStatus(booking.status).color,
                    }}
                  >
                    {booking.status.replace('_', ' ')}
                  </span>
                  {booking.totalCost != null && (
                    <p className="text-sm font-medium text-slate-700 mt-1">
                      ${booking.totalCost.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hotel cards */}
      {currentMarket && hasHotels && (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {hotels!.map((hotel: Hotel) => (
            <HotelCard
              key={hotel._id}
              hotel={hotel}
              onDetailsClick={clickedHotel => {
                setSelectedHotel(clickedHotel);
                setSheetOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Unified hotel sheet: add, view, edit */}
      {currentMarket && (
        <HotelSheet
          marketId={currentMarket._id}
          hotel={selectedHotel}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      )}
    </PageLayout>
  );
}

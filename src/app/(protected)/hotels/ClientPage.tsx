'use client';

import { useMarketContext } from '@/app/(protected)/_contexts/MarketContext';
import { useHotelsContext } from '@/app/(protected)/hotels/ContextProvider';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Hotel } from '@/convex/types';
import { HotelCard } from '@/modules/hotels/HotelCard';
import { HotelSheet } from '@/modules/hotels/HotelSheet';
import { Button, PageLayout } from '@/stories';
import { Building2, Plane, Plus } from 'lucide-react';
import { useState } from 'react';
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
  const { hotels } = useHotelsContext();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const isLoading = currentMarket?._id && hotels === undefined;
  const hasHotels = Array.isArray(hotels) && hotels.length > 0;

  return (
    <PageLayout header={<AppHeader />}>
      <div className="space-y-6 p-6">
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

        {/* Empty state: no market */}
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

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <HotelCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state: no hotels for market */}
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

        {/* Hotel cards */}
        {currentMarket && hasHotels && (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {hotels.map((hotel: Hotel) => (
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
      </div>
    </PageLayout>
  );
}

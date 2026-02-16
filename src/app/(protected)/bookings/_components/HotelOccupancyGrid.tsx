import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Booking, Hotel } from '@/convex/types';
import { cn } from '@/lib/utils';
import { addDays, format, isSameDay } from 'date-fns';
import {
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Hotel as HotelIcon,
  Users,
} from 'lucide-react';
import { cloneElement, useMemo, useState } from 'react';

interface HotelOccupancyGridProps {
  hotels: Hotel[];
  bookings: Booking[];
  isLoading?: boolean;
  className?: string;
}

interface CellData {
  rooms: number;
  crew: number;
  flights: string[];
  bookings: Booking[];
}

const VISIBLE_DAYS = 14;

function getOccupancyLevel(rooms: number): number {
  if (rooms === 0) return 0;
  if (rooms <= 2) return 1;
  if (rooms <= 4) return 2;
  if (rooms <= 6) return 3;
  return 4;
}

export default function HotelOccupancyGrid({
  hotels,
  bookings,
  isLoading = false,
  className,
}: HotelOccupancyGridProps) {
  const [startDate, setStartDate] = useState(() => new Date());

  const dates = useMemo(
    () => Array.from({ length: VISIBLE_DAYS }, (_, i) => addDays(startDate, i)),
    [startDate]
  );

  // Build a lookup: hotelId → date → CellData
  const grid = useMemo(() => {
    const map = new Map<string, Map<string, CellData>>();

    for (const hotel of hotels) {
      map.set(hotel._id, new Map());
    }

    for (const b of bookings) {
      if (b.status === 'cancelled') continue;
      const checkIn = new Date(b.checkInDate);
      const nightsCount = b.nights ?? 1;

      const hotelMap = map.get(b.hotelId);
      if (!hotelMap) continue;

      for (let d = 0; d < nightsCount; d++) {
        const day = addDays(checkIn, d);
        const key = format(day, 'yyyy-MM-dd');
        const existing = hotelMap.get(key) || {
          rooms: 0,
          crew: 0,
          flights: [],
          bookings: [],
        };
        existing.rooms += b.roomsBooked;
        existing.crew += b.crewSize;
        const flight = b.flightNumber ?? '';
        if (flight && !existing.flights.includes(flight)) {
          existing.flights.push(flight);
        }
        existing.bookings.push(b);
        hotelMap.set(key, existing);
      }
    }

    return map;
  }, [hotels, bookings]);

  const today = new Date();

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn('rounded-xl border bg-card overflow-hidden', className)}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
              <HotelIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Hotel Occupancy
              </h3>
              <p className="text-xs text-muted-foreground">
                {format(startDate, 'MMM d')} –{' '}
                {format(addDays(startDate, VISIBLE_DAYS - 1), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStartDate(d => addDays(d, -7))}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setStartDate(new Date(2025, 1, 12))}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setStartDate(d => addDays(d, 7))}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Date headers */}
            <div
              className="grid border-b"
              style={{
                gridTemplateColumns: `180px repeat(${VISIBLE_DAYS}, 1fr)`,
              }}
            >
              <div className="px-4 py-2.5 text-xs font-medium text-muted-foreground border-r bg-muted/30">
                Hotel
              </div>
              {dates.map(date => {
                const isToday = isSameDay(date, today);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      'px-1 py-2.5 text-center border-r last:border-r-0',
                      isWeekend && 'bg-muted/20',
                      isToday && 'bg-primary/5'
                    )}
                  >
                    <div
                      className={cn(
                        'text-[10px] font-medium uppercase tracking-wider',
                        isToday ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {format(date, 'EEE')}
                    </div>
                    <div
                      className={cn(
                        'text-xs font-semibold mt-0.5',
                        isToday ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {format(date, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hotel rows */}
            {hotels.map(hotel => {
              const hotelMap = grid.get(hotel._id);
              return (
                <div
                  key={hotel._id}
                  className="grid border-b last:border-b-0 group/row hover:bg-muted/10 transition-colors"
                  style={{
                    gridTemplateColumns: `180px repeat(${VISIBLE_DAYS}, 1fr)`,
                  }}
                >
                  {/* Hotel name */}
                  <div className="px-4 py-3 border-r flex items-center gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground ">
                        {hotel.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {[hotel.chain, hotel.address?.city]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </div>
                    </div>
                    {hotel.isPreferred && (
                      <span
                        className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary"
                        title="Preferred"
                      />
                    )}
                  </div>

                  {/* Date cells */}
                  {dates.map(date => {
                    const key = format(date, 'yyyy-MM-dd');
                    const cell = hotelMap?.get(key);
                    const level = cell ? getOccupancyLevel(cell.rooms) : 0;
                    const isWeekend =
                      date.getDay() === 0 || date.getDay() === 6;
                    const isToday = isSameDay(date, today);

                    const cellDiv = (
                      <div
                        className={cn(
                          'border-r last:border-r-0 p-1.5 flex items-center justify-center cursor-default transition-colors',
                          isWeekend && 'bg-muted/20',
                          isToday && 'bg-primary/5'
                        )}
                      >
                        {cell ? (
                          <div
                            className={cn(
                              'w-full h-8 rounded-md flex items-center justify-center text-xs font-semibold transition-all',
                              level === 1 && 'bg-primary/10 text-primary/70',
                              level === 2 && 'bg-primary/20 text-primary/80',
                              level === 3 &&
                                'bg-primary/40 text-primary-foreground/80',
                              level === 4 &&
                                'bg-primary/70 text-primary-foreground'
                            )}
                          >
                            {cell.rooms}
                          </div>
                        ) : (
                          <div className="w-full h-8 rounded-md" />
                        )}
                      </div>
                    );

                    if (cell) {
                      return (
                        <Tooltip key={key}>
                          <TooltipTrigger asChild>{cellDiv}</TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="bg-sky-50 border border-sky-300 max-w-[220px] pt-2 pb-4"
                          >
                            <div className="space-y-1.5 text-sky-900">
                              <div className="font-semibold text-xs">
                                {hotel.name}
                              </div>
                              <div className="text-[11px] ">
                                {format(date, 'EEE, MMM d')}
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1">
                                  <BedDouble className="h-3 w-3" /> {cell.rooms}{' '}
                                  rooms
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" /> {cell.crew} crew
                                </span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return cloneElement(cellDiv, { key });
                  })}
                </div>
              );
            })}

            {hotels.length === 0 && isLoading && (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-muted-foreground">Loading…</p>
              </div>
            )}
            {hotels.length === 0 && !isLoading && (
              <div className="px-5 py-12 text-center">
                <p className="text-sm font-medium text-foreground">
                  No hotels in this market
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a different market to view occupancy
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 py-3 border-t bg-muted/20">
          <span className="text-[11px] text-muted-foreground">Rooms:</span>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-6 rounded bg-primary/10" />
            <span className="text-[10px] text-muted-foreground">1-2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-6 rounded bg-primary/20" />
            <span className="text-[10px] text-muted-foreground">3-4</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-6 rounded bg-primary/40" />
            <span className="text-[10px] text-muted-foreground">5-6</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-6 rounded bg-primary/70" />
            <span className="text-[10px] text-muted-foreground">7+</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

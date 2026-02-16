'use client';

import { useMarketContext } from '@/app/(protected)/_contexts/MarketContext';
import { useBookingsContext } from '@/app/(protected)/bookings/ContextProvider';
import { PageLayout, StatusBadge } from '@/stories';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Plus, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AppHeader } from '../_components/AppHeader';
import HotelOccupancyGrid from './_components/HotelOccupancyGrid';

const statusFilters = [
  'all',
  'confirmed',
  'pending',
  'completed',
  'cancelled',
  'checked_in',
] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const item = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } };

function formatCheckIn(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function BookingsClientPage() {
  const { currentMarket } = useMarketContext();
  const { bookings, hotels, isLoading } = useBookingsContext();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (filter !== 'all' && b.status !== filter) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        const flightMatch = (b.flightNumber ?? '')
          .toLowerCase()
          .includes(searchLower);
        const invoiceMatch = (b.invoiceNumber ?? '')
          .toLowerCase()
          .includes(searchLower);
        if (!flightMatch && !invoiceMatch) return false;
      }
      return true;
    });
  }, [bookings, filter, search]);

  const marketName = currentMarket?.name ?? 'All Markets';

  return (
    <PageLayout header={<AppHeader />}>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Bookings</h1>
            {currentMarket && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {marketName} - {filtered.length} booking
                {filtered.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> New Booking
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            {statusFilters.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  filter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search flight or booking #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-card py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <HotelOccupancyGrid
          hotels={hotels}
          bookings={filtered}
          isLoading={isLoading}
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          key={(currentMarket?._id ?? 'all') + filter}
          className="space-y-3"
        >
          {filtered.map(b => (
            <motion.div
              key={b._id}
              variants={item}
              className="rounded-lg border bg-card p-5 hover:shadow-sm transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">-</span>
                    <span className="text-sm font-medium text-foreground">
                      {b.flightNumber ?? '-'}
                    </span>
                    <StatusBadge
                      status={
                        b.status as
                          | 'confirmed'
                          | 'pending'
                          | 'completed'
                          | 'cancelled'
                          | 'checked_in'
                      }
                    />
                    {b.bookingType === 'disruption' && (
                      <span className="rounded-full bg-status-warning-bg px-2 py-0.5 text-xs font-medium text-status-warning-text">
                        Disruption
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {b.crewSize} crew - {b.roomsBooked} rooms
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatCheckIn(b.checkInDate)} - {b.nights ?? 0} night
                      {(b.nights ?? 0) > 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />$
                      {b.ratePerRoom ?? 0}/night - $
                      {(b.totalCost ?? 0).toLocaleString()} total
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="rounded-md border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
                    Details
                  </button>
                  {b.status !== 'cancelled' && b.status !== 'completed' && (
                    <button className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-lg border bg-card p-12 text-center">
              <p className="font-medium text-foreground">No bookings found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {currentMarket
                  ? `No bookings in ${marketName}. Try selecting All Markets.`
                  : 'Try adjusting your filters or create a new booking'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
}

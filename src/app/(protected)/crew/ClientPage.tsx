'use client';

import type { CrewMemberStay } from '@/convex/functions/aggregates/crewMembersPage';
import { AddCrewMemberSheet } from '@/modules/crew-members';
import { Button, PageLayout } from '@/stories';
import { motion } from 'framer-motion';
import {
  Building2,
  ChevronDown,
  Filter,
  Search,
  UserPlus,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppHeader } from '../_components/AppHeader';
import { useCrewMembersContext } from './ContextProvider';
import { CrewTable } from './_components/CrewTable';

const ROWS_PER_PAGE = 25;

type PositionGroup = 'all' | 'flight_deck' | 'cabin';
type HotelFilter = 'all' | 'in_hotel' | 'no_hotel';

const todayStart = () => new Date().setHours(0, 0, 0, 0);
const todayEnd = () => new Date().setHours(23, 59, 59, 999);

function isStayActiveToday(stay: CrewMemberStay): boolean {
  const start = todayStart();
  const end = todayEnd();
  return stay.checkInDate <= end && stay.checkOutDate >= start;
}

function getCurrentStay(stays: CrewMemberStay[]): CrewMemberStay | null {
  const start = todayStart();
  const end = todayEnd();
  const active = stays.find(
    s => s.checkInDate <= end && s.checkOutDate >= start
  );
  if (active) return active;
  const upcoming = stays.find(s => s.checkOutDate >= start);
  return upcoming ?? null;
}

function FilterChip({
  label,
  active,
  onClear,
}: {
  label: string;
  active: boolean;
  onClear: () => void;
}) {
  if (!active) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
      {label}
      <button
        type="button"
        onClick={onClear}
        className="p-1 transition-colors hover:text-primary/70 hover:cursor-pointer"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function DropdownFilter<T extends string>({
  label,
  icon: Icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: React.ElementType;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeOption = options.find(o => o.value === value);
  const isFiltered = value !== 'all';

  return (
    <div ref={ref} className="relative w-[180px] shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border px-3 text-left text-sm font-medium transition-colors ${
          isFiltered
            ? 'border-primary/30 bg-primary/5 text-primary'
            : 'bg-card text-foreground hover:bg-muted'
        }`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 truncate">
          {isFiltered ? activeOption?.label : label}
        </span>
        <ChevronDown
          className={`ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border bg-card shadow-lg">
          <div className="py-1">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                  value === opt.value
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CrewMembersClientPage() {
  const { crewOverview } = useCrewMembersContext();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<PositionGroup>('all');
  const [hotelFilter, setHotelFilter] = useState<HotelFilter>('all');
  const [visibleRows, setVisibleRows] = useState(ROWS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const crew = crewOverview?.crewMembers ?? [];

  const filtered = useMemo(() => {
    return crew.filter(c => {
      const currentStay = getCurrentStay(c.stays);
      const inHotel = Boolean(currentStay && isStayActiveToday(currentStay));

      if (
        positionFilter === 'flight_deck' &&
        c.position !== 'captain' &&
        c.position !== 'first_officer'
      )
        return false;
      if (positionFilter === 'cabin' && c.position !== 'flight_attendant')
        return false;

      if (hotelFilter === 'in_hotel' && !inHotel) return false;
      if (hotelFilter === 'no_hotel' && inHotel) return false;

      if (search) {
        const q = search.toLowerCase();
        const hotelName = currentStay?.hotel.name?.toLowerCase() ?? '';
        return (
          c.name.toLowerCase().includes(q) ||
          (c.email?.toLowerCase().includes(q) ?? false) ||
          (c.position?.toLowerCase().includes(q) ?? false) ||
          (c.seniorityCode?.toLowerCase().includes(q) ?? false) ||
          hotelName.includes(q)
        );
      }
      return true;
    });
  }, [crew, search, positionFilter, hotelFilter]);

  useEffect(() => {
    setVisibleRows(ROWS_PER_PAGE);
  }, [search, positionFilter, hotelFilter]);

  const displayed = filtered.slice(0, visibleRows);
  const hasMore = visibleRows < filtered.length;

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleRows(prev => prev + ROWS_PER_PAGE);
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, filtered.length]);

  const activeFilterCount = [
    positionFilter !== 'all',
    hotelFilter !== 'all',
  ].filter(Boolean).length;

  const clearAll = () => {
    setPositionFilter('all');
    setHotelFilter('all');
    setSearch('');
  };

  const isLoading = crewOverview === undefined;
  const hasActiveFilters = activeFilterCount > 0 || search.length > 0;

  const emptyState =
    filtered.length === 0
      ? {
          message: hasActiveFilters
            ? 'Try adjusting your filters or search.'
            : 'No crew members yet.',
          showClearButton: hasActiveFilters,
          onClear: clearAll,
        }
      : undefined;

  return (
    <PageLayout header={<AppHeader />}>
      <div className="mx-auto max-w-7xl space-y-5 p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Crew Members
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {filtered.length} member{filtered.length !== 1 ? 's' : ''}
              {activeFilterCount > 0 &&
                ` • ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
            </p>
          </div>
          <AddCrewMemberSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            trigger={<Button text="Add Member" icon={UserPlus} size="sm" />}
          />
        </div>

        {/* Filters bar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name, email, hotel…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border bg-card py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <DropdownFilter<PositionGroup>
              label="Position"
              icon={Filter}
              value={positionFilter}
              onChange={setPositionFilter}
              options={[
                { value: 'all', label: 'All Positions' },
                { value: 'flight_deck', label: 'Flight Deck (Pilots)' },
                { value: 'cabin', label: 'Cabin Crew' },
              ]}
            />
            <DropdownFilter<HotelFilter>
              label="Hotel"
              icon={Building2}
              value={hotelFilter}
              onChange={setHotelFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'in_hotel', label: 'Currently in Hotel' },
                { value: 'no_hotel', label: 'Not in Hotel' },
              ]}
            />
          </div>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip
                label={
                  positionFilter === 'flight_deck'
                    ? 'Flight Deck'
                    : 'Cabin Crew'
                }
                active={positionFilter !== 'all'}
                onClear={() => setPositionFilter('all')}
              />
              <FilterChip
                label={hotelFilter === 'in_hotel' ? 'In Hotel' : 'No Hotel'}
                active={hotelFilter !== 'all'}
                onClear={() => setHotelFilter('all')}
              />
              <Button
                variant="ghost"
                icon={X}
                text="Clear all"
                size="xs"
                onClick={clearAll}
              />
            </div>
          )}
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden rounded-lg border bg-card"
        >
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Loading crew…
            </div>
          ) : (
            <CrewTable crew={displayed} emptyState={emptyState} />
          )}

          {hasMore && <div ref={sentinelRef} className="h-1" />}
          {filtered.length > 0 && !isLoading && (
            <div className="border-t px-4 py-2.5 text-xs text-muted-foreground">
              Showing {displayed.length} of {filtered.length} members
            </div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
}

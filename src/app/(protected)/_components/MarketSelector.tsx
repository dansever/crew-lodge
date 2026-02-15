'use client';

import { useMarketContext } from '@/app/(protected)/_contexts/MarketContext';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import type { Market, MarketId } from '@/convex/types';
import { AddMarketSheet } from '@/modules/markets';
import { Button, Input, Sheet } from '@/stories';
import { useQuery } from 'convex/react';
import { CheckCircle2, ChevronDown, MapPin, Plane, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function MarketSelector({
  markets: marketsProp,
}: {
  markets?: Market[] | undefined;
} = {}) {
  const {
    currentMarket,
    setCurrentMarketId,
    markets: marketsFromContext,
  } = useMarketContext();
  const airports = useQuery(api.functions.airports.listMyAirports);

  // Prefer context markets (live data), fallback to prop for flexibility
  const markets = marketsFromContext ?? marketsProp;
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search query to avoid too many re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  const isLoading = markets === undefined;
  const marketCount = markets?.length ?? 0;

  // Count airports per market
  const airportCountByMarketId = useMemo(() => {
    if (!airports) return new Map<string, number>();
    const counts = new Map<string, number>();
    for (const airport of airports) {
      const id = airport.marketId;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  }, [airports]);

  // Filter markets for the selector sheet
  const filteredMarkets = useMemo(() => {
    if (!markets) return [];

    let filtered = markets;

    // Filter by search query (name, country)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (market: Market) =>
          market.name?.toLowerCase().includes(query) ||
          market.country?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [markets, searchQuery]);

  const handleMarketSelect = useCallback(
    (marketId: MarketId) => {
      setCurrentMarketId(marketId);
      setOpen(false);
    },
    [setCurrentMarketId]
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  const handleTriggerClick = useCallback(() => {
    setOpen(true);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
    },
    []
  );

  return (
    <Sheet
      side="left"
      width="sm"
      open={open}
      onOpenChange={handleOpenChange}
      title="Select Market"
      description="Select a market to filter by"
      trigger={
        <MarketSelectorTrigger
          currentMarket={currentMarket}
          marketCount={marketCount}
          airportCountByMarketId={airportCountByMarketId}
          isLoading={isLoading}
          onClick={handleTriggerClick}
        />
      }
    >
      {/* Filters */}
      <div className="q-full p-2 flex flex-col gap-4">
        <Input
          placeholder="Search markets by name or country..."
          value={searchInput}
          onChange={handleSearchChange}
        />
        <div className="flex justify-end">
          <AddMarketSheet trigger={<Button icon={Plus} text="Add Market" />} />
        </div>
      </div>
      <MarketsList
        markets={filteredMarkets}
        airportCountByMarketId={airportCountByMarketId}
        isLoading={isLoading}
        onMarketSelect={handleMarketSelect}
        currentMarket={currentMarket}
      />
    </Sheet>
  );
}

interface MarketSelectorTriggerProps {
  currentMarket: Market | null | undefined;
  marketCount: number;
  airportCountByMarketId: Map<string, number>;
  isLoading: boolean;
  onClick: () => void;
}

function MarketSelectorTrigger({
  currentMarket,
  marketCount,
  airportCountByMarketId,
  isLoading,
  onClick,
}: MarketSelectorTriggerProps) {
  const airportCount =
    currentMarket?._id != null
      ? (airportCountByMarketId.get(currentMarket._id) ?? 0)
      : 0;

  if (isLoading) {
    return (
      <button
        onClick={onClick}
        className="group px-3 py-1.5 relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/40 transition-all duration-200 hover:border-slate-300/80 dark:hover:border-slate-600/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:shadow-sm w-full text-left"
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-700/40 dark:to-slate-800/40 flex items-center justify-center border border-slate-200/80 dark:border-slate-700/40">
            <Skeleton className="w-5 h-5 text-slate-600 dark:text-white/70" />
          </div>
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-700/60 mb-2" />
            <Skeleton className="h-3 w-32 bg-slate-200 dark:bg-slate-700/60" />
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/60 shrink-0" />
        </div>
      </button>
    );
  }

  if (currentMarket) {
    const location = currentMarket.country ?? 'No location';
    const airportLabel =
      airportCount === 0
        ? '0 airports'
        : airportCount === 1
          ? '1 airport'
          : `${airportCount} airports`;

    return (
      <button
        onClick={onClick}
        className="group px-3 py-1.5 relative overflow-hidden rounded-xl dark:bg-slate-800/40 transition-all duration-200 hover:border-slate-300/80 dark:hover:border-slate-600/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 w-full text-left"
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center border border-primary/20 dark:border-primary/30">
            <Plane className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
              {currentMarket.name}
            </h4>
            <p className="text-xs text-slate-600 dark:text-white/70 truncate">
              {location} • {airportLabel}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/60 shrink-0 group-hover:text-slate-600 dark:group-hover:text-white/80 transition-colors" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group px-3 py-1.5 relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:border-slate-300/80 dark:hover:border-slate-600/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:shadow-sm w-full text-left"
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-700/40 dark:to-slate-800/40 flex items-center justify-center border border-slate-200/80 dark:border-slate-700/40">
          <MapPin className="w-5 h-5 text-slate-600 dark:text-white/70" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
            Select Market
          </h4>
          <p className="text-xs text-slate-600 dark:text-white/70">
            {marketCount === 0
              ? 'No markets available'
              : marketCount === 1
                ? '1 market available'
                : `${marketCount} markets available`}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/60 shrink-0 group-hover:text-slate-600 dark:group-hover:text-white/80 transition-colors" />
      </div>
    </button>
  );
}

interface MarketsListProps {
  markets: Market[] | undefined;
  airportCountByMarketId: Map<string, number>;
  isLoading: boolean;
  onMarketSelect: (marketId: MarketId) => void;
  currentMarket: Market | null | undefined;
}

function MarketsList({
  markets,
  airportCountByMarketId,
  isLoading,
  onMarketSelect,
  currentMarket,
}: MarketsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="w-full rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/40 p-4"
          >
            <Skeleton className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700/60 mb-2" />
            <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-700/60 mb-4" />
            <Skeleton className="h-8 w-1/3 bg-slate-200 dark:bg-slate-700/60" />
          </div>
        ))}
      </div>
    );
  }

  if (!markets || markets.length === 0) {
    return (
      <div className="text-center py-16 w-full rounded-2xl border border-slate-200/80 dark:border-slate-700/40 bg-white dark:bg-slate-800/40">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-slate-600 dark:text-white/60" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          No markets found
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Try a different search or add markets to your organization
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full pb-2 p-1">
      {markets.map(market => (
        <MarketCard
          key={market._id}
          market={market}
          airportCount={airportCountByMarketId.get(market._id) ?? 0}
          onSelect={onMarketSelect}
          isActive={currentMarket?._id === market._id}
        />
      ))}
    </div>
  );
}

function MarketCard({
  market,
  airportCount,
  onSelect,
  isActive,
}: {
  market: Market;
  airportCount: number;
  onSelect: (marketId: MarketId) => void;
  isActive?: boolean;
}) {
  if (!market) return null;

  const handleClick = () => {
    onSelect(market._id);
  };

  const location = market.country ?? 'No location';

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-2 rounded-2xl"
    >
      <div
        className={`
      box-border w-full h-[88px] min-h-[88px] overflow-hidden
      rounded-2xl border p-4 shadow-sm transition-colors duration-200
      ${
        isActive
          ? 'border-sky-400 bg-sky-50/50 hover:bg-sky-100/40 shadow-md dark:bg-sky-500/10 dark:border-sky-500/30'
          : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/40 dark:hover:border-slate-600/60 dark:hover:bg-slate-800/60 dark:shadow-none'
      }
    `}
      >
        <div className="flex items-center gap-3 w-full h-full min-w-0">
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <h5
                title={market.name}
                className={`text-sm font-semibold line-clamp-2 min-w-0 wrap-break-words ${
                  isActive
                    ? 'text-primary dark:text-primary'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {market.name}
              </h5>
              {isActive && (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
              )}
            </div>
            <p
              title={location}
              className="text-sm text-slate-600 dark:text-white/75 line-clamp-2"
            >
              {location}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200"
          >
            {airportCount === 0
              ? '0 airports'
              : airportCount === 1
                ? '1 airport'
                : `${airportCount} airports`}
          </Badge>
        </div>
      </div>
    </button>
  );
}

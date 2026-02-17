'use client';

import { api } from '@/convex/_generated/api';
import type { Market, MarketId } from '@/convex/types';
import { useConvexAuth, useQuery } from 'convex/react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

interface MarketContextValue {
  currentMarket: Market | null;
  setCurrentMarketId: (marketId: MarketId | null) => void;
  markets: Market[] | undefined;
}

const MarketContext = createContext<MarketContextValue | null>(null);

const STORAGE_KEY = 'crew-lodge-current-market-id';

export function MarketProvider({ children }: { children: React.ReactNode }) {
  // Use the useConvexAuth hook to check if the user is authenticated and if the markets are loading
  const { isLoading, isAuthenticated } = useConvexAuth();

  // Use the useQuery hook to get the markets
  // If the user is not authenticated or the markets are loading, skip the query
  // Otherwise, get the markets
  const markets = useQuery(
    api.functions.markets.listMyMarkets,
    isLoading || !isAuthenticated ? 'skip' : {}
  );

  // Use the useState hook to store the current market id
  const [currentMarketId, setCurrentMarketIdState] = useState<MarketId | null>(
    () => {
      if (typeof window === 'undefined') return null;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return stored as MarketId;
      } catch {
        /* ignore */
      }
      return null;
    }
  );

  const setCurrentMarketId = useCallback((marketId: MarketId | null) => {
    setCurrentMarketIdState(marketId);
    try {
      if (marketId) {
        localStorage.setItem(STORAGE_KEY, marketId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const currentMarket = useMemo(() => {
    if (!markets || !currentMarketId) return null;
    return markets.find((m: Market) => m._id === currentMarketId) ?? null;
  }, [markets, currentMarketId]);

  // Auto-select first market if none is selected
  useEffect(() => {
    if (markets && markets.length > 0 && !currentMarketId) {
      setCurrentMarketId(markets[0]._id);
    }
  }, [markets, currentMarketId, setCurrentMarketId]);

  // Handle stale market ID (if stored market was deleted)
  useEffect(() => {
    if (markets && currentMarketId && !currentMarket && markets.length > 0) {
      setCurrentMarketId(markets[0]._id);
    }
  }, [markets, currentMarketId, currentMarket, setCurrentMarketId]);

  const value = useMemo<MarketContextValue>(
    () => ({
      currentMarket,
      setCurrentMarketId,
      markets,
    }),
    [currentMarket, setCurrentMarketId, markets]
  );

  return (
    <MarketContext.Provider value={value}>{children}</MarketContext.Provider>
  );
}

export function useMarketContext(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) {
    throw new Error('useMarketContext must be used within MarketProvider');
  }
  return ctx;
}

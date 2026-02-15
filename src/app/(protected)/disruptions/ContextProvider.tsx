'use client';

import { api } from '@/convex/_generated/api';
import type { Airport, Disruption, Market } from '@/convex/types';
import { Preloaded, usePreloadedQuery } from 'convex/react';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type DisruptionsPageData = {
  disruptions: Disruption[];
  airports: Airport[];
  markets: Market[];
};

export type PreloadedDisruptionsPage = Preloaded<
  typeof api.functions.aggregates.disruptionsPage.getDisruptionsPageData
>;

interface DisruptionsContextValue {
  data: DisruptionsPageData | undefined;
  disruptions: Disruption[];
  airports: Airport[];
  markets: Market[];
}

const DisruptionsContext = createContext<DisruptionsContextValue | null>(null);

interface DisruptionsContextProviderProps {
  preloadedData: PreloadedDisruptionsPage;
  children: ReactNode;
}

export function DisruptionsContextProvider({
  preloadedData,
  children,
}: DisruptionsContextProviderProps) {
  const data = usePreloadedQuery(preloadedData);

  const value = useMemo<DisruptionsContextValue>(() => {
    const empty: DisruptionsPageData = {
      disruptions: [],
      airports: [],
      markets: [],
    };
    const d = data ?? empty;
    return {
      data: d,
      disruptions: d.disruptions ?? [],
      airports: d.airports ?? [],
      markets: d.markets ?? [],
    };
  }, [data]);

  return (
    <DisruptionsContext.Provider value={value}>
      {children}
    </DisruptionsContext.Provider>
  );
}

export function useDisruptionsContext(): DisruptionsContextValue {
  const ctx = useContext(DisruptionsContext);
  if (!ctx) {
    throw new Error(
      'useDisruptionsContext must be used within DisruptionsContextProvider'
    );
  }
  return ctx;
}

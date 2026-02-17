'use client';

import { api } from '@/convex/_generated/api';
import type { DashboardData } from '@/convex/functions/aggregates/dashboard';
import { Preloaded, usePreloadedQuery } from 'convex/react';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type PreloadedDashboard = Preloaded<
  typeof api.functions.aggregates.dashboard.getDashboard
>;

interface DashboardContextValue {
  /** Dashboard data; undefined when loading */
  data: DashboardData | undefined;
  /** Convenience: active disruptions */
  disruptions: NonNullable<DashboardData>['disruptions'];
  /** Convenience: stats */
  stats: NonNullable<DashboardData>['stats'];
  /** Convenience: market summaries */
  markets: NonNullable<DashboardData>['markets'];
  /** Convenience: recent activity */
  recentActivity: NonNullable<DashboardData>['recentActivity'];
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

interface DashboardContextProviderProps {
  preloadedDashboard: PreloadedDashboard;
  children: ReactNode;
}

export function DashboardContextProvider({
  preloadedDashboard,
  children,
}: DashboardContextProviderProps) {
  const data = usePreloadedQuery(preloadedDashboard);

  const value = useMemo<DashboardContextValue>(() => {
    const empty: DashboardData = {
      disruptions: [],
      stats: {
        activeBookings: 0,
        pendingBookings: 0,
        todaySpend: 0,
        avgRatePerNight: 0,
      },
      markets: [],
      recentActivity: [],
    };
    const d = data ?? empty;
    return {
      data: d,
      disruptions: d.disruptions,
      stats: d.stats,
      markets: d.markets,
      recentActivity: d.recentActivity,
    };
  }, [data]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error(
      'useDashboardContext must be used within DashboardContextProvider'
    );
  }
  return ctx;
}

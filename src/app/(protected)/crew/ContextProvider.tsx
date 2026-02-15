'use client';

import { api } from '@/convex/_generated/api';
import type { CrewMembersPageData } from '@/convex/functions/aggregates/crewMembersPage';
import { Preloaded, usePreloadedQuery } from 'convex/react';
import { createContext, useContext, type ReactNode } from 'react';

/** Preloaded crew overview data */
export type PreloadedCrewOverview = Preloaded<
  typeof api.functions.aggregates.crewMembersPage.getCrewMembersPageData
>;

interface CrewMembersContextValue {
  /** All personnel with their hotel stays */
  crewOverview: CrewMembersPageData | undefined;
}

const CrewMembersContext = createContext<CrewMembersContextValue | null>(null);

interface CrewMembersContextProviderProps {
  preloadedCrewOverview: PreloadedCrewOverview;
  children: ReactNode;
}

export function CrewMembersContextProvider({
  preloadedCrewOverview,
  children,
}: CrewMembersContextProviderProps) {
  const crewOverview = usePreloadedQuery(preloadedCrewOverview);

  return (
    <CrewMembersContext.Provider value={{ crewOverview }}>
      {children}
    </CrewMembersContext.Provider>
  );
}

export function useCrewMembersContext(): CrewMembersContextValue {
  const ctx = useContext(CrewMembersContext);
  if (!ctx) {
    throw new Error(
      'useCrewMembersContext must be used within CrewMembersContextProvider'
    );
  }
  return ctx;
}

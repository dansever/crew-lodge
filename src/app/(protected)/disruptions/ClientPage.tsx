'use client';

import type { AirportId, Disruption } from '@/convex/types';
import { AirportCombobox } from '@/modules/airports';
import { DisruptionCard, DisruptionSheet } from '@/modules/disruptions';
import { Button, PageLayout } from '@/stories';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { AppHeader } from '../_components/AppHeader';
import { useDisruptionsContext } from './ContextProvider';

export default function DisruptionsClientPage() {
  const { disruptions, airports, markets } = useDisruptionsContext();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDisruption, setSelectedDisruption] =
    useState<Disruption | null>(null);
  const [filterAirportId, setFilterAirportId] = useState<AirportId | null>(
    null
  );

  const filteredDisruptions = useMemo(() => {
    if (!filterAirportId) return disruptions;
    return disruptions.filter(d => {
      if (d.airportId) return d.airportId === filterAirportId;
      if (d.location) {
        const airport = airports.find(a => a._id === filterAirportId);
        if (!airport) return false;
        const matchTerms = [
          airport.iata,
          airport.icao,
          airport.name,
          airport.city,
        ]
          .filter((v): v is string => Boolean(v))
          .map(t => t.toLowerCase());
        const loc = d.location.toLowerCase();
        return matchTerms.some(t => loc === t || loc.includes(t));
      }
      return false;
    });
  }, [disruptions, airports, filterAirportId]);

  const openViewSheet = useCallback((disruption: Disruption) => {
    setSelectedDisruption(disruption);
    setSheetOpen(true);
  }, []);

  return (
    <PageLayout header={<AppHeader />}>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Disruptions
          </h1>
          <div className="flex items-center gap-2">
            <DisruptionSheet
              disruption={selectedDisruption}
              airports={airports}
              markets={markets}
              open={sheetOpen}
              onOpenChange={open => {
                setSheetOpen(open);
                if (!open) setSelectedDisruption(null);
              }}
              trigger={
                <Button
                  text="Create Disruption"
                  icon={Plus}
                  size="sm"
                  onClick={() => setSelectedDisruption(null)}
                />
              }
            />
          </div>
        </div>

        <AirportCombobox
          airports={airports}
          value={filterAirportId ?? undefined}
          onChange={id => setFilterAirportId(id ?? null)}
          placeholder="Filter by airport…"
        />

        {filteredDisruptions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Active ({filteredDisruptions.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredDisruptions.map(d => (
                <DisruptionCard
                  key={d._id}
                  disruption={d}
                  airports={airports}
                  onDetailsClick={openViewSheet}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

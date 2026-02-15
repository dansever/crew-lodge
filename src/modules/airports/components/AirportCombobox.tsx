'use client';

import type { Airport, AirportId } from '@/convex/types';
import { EntitySelector, type EntitySelectorAddConfig } from '@/stories';

export interface AirportComboboxProps {
  /** Airports from the organization (e.g. from useQuery or context) */
  airports: Airport[];
  value?: AirportId;
  onChange?: (airportId: AirportId) => void;
  placeholder?: string;
  className?: string;
  addConfig?: EntitySelectorAddConfig<Airport>;
}

export function AirportCombobox({
  airports,
  value,
  onChange,
  placeholder = 'Select airport…',
  className,
  addConfig,
}: AirportComboboxProps) {
  const valueStr = value ?? undefined;

  return (
    <EntitySelector<Airport>
      items={airports}
      value={valueStr}
      onChange={v => onChange?.(v as AirportId)}
      getValue={a => a._id}
      getPrimaryLabel={a => a.name}
      getSecondaryLabel={a =>
        [a.city, a.country].filter(Boolean).join(', ') || ''
      }
      getBadgeLabel={(a): string => a.iata ?? a.icao ?? ''}
      messages={{
        placeholder,
        search: 'Search airports…',
        empty: 'No airport found.',
      }}
      showValueBadge
      addConfig={addConfig}
      className={className}
    />
  );
}

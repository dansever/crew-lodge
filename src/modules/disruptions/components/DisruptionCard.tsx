'use client';

import type { Airport, Disruption } from '@/convex/types';
import { StatusBadge } from '@/stories';

function airportLabel(a: Airport) {
  return `${[a.iata, a.icao].filter(Boolean).join('/')} - ${a.name}`;
}

function getLocationLabel(
  disruption: Disruption,
  airports: Airport[]
): string | undefined {
  if (disruption.eventSummary) return disruption.eventSummary;
  if (disruption.airportId) {
    const ap = airports.find(a => a._id === disruption.airportId);
    return ap ? airportLabel(ap) : undefined;
  }
  return disruption.location;
}

const VALID_STATUSES = [
  'open',
  'searching',
  'options_ready',
  'resolved',
] as const;
type StatusBadgeStatus = (typeof VALID_STATUSES)[number];

function toStatusBadgeStatus(s: string | undefined): StatusBadgeStatus {
  if (s && VALID_STATUSES.includes(s as StatusBadgeStatus)) {
    return s as StatusBadgeStatus;
  }
  return 'open';
}

export interface DisruptionCardProps {
  disruption: Disruption;
  airports?: Airport[];
  onDetailsClick?: (disruption: Disruption) => void;
}

export function DisruptionCard({
  disruption,
  airports = [],
  onDetailsClick,
}: DisruptionCardProps) {
  const handleClick = () => {
    onDetailsClick?.(disruption);
  };
  const locationLabel = getLocationLabel(disruption, airports);

  return (
    <div
      role={onDetailsClick ? 'button' : undefined}
      tabIndex={onDetailsClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={e => {
        if (onDetailsClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`rounded-lg border bg-card p-4 ${
        onDetailsClick
          ? 'cursor-pointer hover:border-primary/50 transition-colors'
          : ''
      }`}
    >
      <div className="flex gap-2 items-start justify-between mb-2">
        {locationLabel && (
          <p className="text-sm text-muted-foreground">{locationLabel}</p>
        )}
        <StatusBadge status={toStatusBadgeStatus(disruption.status)} />
      </div>
      <p className="text-sm text-muted-foreground">
        {disruption.crewSize} crew - {disruption.nights} night
        {disruption.nights === 1 ? '' : 's'} -{' '}
        {disruption.eventType.replace(/\b\w/g, c => c.toUpperCase())}
      </p>
      {disruption.eventReason && (
        <p className="text-xs text-muted-foreground mt-1">
          {disruption.eventReason}
        </p>
      )}
      {disruption.notes && (
        <p className="text-xs text-muted-foreground mt-1">{disruption.notes}</p>
      )}
    </div>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type {
  CrewMemberStay,
  CrewMemberWithStays,
} from '@/convex/functions/aggregates/crewMembersPage';
import { Mail, Phone } from 'lucide-react';

const positionLabels: Record<string, string> = {
  captain: 'Captain',
  first_officer: 'First Officer',
  flight_attendant: 'Flight Attendant',
};

const positionColors: Record<string, string> = {
  captain: 'bg-primary/10 text-primary border-primary/20',
  first_officer: 'bg-accent text-accent-foreground border-border',
  flight_attendant: 'bg-secondary text-secondary-foreground border-border',
};

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

export interface CrewTableEmptyState {
  message: string;
  showClearButton?: boolean;
  onClear?: () => void;
}

export interface CrewTableProps {
  /** Rows to display (already filtered and paginated by parent) */
  crew: CrewMemberWithStays[];
  /** Shown when crew is empty */
  emptyState?: CrewTableEmptyState;
}

export function CrewTable({ crew, emptyState }: CrewTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Name</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Seniority</TableHead>
          <TableHead>Current Hotel</TableHead>
          <TableHead className="hidden md:table-cell">Contact</TableHead>
          <TableHead className="hidden lg:table-cell">Preferences</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {crew.map(c => {
          const currentStay = getCurrentStay(c.stays);
          const inHotel = Boolean(
            currentStay && isStayActiveToday(currentStay)
          );
          const prefs = c.preferences as
            | { dietary?: string; roomType?: string; notes?: string }
            | undefined;

          return (
            <TableRow key={c._id} className="cursor-pointer">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {c.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {c.name}
                    </p>
                    {c.passportNumber && (
                      <p className="text-xs text-muted-foreground">
                        PP: {c.passportNumber}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {c.position && (
                  <span
                    className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${positionColors[c.position] ?? ''}`}
                  >
                    {positionLabels[c.position] ?? c.position}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm text-muted-foreground">
                  {c.seniorityCode ?? '—'}
                </span>
              </TableCell>
              <TableCell>
                <div className="min-w-0">
                  {currentStay ? (
                    <>
                      <p className="truncate text-sm text-foreground">
                        {currentStay.hotel.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(currentStay.checkInDate).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                          }
                        )}{' '}
                        –{' '}
                        {new Date(currentStay.checkOutDate).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </p>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-2">
                  {c.phone && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                          <Phone className="h-3.5 w-3.5" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{c.phone}</TooltipContent>
                    </Tooltip>
                  )}
                  {c.email && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                          <Mail className="h-3.5 w-3.5" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{c.email}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {prefs?.dietary && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {prefs.dietary}
                    </Badge>
                  )}
                  {prefs?.roomType && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {prefs.roomType}
                    </Badge>
                  )}
                  {prefs?.notes && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="cursor-help text-xs font-normal"
                        >
                          Notes
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[200px]">
                        {prefs.notes}
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {!prefs?.dietary && !prefs?.roomType && !prefs?.notes && (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {inHotel ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    In Hotel
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Not in Hotel
                  </span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
        {crew.length === 0 && emptyState && (
          <TableRow>
            <TableCell colSpan={7} className="h-32 text-center">
              <p className="font-medium text-foreground">
                No crew members found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {emptyState.message}
              </p>
              {emptyState.showClearButton && emptyState.onClear && (
                <button
                  type="button"
                  onClick={emptyState.onClear}
                  className="mt-2 text-sm text-primary transition-colors hover:text-primary/80"
                >
                  Clear all filters
                </button>
              )}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

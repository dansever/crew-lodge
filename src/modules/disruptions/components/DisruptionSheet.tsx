'use client';

import { FieldGroup } from '@/components/ui/field';
import { api } from '@/convex/_generated/api';
import type {
  Airport,
  AirportId,
  Disruption,
  Market,
  MarketId,
} from '@/convex/types';
import { cn } from '@/lib/utils';
import { AirportCombobox, AddAirportInlineForm } from '@/modules/airports';
import { AddMarketInlineForm, MarketCombobox } from '@/modules/markets';
import { parseDisruptionText } from '@/services/disruptions/parse-disruption';
import type { ParseDisruptionResult } from '@/services/disruptions/parse-disruption-schema';
import {
  Button,
  DataField,
  Input,
  Select,
  Sheet,
  StatusBadge,
  TextArea,
} from '@/stories';
import { useMutation } from 'convex/react';
import { AlertCircle, FileText, Pencil, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DisruptionParseInput } from './DisruptionParseInput';

// -----------------------------------------------------------------------------
// Types & helpers
// -----------------------------------------------------------------------------

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

const EVENT_TYPES = [
  { label: 'Delay', value: 'delay' },
  { label: 'Cancellation', value: 'cancellation' },
  { label: 'Diversion', value: 'diversion' },
] as const;

function airportLabel(a: Airport) {
  return `${[a.iata, a.icao].filter(Boolean).join('/')} - ${a.name}`;
}

function findMatchingAirport(
  airports: Airport[],
  location: string
): Airport | null {
  const lower = location.toLowerCase().trim();
  const byCode = airports.find(
    a =>
      a.iata?.toLowerCase() === lower ||
      a.icao?.toLowerCase() === lower ||
      a.name?.toLowerCase().includes(lower)
  );
  if (byCode) return byCode;
  return (
    airports.find(a =>
      [a.iata, a.icao, a.name, a.city].some(
        v => v && lower.includes(String(v).toLowerCase())
      )
    ) ?? null
  );
}

type Mode = 'view' | 'edit' | 'add';

interface FormData {
  airportId: string;
  marketId: string;
  eventType: string;
  crewSize: string;
  nights: string;
  eventReason: string;
  eventSummary: string;
  notes: string;
  status: string;
}

const EMPTY_FORM: FormData = {
  airportId: '',
  marketId: '',
  eventType: 'delay',
  crewSize: '',
  nights: '',
  eventReason: '',
  eventSummary: '',
  notes: '',
  status: 'open',
};

function disruptionToForm(d: Disruption, airports: Airport[]): FormData {
  const airport = d.airportId
    ? airports.find(a => a._id === d.airportId)
    : airports.find(
        a =>
          a.iata === d.location ||
          a.icao === d.location ||
          a.name === d.location
      );
  return {
    airportId: airport?._id ?? '',
    marketId: d.marketId ?? '',
    eventType: d.eventType ?? 'delay',
    crewSize: String(d.crewSize ?? ''),
    nights: String(d.nights ?? ''),
    eventReason: d.eventReason ?? '',
    eventSummary: d.eventSummary ?? '',
    notes: d.notes ?? '',
    status: d.status ?? 'open',
  };
}

function applyParseResultToForm(
  form: FormData,
  data: ParseDisruptionResult,
  airports: Airport[]
): FormData {
  const airport = findMatchingAirport(airports, data.location);
  return {
    ...form,
    airportId: airport?._id ?? form.airportId,
    marketId: airport?.marketId ?? form.marketId,
    eventType: data.eventType ?? form.eventType,
    crewSize:
      data.crewSize !== undefined ? String(data.crewSize) : form.crewSize,
    nights: data.nights !== undefined ? String(data.nights) : form.nights,
    eventReason: data.eventReason ?? form.eventReason,
    eventSummary: data.eventSummary ?? form.eventSummary,
    notes: data.notes ?? form.notes,
  };
}

// -----------------------------------------------------------------------------
// Form section
// -----------------------------------------------------------------------------

function FormSection({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// DisruptionSheet
// -----------------------------------------------------------------------------

export interface DisruptionSheetProps {
  disruption?: Disruption | null;
  airports: Airport[];
  markets: Market[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
}

export function DisruptionSheet({
  disruption,
  airports,
  markets,
  open,
  onOpenChange,
  trigger,
}: DisruptionSheetProps) {
  const safeMarkets = markets ?? [];
  const [isEditing, setIsEditing] = useState(false);
  const effectiveMode: Mode = disruption
    ? isEditing
      ? 'edit'
      : 'view'
    : 'add';
  const isReadOnly = effectiveMode === 'view';

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const updateDisruption = useMutation(
    api.functions.disruptions.updateDisruption
  );
  const createDisruption = useMutation(
    api.functions.disruptions.createDisruption
  );

  useEffect(() => {
    if (disruption && open) {
      setForm(disruptionToForm(disruption, airports));
    }
  }, [disruption, airports, open]);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setSubmitError(null);
      setParseError(null);
      setIsEditing(false);
    }
  }, [open]);

  const handleAiParse = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setParseError(null);
      setIsParsing(true);
      try {
        const data = await parseDisruptionText(trimmed);
        setForm(f => applyParseResultToForm(f, data, airports));
      } catch (e) {
        setParseError(e instanceof Error ? e.message : 'Parse failed');
      } finally {
        setIsParsing(false);
      }
    },
    [airports]
  );

  const locationDisplayLabel = disruption
    ? (() => {
        if (disruption.eventSummary) return disruption.eventSummary;
        if (disruption.airportId) {
          const ap = airports.find(a => a._id === disruption.airportId);
          return ap ? airportLabel(ap) : null;
        }
        return disruption.location ?? '—';
      })()
    : '—';

  const handleUpdate = useCallback(async () => {
    if (!disruption) return;
    setSubmitError(null);

    const crewSize = parseInt(form.crewSize, 10);
    const nights = parseInt(form.nights, 10);

    if (!form.airportId) {
      setSubmitError('Airport is required');
      return;
    }
    if (!form.marketId) {
      setSubmitError('Market is required');
      return;
    }

    const airport = airports.find(a => a._id === form.airportId);
    if (!airport) {
      setSubmitError('Please select a valid airport');
      return;
    }
    const market = safeMarkets.find(m => m._id === form.marketId);
    if (!market) {
      setSubmitError('Please select a valid market');
      return;
    }

    if (isNaN(crewSize) || crewSize < 1) {
      setSubmitError('Crew count must be at least 1');
      return;
    }

    if (isNaN(nights) || nights < 1) {
      setSubmitError('Nights must be at least 1');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDisruption({
        id: disruption._id,
        patch: {
          airportId: airport._id,
          marketId: market._id,
          eventType: form.eventType,
          crewSize,
          nights,
          eventReason: form.eventReason.trim() || undefined,
          eventSummary: form.eventSummary.trim() || undefined,
          notes: form.notes.trim() || undefined,
          status: form.status,
        },
      });
      setIsEditing(false);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, disruption, airports, safeMarkets, updateDisruption]);

  const handleCreate = useCallback(async () => {
    setSubmitError(null);

    const crewSize = parseInt(form.crewSize, 10);
    const nights = parseInt(form.nights, 10);

    if (!form.airportId) {
      setSubmitError('Airport is required');
      return;
    }
    if (!form.marketId) {
      setSubmitError('Market is required');
      return;
    }

    const airport = airports.find(a => a._id === form.airportId);
    if (!airport) {
      setSubmitError('Please select a valid airport');
      return;
    }
    const market = safeMarkets.find(m => m._id === form.marketId);
    if (!market) {
      setSubmitError('Please select a valid market');
      return;
    }

    if (isNaN(crewSize) || crewSize < 1) {
      setSubmitError('Crew count must be at least 1');
      return;
    }

    if (isNaN(nights) || nights < 1) {
      setSubmitError('Nights must be at least 1');
      return;
    }

    setIsSubmitting(true);
    try {
      await createDisruption({
        airportId: airport._id,
        marketId: market._id,
        eventType: form.eventType,
        crewSize,
        nights,
        eventReason: form.eventReason.trim() || undefined,
        eventSummary: form.eventSummary.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      onOpenChange(false);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, airports, safeMarkets, createDisruption, onOpenChange]);

  const config = {
    add: {
      title: 'Create Disruption',
      description: 'Add a new disruption request',
      footer: (
        <Button
          text="Create Disruption"
          onClick={handleCreate}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      ),
    },
    view: {
      title: disruption
        ? `${disruption.crewSize} crew - ${locationDisplayLabel}`
        : 'Disruption Details',
      description: 'View disruption information',
      footer: (
        <Button
          text="Edit"
          icon={Pencil}
          variant="outline"
          onClick={() => setIsEditing(true)}
        />
      ),
    },
    edit: {
      title: 'Edit Disruption',
      description: 'Update disruption information',
      footer: (
        <div className="flex flex-row gap-2 justify-end">
          <Button
            text="Cancel"
            variant="ghost"
            onClick={() => setIsEditing(false)}
          />
          <Button
            text="Save"
            onClick={handleUpdate}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </div>
      ),
    },
  };

  const cfg = config[effectiveMode];

  const airportAddConfig =
    effectiveMode === 'add'
      ? {
          label: 'Add Airport',
          icon: AlertCircle,
          title: 'New Airport',
          renderForm: ({
            onSubmit,
            onCancel,
          }: {
            onSubmit: (item: Airport) => void;
            onCancel: () => void;
          }) => (
            <AddAirportInlineForm
              onSubmit={onSubmit}
              onCancel={onCancel}
              onAdd={() => {}}
            />
          ),
          onAdd: () => {},
        }
      : undefined;

  const marketAddConfig =
    effectiveMode === 'add'
      ? {
          label: 'Add Market',
          icon: AlertCircle,
          title: 'New Market',
          renderForm: ({
            onSubmit,
            onCancel,
          }: {
            onSubmit: (item: Market) => void;
            onCancel: () => void;
          }) => (
            <AddMarketInlineForm
              onSubmit={onSubmit}
              onCancel={onCancel}
              onAdd={() => {}}
            />
          ),
          onAdd: () => {},
        }
      : undefined;

  return (
    <Sheet
      title={cfg.title}
      description={cfg.description}
      open={open}
      onOpenChange={onOpenChange}
      width="xl"
      footer={<div className="flex gap-2 justify-end">{cfg.footer}</div>}
      trigger={trigger}
    >
      <div>
        {(effectiveMode === 'edit' || effectiveMode === 'add') && (
          <div className="rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3 space-y-2 mb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0" />
              <span className="text-sm font-medium">AI parse</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Describe the disruption to auto-fill the form.
            </p>
            <div className="flex gap-2">
              <DisruptionParseInput
                inProgress={isParsing}
                onSend={handleAiParse}
              />
            </div>
            {parseError && (
              <p className="text-xs text-destructive">{parseError}</p>
            )}
          </div>
        )}

        <FieldGroup className="flex flex-col gap-6 px-1">
          <FormSection title="Details" icon={AlertCircle}>
            <div className="grid grid-cols-2 gap-3">
              <DataField label="Airport">
                {isReadOnly ? (
                  <p className="text-sm text-muted-foreground">
                    {disruption?.airportId
                      ? (() => {
                          const ap = airports.find(
                            a => a._id === disruption.airportId
                          );
                          return ap
                            ? airportLabel(ap)
                            : (disruption.location ?? '—');
                        })()
                      : (disruption?.location ?? '—')}
                  </p>
                ) : (
                  <AirportCombobox
                    airports={airports}
                    value={
                      (form.airportId || undefined) as AirportId | undefined
                    }
                    onChange={v => setForm(f => ({ ...f, airportId: v ?? '' }))}
                    placeholder="Select airport…"
                    addConfig={airportAddConfig}
                  />
                )}
              </DataField>
              <DataField label="Market">
                {isReadOnly ? (
                  <p className="text-sm text-muted-foreground">
                    {disruption?.marketId
                      ? (safeMarkets.find(m => m._id === disruption.marketId)
                          ?.name ?? '—')
                      : '—'}
                  </p>
                ) : (
                  <MarketCombobox
                    markets={safeMarkets}
                    value={(form.marketId || undefined) as MarketId | undefined}
                    onChange={v => setForm(f => ({ ...f, marketId: v ?? '' }))}
                    placeholder="Select market…"
                    addConfig={marketAddConfig}
                  />
                )}
              </DataField>
              <DataField label="Crew size">
                {isReadOnly ? (
                  <p className="text-sm text-muted-foreground">
                    {form.crewSize || '—'}
                  </p>
                ) : (
                  <Input
                    type="number"
                    placeholder="e.g. 8"
                    value={form.crewSize}
                    onChange={e =>
                      setForm(f => ({ ...f, crewSize: e.target.value }))
                    }
                  />
                )}
              </DataField>
              <DataField label="Nights">
                {isReadOnly ? (
                  <p className="text-sm text-muted-foreground">
                    {form.nights || '—'}
                  </p>
                ) : (
                  <Input
                    type="number"
                    placeholder="e.g. 1"
                    value={form.nights}
                    onChange={e =>
                      setForm(f => ({ ...f, nights: e.target.value }))
                    }
                  />
                )}
              </DataField>
              <DataField label="Event type">
                {isReadOnly ? (
                  <p className="text-sm text-muted-foreground capitalize">
                    {form.eventType || '—'}
                  </p>
                ) : (
                  <Select
                    value={form.eventType}
                    onValueChange={v => setForm(f => ({ ...f, eventType: v }))}
                    items={EVENT_TYPES.map(t => ({
                      label: t.label,
                      value: t.value,
                    }))}
                    placeholder="Select type"
                  />
                )}
              </DataField>
              {effectiveMode !== 'add' && (
                <DataField label="Status">
                  {isReadOnly ? (
                    <div>
                      <StatusBadge status={toStatusBadgeStatus(form.status)} />
                    </div>
                  ) : (
                    <Select
                      value={form.status}
                      onValueChange={v => setForm(f => ({ ...f, status: v }))}
                      items={VALID_STATUSES.map(s => ({
                        label: s.replace(/_/g, ' '),
                        value: s,
                      }))}
                      placeholder="Select status"
                    />
                  )}
                </DataField>
              )}
            </div>

            <DataField label="Summary (optional)">
              {isReadOnly ? (
                <p className="text-sm text-muted-foreground">
                  {form.eventSummary || '—'}
                </p>
              ) : (
                <TextArea
                  placeholder="e.g. Aircraft delay in Rome; 4 crew need 2 nights"
                  rows={2}
                  value={form.eventSummary}
                  onChange={e =>
                    setForm(f => ({ ...f, eventSummary: e.target.value }))
                  }
                />
              )}
            </DataField>
            <DataField label="Reason (optional)">
              {isReadOnly ? (
                <p className="text-sm text-muted-foreground">
                  {form.eventReason || '—'}
                </p>
              ) : (
                <TextArea
                  placeholder="e.g. Weather-related delay"
                  rows={2}
                  value={form.eventReason}
                  onChange={e =>
                    setForm(f => ({ ...f, eventReason: e.target.value }))
                  }
                />
              )}
            </DataField>
          </FormSection>

          <FormSection title="Notes" icon={FileText}>
            <DataField label="Additional notes">
              {isReadOnly ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {form.notes || '—'}
                </p>
              ) : (
                <TextArea
                  placeholder="Internal notes"
                  value={form.notes}
                  onChange={e =>
                    setForm(f => ({ ...f, notes: e.target.value }))
                  }
                  rows={3}
                />
              )}
            </DataField>
          </FormSection>
        </FieldGroup>

        {submitError && (
          <p className="px-4 text-sm text-destructive">{submitError}</p>
        )}
      </div>
    </Sheet>
  );
}

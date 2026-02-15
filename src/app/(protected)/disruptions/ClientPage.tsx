'use client';

import { Separator } from '@/components/ui/separator';
import { api } from '@/convex/_generated/api';
import type { Airport, MarketId } from '@/convex/types';
import {
  Button,
  DataField,
  Input,
  PageLayout,
  Select,
  StatusBadge,
  TextArea,
} from '@/stories';
import { useMutation } from 'convex/react';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { AppHeader } from '../_components/AppHeader';
import { useDisruptionsContext } from './ContextProvider';

const VALID_STATUSES = ['open', 'searching', 'options_ready', 'resolved'] as const;
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

type FormState = {
  description: string;
  locationAirportId: string;
  eventType: string;
  crewSize: string;
  nights: string;
  eventReason: string;
  notes: string;
};

const initialForm: FormState = {
  description: '',
  locationAirportId: '',
  eventType: 'delay',
  crewSize: '',
  nights: '',
  eventReason: '',
  notes: '',
};

function airportLabel(a: Airport) {
  return `${[a.iata, a.icao].filter(Boolean).join('/')} - ${a.name}`;
}

function airportValue(a: Airport) {
  return a.iata ?? a.icao ?? a.name;
}

interface DisruptionFormProps {
  airports: Airport[];
  onCreateDisruption: (params: {
    location: string;
    marketId: MarketId;
    eventType: string;
    crewSize: number;
    nights: number;
    eventReason?: string;
    eventLocation?: string;
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

function DisruptionForm({
  airports,
  onCreateDisruption,
  onCancel,
}: DisruptionFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiSubmitting, setIsAiSubmitting] = useState(false);

  const updateForm = useCallback((field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleManualSubmit = useCallback(async () => {
    const crewSize = parseInt(form.crewSize, 10);
    const nights = parseInt(form.nights, 10);

    if (!form.locationAirportId) {
      toast.error('Current location is required');
      return;
    }

    const airport = airports.find(a => a._id === form.locationAirportId);
    if (!airport) {
      toast.error('Please select a valid airport');
      return;
    }

    if (!form.eventType) {
      toast.error('Disruption type is required');
      return;
    }

    if (isNaN(crewSize) || crewSize < 1) {
      toast.error('Crew count must be at least 1');
      return;
    }

    if (isNaN(nights) || nights < 1) {
      toast.error('Nights must be at least 1');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateDisruption({
        location: airportValue(airport),
        marketId: airport.marketId,
        eventType: form.eventType,
        crewSize,
        nights,
        eventReason: form.eventReason.trim() || undefined,
        eventLocation: form.description.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success('Disruption created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create disruption');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, airports, onCreateDisruption]);

  const handleAiSubmit = useCallback(() => {
    setIsAiSubmitting(true);
    toast.info('AI submit coming soon - an agent will parse your description.');
    setIsAiSubmitting(false);
  }, []);

  const airportItems = airports.map(a => ({
    key: a._id,
    label: airportLabel(a),
    value: a._id,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-card p-6 space-y-5"
    >
      <h2 className="font-semibold text-foreground">New Disruption Request</h2>

      <div className="flex flex-col gap-2">
        <DataField label="What happened and what's needed?">
          <TextArea
            placeholder="e.g. Flight delayed 9 hours in Denver INTL, need rooms ASAP for 8 crew members"
            rows={3}
            value={form.description}
            onChange={e => updateForm('description', e.target.value)}
          />
        </DataField>
        <div className="flex justify-end">
          <Button
            onClick={handleAiSubmit}
            disabled={isAiSubmitting}
            loading={isAiSubmitting}
            text="Generate Form"
            variant="ghost"
            size="sm"
            icon={Sparkles}
          />
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <DataField label="Current Location">
          <Select
            placeholder="Select airport"
            value={form.locationAirportId || undefined}
            onValueChange={v => updateForm('locationAirportId', v)}
            items={airportItems}
          />
        </DataField>
        <DataField label="Crew Count">
          <Input
            Icon={null}
            type="number"
            placeholder="e.g. 8"
            value={form.crewSize}
            onChange={e => updateForm('crewSize', e.target.value)}
          />
        </DataField>
        <DataField label="Nights needed">
          <Input
            Icon={null}
            type="number"
            placeholder="e.g. 1"
            value={form.nights}
            onChange={e => updateForm('nights', e.target.value)}
          />
        </DataField>
        <DataField label="Disruption Type">
          <Select
            value={form.eventType}
            onValueChange={v => updateForm('eventType', v)}
            items={EVENT_TYPES.map(t => ({ label: t.label, value: t.value }))}
            placeholder="Select disruption type"
          />
        </DataField>
        <DataField label="Reason (optional)" className="sm:col-span-2">
          <TextArea
            placeholder="e.g. Weather-related delay"
            rows={2}
            value={form.eventReason}
            onChange={e => updateForm('eventReason', e.target.value)}
          />
        </DataField>
        <DataField label="Notes (optional)" className="sm:col-span-2">
          <TextArea
            rows={2}
            value={form.notes}
            onChange={e => updateForm('notes', e.target.value)}
          />
        </DataField>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleManualSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
          text={isSubmitting ? 'Creating...' : 'Create Disruption'}
        />
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || isAiSubmitting}
          text="Cancel"
        />
      </div>
    </motion.div>
  );
}

export default function DisruptionsClientPage() {
  const { disruptions, airports } = useDisruptionsContext();
  const createDisruption = useMutation(api.functions.disruptions.createDisruption);
  const [showForm, setShowForm] = useState(false);

  const handleCreateDisruption = useCallback(
    async (params: {
      location: string;
      marketId: MarketId;
      eventType: string;
      crewSize: number;
      nights: number;
      eventReason?: string;
      eventLocation?: string;
      notes?: string;
    }) => {
      await createDisruption(params);
      setShowForm(false);
    },
    [createDisruption]
  );

  const displayLocation = (d: (typeof disruptions)[0]) => {
    if (d.eventLocation) return d.eventLocation;
    if (d.location) return d.location;
    return '-';
  };

  return (
    <PageLayout header={<AppHeader />}>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Disruptions</h1>
          <span className="text-sm text-muted-foreground">Today</span>
        </div>

        {disruptions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Active ({disruptions.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {disruptions.map(d => (
                <div key={d._id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={toStatusBadgeStatus(d.status)} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {d.crewSize} crew - {displayLocation(d)} - {d.nights ?? '?'} night(s) -{' '}
                    {d.eventType.replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                  {d.eventReason && (
                    <p className="text-xs text-muted-foreground mt-1">{d.eventReason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-lg border-2 border-dashed border-primary/30 bg-status-open-bg p-6 text-center hover:border-primary/50 transition-colors"
          >
            <Plus className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-2 font-medium text-foreground">
              Create New Disruption Request
            </p>
            <p className="text-sm text-muted-foreground">
              Find emergency accommodations for stranded crew
            </p>
          </button>
        ) : (
          <DisruptionForm
            airports={airports}
            onCreateDisruption={handleCreateDisruption}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>
    </PageLayout>
  );
}
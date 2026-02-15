'use client';

import { useMarketContext } from '@/app/(protected)/_contexts/MarketContext';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { SheetFooter } from '@/components/ui/sheet';
import { api } from '@/convex/_generated/api';
import type { Airport, MarketId } from '@/convex/types';
import type { AirportDatasetItem } from '@/modules/airports/types';
import { useAirportCsv } from '@/modules/airports/hooks/use-airport-csv';
import { Button, Input, Sheet } from '@/stories';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useEffect, useState } from 'react';
import AirportAutocompleteInput from './AirportAutocompleteInput';

type FormData = {
  name: string;
  icao: string;
  iata: string;
  city: string;
  state: string;
  country: string;
};

const emptyForm: FormData = {
  name: '',
  icao: '',
  iata: '',
  city: '',
  state: '',
  country: '',
};

function toFormData(airport: Airport | AirportDatasetItem): FormData {
  if ('_id' in airport) {
    return {
      name: airport.name ?? '',
      icao: airport.icao ?? '',
      iata: airport.iata ?? '',
      city: airport.city ?? '',
      state: airport.state ?? '',
      country: airport.country ?? '',
    };
  }
  return {
    name: airport.airport ?? '',
    icao: airport.icao ?? '',
    iata: airport.iata ?? '',
    city: '',
    state: airport.region_name ?? '',
    country: airport.country_code ?? '',
  };
}

export function AddAirportSheet({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const airports = useQuery(api.functions.airports.listMyAirports);
  const org = useQuery(api.functions.orgs.getMyOrg);
  const { airports: csvAirports } = useAirportCsv({ enabled: open });
  const createAirport = useMutation(api.functions.airports.createAirport);
  const { currentMarket } = useMarketContext();

  const handleAirportSelect = useCallback(
    (airport: Airport | AirportDatasetItem) => {
      setForm(toFormData(airport));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!form.name.trim()) {
      setError('Airport name is required');
      return;
    }
    if (!form.city.trim()) {
      setError('City is required');
      return;
    }
    if (!form.country.trim()) {
      setError('Country is required');
      return;
    }
    if (!org?._id) {
      setError('Organization not found');
      return;
    }
    setIsSubmitting(true);
    try {
      await createAirport({
        airport: {
          orgId: org._id,
          marketId: currentMarket?._id ?? ('' as MarketId),
          name: form.name.trim(),
          icao: form.icao.trim() || undefined,
          iata: form.iata.trim() || undefined,
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          country: form.country.trim(),
        },
      });
      setOpen(false);
      setForm(emptyForm);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create airport');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, org, createAirport]);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setError(null);
    }
  }, [open]);

  return (
    <Sheet
      title="Add Airport"
      description="Add a new airport to the system"
      open={open}
      onOpenChange={setOpen}
      width="sm"
      trigger={trigger}
    >
      <Field className="gap-2 bg-linear-to-br from-orange-50 via-purple-50 to-pink-50 p-3 rounded-xl">
        <FieldLabel>Search Airport</FieldLabel>
        <AirportAutocompleteInput
          placeholder="Search by name, code, or location..."
          className="placeholder:text-gray-300"
          airports={airports ?? []}
          csvAirports={csvAirports}
          onAirportSelect={handleAirportSelect}
          isVisible={open}
        />
      </Field>
      <FieldGroup className="p-2 flex flex-col gap-6">
        <Field className="gap-2">
          <FieldLabel>Name</FieldLabel>
          <Input
            placeholder="Airport Name"
            className="placeholder:text-gray-300"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field className="gap-2">
            <FieldLabel htmlFor="icao">ICAO</FieldLabel>
            <Input
              id="icao"
              type="text"
              placeholder="KLAX"
              className="placeholder:text-gray-300"
              value={form.icao}
              onChange={e => setForm(f => ({ ...f, icao: e.target.value }))}
            />
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="iata">IATA</FieldLabel>
            <Input
              id="iata"
              type="text"
              placeholder="LAX"
              className="placeholder:text-gray-300"
              value={form.iata}
              onChange={e => setForm(f => ({ ...f, iata: e.target.value }))}
            />
          </Field>
        </div>

        <Field className="gap-2">
          <FieldLabel>City</FieldLabel>
          <Input
            placeholder="Los Angeles"
            className="placeholder:text-gray-300"
            value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field className="gap-2">
            <FieldLabel>State/Region</FieldLabel>
            <Input
              placeholder="California"
              className="placeholder:text-gray-300"
              value={form.state}
              onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
            />
          </Field>
          <Field className="gap-2">
            <FieldLabel>Country</FieldLabel>
            <Input
              placeholder="United States"
              className="placeholder:text-gray-300"
              value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
            />
          </Field>
        </div>
      </FieldGroup>
      {error && <p className="px-4 text-sm text-destructive">{error}</p>}
      <SheetFooter>
        <Button
          text="Submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </SheetFooter>
    </Sheet>
  );
}

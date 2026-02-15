'use client';

import { api } from '@/convex/_generated/api';
import type { Airport, MarketId } from '@/convex/types';
import { MarketCombobox } from '@/modules/markets/MarketCombobox';
import { Button, Input } from '@/stories';
import { useMutation, useQuery } from 'convex/react';
import { Plane } from 'lucide-react';
import { useCallback, useState } from 'react';

interface AddAirportInlineFormProps {
  onSubmit: (airport: Airport) => void;
  onCancel: () => void;
  onAdd: (airport: Airport) => void;
}

export function AddAirportInlineForm({
  onSubmit,
  onCancel,
  onAdd,
}: AddAirportInlineFormProps) {
  const [name, setName] = useState('');
  const [iata, setIata] = useState('');
  const [icao, setIcao] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [marketId, setMarketId] = useState<MarketId | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const org = useQuery(api.functions.orgs.getMyOrg);
  const markets = useQuery(api.functions.markets.listMyMarkets);
  const createAirport = useMutation(api.functions.airports.createAirport);

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!name.trim()) {
      setError('Airport name is required');
      return;
    }
    if (!country.trim()) {
      setError('Country is required');
      return;
    }
    if (!marketId) {
      setError('Market is required');
      return;
    }
    if (!org?._id) {
      setError('Organization not found');
      return;
    }
    setIsSubmitting(true);
    try {
      const airportId = await createAirport({
        airport: {
          orgId: org._id,
          marketId,
          name: name.trim(),
          iata: iata.trim() || undefined,
          icao: icao.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim(),
        },
      });
      const airport = {
        _id: airportId,
        marketId,
        name: name.trim(),
        iata: iata.trim() || undefined,
        icao: icao.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim(),
      } as Airport;
      onAdd(airport);
      onSubmit(airport);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create airport');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    name,
    iata,
    icao,
    city,
    country,
    marketId,
    org,
    createAirport,
    onAdd,
    onSubmit,
  ]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Plane className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">New Airport</h4>
      </div>
      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Name <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="e.g. Newark Liberty International"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            IATA
          </label>
          <Input
            placeholder="EWR"
            value={iata}
            onChange={e => setIata(e.target.value)}
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            ICAO
          </label>
          <Input
            placeholder="KEWR"
            value={icao}
            onChange={e => setIcao(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          City
        </label>
        <Input
          placeholder="Newark"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Country <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="United States"
          value={country}
          onChange={e => setCountry(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Market <span className="text-destructive">*</span>
        </label>
        <MarketCombobox
          markets={markets}
          value={marketId}
          onChange={id => setMarketId(id)}
          placeholder="Select market…"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button
          text="Cancel"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        />
        <Button
          text="Add"
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </div>
  );
}

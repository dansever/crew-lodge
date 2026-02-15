'use client';

import { api } from '@/convex/_generated/api';
import type { Market } from '@/convex/types';
import { Button, Input } from '@/stories';
import { useMutation, useQuery } from 'convex/react';
import { MapPin } from 'lucide-react';
import { useCallback, useState } from 'react';

interface AddMarketInlineFormProps {
  onSubmit: (market: Market) => void;
  onCancel: () => void;
  onAdd: (market: Market) => void;
}

export function AddMarketInlineForm({
  onSubmit,
  onCancel,
  onAdd,
}: AddMarketInlineFormProps) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const org = useQuery(api.functions.orgs.getMyOrg);
  const createMarket = useMutation(api.functions.markets.createMarket);

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!name.trim()) {
      setError('Market name is required');
      return;
    }
    if (!country.trim()) {
      setError('Country is required');
      return;
    }
    if (!org?._id) {
      setError('Organization not found');
      return;
    }
    setIsSubmitting(true);
    try {
      const marketId = await createMarket({
        market: {
          orgId: org._id,
          name: name.trim(),
          country: country.trim(),
          isActive: true,
        },
      });
      const market = {
        _id: marketId,
        name: name.trim(),
        country: country.trim(),
        isActive: true,
      } as Market;
      onAdd(market);
      onSubmit(market);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create market');
    } finally {
      setIsSubmitting(false);
    }
  }, [name, country, org, createMarket, onAdd, onSubmit]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">New Market</h4>
      </div>
      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Name <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="e.g. New York Metro"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Country <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="e.g. United States"
          value={country}
          onChange={e => setCountry(e.target.value)}
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

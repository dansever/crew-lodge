'use client';

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { SheetFooter } from '@/components/ui/sheet';
import { api } from '@/convex/_generated/api';
import { CountryCombobox } from '@/modules/countries/CountryCombobox';
import { Button, Input, Sheet } from '@/stories';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useEffect, useState } from 'react';

type FormData = {
  name: string;
  country: string;
};

const emptyForm: FormData = {
  name: '',
  country: '',
};

export function AddMarketSheet({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const org = useQuery(api.functions.orgs.getMyOrg);
  const createMarket = useMutation(api.functions.markets.createMarket);

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!form.name.trim()) {
      setError('Market name is required');
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
      await createMarket({
        market: {
          orgId: org._id,
          name: form.name.trim(),
          country: form.country.trim(),
          isActive: true,
        },
      });
      setOpen(false);
      setForm(emptyForm);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create market');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, org, createMarket]);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setError(null);
    }
  }, [open]);

  return (
    <Sheet
      title="Add Market"
      description="Add a new market to your organization"
      open={open}
      onOpenChange={setOpen}
      width="sm"
      trigger={trigger}
    >
      <FieldGroup className="p-2 flex flex-col gap-6">
        <Field className="gap-2">
          <FieldLabel>Name</FieldLabel>
          <Input
            placeholder="e.g. New York Metro"
            className="placeholder:text-gray-300"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </Field>
        <Field className="gap-2">
          <FieldLabel>Country</FieldLabel>
          <CountryCombobox
            placeholder="Select country…"
            value={form.country}
            onChange={country => setForm(f => ({ ...f, country }))}
          />
        </Field>
      </FieldGroup>
      {error && <p className="px-4 text-sm text-destructive">{error}</p>}
      <SheetFooter>
        <Button
          text="Add Market"
          onClick={handleSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </SheetFooter>
    </Sheet>
  );
}

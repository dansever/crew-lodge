'use client';

import { FieldGroup } from '@/components/ui/field';
import { api } from '@/convex/_generated/api';
import type { CrewMemberId } from '@/convex/types';
import { cn } from '@/lib/utils';
import { Button, DataField, Input, Select, Sheet } from '@/stories';
import { useMutation, useQuery } from 'convex/react';
import { User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

/** Sentinel value for "no position" - cannot use '' as Select reserves it for clearing. */
const NO_POSITION_VALUE = '__none__';

const POSITION_OPTIONS: { label: string; value: string }[] = [
  { label: '—', value: NO_POSITION_VALUE },
  { label: 'Captain', value: 'captain' },
  { label: 'First Officer', value: 'first_officer' },
  { label: 'Flight Attendant', value: 'flight_attendant' },
];

interface FormData {
  name: string;
  position: string;
  seniorityCode: string;
  passportNumber: string;
  phone: string;
  email: string;
}

const EMPTY_FORM: FormData = {
  name: '',
  position: '',
  seniorityCode: '',
  passportNumber: '',
  phone: '',
  email: '',
};

export interface AddCrewMemberSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess?: (id: CrewMemberId) => void;
}

export function AddCrewMemberSheet({
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: AddCrewMemberSheetProps) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const org = useQuery(api.functions.orgs.getMyOrg);
  const createCrewMember = useMutation(
    api.functions.crewMembers.createCrewMember
  );

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setSubmitError(null);
    }
  }, [open]);

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setSubmitError('Name is required');
      return;
    }
    if (!org?._id) {
      setSubmitError('Organization not found');
      return;
    }

    setIsSubmitting(true);
    try {
      const id = await createCrewMember({
        crewMember: {
          orgId: org._id,
          name: trimmedName,
          position: form.position || undefined,
          seniorityCode: form.seniorityCode.trim() || undefined,
          passportNumber: form.passportNumber.trim() || undefined,
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
        },
      });
      onOpenChange(false);
      onSuccess?.(id);
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : 'Failed to add crew member'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [form, org?._id, createCrewMember, onOpenChange, onSuccess]);

  return (
    <Sheet
      title="Add Member"
      description="Add a new crew member to your organization"
      open={open}
      onOpenChange={onOpenChange}
      width="md"
      trigger={trigger}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            text="Cancel"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          />
          <Button
            text="Add Member"
            onClick={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </div>
      }
    >
      <FieldGroup className={cn('flex flex-col gap-6 px-1')}>
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            Identity
          </h3>
          <div className="grid grid-cols-2 gap-3 space-y-3">
            <DataField className="col-span-2" label="Name *">
              <Input
                placeholder="e.g. Jane Smith"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </DataField>
            <DataField className="col-span-2" label="Passport number">
              <Input
                placeholder="e.g. AB1234567"
                value={form.passportNumber}
                onChange={e =>
                  setForm(f => ({ ...f, passportNumber: e.target.value }))
                }
              />
            </DataField>
            <DataField label="Position">
              <Select
                items={POSITION_OPTIONS.map(p => ({
                  label: p.label,
                  value: p.value,
                }))}
                placeholder="Select position"
                value={form.position || NO_POSITION_VALUE}
                onValueChange={v =>
                  setForm(f => ({
                    ...f,
                    position: v === NO_POSITION_VALUE ? '' : v,
                  }))
                }
              />
            </DataField>
            <DataField label="Seniority Code">
              <Input
                placeholder="e.g. 12345"
                value={form.seniorityCode}
                onChange={e =>
                  setForm(f => ({ ...f, seniorityCode: e.target.value }))
                }
              />
            </DataField>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Contact
          </h3>
          <div className="space-y-3">
            <DataField label="Phone">
              <Input
                placeholder="e.g. +1 234 567 8900"
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </DataField>
            <DataField label="Email">
              <Input
                placeholder="e.g. jane@company.com"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </DataField>
          </div>
        </section>

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}
      </FieldGroup>
    </Sheet>
  );
}

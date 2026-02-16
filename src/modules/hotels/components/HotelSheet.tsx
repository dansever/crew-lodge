'use client';

import { FieldGroup } from '@/components/ui/field';
import { api } from '@/convex/_generated/api';
import type { Hotel, MarketId } from '@/convex/types';
import { cn } from '@/lib/utils';
import {
  parsePlaceToAddress,
  PlacesAutocomplete,
  type PlaceDetails,
} from '@/modules/maps';
import {
  Button,
  DataField,
  Input,
  Sheet,
  SwitchChoiceCard,
  TextArea,
} from '@/stories';
import { useMutation, useQuery } from 'convex/react';
import {
  BarChart3,
  Building2,
  FileText,
  MapPin,
  Pencil,
  Phone,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// -----------------------------------------------------------------------------
// Types & helpers
// -----------------------------------------------------------------------------

type Mode = 'view' | 'edit' | 'add';

interface FormData {
  name: string;
  chain: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  googleMapsPlaceId: string;
  contactPerson: string;
  bookingEmail: string;
  slaCompliance: string;
  ytdNights: string;
  ytdSpend: string;
  notes: string;
  isActive: boolean;
  isPreferred: boolean;
}

const EMPTY_FORM: FormData = {
  name: '',
  chain: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
  email: '',
  website: '',
  googleMapsPlaceId: '',
  contactPerson: '',
  bookingEmail: '',
  slaCompliance: '',
  ytdNights: '',
  ytdSpend: '',
  notes: '',
  isActive: true,
  isPreferred: false,
};

function hotelToForm(hotel: Hotel): FormData {
  return {
    name: hotel.name ?? '',
    chain: hotel.chain ?? '',
    street: hotel.address?.street ?? '',
    city: hotel.address?.city ?? '',
    state: hotel.address?.state ?? '',
    postalCode: hotel.address?.postalCode ?? '',
    country: hotel.address?.country ?? '',
    phone: hotel.phone ?? '',
    email: hotel.email ?? '',
    website: hotel.website ?? '',
    googleMapsPlaceId: hotel.googleMapsPlaceId ?? '',
    contactPerson: hotel.contactPerson ?? '',
    bookingEmail: hotel.bookingEmail ?? '',
    slaCompliance: hotel.slaCompliance?.toString() ?? '',
    ytdNights: hotel.ytdNights?.toString() ?? '',
    ytdSpend: hotel.ytdSpend?.toString() ?? '',
    notes: hotel.notes ?? '',
    isActive: hotel.isActive ?? true,
    isPreferred: hotel.isPreferred ?? false,
  };
}

function formToPayload(form: FormData, marketId: MarketId) {
  return {
    marketId,
    name: form.name.trim(),
    chain: form.chain.trim() || undefined,
    address: {
      street: form.street.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      postalCode: form.postalCode.trim() || undefined,
      country: form.country.trim(),
    },
    phone: form.phone.trim() || undefined,
    email: form.email.trim() || undefined,
    website: form.website.trim() || undefined,
    googleMapsPlaceId: form.googleMapsPlaceId.trim() || undefined,
    contactPerson: form.contactPerson.trim() || undefined,
    bookingEmail: form.bookingEmail.trim() || undefined,
    slaCompliance: form.slaCompliance ? Number(form.slaCompliance) : undefined,
    ytdNights: form.ytdNights ? Number(form.ytdNights) : undefined,
    ytdSpend: form.ytdSpend ? Number(form.ytdSpend) : undefined,
    notes: form.notes.trim() || undefined,
    isActive: form.isActive,
    isPreferred: form.isPreferred,
  };
}

function formatAddress(form: FormData): string {
  const parts = [
    form.street,
    form.city,
    form.state,
    form.postalCode,
    form.country,
  ].filter(Boolean);
  return parts.join(', ') || '—';
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
// HotelSheet
// -----------------------------------------------------------------------------

export interface HotelSheetProps {
  /** Required for add mode */
  marketId: MarketId;
  /** When set: view/edit mode. When null/undefined: add mode. Parent fetches and passes the hotel. */
  hotel?: Hotel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional trigger (e.g. Add button) - when provided, Sheet uses it to open in add mode */
  trigger?: React.ReactNode;
}

export function HotelSheet({
  marketId,
  hotel: hotelProp,
  open,
  onOpenChange,
  trigger,
}: HotelSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const effectiveMode: Mode = hotelProp ? (isEditing ? 'edit' : 'view') : 'add';
  const isReadOnly = effectiveMode === 'view';

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hotel = hotelProp;
  const org = useQuery(api.functions.orgs.getMyOrg);
  const createHotel = useMutation(api.functions.hotels.createHotel);
  const updateHotel = useMutation(api.functions.hotels.updateHotel);

  // Sync form when hotel loads or sheet opens (view/edit)
  useEffect(() => {
    if (hotel && open) setForm(hotelToForm(hotel));
  }, [hotel, open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setSubmitError(null);
      setIsEditing(false);
    }
  }, [open]);

  const handlePlaceSelect = useCallback((place: PlaceDetails) => {
    const address = parsePlaceToAddress(place);
    setForm(f => ({
      ...f,
      name: place.displayName?.text ?? place.name ?? f.name,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: place.internationalPhoneNumber ?? f.phone,
      website: place.websiteUri ?? f.website,
      googleMapsPlaceId: place.id ?? f.googleMapsPlaceId,
    }));
  }, []);

  const handleCreate = useCallback(async () => {
    setSubmitError(null);
    if (!form.name.trim()) {
      setSubmitError('Hotel name is required');
      return;
    }
    if (!form.country.trim()) {
      setSubmitError('Country is required');
      return;
    }
    if (!org?._id) {
      setSubmitError('Organization not found');
      return;
    }
    setIsSubmitting(true);
    try {
      await createHotel({
        hotel: { ...formToPayload(form, marketId), orgId: org._id },
      });
      onOpenChange(false);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to create hotel');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, marketId, org, createHotel, onOpenChange]);

  const handleUpdate = useCallback(async () => {
    if (!hotel) return;
    setSubmitError(null);
    if (!form.name.trim()) {
      setSubmitError('Hotel name is required');
      return;
    }
    if (!form.country.trim()) {
      setSubmitError('Country is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateHotel({
        id: hotel._id,
        hotel: formToPayload(form, hotel.marketId),
      });
      setIsEditing(false);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to update hotel');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, hotel, updateHotel]);

  const config = {
    add: {
      title: 'Add Hotel',
      description: 'Add a new hotel to this market',
      footer: (
        <Button
          text="Add Hotel"
          onClick={handleCreate}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      ),
    },
    view: {
      title: hotel?.name ?? 'Hotel Details',
      description: 'View hotel information',
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
      title: 'Edit Hotel',
      description: 'Update hotel information',
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

  return (
    <Sheet
      title={cfg.title}
      description={cfg.description}
      open={open}
      onOpenChange={onOpenChange}
      width="lg"
      trigger={!hotel ? trigger : undefined}
      footer={<div className="flex gap-2 justify-end">{cfg.footer}</div>}
    >
      <>
        <FieldGroup className="flex flex-col gap-6 px-1">
          {/* 1. Identity & status */}
          <FormSection title="Identity" icon={Building2}>
            <div className="grid grid-cols-[1fr_minmax(0,140px)] gap-3">
              <DataField label="Hotel name *">
                {isReadOnly ? (
                  <p className="text-sm text-muted-foreground">
                    {form.name || '—'}
                  </p>
                ) : (
                  <Input
                    placeholder="e.g. Hilton Downtown"
                    value={form.name}
                    onChange={e =>
                      setForm(f => ({ ...f, name: e.target.value }))
                    }
                  />
                )}
              </DataField>
              <DataField label="Chain">
                {isReadOnly ? (
                  <p className="text-sm text-muted-foreground">
                    {form.chain || '—'}
                  </p>
                ) : (
                  <Input
                    placeholder="e.g. Hilton"
                    value={form.chain}
                    onChange={e =>
                      setForm(f => ({ ...f, chain: e.target.value }))
                    }
                  />
                )}
              </DataField>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              {isReadOnly ? (
                <div className="flex gap-4">
                  <DataField label="Active">
                    <p className="text-sm text-muted-foreground">
                      {form.isActive ? 'Yes' : 'No'}
                    </p>
                  </DataField>
                  <DataField label="Preferred">
                    <p className="text-sm text-muted-foreground">
                      {form.isPreferred ? 'Yes' : 'No'}
                    </p>
                  </DataField>
                </div>
              ) : (
                <div className="flex flex-row gap-2">
                  <SwitchChoiceCard
                    id="active"
                    label="Active"
                    checked={form.isActive}
                    onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
                  />
                  <SwitchChoiceCard
                    id="preferred"
                    label="Preferred"
                    checked={form.isPreferred}
                    onCheckedChange={v =>
                      setForm(f => ({ ...f, isPreferred: v }))
                    }
                  />
                </div>
              )}
            </div>
          </FormSection>

          {/* 2. Location */}
          <FormSection title="Address" icon={MapPin}>
            {isReadOnly ? (
              <DataField label="Address">
                <p className="text-sm text-muted-foreground">
                  {formatAddress(form)}
                </p>
              </DataField>
            ) : (
              <div className="space-y-3">
                <DataField label="Search address">
                  <PlacesAutocomplete
                    placeholder="e.g. 123 Main St, New York"
                    minQueryLength={3}
                    value={
                      form.street || form.city || form.country
                        ? {
                            id: '',
                            name: formatAddress(form),
                            displayName: { text: formatAddress(form) },
                            formattedAddress: formatAddress(form),
                          }
                        : null
                    }
                    onSelect={handlePlaceSelect}
                    onClear={() =>
                      setForm(f => ({
                        ...f,
                        street: '',
                        city: '',
                        state: '',
                        postalCode: '',
                        country: '',
                        googleMapsPlaceId: '',
                      }))
                    }
                  />
                </DataField>
                <div className="grid grid-cols-2 gap-3">
                <DataField label="Street">
                  <Input
                    placeholder="Street address"
                    value={form.street}
                    onChange={e =>
                      setForm(f => ({ ...f, street: e.target.value }))
                    }
                  />
                </DataField>
                <DataField label="City">
                  <Input
                    placeholder="City"
                    value={form.city}
                    onChange={e =>
                      setForm(f => ({ ...f, city: e.target.value }))
                    }
                  />
                </DataField>
                <DataField label="State/Region">
                  <Input
                    placeholder="State"
                    value={form.state}
                    onChange={e =>
                      setForm(f => ({ ...f, state: e.target.value }))
                    }
                  />
                </DataField>
                <DataField label="Postal code">
                  <Input
                    placeholder="Postal code"
                    value={form.postalCode}
                    onChange={e =>
                      setForm(f => ({ ...f, postalCode: e.target.value }))
                    }
                  />
                </DataField>
                <DataField label="Country *">
                  <Input
                    placeholder="Country"
                    value={form.country}
                    onChange={e =>
                      setForm(f => ({ ...f, country: e.target.value }))
                    }
                  />
                </DataField>
                </div>
              </div>
            )}
          </FormSection>

          {/* 3. Contact */}
          <FormSection title="Contact" icon={Phone}>
            <div className="grid grid-cols-2 gap-3">
              <DataField label="Phone">
                {isReadOnly ? (
                  <p className="text-sm text-muted-foreground">
                    {form.phone || '—'}
                  </p>
                ) : (
                  <Input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={form.phone}
                    onChange={e =>
                      setForm(f => ({ ...f, phone: e.target.value }))
                    }
                  />
                )}
              </DataField>
              <DataField label="Email">
                {isReadOnly ? (
                  <p className="text-sm text-muted-foreground">
                    {form.email || '—'}
                  </p>
                ) : (
                  <Input
                    type="email"
                    placeholder="frontdesk@hotel.com"
                    value={form.email}
                    onChange={e =>
                      setForm(f => ({ ...f, email: e.target.value }))
                    }
                  />
                )}
              </DataField>
            </div>
            <DataField label="Website">
              {isReadOnly ? (
                <p className="text-sm text-muted-foreground">
                  {form.website || '—'}
                </p>
              ) : (
                <Input
                  type="url"
                  placeholder="https://www.hotel.com"
                  value={form.website}
                  onChange={e =>
                    setForm(f => ({ ...f, website: e.target.value }))
                  }
                />
              )}
            </DataField>
          </FormSection>

          {/* 4. Reservations */}
          <FormSection title="Reservations">
            <div className="grid grid-cols-2 gap-3">
              <DataField label="Contact person">
                {isReadOnly ? (
                  <p className="text-sm text-muted-foreground">
                    {form.contactPerson || '—'}
                  </p>
                ) : (
                  <Input
                    placeholder="Name"
                    value={form.contactPerson}
                    onChange={e =>
                      setForm(f => ({ ...f, contactPerson: e.target.value }))
                    }
                  />
                )}
              </DataField>
              <DataField label="Booking email">
                {isReadOnly ? (
                  <p className="text-sm text-muted-foreground">
                    {form.bookingEmail || '—'}
                  </p>
                ) : (
                  <Input
                    type="email"
                    placeholder="reservations@hotel.com"
                    value={form.bookingEmail}
                    onChange={e =>
                      setForm(f => ({ ...f, bookingEmail: e.target.value }))
                    }
                  />
                )}
              </DataField>
            </div>
          </FormSection>

          {/* 5. Performance metrics */}
          <FormSection title="Performance" icon={BarChart3}>
            <div className="grid grid-cols-3 gap-2">
              <DataField label="SLA compliance">
                {isReadOnly ? (
                  <div className="rounded-lg border bg-muted/30 px-3 py-2">
                    <span className="text-sm font-medium tabular-nums">
                      {form.slaCompliance ? `${form.slaCompliance}%` : '—'}
                    </span>
                  </div>
                ) : (
                  <Input
                    type="number"
                    placeholder="e.g. 95"
                    value={form.slaCompliance}
                    onChange={e =>
                      setForm(f => ({ ...f, slaCompliance: e.target.value }))
                    }
                  />
                )}
              </DataField>
              <DataField label="YTD nights">
                {isReadOnly ? (
                  <div className="rounded-lg border bg-muted/30 px-3 py-2">
                    <span className="text-sm font-medium tabular-nums">
                      {form.ytdNights ?? '—'}
                    </span>
                  </div>
                ) : (
                  <Input
                    type="number"
                    placeholder="e.g. 1200"
                    value={form.ytdNights}
                    onChange={e =>
                      setForm(f => ({ ...f, ytdNights: e.target.value }))
                    }
                  />
                )}
              </DataField>
              <DataField label="YTD spend">
                {isReadOnly ? (
                  <div className="rounded-lg border bg-muted/30 px-3 py-2">
                    <span className="text-sm font-medium tabular-nums">
                      {form.ytdSpend
                        ? `$${Number(form.ytdSpend).toLocaleString()}`
                        : '—'}
                    </span>
                  </div>
                ) : (
                  <Input
                    type="number"
                    placeholder="e.g. 50000"
                    value={form.ytdSpend}
                    onChange={e =>
                      setForm(f => ({ ...f, ytdSpend: e.target.value }))
                    }
                  />
                )}
              </DataField>
            </div>
          </FormSection>

          {/* 6. Notes */}
          <FormSection title="Notes" icon={FileText}>
            <DataField label="Additional notes">
              {isReadOnly ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {form.notes || '—'}
                </p>
              ) : (
                <TextArea
                  placeholder="Internal notes, special requirements, etc."
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
      </>
    </Sheet>
  );
}

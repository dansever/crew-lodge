'use client';

import { SORTED_COUNTRY_OPTIONS } from '@/lib/constants/countries';
import { EntitySelector } from '@/stories';
import { useMemo } from 'react';

export interface CountryComboboxProps {
  value?: string;
  onChange?: (country: string) => void;
  placeholder?: string;
  className?: string;
}

type CountryOption = (typeof SORTED_COUNTRY_OPTIONS)[number];

/**
 * A searchable combobox for selecting a country.
 * Uses predefined country list; no "Add" option.
 */
export function CountryCombobox({
  value,
  onChange,
  placeholder = 'Select country…',
  className,
}: CountryComboboxProps) {
  const getValue = useMemo(() => (opt: CountryOption) => opt.name, []);
  const getPrimaryLabel = useMemo(() => (opt: CountryOption) => opt.name, []);
  const getBadgeLabel = useMemo(() => (opt: CountryOption) => opt.code, []);

  return (
    <EntitySelector<CountryOption>
      items={SORTED_COUNTRY_OPTIONS}
      value={value}
      onChange={onChange}
      getValue={getValue}
      getPrimaryLabel={getPrimaryLabel}
      messages={{
        placeholder,
        search: 'Search countries…',
        empty: 'No country found.',
      }}
      showValueBadge
      getBadgeLabel={getBadgeLabel}
      className={className}
    />
  );
}

'use client';

import type { Market, MarketId } from '@/convex/types';
import { EntitySelector, type EntitySelectorAddConfig } from '@/stories';

export interface MarketComboboxProps {
  /** Markets to display (e.g. from useQuery) */
  markets: Market[] | undefined;
  value?: MarketId;
  onChange?: (marketId: MarketId) => void;
  placeholder?: string;
  className?: string;
  addConfig?: EntitySelectorAddConfig<Market>;
}

/**
 * A compact combobox for selecting a market by name/country.
 * Use in forms when you need a dropdown picker vs the full MarketSelector sheet.
 */
export function MarketCombobox({
  markets = [],
  value,
  onChange,
  placeholder = 'Select market…',
  className,
  addConfig,
}: MarketComboboxProps) {
  const items = markets ?? [];
  const valueStr = value ?? undefined;

  return (
    <EntitySelector<Market>
      items={items}
      value={valueStr}
      onChange={v => onChange?.(v as MarketId)}
      getValue={m => m._id}
      getPrimaryLabel={m => m.name}
      getSecondaryLabel={m => m.country}
      messages={{
        placeholder,
        search: 'Search markets by name or country…',
        empty: 'No market found.',
      }}
      addConfig={addConfig}
      className={className}
    />
  );
}

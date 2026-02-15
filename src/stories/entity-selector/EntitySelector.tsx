'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, LucideIcon, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../button/Button';

export interface EntitySelectorMessages {
  placeholder?: string;
  search?: string;
  empty?: string;
}

export interface EntitySelectorAddConfig<T> {
  label?: string;
  icon?: LucideIcon;
  title?: string;
  renderForm: (props: {
    onSubmit: (item: T) => void;
    onCancel: () => void;
  }) => React.ReactNode;
  onAdd: (item: T) => void;
}

export interface EntitySelectorProps<T> {
  items: T[];
  value?: string;
  onChange?: (value: string) => void;
  getValue: (item: T) => string;
  getPrimaryLabel: (item: T) => string;
  getSecondaryLabel?: (item: T) => string;
  /** When showValueBadge is true, use this for badge display (e.g. IATA code). Falls back to getValue if omitted. */
  getBadgeLabel?: (item: T) => string;
  messages?: EntitySelectorMessages;
  showValueBadge?: boolean;
  addConfig?: EntitySelectorAddConfig<T>;
  className?: string;
}

const DEFAULT_MESSAGES: Required<EntitySelectorMessages> = {
  placeholder: 'Select…',
  search: 'Search…',
  empty: 'No results found.',
};

/**
 * A generic searchable combobox for entities with optional inline add-new.
 * Use for airports (code/name/city), markets (id/name/country), etc.
 */
export function EntitySelector<T>({
  items,
  value,
  onChange,
  getValue,
  getPrimaryLabel,
  getSecondaryLabel,
  getBadgeLabel,
  messages: messagesProp,
  showValueBadge = false,
  addConfig,
  className,
}: EntitySelectorProps<T>) {
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const messages = { ...DEFAULT_MESSAGES, ...messagesProp };

  const selected = useMemo(
    () => items.find(item => getValue(item) === value),
    [items, value, getValue]
  );

  const buildSearchValue = (item: T) => {
    const parts = [getValue(item), getPrimaryLabel(item)];
    if (getBadgeLabel) parts.push(getBadgeLabel(item));
    if (getSecondaryLabel) parts.push(getSecondaryLabel(item));
    return parts.join(' ').toLowerCase();
  };

  const getDisplayBadge = (item: T) =>
    getBadgeLabel ? getBadgeLabel(item) : getValue(item);

  const handleAddSubmit = (item: T) => {
    addConfig?.onAdd(item);
    onChange?.(getValue(item));
    setIsAdding(false);
    setOpen(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const resetForm = () => {
    setIsAdding(false);
  };

  const AddFormIcon = addConfig?.icon;

  return (
    <Popover
      open={open}
      onOpenChange={o => {
        setOpen(o);
        if (!o) resetForm();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              {showValueBadge && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold tracking-wider text-foreground">
                  {getDisplayBadge(selected)}
                </span>
              )}
              <span className="truncate">{getPrimaryLabel(selected)}</span>
            </span>
          ) : (
            messages.placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px] p-0" align="start">
        {!isAdding ? (
          <Command>
            <CommandInput placeholder={messages.search} />
            <CommandList>
              <ScrollArea className="h-[300px]">
                <CommandEmpty>{messages.empty}</CommandEmpty>
                <CommandGroup>
                  {items.map(item => {
                    const itemValue = getValue(item);
                    return (
                      <CommandItem
                        key={itemValue}
                        value={buildSearchValue(item)}
                        onSelect={() => {
                          onChange?.(itemValue);
                          setOpen(false);
                        }}
                        className="flex items-center gap-3"
                      >
                        <Check
                          className={cn(
                            'h-4 w-4 shrink-0',
                            value === itemValue ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {showValueBadge && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold tracking-wider text-foreground">
                            {getDisplayBadge(item)}
                          </span>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-sm">
                            {getPrimaryLabel(item)}
                          </span>
                          {getSecondaryLabel && (
                            <span className="text-xs text-muted-foreground">
                              {getSecondaryLabel(item)}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {addConfig && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => setIsAdding(true)}
                        className="flex items-center gap-2 text-primary"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">
                          {addConfig.label ?? 'Add new'}
                        </span>
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </ScrollArea>
            </CommandList>
          </Command>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              {AddFormIcon && (
                <AddFormIcon className="h-4 w-4 text-primary" />
              )}
              <h4 className="text-sm font-semibold text-foreground">
                {addConfig?.title ?? 'New'}
              </h4>
            </div>
            {addConfig?.renderForm?.({
              onSubmit: handleAddSubmit,
              onCancel: handleCancel,
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

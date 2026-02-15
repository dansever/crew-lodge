'use client';

import {
  Select as SelectComponent,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ComponentProps } from 'react';

/**
 * A component that displays a select dropdown.
 * @param items - The items to display in the select dropdown.
 * @param placeholder - The placeholder text for the select dropdown.
 * @param props - The props for the select component.
 */
interface SelectProps extends ComponentProps<typeof SelectComponent> {
  items: { label: string; value: string }[];
  placeholder?: string;
}

/**
 * A component that displays a select dropdown.
 * @param items - The items to display in the select dropdown: {label: string, value: string}[]
 * @param placeholder - The placeholder text for the select dropdown.
 * @param props - The props for the select component.
 */
export function Select({ items, placeholder, ...props }: SelectProps) {
  return (
    <SelectComponent {...props}>
      <SelectTrigger
        className="bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/40 text-slate-900 dark:text-white rounded-lg
    focus-visible:ring-0 focus-visible:border-primary cursor-pointer flex flex-row items-start"
      >
        <SelectValue
          className="placeholder:text-red-400"
          placeholder={placeholder}
        />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
      >
        <SelectGroup>
          {items.map(item => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectComponent>
  );
}

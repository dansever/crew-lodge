'use client';

import { Input as InputComponent } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { LucideIcon, Search } from 'lucide-react';
import { useId, useRef, type KeyboardEvent } from 'react';

type HTMLInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week';

interface InputProps extends Omit<
  React.ComponentProps<typeof InputComponent>,
  'type' | 'id' | 'className' | 'onSubmit'
> {
  label?: string;
  placeholder?: string;
  type?: HTMLInputType;
  Icon?: LucideIcon | null;
  className?: string;
  id?: string;
  onSubmit?: (value: string) => void;
}

export function Input({
  label,
  placeholder,
  type = 'text',
  className,
  onSubmit,
  Icon = Search,
  id: providedId,
  ...inputProps
}: InputProps) {
  // Generate a stable ID for accessibility
  // Always call useId() to maintain hook order, but only use it when label is provided
  const generatedId = useId();
  const inputId = providedId || (label ? generatedId : undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle Enter key submission safely
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Call original onKeyDown if provided
    inputProps.onKeyDown?.(e);

    // Handle Enter key for submission
    if (e.key === 'Enter' && !e.defaultPrevented) {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (onSubmit !== undefined && value.length > 0) {
        onSubmit(value);
      }
    }
  };

  // Determine padding based on icon presence
  const hasIcon = Icon !== null;
  const inputPaddingClass = hasIcon ? 'pl-8' : '';

  return (
    <div className="grid w-full items-center gap-2">
      {label && (
        <Label className="pl-2" htmlFor={inputId}>
          {label}
        </Label>
      )}
      <div className="relative w-full">
        {Icon && (
          <div
            className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2"
            aria-hidden="true"
          >
            <Icon className="size-4 text-muted-foreground" />
          </div>
        )}
        <InputComponent
          {...inputProps}
          ref={inputRef}
          {...(inputId && { id: inputId })}
          type={type}
          placeholder={placeholder}
          className={cn(
            'bg-white w-full focus-visible:ring-0 focus-visible:border-primary rounded-lg ',
            inputPaddingClass,
            className
          )}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}

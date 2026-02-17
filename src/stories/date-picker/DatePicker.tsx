'use client';

import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/stories';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';

interface DatePickerSingleProps {
  label?: string;
  mode: 'single';
  date?: Date;
  defaultDate?: Date;
  onSelect: (date: Date | undefined) => void;
}

interface DatePickerRangeProps {
  label?: string;
  mode: 'range';
  dates?: DateRange;
  defaultDate?: DateRange;
  onSelect: (dates: DateRange) => void;
}

type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

/**
 * A date picker component that allows the user to select a single date or a date range.
 *
 * @example
 * <DatePicker
 *   dates={new DateRange(new Date(), new Date())}
 *   onSelect={(dates) => console.log(dates)}
 * />
 *
 * @param props - The props for the DatePicker component.
 * @returns
 */
export function DatePicker(props: DatePickerProps) {
  const { label, mode } = props;

  // Extract dates prop based on mode to avoid object reference issues in useEffect
  const externalDates = mode === 'range' ? props.dates : props.date;

  // Internal state for the selected date(s)
  const [internalDate, setInternalDate] = useState<
    DateRange | Date | undefined
  >(() => {
    if (mode === 'single') {
      return props.date || props.defaultDate;
    } else {
      return props.dates || props.defaultDate;
    }
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Sync internal state with external dates prop when it changes
  useEffect(() => {
    if (externalDates !== undefined) {
      setInternalDate(externalDates);
    }
  }, [externalDates]);

  const handleReset = () => {
    // Reset to default date
    if (mode === 'single') {
      const resetDate = props.defaultDate;
      setInternalDate(resetDate);
      props.onSelect(resetDate);
    } else {
      const resetDate = props.defaultDate;
      setInternalDate(resetDate);
      props.onSelect(resetDate || { from: undefined, to: undefined });
    }
    setIsPopoverOpen(false);
  };

  const handleSelect = (selected: DateRange | Date | undefined) => {
    if (mode === 'single') {
      const date = selected as Date | undefined;
      setInternalDate(date);
      props.onSelect(date);
      setIsPopoverOpen(false);
    } else {
      const range = {
        from: (selected as DateRange)?.from || undefined,
        to: (selected as DateRange)?.to || undefined,
      };
      setInternalDate(range);
      props.onSelect(range);
    }
  };

  // Format button text based on mode and selection
  const getButtonText = () => {
    if (mode === 'single') {
      const date = internalDate as Date | undefined;
      return date ? format(date, 'LLL dd, y') : 'Pick a date';
    } else {
      const dateRange = internalDate as DateRange | undefined;
      if (!dateRange?.from && !dateRange?.to) {
        return 'Pick a date range';
      }
      const fromText = dateRange?.from
        ? format(dateRange.from, 'LLL dd, y')
        : '...';
      const toText = dateRange?.to ? format(dateRange.to, 'LLL dd, y') : '...';
      return `${fromText} - ${toText}`;
    }
  };

  // Get the default month to display in calendar
  const getDefaultMonth = () => {
    if (mode === 'single') {
      return (internalDate as Date) || new Date();
    } else {
      return (internalDate as DateRange)?.from || new Date();
    }
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      {label && (
        <Label className="pl-2" htmlFor="date-picker">
          {label}
        </Label>
      )}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild className="rounded-lg">
          <Button
            type="button"
            variant="outline"
            text={getButtonText()}
            icon={CalendarIcon}
            className="font-normal text-sm"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {mode === 'single' ? (
            <Calendar
              autoFocus
              mode="single"
              defaultMonth={getDefaultMonth()}
              showOutsideDays={false}
              selected={internalDate as Date | undefined}
              onSelect={date => handleSelect(date)}
              numberOfMonths={1}
            />
          ) : (
            <Calendar
              autoFocus
              mode="range"
              defaultMonth={getDefaultMonth()}
              showOutsideDays={false}
              selected={internalDate as DateRange | undefined}
              onSelect={range => handleSelect(range)}
              numberOfMonths={2}
            />
          )}
          <div className="flex items-center justify-end gap-1.5 border-t border-border p-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              text="Reset"
              icon={RotateCcw}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

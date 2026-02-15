"use client";

import {
  PopoverContent,
  PopoverTrigger,
  Popover as ShadcnPopover,
} from "@/components/ui/popover";
import * as React from "react";

export interface PopoverProps extends Omit<
  React.ComponentProps<typeof ShadcnPopover>,
  "children" | "open" | "onOpenChange"
> {
  /** The element that triggers the popover */
  trigger: React.ReactNode;
  /** The content to display inside the popover */
  content: React.ReactNode;
  /** Whether the popover is open (controlled) */
  open?: boolean;
  /** Callback when open state changes (controlled) */
  onOpenChange?: (open: boolean) => void;
  /** Alignment of the popover relative to trigger */
  align?: "center" | "start" | "end";
  /** Side of the trigger to show the popover */
  side?: "bottom" | "top" | "right" | "left";
  /** Offset from the trigger */
  sideOffset?: number;
  /** Custom className for the popover content */
  contentClassName?: string;
}

/**
 * Regular Popover component for general use cases.
 * Displays content in a popover when triggered.
 *
 * @example
 * ```tsx
 * <Popover
 *   trigger={<Button text="Open Popover" />}
 *   content={<div>Popover content here</div>}
 * />
 * ```
 */
export function Popover({
  trigger,
  content,
  open,
  onOpenChange,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  contentClassName,
  ...props
}: PopoverProps) {
  return (
    <ShadcnPopover open={open} onOpenChange={onOpenChange} {...props}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={contentClassName}
      >
        {content}
      </PopoverContent>
    </ShadcnPopover>
  );
}

export default Popover;

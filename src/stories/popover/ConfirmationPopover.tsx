'use client';

import {
  PopoverContent,
  PopoverTrigger,
  Popover as ShadcnPopover,
} from '@/components/ui/popover';
import { AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';
import * as React from 'react';
import { Button } from '../button/Button';

export type ConfirmationVariant = 'danger' | 'warning' | 'info';

export interface ConfirmationPopoverProps extends Omit<
  React.ComponentProps<typeof ShadcnPopover>,
  'children' | 'open' | 'onOpenChange'
> {
  /** The element that triggers the confirmation popover */
  trigger: React.ReactNode;
  /** Title text displayed in the popover */
  title?: string;
  /** Description text displayed in the popover */
  description?: string;
  /** Variant of the confirmation (affects icon and button colors) */
  variant?: ConfirmationVariant;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Callback when user confirms */
  onConfirm: () => void | Promise<void>;
  /** Callback when user cancels */
  onCancel?: () => void;
  /** Whether the confirm action is loading */
  isLoading?: boolean;
  /** Whether the popover is open (controlled) */
  open?: boolean;
  /** Callback when open state changes (controlled) */
  onOpenChange?: (open: boolean) => void;
  /** Alignment of the popover relative to trigger */
  align?: 'center' | 'start' | 'end';
  /** Side of the trigger to show the popover */
  side?: 'bottom' | 'top' | 'right' | 'left';
  /** Offset from the trigger */
  sideOffset?: number;
  /** Custom icon to display (overrides variant icon) */
  icon?: React.ReactNode;
  /** Custom className for the popover content */
  contentClassName?: string;
}

/**
 * ConfirmationPopover component for asking user consent before actions.
 * Perfect for "Are you sure?" scenarios, especially before deleting items.
 *
 * @example
 * ```tsx
 * <ConfirmationPopover
 *   trigger={<Button variant="danger" text="Delete" icon={Trash2} />}
 *   title="Are you sure?"
 *   description="This action cannot be undone."
 *   onConfirm={async () => {
 *     await deleteItem();
 *   }}
 * />
 * ```
 */
export function ConfirmationPopover({
  trigger,
  title = 'Are you sure?',
  description,
  variant = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  open,
  onOpenChange,
  align = 'center',
  side = 'top',
  sideOffset = 8,
  icon,
  contentClassName,
  ...props
}: ConfirmationPopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  const handleConfirm = React.useCallback(async () => {
    try {
      await onConfirm();
      handleOpenChange(false);
    } catch (error) {
      // Error handling is up to the parent component
      // We don't close the popover on error so user can retry
      console.error('Confirmation action failed:', error);
    }
  }, [onConfirm, handleOpenChange]);

  const handleCancel = React.useCallback(() => {
    onCancel?.();
    handleOpenChange(false);
  }, [onCancel, handleOpenChange]);

  // Get icon based on variant
  const getIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case 'danger':
        return <Trash2 className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-neutral-600" />;
    }
  };

  // Get confirm button variant based on confirmation variant
  const getConfirmVariant = (): 'danger' | 'warning' | 'primary' => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'primary';
      default:
        return 'primary';
    }
  };

  return (
    <ShadcnPopover open={isOpen} onOpenChange={handleOpenChange} {...props}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={`w-80 shadow-none ${contentClassName || ''}`}
      >
        <div className="space-y-4">
          {/* Header with icon and title */}
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-semibold text-neutral-900">
                {title}
              </h4>
              {description && (
                <p className="text-sm text-neutral-600">{description}</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              text={cancelText}
              onClick={handleCancel}
              disabled={isLoading}
            />
            <Button
              variant={getConfirmVariant()}
              size="sm"
              text={confirmText}
              onClick={handleConfirm}
              loading={isLoading}
              disabled={isLoading}
            />
          </div>
        </div>
      </PopoverContent>
    </ShadcnPopover>
  );
}

export default ConfirmationPopover;

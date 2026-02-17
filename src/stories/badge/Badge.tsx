import { Badge as BaseBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as React from 'react';

export type BadgeStatus =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'active'
  | 'inactive'
  | 'pending'
  | 'default';

export type IconSide = 'left' | 'right';

export interface BadgeProps {
  status: BadgeStatus;
  text: string;
  icon?: React.ReactNode;
  iconSide?: IconSide;
  className?: string;
}

const statusStyles: Record<BadgeStatus, string> = {
  success: 'border-transparent bg-emerald-500 text-white dark:bg-emerald-600',
  error: 'border-transparent bg-destructive text-white dark:bg-destructive/80',
  warning: 'border-transparent bg-amber-500 text-white dark:bg-amber-600',
  info: 'border-transparent bg-blue-500 text-white dark:bg-blue-600',
  active: 'border-transparent bg-emerald-500 text-white dark:bg-emerald-600',
  inactive: 'border-transparent bg-slate-400 text-white dark:bg-slate-500',
  pending: 'border-transparent bg-amber-500 text-white dark:bg-amber-600',
  default: 'border-transparent bg-primary text-primary-foreground',
};

export function Badge({
  status,
  text,
  icon,
  iconSide = 'left',
  className,
}: BadgeProps) {
  const statusStyle = statusStyles[status] || statusStyles.default;

  return (
    <BaseBadge
      variant="outline"
      className={cn(statusStyle, 'gap-1.5 px-2.5 py-1', className)}
    >
      {icon && iconSide === 'left' && (
        <span className="flex items-center [&>svg]:size-3 [&>svg]:shrink-0">
          {icon}
        </span>
      )}
      <span className="text-xs font-medium">{text}</span>
      {icon && iconSide === 'right' && (
        <span className="flex items-center [&>svg]:size-3 [&>svg]:shrink-0">
          {icon}
        </span>
      )}
    </BaseBadge>
  );
}

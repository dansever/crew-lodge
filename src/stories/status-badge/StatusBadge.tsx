import { cn } from '@/lib/utils';

type Status =
  | 'confirmed'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'checked_in'
  | 'open'
  | 'searching'
  | 'options_ready'
  | 'resolved';

const styles: Record<Status, string> = {
  confirmed: 'bg-green-200 text-green-800',
  pending: 'bg-yellow-200 text-yellow-800',
  completed: 'bg-green-200 text-green-800',
  cancelled: 'bg-red-200 text-red-800 line-through',
  checked_in: 'bg-blue-200 text-blue-800',
  open: 'bg-sky-200 text-sky-800',
  searching: 'bg-amber-200 text-amber-800 animate-pulse-subtle',
  options_ready: 'bg-blue-200 text-blue-800',
  resolved: 'bg-emerald-200 text-emerald-800',
};

const labels: Record<Status, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
  checked_in: 'Checked In',
  open: 'Open',
  searching: 'Searching...',
  options_ready: 'Options Ready',
  resolved: 'Resolved',
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}

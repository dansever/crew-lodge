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
  confirmed: 'bg-status-confirmed-bg text-status-confirmed-text',
  pending: 'bg-status-pending-bg text-status-pending-text',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-status-cancelled-bg text-status-cancelled-text line-through',
  checked_in: 'bg-status-open-bg text-status-open-text',
  open: 'bg-status-urgent-bg text-status-urgent-text',
  searching:
    'bg-status-pending-bg text-status-pending-text animate-pulse-subtle',
  options_ready: 'bg-status-confirmed-bg text-status-confirmed-text',
  resolved: 'bg-muted text-muted-foreground',
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

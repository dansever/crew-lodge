import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

export const buttonStyles = cva(
  [
    'inline-flex items-center justify-center gap-1',
    'rounded-[12px] transition-all duration-200',
    'font-medium text-center',
    'cursor-pointer shrink-0',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500',
    'disabled:opacity-50 disabled:pointer-events-none',
    'hover:bg-transparent ',
  ],
  {
    variants: {
      variant: {
        // Primary action - main call-to-action, most important actions
        primary:
          'bg-linear-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 active:from-violet-800 active:to-blue-800 text-white shadow-sm',
        // Secondary action - less prominent, alternative actions
        secondary:
          'bg-neutral-300/60 hover:bg-neutral-300/80 active:bg-neutral-300 text-neutral-900 border border-neutral-300',
        // Outline - bordered transparent background
        outline: cn(
          'bg-transparent border-1 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 active:bg-neutral-100 text-neutral-700',
          'dark:bg-transparent dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 dark:active:bg-neutral-900 dark:text-neutral-100'
        ),
        // Ghost action - minimal prominence, tertiary actions, icon buttons
        ghost:
          'bg-transparent hover:bg-neutral-200/50 active:bg-neutral-200 text-neutral-700 shadow-none',
        // Link - text-only, looks like a hyperlink
        link: 'bg-transparent hover:underline text-violet-600 hover:text-violet-700 active:text-violet-800 shadow-none p-0 h-auto',
        // Success action - confirmations, completions, positive outcomes
        success:
          'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm',
        // Warning action - caution required, potentially risky actions
        warning:
          'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-sm',
        // Danger action - destructive actions, deletions, critical operations
        danger:
          'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm',
        // Destructive outline - less aggressive danger variant
        dangerOutline:
          'bg-transparent border-red-600 hover:bg-red-50 hover:border-red-700 active:bg-red-100 text-red-600',
      },
      size: {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

import { cn } from '@/lib/utils';

interface LoadingComponentProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const Loading = ({
  size = 'md',
  text = 'Loading...',
  className,
}: LoadingComponentProps) => {
  const sizeStyles = {
    sm: {
      container: 'p-8',
      spinner: 'w-8 h-8',
      text: 'text-sm',
      dots: 'w-2 h-2',
    },
    md: {
      container: 'p-12',
      spinner: 'w-12 h-12',
      text: 'text-base',
      dots: 'w-3 h-3',
    },
    lg: {
      container: 'p-16',
      spinner: 'w-16 h-16',
      text: 'text-lg',
      dots: 'w-4 h-4',
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        styles.container,
        className
      )}
    >
      {/* Gradient spinner */}
      <div className="relative">
        <div
          className={cn(
            'rounded-full border-4 border-gray-200 animate-spin',
            styles.spinner
          )}
        >
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 border-r-blue-500 animate-spin" />
        </div>

        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'rounded-full bg-linear-to-r from-violet-500 to-blue-500 animate-pulse',
              styles.dots
            )}
          />
        </div>
      </div>

      {/* Loading text with subtle animation */}
      <div
        className={cn(
          'mt-6 font-medium text-gray-600 animate-pulse',
          styles.text
        )}
      >
        {text}
      </div>

      {/* Animated dots */}
      <div className="flex gap-1 mt-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

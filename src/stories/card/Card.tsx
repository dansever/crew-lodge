import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Card as ShadcnCard,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface CardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  header?: React.ReactNode;
  headerClassName?: string;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function Card({
  title = '',
  description = '',
  icon,
  header = null,
  headerClassName,
  actions = null,
  className,
  contentClassName,
  children,
  onClick = () => {},
  ...props
}: CardProps) {
  return (
    <ShadcnCard
      onClick={onClick}
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-2 rounded-md border shadow-none',
        'dark:border-white/10 dark:shadow-[0_16px_44px_rgba(0,0,0,0.45)]',
        className
      )}
      {...props}
    >
      {(header || title || description || actions) && (
        <CardHeader className={cn(headerClassName)}>
          {header ? (
            header
          ) : (
            <div id="header" className="flex items-start gap-2">
              <div id="header-left-side" className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                  {icon && icon}
                  {title && <CardTitle>{title}</CardTitle>}
                </div>
                <div>
                  {description && (
                    <CardDescription className={cn(icon && 'ml-6')}>
                      {description}
                    </CardDescription>
                  )}
                </div>
              </div>
              <div id="header-right-side" className="shrink-0">
                {actions && actions}
              </div>
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>{children}</CardContent>
    </ShadcnCard>
  );
}

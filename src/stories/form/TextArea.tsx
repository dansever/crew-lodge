import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

export interface TextAreaProps extends ComponentPropsWithoutRef<
  typeof Textarea
> {
  label?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ id, label, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <Label className="pl-2" htmlFor={id}>
            {label}
          </Label>
        )}
        <Textarea
          id={id}
          ref={ref}
          className={cn(
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

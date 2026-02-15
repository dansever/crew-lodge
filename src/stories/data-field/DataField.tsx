import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '@/components/ui/field';
import { cn } from '@/lib/utils';

interface DataFieldProps {
  label: string;
  description?: string;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  children: React.ReactNode;
}

/**
 * A component that displays a label and description for a data field.
 * @param label - The label for the data field.
 * @param description - The description for the data field.
 * @param orientation - The orientation of the data field.
 * @param className - The class name for the data field.
 * @param children - The content of the data field.
 */
export function DataField({
  label,
  description,
  orientation = 'vertical',
  className,
  children,
}: DataFieldProps) {
  return (
    <Field className={cn('gap-2', className)} orientation={orientation}>
      <FieldContent className="flex flex-col gap-1">
        <FieldLabel>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      {children}
    </Field>
  );
}

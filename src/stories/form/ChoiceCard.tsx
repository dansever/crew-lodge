import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface BaseChoiceCardProps {
  id: string;
  label?: string;
  description?: string;
  className?: string;
}

interface SwitchChoiceCardProps extends BaseChoiceCardProps {
  switchClassName?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

interface RadioChoiceCardProps extends BaseChoiceCardProps {
  value: string;
  radioClassName?: string;
}

export function SwitchChoiceCard({
  id,
  label,
  description,
  switchClassName,
  checked,
  onCheckedChange,
  className,
}: SwitchChoiceCardProps) {
  return (
    <FieldLabel
      htmlFor={id}
      className={cn(
        'cursor-pointer [&>*]:data-[slot=field]:p-3',
        className,
        checked &&
          'has-data-[state=checked]:bg-green-50 has-data-[state=checked]:border-green-300'
      )}
    >
      <Field className="flex flex-row items-start justify-between gap-2">
        <FieldContent>
          {label && <FieldTitle>{label}</FieldTitle>}
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
        <Switch
          id={id}
          className={cn(
            switchClassName,
            checked && 'data-[state=checked]:bg-green-500'
          )}
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      </Field>
    </FieldLabel>
  );
}

export function RadioChoiceCard({
  id,
  label,
  description,
  value,
  radioClassName,
  className,
}: RadioChoiceCardProps) {
  return (
    <FieldLabel htmlFor={id} className={cn(className, 'bg-green-300')}>
      <Field orientation="horizontal">
        <FieldContent>
          {label && <FieldTitle>{label}</FieldTitle>}
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
        <RadioGroupItem value={value} id={id} className={radioClassName} />
      </Field>
    </FieldLabel>
  );
}

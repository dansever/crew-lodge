import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  Sheet as SheetShadcn,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const widthVariants = {
  xs: { min: '16rem', max: '20rem' },
  sm: { min: '20rem', max: '24rem' },
  md: { min: '24rem', max: '28rem' },
  lg: { min: '28rem', max: '32rem' },
  xl: { min: '32rem', max: '36rem' },
} as const;

const paddintVariants = {
  xs: 'px-3',
  sm: 'px-4',
  md: 'px-5',
  lg: 'px-6',
  xl: 'px-6',
} as const;

type WidthVariant = keyof typeof widthVariants;

export interface SheetProps {
  trigger?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  width?: WidthVariant | string | { min: string; max: string };
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sheet({
  trigger,
  side = 'right',
  width = 'lg',
  title,
  description,
  footer,
  children,
  open,
  onOpenChange,
}: SheetProps) {
  // Determine width styles
  let widthStyles: React.CSSProperties = {};

  if (typeof width === 'string' && width in widthVariants) {
    // Predefined variant - use clamp() to allow responsive growth between min and max
    const variant = widthVariants[width as WidthVariant];
    // clamp(min, preferred, max) - preferred is 40vw to allow growth with screen size
    widthStyles = {
      width: `clamp(${variant.min}, 40vw, ${variant.max})`,
      minWidth: variant.min,
      maxWidth: variant.max,
    };
  } else if (typeof width === 'object' && 'min' in width && 'max' in width) {
    // Custom min/max object - use clamp() for responsive growth
    widthStyles = {
      width: `clamp(${width.min}, 40vw, ${width.max})`,
      minWidth: width.min,
      maxWidth: width.max,
    };
  } else if (typeof width === 'string') {
    // Custom width string (fallback to fixed width)
    widthStyles = { width };
  }

  return (
    <SheetShadcn open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        side={side}
        style={widthStyles}
        className="mx-2 flex h-[calc(100vh-1rem)] flex-col gap-0 overflow-x-hidden rounded-2xl top-1/2 -translate-y-1/2"
      >
        <SheetHeader className="p-4">
          <SheetTitle asChild>
            <h3>{title}</h3>
          </SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="px-4 min-h-0 flex-1 overflow-hidden ">
          {children}
        </ScrollArea>
        <Separator />
        {footer && <SheetFooter className="">{footer}</SheetFooter>}
      </SheetContent>
    </SheetShadcn>
  );
}

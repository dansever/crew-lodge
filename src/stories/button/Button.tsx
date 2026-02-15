import { Button as ButtonShadcn } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { buttonStyles } from "./styles";

export type ButtonSize = "xs" | "sm" | "md" | "lg";
export type ButtonType = "button" | "submit" | "reset";
export type ButtonIconPosition = "left" | "right";
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "success"
  | "warning"
  | "danger"
  | "dangerOutline";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  text?: string;
  icon?: LucideIcon;
  iconPosition?: ButtonIconPosition;
  iconClassName?: string;
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: ButtonType;
  ariaLabel?: string;
  className?: string;
  children?: React.ReactNode;
  /** When true, delegates the DOM element to the child (via Slot) */
  asChild?: boolean;
}

// Helpers
export const getIconSizeClass = (size?: ButtonSize) => {
  switch (size) {
    case "xs":
      return "size-3";
    case "sm":
      return "size-4";
    case "lg":
      return "size-5";
    case "md":
    default:
      return "size-4.5";
  }
};

export function Button({
  variant = "primary",
  size = "md",
  text,
  icon: Icon,
  iconPosition = "left",
  iconClassName,
  loading = false,
  disabled = false,
  onClick,
  className,
  ariaLabel,
  type = "button",
  children,
  asChild = false,
  ...props
}: ButtonProps) {
  const iconSizeClass = getIconSizeClass(size);

  const iconNode = loading ? (
    <Spinner className={iconSizeClass} />
  ) : Icon ? (
    <Icon className={cn(iconSizeClass, iconClassName)} aria-hidden="true" />
  ) : null;

  const isDisabled = disabled || loading;
  const baseClassName = cn(buttonStyles({ variant, size }), className);

  return (
    <ButtonShadcn
      className={baseClassName}
      disabled={isDisabled}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      asChild={asChild}
      {...props}
    >
      {iconPosition === "left" && iconNode}
      {text}
      {children}
      {iconPosition === "right" && iconNode}
    </ButtonShadcn>
  );
}

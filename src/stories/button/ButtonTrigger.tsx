import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import * as React from "react";
import {
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
  getIconSizeClass,
} from "./Button";
import { buttonStyles } from "./styles";

export interface ButtonTriggerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onClick" | "onKeyDown"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  text?: string;
  icon?: LucideIcon;
  iconPosition?: ButtonIconPosition;
  loading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  as?: "div" | "span"; // HTML element to render as (default: "div")
  onClick?: (e: React.MouseEvent<HTMLDivElement | HTMLSpanElement>) => void;
  onKeyDown?: (
    e: React.KeyboardEvent<HTMLDivElement | HTMLSpanElement>,
  ) => void;
  children?: React.ReactNode;
}

/**
 * ButtonTrigger - A non-button component with the same styling as Button.
 * Use this when you need button-like styling but can't use an actual button element
 * (e.g., when it's inside another button, which is invalid HTML).
 */
export function ButtonTrigger({
  variant = "primary",
  size = "md",
  text,
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  className,
  ariaLabel,
  as = "div",
  onClick,
  onKeyDown,
  children,
  ...props
}: ButtonTriggerProps) {
  const iconSizeClass = getIconSizeClass(size);
  const isDisabled = disabled || loading;
  const displayContent = text || children;
  const hasIcon = Icon && !loading;
  const isIconOnly = !displayContent && (hasIcon || loading);

  // Validate accessibility for icon-only triggers
  if (isIconOnly && !ariaLabel && !props["aria-label"]) {
    console.warn(
      "ButtonTrigger: Icon-only triggers should have an ariaLabel prop for accessibility",
    );
  }

  const ariaAttributes = {
    "aria-label": ariaLabel || props["aria-label"],
    "aria-busy": loading ? true : undefined,
    "aria-disabled": isDisabled ? true : undefined,
    role: props.role || "button",
    tabIndex: isDisabled ? -1 : (props.tabIndex ?? 0),
  };

  const iconNode = loading ? (
    <Spinner className={iconSizeClass} />
  ) : Icon ? (
    <Icon className={iconSizeClass} aria-hidden="true" />
  ) : null;

  const content = (
    <>
      {iconPosition === "left" && iconNode}
      {displayContent}
      {iconPosition === "right" && iconNode}
    </>
  );

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement | HTMLSpanElement>,
  ) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement | HTMLSpanElement>,
  ) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onClick) {
        (e.currentTarget as HTMLElement).click();
      }
    }
    onKeyDown?.(e);
  };

  const Component = as;
  const baseClassName = cn(buttonStyles({ variant, size }), className);

  const elementProps = {
    ...props,
    className: baseClassName,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    ...ariaAttributes,
  };

  return <Component {...elementProps}>{content}</Component>;
}

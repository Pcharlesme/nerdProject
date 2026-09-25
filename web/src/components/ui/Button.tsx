"use client";

import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "cta" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active",
  // Navy — the staff area's one consistent action color, distinct from the brand
  // indigo ("primary") reserved for the customer-facing site and the logo.
  cta: "bg-cta text-on-primary hover:opacity-90 active:opacity-80",
  secondary: "bg-surface text-text border border-border hover:bg-background",
  ghost: "bg-transparent text-text hover:bg-background",
  danger: "bg-danger text-white hover:opacity-90 active:opacity-80",
};

// sm suits dense staff tables/toolbars; lg suits the calmer, larger customer surfaces.
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-sm px-3 text-sm",
  md: "h-10 gap-2 rounded-md px-4 text-sm",
  lg: "h-14 gap-2 rounded-lg px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  // Loading keeps the button's real colour (it's actively doing something); only a
  // genuinely inert, non-loading disabled state gets the flat neutral treatment —
  // dimming the real colour with opacity reads as "broken", not "unavailable".
  const isInert = Boolean(disabled) && !loading;
  const stateClasses = isInert
    ? "cursor-not-allowed bg-border text-muted"
    : `${loading ? "cursor-wait" : "cursor-pointer"} ${VARIANT_CLASSES[variant]}`;

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${stateClasses} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {children}
      {loading ? (
        <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      ) : (
        icon
      )}
    </motion.button>
  );
}

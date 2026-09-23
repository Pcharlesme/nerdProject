"use client";

import { motion, scale } from "motion/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "title"
> {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active",
  secondary: "bg-surface text-text border border-border hover:bg-background",
  danger: "bg-danger text-white hover:opacity-90",
  ghost: "bg-transparent text-text hover:bg-background",
};

export function CustomButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  icon,
  disabled,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onPress}
      disabled={isDisabled}
      aria-busy={loading}
      whileHover={{ scale: 1.15 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className={`inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}>
      {loading ? "Loading..." : title}
      {!loading && icon}
    </motion.button>
  );
}

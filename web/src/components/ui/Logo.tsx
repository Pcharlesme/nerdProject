const SIZE_CLASSES = {
  sm: "size-7 text-sm",
  md: "size-10 text-lg",
} as const;

interface LogoProps {
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

/** The Nerd Logistics brand mark — reused in the customer nav, staff top bar, and login screen. */
export function Logo({ size = "sm", className = "" }: LogoProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-md bg-primary leading-none ${SIZE_CLASSES[size]} ${className}`}
      role="img"
      aria-label="Nerd Logistics"
    >
      🐘
    </span>
  );
}

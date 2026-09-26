const SIZE_CLASSES = {
  sm: "size-7",
  md: "size-10",
} as const;

interface LogoProps {
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

/** The Nerd Logistics icon mark — reused in the customer nav, staff top bar, and login screen. */
export function Logo({ size = "sm", className = "" }: LogoProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[28%] bg-primary leading-none ${SIZE_CLASSES[size]} ${className}`}
      role="img"
      aria-label="Nerd Logistics"
    >
      <svg viewBox="0 0 48 48" fill="none" className="size-[58%]" aria-hidden="true">
        <path
          d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
          stroke="white"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path
          d="M24 4V24M24 24L42 14M24 24L6 14"
          stroke="white"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="24" r="3.6" fill="white" />
      </svg>
    </span>
  );
}

const WORDMARK_SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
} as const;

/** The split-color "Nerd" / "Logistics" wordmark, always paired with `Logo`. */
export function Wordmark({
  size = "sm",
  /** Use over a dark/photo background (e.g. the 404 page's hero image) — "Nerd" reads
   * as white instead of near-black; "Logistics" stays the brand colour either way. */
  light = false,
  className = "",
}: {
  size?: keyof typeof WORDMARK_SIZE_CLASSES;
  light?: boolean;
  className?: string;
}) {
  return (
    <span className={`font-extrabold tracking-tight ${WORDMARK_SIZE_CLASSES[size]} ${className}`}>
      <span className={light ? "text-white" : "text-text"}>Nerd</span>
      <span className="text-primary">Logistics</span>
    </span>
  );
}

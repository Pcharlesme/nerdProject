import type { CSSProperties } from "react";

type ShipmentRouteIllustrationProps = {
  className?: string;
};

export function ShipmentRouteIllustration({
  className = "",
}: ShipmentRouteIllustrationProps) {
  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox="0 0 900 300"
        width="100%"
        role="presentation"
        style={styles.svg}
      >
        <defs>
          <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
            <feOffset dy="8" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.12" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="route-gradient" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#1E2E68" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>

          <path
            id="route-path"
            d="M250 154 C360 92 430 220 540 154 S700 86 770 130"
          />
        </defs>

        {/* Soft ground beneath the parcel */}
        <ellipse cx="190" cy="214" rx="112" ry="22" fill="#1E2E68" opacity="0.08" />

        {/* Delivery route */}
        <use href="#route-path" fill="none" stroke="#C7D2FE" strokeWidth="14" strokeLinecap="round" opacity="0.25" />
        <use href="#route-path" fill="none" stroke="url(#route-gradient)" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 17" />

        {/* Static route checkpoints */}
        <circle cx="410" cy="156" r="7" fill="#4338CA" opacity="0.35" />
        <circle cx="550" cy="155" r="7" fill="#4338CA" opacity="0.35" />
        <circle cx="674" cy="127" r="7" fill="#4338CA" opacity="0.35" />

        {/* Moving package marker */}
        <g className="nl-moving-dot">
          <circle r="7" fill="#4338CA">
            <animateMotion dur="3.8s" repeatCount="indefinite" rotate="auto">
              <mpath href="#route-path" />
            </animateMotion>
          </circle>
        </g>

        {/* Parcel */}
        <g filter="url(#soft-shadow)">
          {/* top */}
          <path d="M108 103 L184 75 L259 105 L183 135 Z" fill="#D8A66A" />
          {/* left */}
          <path d="M108 103 L183 135 L183 215 L108 179 Z" fill="#C68C4E" />
          {/* right */}
          <path d="M183 135 L259 105 L259 181 L183 215 Z" fill="#E2B477" />

          {/* packing tape */}
          <path d="M168 81 L191 90 L191 138 L168 128 Z" fill="#1E2E68" opacity="0.95" />
          <path d="M168 81 L191 90 L216 80 L193 71 Z" fill="#263873" opacity="0.95" />

          {/* NerdLogistics mark */}
          <g transform="translate(202 151)">
            <rect width="35" height="35" rx="8" fill="#172554" />
            <path d="M10 14 L17.5 10 L25 14 L25 22 L17.5 27 L10 22 Z" fill="none" stroke="white" strokeWidth="2" />
            <path d="M10 14 L17.5 18 L25 14 M17.5 18 V27" fill="none" stroke="white" strokeWidth="2" />
          </g>
        </g>

        {/* Destination pin */}
        <g>
          <circle cx="770" cy="151" r="42" fill="#C7D2FE" opacity="0.22" />
          <circle cx="770" cy="151" r="30" fill="none" stroke="#A5B4FC" strokeWidth="2" opacity="0.7" />
          <path
            d="M770 91 C748 91 731 108 731 129 C731 158 770 193 770 193 S809 158 809 129 C809 108 792 91 770 91Z"
            fill="#1E2E68"
          />
          <circle cx="770" cy="129" r="11" fill="white" opacity="0.95" />
        </g>
      </svg>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .nl-moving-dot { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  svg: {
    display: "block",
    overflow: "visible",
  },
};
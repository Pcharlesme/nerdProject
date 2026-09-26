/**
 * TrackingHeroVisual
 * Animated "truck + live tracking pin" illustration for the NerdLogistics
 * tracking landing page. Pure CSS/SVG — no client state, safe to render
 * as a Server Component.
 *
 * Usage (in app/page.tsx), right under <TrackingLanding />:
 *
 *   <div className="mt-10 w-full max-w-2xl">
 *     <TrackingLanding />
 *   </div>
 *   <TrackingHeroVisual />
 *
 * Colors are pulled from your existing tokens (text-primary, text-muted,
 * border-border, bg-surface) plus Tailwind's default sky/amber scales, so
 * it should match the page without any extra config.
 */
export function TrackingHeroVisual() {
  return (
    <div className="nl-scene relative mt-10 w-full max-w-2xl overflow-hidden">
      <div
        role="img"
        aria-label="Animated illustration of a delivery truck on a road with a live GPS tracking pin pulsing above it"
        className="relative h-[280px] sm:h-[300px]"
      >
        {/* road */}
        <div className="nl-road absolute inset-x-0 bottom-[26%] h-[2px] opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-[26%] bg-gradient-to-t from-primary-soft/60 to-transparent" />

        {/* rig */}
        <div className="nl-rig absolute bottom-[26%] left-1/2 w-[62%] max-w-[280px] -translate-x-1/2">
          <svg viewBox="0 0 320 150" fill="none" className="block w-full overflow-visible">
            {/* radar pings from pin tip */}
            <circle className="nl-ping text-sky-400" cx="150" cy="34" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <circle className="nl-ping nl-ping-delay text-sky-400" cx="150" cy="34" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />

            {/* tracking pin */}
            <g className="nl-pin text-sky-400">
              <path
                d="M150 34c-11 0-19 8.2-19 18.4 0 13.8 19 33.6 19 33.6s19-19.8 19-33.6C169 42.2 161 34 150 34z"
                fill="currentColor"
              />
              <circle cx="150" cy="52" r="7" className="fill-surface" />
            </g>

            {/* speed lines */}
            <g className="nl-speedlines text-muted" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="70" x2="42" y2="70" />
              <line x1="10" y1="92" x2="34" y2="92" />
              <line x1="20" y1="112" x2="40" y2="112" />
            </g>

            {/* cargo box */}
            <rect x="58" y="52" width="118" height="70" rx="4" className="fill-primary-soft text-primary" stroke="currentColor" strokeWidth="2" />
            <line x1="58" y1="80" x2="176" y2="80" className="text-primary" stroke="currentColor" strokeWidth="1.4" opacity="0.4" />

            {/* cab */}
            <path d="M176 68h34l30 26v28h-64V68z" className="fill-surface text-primary" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M182 74h20l18 20h-38V74z" className="fill-primary/25" />

            {/* headlight */}
            <circle className="nl-headlight" cx="242" cy="108" r="5" fill="#f59e0b" />
            <circle className="nl-headlight" cx="242" cy="108" r="11" fill="#f59e0b" opacity="0.18" />

            {/* chassis line */}
            <line x1="58" y1="122" x2="240" y2="122" className="text-primary" stroke="currentColor" strokeWidth="2" opacity="0.5" />

            {/* wheels */}
            <g className="nl-wheel text-text" style={{ animationDelay: "-.1s" }}>
              <circle cx="92" cy="124" r="15" className="fill-surface" stroke="currentColor" strokeWidth="3" />
              <line x1="92" y1="112" x2="92" y2="136" stroke="currentColor" strokeWidth="2" />
              <line x1="80" y1="124" x2="104" y2="124" stroke="currentColor" strokeWidth="2" />
            </g>
            <g className="nl-wheel text-text">
              <circle cx="204" cy="124" r="15" className="fill-surface" stroke="currentColor" strokeWidth="3" />
              <line x1="204" y1="112" x2="204" y2="136" stroke="currentColor" strokeWidth="2" />
              <line x1="192" y1="124" x2="216" y2="124" stroke="currentColor" strokeWidth="2" />
            </g>
          </svg>
        </div>
      </div>

      <style>{`
        .nl-road {
          background: repeating-linear-gradient(
            90deg,
            rgb(148 163 184 / 0.6) 0px, rgb(148 163 184 / 0.6) 22px,
            transparent 22px, transparent 44px
          );
          background-size: 200% 100%;
          animation: nl-road-move 1.1s linear infinite;
        }
        .nl-rig { animation: nl-rig-bob 1.1s ease-in-out infinite; }
        .nl-wheel { transform-box: fill-box; transform-origin: center; animation: nl-spin 0.7s linear infinite; }
        .nl-pin { transform-box: fill-box; transform-origin: bottom center; animation: nl-pin-bob 2s ease-in-out infinite; }
        .nl-ping { transform-box: fill-box; transform-origin: center; animation: nl-ping 2s ease-out infinite; }
        .nl-ping-delay { animation-delay: 1s; }
        .nl-headlight { animation: nl-headlight 1.6s ease-in-out infinite; }
        .nl-speedlines { animation: nl-speed 1.1s linear infinite; }

        @keyframes nl-road-move { from { background-position-x: 0; } to { background-position-x: -44px; } }
        @keyframes nl-rig-bob { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -3px); } }
        @keyframes nl-spin { to { transform: rotate(360deg); } }
        @keyframes nl-pin-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes nl-ping { 0% { transform: scale(0.4); opacity: 0.55; } 100% { transform: scale(2.1); opacity: 0; } }
        @keyframes nl-headlight { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
        @keyframes nl-speed {
          0% { opacity: 0; transform: translateX(6px); }
          30% { opacity: 0.5; }
          100% { opacity: 0; transform: translateX(-10px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .nl-road, .nl-rig, .nl-wheel, .nl-pin, .nl-ping, .nl-headlight, .nl-speedlines {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
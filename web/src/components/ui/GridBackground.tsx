"use client";

import { useEffect, useRef } from "react";

export default function GridBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;

    const onMove = (event: MouseEvent) => {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        frame = 0;

        const mask = `radial-gradient(
          circle 360px at ${event.clientX}px ${event.clientY}px,
          black 0%,
          rgba(0,0,0,0.9) 45%,
          transparent 100%
        )`;

        el.style.maskImage = mask;
        el.style.webkitMaskImage = mask;
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        maskImage:
          "radial-gradient(circle 360px at -1000px -1000px, black 0%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(circle 360px at -1000px -1000px, black 0%, transparent 100%)",
      }}
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="grid"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 56 0 L 0 0 0 56"
              fill="none"
              stroke="rgba(79,70,229,0.18)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

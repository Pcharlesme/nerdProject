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
        const mask = `radial-gradient(circle 300px at ${event.clientX}px ${event.clientY}px, black 0%, transparent 70%)`;
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
        maskImage: "radial-gradient(circle 300px at -1000px -1000px, black 0%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(circle 300px at -1000px -1000px, black 0%, transparent 70%)",
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(23,37,84,0.12)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { TrackingSearch } from "@/components/customer/TrackingSearch";
import {
  TrackingResult,
  TrackingResultSkeleton,
} from "@/components/customer/TrackingResult";
import { EnquiryPanel } from "@/components/customer/EnquiryPanel";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { useTrackingLookup } from "@/hooks/useTrackingLookup";

export default function Home() {
  const { status, shipment, trackingNumber, search } = useTrackingLookup();
  const hasSearched = status === "not-found" || status === "found";
  const isIdle = status === "idle";
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      {/* Soft, slowly-drifting gradient atmosphere */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(79,70,229,0.16),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(56,189,248,0.16),transparent_35%)]"
        animate={
          prefersReducedMotion
            ? undefined
            : { scale: [1, 1.08, 1], x: [0, 14, 0], y: [0, -10, 0] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      <nav className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
        <span className="flex items-center gap-2">
          <Logo />
          <Wordmark />
        </span>
        <Link
          href="/staff"
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-text/30 hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
        >
          Staff sign in
        </Link>
      </nav>

      {isIdle ? (
        <section className="relative flex flex-1 flex-col items-center justify-center gap-12 px-5 pb-16 sm:px-8">
          <HeroIntro onSearch={search} loading={false} />
          {/* //<HeroBanner prefersReducedMotion={prefersReducedMotion} /> */}
        </section>
      ) : (
        <section className="relative flex flex-col items-center px-5 pb-16 pt-6 sm:px-8">
          <HeroIntro onSearch={search} loading={status === "loading"} />

          <div
            aria-live="polite"
            className="mt-10 flex w-full flex-col items-center gap-5 px-1"
          >
            {status === "loading" && <TrackingResultSkeleton />}

            {status === "not-found" && (
              <div
                role="alert"
                className="w-full max-w-2xl rounded-lg border border-border bg-surface p-4 text-sm text-text shadow-sm"
              >
                We couldn&apos;t find a shipment for{" "}
                <span className="font-mono font-semibold">
                  {trackingNumber}
                </span>
                . Double-check the tracking number and try again.
              </div>
            )}

            {status === "found" && shipment && (
              <TrackingResult shipment={shipment} />
            )}

            {hasSearched && (
              <EnquiryPanel
                key={trackingNumber ?? "none"}
                trackingNumber={trackingNumber}
              />
            )}
          </div>
        </section>
      )}
    </main>
  );
}

interface HeroIntroProps {
  onSearch: (trackingNumber: string) => void;
  loading: boolean;
}

/** Eyebrow + heading + search form, centered in both the idle and searching/result layouts. */
function HeroIntro({ onSearch, loading }: HeroIntroProps) {
  return (
    <div className="w-full max-w-3xl text-center">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 text-sm font-medium text-primary"
      >
        Your parcel, one step away
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-text sm:text-6xl"
      >
        Where is your{" "}
        <span className="font-[cursive] font-normal text-primary">parcel?</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-auto mb-10 mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg"
      >
        Enter your tracking number to see where your parcel is and what happens
        next.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-auto flex justify-center"
      >
        <TrackingSearch onSearch={onSearch} loading={loading} />
      </motion.div>
    </div>
  );
}

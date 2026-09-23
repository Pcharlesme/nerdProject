"use client";

import { motion } from "motion/react";
import { TrackingSearch } from "@/components/customer/TrackingSearch";
import { TrackingResult } from "@/components/customer/TrackingResult";
import { useTrackingLookup } from "@/hooks/useTrackingLookup";

export default function Home() {
  const { status, shipment, trackingNumber, search } = useTrackingLookup();

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      {/* Soft gradient atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(79,70,229,0.16),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(56,189,248,0.16),transparent_35%)]"
      />

      <section className="relative flex flex-col items-center px-5 py-16 sm:px-8">
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
            Enter your tracking number to see where your parcel is and what happens next.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto flex justify-center"
          >
            <TrackingSearch onSearch={search} loading={status === "loading"} />
          </motion.div>
        </div>

        <div aria-live="polite" className="mt-8 flex w-full justify-center px-1">
          {status === "not-found" && (
            <div
              role="alert"
              className="w-full max-w-xl rounded-lg border border-border bg-surface p-4 text-sm text-text shadow-sm"
            >
              We couldn&apos;t find a shipment for{" "}
              <span className="font-mono font-semibold">{trackingNumber}</span>. Double-check the
              tracking number and try again.
            </div>
          )}

          {status === "found" && shipment && <TrackingResult shipment={shipment} />}
        </div>
      </section>
    </main>
  );
}

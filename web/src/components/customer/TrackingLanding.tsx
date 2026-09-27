"use client";

import { TrackingSearch } from "@/components/customer/TrackingSearch";
import { TrackingResult, TrackingResultSkeleton } from "@/components/customer/TrackingResult";
import { EnquiryPanel } from "@/components/customer/EnquiryPanel";
import { useTrackingLookup } from "@/hooks/useShipments";

/**
 * The one interactive "island" on an otherwise fully static, server-rendered landing
 * page — search box, lookup result, and enquiry form. Kept as a single small client
 * component (rather than the whole page) so the hero copy/image never has to wait on
 * JS to hydrate before it's visible.
 */
export function TrackingLanding() {
  const { status, shipment, trackingNumber, search } = useTrackingLookup();
  const hasSearched = status === "not-found" || status === "error" || status === "found";

  return (
    <div className="w-full">
      <TrackingSearch onSearch={search} loading={status === "loading"} />

      {status !== "idle" && (
        <div aria-live="polite" className="mt-8 flex w-full flex-col items-center gap-5">
          {status === "loading" && <TrackingResultSkeleton />}

          {status === "not-found" && (
            <div
              role="alert"
              className="w-full max-w-2xl rounded-lg border border-border bg-surface p-4 text-sm text-text shadow-sm"
            >
              We couldn&apos;t find a shipment for{" "}
              <span className="font-mono font-semibold">{trackingNumber}</span>. Double-check the
              tracking number and try again.
            </div>
          )}

          {status === "error" && (
            <div
              role="alert"
              className="w-full max-w-2xl rounded-lg border border-danger-border bg-danger-bg p-4 text-sm text-danger shadow-sm"
            >
              Something went wrong looking up that shipment. Please try again in a moment.
            </div>
          )}

          {status === "found" && shipment && <TrackingResult shipment={shipment} />}

          {hasSearched && (
            <EnquiryPanel key={trackingNumber ?? "none"} trackingNumber={trackingNumber} />
          )}
        </div>
      )}
    </div>
  );
}

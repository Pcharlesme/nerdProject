"use client";

import { useCallback, useState } from "react";
import { ApiError } from "@/api";
import { useGetTrackingDetail } from "@/hooks/useGetTrackingDetail";
import type { PublicShipment } from "@/types";

type LookupStatus = "idle" | "loading" | "not-found" | "error" | "found";

interface LookupResult {
  status: LookupStatus;
  shipment: PublicShipment | null;
  trackingNumber: string | null;
  search: (trackingNumber: string) => void;
  reset: () => void;
}

/** Owns the public tracking-search flow on top of `useGetTrackingDetail`: a 404 from
 * the backend surfaces as "not-found" (a normal, expected outcome), while any other
 * failure (network down, 5xx) surfaces as "error" so the UI can tell them apart. */
export function useTrackingLookup(): LookupResult {
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const query = useGetTrackingDetail(trackingNumber);

  const search = useCallback((value: string) => {
    setTrackingNumber(value.trim().toUpperCase());
  }, []);

  const reset = useCallback(() => setTrackingNumber(null), []);

  let status: LookupStatus = "idle";
  if (trackingNumber) {
    if (query.isLoading) {
      status = "loading";
    } else if (query.isError) {
      status = query.error instanceof ApiError && query.error.isNotFound ? "not-found" : "error";
    } else if (query.data) {
      status = "found";
    }
  }

  return {
    status,
    shipment: query.data ?? null,
    trackingNumber,
    search,
    reset,
  };
}

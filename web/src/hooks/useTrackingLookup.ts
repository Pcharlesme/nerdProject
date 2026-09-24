"use client";

import { useCallback, useState } from "react";
import { useAppData } from "@/providers/AppDataProvider";
import type { Shipment } from "@/types";

type LookupStatus = "idle" | "loading" | "not-found" | "found";

interface LookupState {
  status: LookupStatus;
  shipment: Shipment | null;
  trackingNumber: string | null;
}

const IDLE_STATE: LookupState = {
  status: "idle",
  shipment: null,
  trackingNumber: null,
};

/** Owns the public tracking-search flow: fires the (mock) lookup and tracks idle/loading/not-found/found. */
export function useTrackingLookup() {
  const { lookupShipment } = useAppData();
  const [state, setState] = useState<LookupState>(IDLE_STATE);

  const search = useCallback(
    async (trackingNumber: string) => {
      setState({ status: "loading", shipment: null, trackingNumber });
      const shipment = await lookupShipment(trackingNumber);
      setState(
        shipment
          ? { status: "found", shipment, trackingNumber }
          : { status: "not-found", shipment: null, trackingNumber },
      );
    },
    [lookupShipment],
  );

  const reset = useCallback(() => setState(IDLE_STATE), []);

  return { ...state, search, reset };
}

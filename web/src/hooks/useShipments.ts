"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, queryKeys, shipmentsApi } from "@/api";
import { hasAccessToken } from "@/api/tokenStore";
import type {
  AddInternalNoteRequest,
  AddTrackingEventRequest,
  ChangeShipmentStatusRequest,
  ListShipmentsParams,
  UpdateShipmentRequest,
} from "@/api/types";
import type { PublicShipment } from "@/types";

// ==== Public tracking (no auth) ====

/** GET /api/shipments/:trackingNumber — the public tracking lookup. Disabled until a
 * tracking number is provided, so it never fires on mount with an empty string. */
export function useGetTrackingDetail(trackingNumber: string | null) {
  return useQuery({
    queryKey: queryKeys.shipments.public(trackingNumber ?? ""),
    queryFn: () => shipmentsApi.getPublicShipment(trackingNumber as string),
    enabled: Boolean(trackingNumber),
    retry: false,
  });
}

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

// ==== Staff shipments ====

/** GET /api/staff/shipments/:trackingNumber — full record incl. contacts/notes. */
export function useStaffShipmentDetail(trackingNumber: string) {
  return useQuery({
    queryKey: queryKeys.shipments.staffDetail(trackingNumber),
    queryFn: () => shipmentsApi.getStaffShipment(trackingNumber),
    retry: false,
    enabled: hasAccessToken(),
  });
}

/** GET /api/staff/shipments — search/filter/sort/paginate. `placeholderData` keeps the
 * previous page's rows on screen while a new page/filter loads, instead of flashing empty. */
export function useStaffShipments(params: ListShipmentsParams) {
  return useQuery({
    queryKey: queryKeys.shipments.staffList(params),
    queryFn: () => shipmentsApi.listStaffShipments(params),
    placeholderData: (previousData) => previousData,
    enabled: hasAccessToken(),
  });
}

/** POST /api/staff/shipments — invalidates every shipments list/detail query and the
 * dashboard so the new record shows up immediately wherever it's listed. */
export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shipmentsApi.createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.root() });
    },
  });
}

/** PATCH /api/staff/shipments/:trackingNumber — never touches tracking history. */
export function useUpdateShipment(trackingNumber: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateShipmentRequest) => shipmentsApi.updateShipment(trackingNumber, body),
    onSuccess: (shipment) => {
      queryClient.setQueryData(queryKeys.shipments.staffDetail(trackingNumber), shipment);
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all() });
    },
  });
}

/** PATCH /api/staff/shipments/:trackingNumber/status — writes a matching timeline
 * event server-side, so the badge and the timeline can never disagree. */
export function useChangeShipmentStatus(trackingNumber: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ChangeShipmentStatusRequest) => shipmentsApi.changeShipmentStatus(trackingNumber, body),
    onSuccess: (shipment) => {
      queryClient.setQueryData(queryKeys.shipments.staffDetail(trackingNumber), shipment);
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.root() });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

/** POST /api/staff/shipments/:trackingNumber/events — append-only; may also change status. */
export function useAddTrackingEvent(trackingNumber: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddTrackingEventRequest) => shipmentsApi.addTrackingEvent(trackingNumber, body),
    onSuccess: (shipment) => {
      queryClient.setQueryData(queryKeys.shipments.staffDetail(trackingNumber), shipment);
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.root() });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

/** POST /api/staff/shipments/:trackingNumber/notes — the author is derived from the
 * bearer token server-side; the request body never carries an author field. */
export function useAddInternalNote(trackingNumber: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddInternalNoteRequest) => shipmentsApi.addInternalNote(trackingNumber, body),
    onSuccess: (shipment) => {
      queryClient.setQueryData(queryKeys.shipments.staffDetail(trackingNumber), shipment);
    },
  });
}

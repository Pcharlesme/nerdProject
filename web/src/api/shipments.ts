import { apiClient } from "./client";
import { toApiError } from "./errors";
import type {
  AddInternalNoteRequest,
  AddTrackingEventRequest,
  ApiEnvelope,
  ChangeShipmentStatusRequest,
  CreateShipmentRequest,
  ListShipmentsParams,
  PaginatedEnvelope,
  UpdateShipmentRequest,
} from "./types";
import type { PublicShipment, ShipmentSummary, StaffShipment } from "@/types";

/** GET /api/shipments/:trackingNumber — public, no auth. */
export async function getPublicShipment(trackingNumber: string): Promise<PublicShipment> {
  try {
    const res = await apiClient.get<ApiEnvelope<PublicShipment>>(
      `/shipments/${encodeURIComponent(trackingNumber)}`,
    );
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** GET /api/staff/shipments — search/filter/sort/paginate. */
export async function listStaffShipments(
  params: ListShipmentsParams,
): Promise<{ shipments: ShipmentSummary[]; meta: PaginatedEnvelope<ShipmentSummary>["meta"] }> {
  try {
    const res = await apiClient.get<PaginatedEnvelope<ShipmentSummary>>("/staff/shipments", { params });
    return { shipments: res.data.data, meta: res.data.meta };
  } catch (error) {
    throw toApiError(error);
  }
}

/** GET /api/staff/shipments/:trackingNumber — full record incl. contacts/notes. */
export async function getStaffShipment(trackingNumber: string): Promise<StaffShipment> {
  try {
    const res = await apiClient.get<ApiEnvelope<StaffShipment>>(
      `/staff/shipments/${encodeURIComponent(trackingNumber)}`,
    );
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** POST /api/staff/shipments */
export async function createShipment(body: CreateShipmentRequest): Promise<StaffShipment> {
  try {
    const res = await apiClient.post<ApiEnvelope<StaffShipment>>("/staff/shipments", body);
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** PATCH /api/staff/shipments/:trackingNumber — never touches tracking history. */
export async function updateShipment(trackingNumber: string, body: UpdateShipmentRequest): Promise<StaffShipment> {
  try {
    const res = await apiClient.patch<ApiEnvelope<StaffShipment>>(
      `/staff/shipments/${encodeURIComponent(trackingNumber)}`,
      body,
    );
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** PATCH /api/staff/shipments/:trackingNumber/status — writes a matching timeline event. */
export async function changeShipmentStatus(
  trackingNumber: string,
  body: ChangeShipmentStatusRequest,
): Promise<StaffShipment> {
  try {
    const res = await apiClient.patch<ApiEnvelope<StaffShipment>>(
      `/staff/shipments/${encodeURIComponent(trackingNumber)}/status`,
      body,
    );
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** POST /api/staff/shipments/:trackingNumber/events — append-only. */
export async function addTrackingEvent(
  trackingNumber: string,
  body: AddTrackingEventRequest,
): Promise<StaffShipment> {
  try {
    const res = await apiClient.post<ApiEnvelope<StaffShipment>>(
      `/staff/shipments/${encodeURIComponent(trackingNumber)}/events`,
      body,
    );
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** POST /api/staff/shipments/:trackingNumber/notes — author comes from the session, not the body. */
export async function addInternalNote(trackingNumber: string, body: AddInternalNoteRequest): Promise<StaffShipment> {
  try {
    const res = await apiClient.post<ApiEnvelope<StaffShipment>>(
      `/staff/shipments/${encodeURIComponent(trackingNumber)}/notes`,
      body,
    );
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

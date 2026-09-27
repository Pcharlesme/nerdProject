// API-transport types: request payloads, list params, and the envelope shapes
// every backend response comes wrapped in. Domain models (Shipment, Enquiry, ...)
// live in `@/types` and are shared between this layer and the UI.

import type {
  CreateShipmentInput,
  EditShipmentInput,
  EnquiryCategory,
  EnquiryStatus,
  ShipmentStatus,
  StaffUser,
} from "@/types";

/** Every successful response body: `{ data: T }`, plus `meta` on list endpoints. */
export interface ApiEnvelope<T> {
  data: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedEnvelope<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Every error response body: `{ error: { code, message, details? } }`. */
export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

// ==== Auth ====

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  staff: StaffUser;
}

// ==== Shipments ====

export interface ListShipmentsParams {
  search?: string;
  status?: ShipmentStatus;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export type CreateShipmentRequest = CreateShipmentInput;
export type UpdateShipmentRequest = EditShipmentInput;

export interface ChangeShipmentStatusRequest {
  status: ShipmentStatus;
  message?: string;
  location?: string;
}

export interface AddTrackingEventRequest {
  occurredAt: string; // ISO — must not be in the future
  location: string;
  message: string;
  status?: ShipmentStatus;
}

export interface AddInternalNoteRequest {
  message: string;
}

// ==== Enquiries ====

export interface CreateEnquiryRequest {
  trackingNumber: string;
  category: EnquiryCategory;
  message: string;
  contactEmail?: string;
}

/** The lighter shape `POST /api/enquiries` itself returns — not the full Enquiry. */
export interface CreateEnquiryResponse {
  id: string;
  trackingNumber: string;
  status: EnquiryStatus;
  createdAt: string;
}

export interface ListEnquiriesParams {
  status?: EnquiryStatus;
  page?: number;
  limit?: number;
}

export interface UpdateEnquiryStatusRequest {
  status: EnquiryStatus;
}

// ==== Analytics ====

export interface DeliveryPerformanceParams {
  from?: string; // ISO yyyy-mm-dd
  to?: string;
}

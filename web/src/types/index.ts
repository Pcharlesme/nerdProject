// Shared domain models — kept in lockstep with the backend's actual response
// shapes (server/src/modules/*/*.serializers.ts, *.schemas.ts), not invented.
// Request/pagination/API-transport types live in `@/api/types`; these are the
// domain models the UI renders, used by both the API layer and components.

export type ShipmentStatus =
  | "CREATED"
  | "COLLECTED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELAYED"
  | "EXCEPTION";

export interface TrackingEvent {
  id: string;
  occurredAt: string; // ISO timestamp
  location: string;
  message: string;
  /** Present only when this event also changed the shipment's status. */
  status?: ShipmentStatus;
}

/** Staff-only — never shown on the public customer tracking page. */
export interface InternalNote {
  id: string;
  message: string;
  author: string;
  createdAt: string;
}

/** Fictional contact details for the sender or receiver of a shipment. */
export interface ContactInfo {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

/** The minimal shape the status stepper/timeline need — satisfied by both
 * `PublicShipment` and `StaffShipment` without depending on either. */
export interface ShipmentProgress {
  status: ShipmentStatus;
  events: TrackingEvent[];
}

/** Fields present on every shipment view, public or staff. */
export interface ShipmentCore {
  trackingNumber: string;
  status: ShipmentStatus;
  originCity: string;
  originRegion: string;
  destinationCity: string;
  destinationRegion: string;
  currentLocation: string;
  estimatedDeliveryAt: string; // ISO date/time
  previousEstimatedDeliveryAt?: string | null;
  etaNote?: string | null;
  serviceLevel: string;
  packageCount: number;
  referenceCode: string;
  weightKg: number;
  updatedAt: string;
}

/**
 * `GET /api/shipments/:trackingNumber` — the public, customer-facing view.
 * Deliberately an allow-list on the backend: no sender/receiver/internalNotes/id
 * ever reach this shape, by construction, not by the frontend choosing not to show them.
 */
export interface PublicShipment extends ShipmentCore {
  /** Chronological ascending order; last item is the latest event. */
  events: TrackingEvent[];
}

/**
 * `GET /api/staff/shipments/:trackingNumber` (and the create/update/event/note
 * mutations, which all return the full updated record) — the staff-only view.
 */
export interface StaffShipment extends ShipmentCore {
  sender: ContactInfo;
  receiver: ContactInfo;
  createdAt: string;
  /** Chronological ascending order; last item is the latest event. */
  events: TrackingEvent[];
  /** Chronological ascending order; staff-only. */
  internalNotes: InternalNote[];
}

/** `GET /api/staff/shipments` list rows and the dashboard's "recent shipments". */
export interface ShipmentSummary {
  trackingNumber: string;
  status: ShipmentStatus;
  originCity: string;
  originRegion: string;
  destinationCity: string;
  destinationRegion: string;
  currentLocation: string;
  estimatedDeliveryAt: string;
  serviceLevel: string;
  referenceCode: string;
  senderName: string;
  updatedAt: string;
}

/** The fields a staff member fills in to create a new shipment. */
export interface CreateShipmentInput {
  trackingNumber?: string; // left blank to auto-generate
  originCity: string;
  originRegion: string;
  destinationCity: string;
  destinationRegion: string;
  currentLocation: string;
  estimatedDeliveryAt: string;
  etaNote?: string;
  serviceLevel: string;
  packageCount: number;
  referenceCode: string;
  weightKg: number;
  sender: ContactInfo;
  receiver: ContactInfo;
}

/** Fields staff can change without touching tracking history. */
export type EditShipmentInput = Pick<
  ShipmentCore,
  | "originCity"
  | "originRegion"
  | "destinationCity"
  | "destinationRegion"
  | "currentLocation"
  | "estimatedDeliveryAt"
  | "serviceLevel"
  | "packageCount"
  | "referenceCode"
  | "weightKg"
> & { etaNote?: string | null };

export type EnquiryCategory = "DELAY" | "DAMAGE" | "ADDRESS_CHANGE" | "MISSING_ITEM" | "OTHER";

export interface EnquiryInput {
  trackingNumber: string;
  category: EnquiryCategory;
  message: string;
  /** Optional — the brief doesn't require contact identity, only offer it back for follow-up. */
  contactEmail?: string;
}

export type EnquiryStatus = "OPEN" | "RESOLVED";

export interface Enquiry extends EnquiryInput {
  id: string;
  status: EnquiryStatus;
  resolvedAt: string | null;
  createdAt: string;
}

export const ENQUIRY_CATEGORIES: { value: EnquiryCategory; label: string }[] = [
  { value: "DELAY", label: "Delivery is delayed" },
  { value: "DAMAGE", label: "Package arrived damaged" },
  { value: "ADDRESS_CHANGE", label: "Need to change delivery address" },
  { value: "MISSING_ITEM", label: "Item missing from shipment" },
  { value: "OTHER", label: "Something else" },
];

/** `GET /api/auth/me` and the `data` of a successful login. */
export interface StaffUser {
  id: string;
  email: string;
  name: string;
}

/** `GET /api/staff/dashboard`. */
export interface DashboardData {
  totalShipments: number;
  byStatus: Record<ShipmentStatus, number>;
  recentShipments: ShipmentSummary[];
  openEnquiryCount: number;
  latestOpenEnquiries: Enquiry[];
}

/** One day of `GET /api/staff/analytics/delivery-performance`. */
export interface DeliveryPerformanceDay {
  date: string; // ISO yyyy-mm-dd
  delivered: number;
  onTime: number;
  onTimeRate: number | null;
}

export interface DeliveryPerformanceData {
  from: string;
  to: string;
  days: DeliveryPerformanceDay[];
  summary: { delivered: number; onTime: number; onTimeRate: number | null };
  /** Every date (anywhere, not just in this window) with at least one delivery — used to
   * tell the calendar which days genuinely have data vs. which are honestly empty. */
  availableDates: string[];
}

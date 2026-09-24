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
  email?: string;
  phone?: string;
  address?: string;
}

export interface Shipment {
  trackingNumber: string;
  status: ShipmentStatus;
  originCity: string;
  originRegion: string;
  destinationCity: string;
  destinationRegion: string;
  currentLocation: string;
  estimatedDeliveryAt: string; // ISO date/time
  previousEstimatedDeliveryAt?: string;
  etaNote?: string;
  serviceLevel: string;
  packageCount: number;
  referenceCode: string;
  weightKg: number;
  sender: ContactInfo;
  receiver: ContactInfo;
  /** Chronological ascending order; last item is the latest event. */
  events: TrackingEvent[];
  /** Chronological ascending order; staff-only. */
  internalNotes: InternalNote[];
  createdAt: string;
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
  serviceLevel: string;
  packageCount: number;
  referenceCode: string;
  weightKg: number;
  sender: ContactInfo;
  receiver: ContactInfo;
}

/** Fields staff can change without touching tracking history. */
export type EditShipmentInput = Pick<
  Shipment,
  "originCity" | "originRegion" | "destinationCity" | "destinationRegion" | "currentLocation" | "estimatedDeliveryAt" | "serviceLevel" | "packageCount" | "referenceCode" | "weightKg"
>;

export type EnquiryCategory =
  | "DELAY"
  | "DAMAGE"
  | "ADDRESS_CHANGE"
  | "MISSING_ITEM"
  | "OTHER";

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
  createdAt: string;
}

export const ENQUIRY_CATEGORIES: { value: EnquiryCategory; label: string }[] = [
  { value: "DELAY", label: "Delivery is delayed" },
  { value: "DAMAGE", label: "Package arrived damaged" },
  { value: "ADDRESS_CHANGE", label: "Need to change delivery address" },
  { value: "MISSING_ITEM", label: "Item missing from shipment" },
  { value: "OTHER", label: "Something else" },
];

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
  /** Chronological ascending order; last item is the latest event. */
  events: TrackingEvent[];
}

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

export const ENQUIRY_CATEGORIES: { value: EnquiryCategory; label: string }[] = [
  { value: "DELAY", label: "Delivery is delayed" },
  { value: "DAMAGE", label: "Package arrived damaged" },
  { value: "ADDRESS_CHANGE", label: "Need to change delivery address" },
  { value: "MISSING_ITEM", label: "Item missing from shipment" },
  { value: "OTHER", label: "Something else" },
];

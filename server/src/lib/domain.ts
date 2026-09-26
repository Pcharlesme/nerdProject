import type { EnquiryCategory, EnquiryStatus, ShipmentStatus } from "@prisma/client";

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "CREATED",
  "COLLECTED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "DELAYED",
  "EXCEPTION",
];

export const ENQUIRY_CATEGORIES: EnquiryCategory[] = ["DELAY", "DAMAGE", "ADDRESS_CHANGE", "MISSING_ITEM", "OTHER"];

export const ENQUIRY_STATUSES: EnquiryStatus[] = ["OPEN", "RESOLVED"];

// Letters/numbers/dashes only, 6-32 characters — covers both seeded ("TRK-DEMO-001") and generated
// ("TRK-XXXXXXXX") tracking numbers. Schemas upper-case the input before this pattern runs.
export const TRACKING_NUMBER_PATTERN = /^[A-Z0-9-]{6,32}$/;

/** The customer-readable message auto-written when staff change status without a custom one — kept in
 * lockstep with the frontend's own copy of this map (`web/src/lib/shipmentStatus.ts`). */
export const STATUS_AUTO_MESSAGE: Record<ShipmentStatus, string> = {
  CREATED: "Shipment record created.",
  COLLECTED: "Collected from sender by carrier.",
  IN_TRANSIT: "Shipment is in transit.",
  OUT_FOR_DELIVERY: "Out for delivery.",
  DELIVERED: "Delivered.",
  DELAYED: "Delivery is delayed. An updated estimate will follow.",
  EXCEPTION: "An issue needs attention — see the latest update for details.",
};

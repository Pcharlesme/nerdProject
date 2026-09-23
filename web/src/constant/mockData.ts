import { EnquiryInput, Shipment } from "@/types";

 

// === Fictional demo data only, matching the five seed scenarios in the brief.====
const SHIPMENTS: Shipment[] = [
  {
    trackingNumber: "TRK-DEMO-001",
    status: "IN_TRANSIT",
    originCity: "Manchester",
    originRegion: "United Kingdom",
    destinationCity: "Rotterdam",
    destinationRegion: "Netherlands",
    currentLocation: "Lille Distribution Hub, France",
    estimatedDeliveryAt: "2026-09-24T17:00:00Z",
    serviceLevel: "Standard Freight",
    packageCount: 3,
    referenceCode: "PO-48213",
    weightKg: 18.4,
    events: [
      {
        id: "001-e1",
        occurredAt: "2026-09-18T09:12:00Z",
        location: "Manchester, United Kingdom",
        message: "Shipment record created.",
        status: "CREATED",
      },
      {
        id: "001-e2",
        occurredAt: "2026-09-19T07:40:00Z",
        location: "Manchester, United Kingdom",
        message: "Collected from sender by carrier.",
        status: "COLLECTED",
      },
      {
        id: "001-e3",
        occurredAt: "2026-09-20T14:05:00Z",
        location: "Dover Gateway, United Kingdom",
        message: "Departed origin country, in transit to mainland Europe.",
        status: "IN_TRANSIT",
      },
      {
        id: "001-e4",
        occurredAt: "2026-09-21T22:30:00Z",
        location: "Lille Distribution Hub, France",
        message: "Arrived at sorting hub, continuing to destination.",
      },
    ],
  },
  {
    trackingNumber: "TRK-DEMO-002",
    status: "DELIVERED",
    originCity: "Leeds",
    originRegion: "United Kingdom",
    destinationCity: "Dublin",
    destinationRegion: "Ireland",
    currentLocation: "Dublin, Ireland",
    estimatedDeliveryAt: "2026-09-14T18:00:00Z",
    serviceLevel: "Express",
    packageCount: 1,
    referenceCode: "PO-30119",
    weightKg: 4.2,
    events: [
      {
        id: "002-e1",
        occurredAt: "2026-09-10T08:05:00Z",
        location: "Leeds, United Kingdom",
        message: "Shipment record created.",
        status: "CREATED",
      },
      {
        id: "002-e2",
        occurredAt: "2026-09-11T09:50:00Z",
        location: "Leeds, United Kingdom",
        message: "Collected from sender by carrier.",
        status: "COLLECTED",
      },
      {
        id: "002-e3",
        occurredAt: "2026-09-12T16:20:00Z",
        location: "Holyhead Port, United Kingdom",
        message: "In transit toward Ireland.",
        status: "IN_TRANSIT",
      },
      {
        id: "002-e4",
        occurredAt: "2026-09-14T08:15:00Z",
        location: "Dublin, Ireland",
        message: "Out for delivery with local courier.",
        status: "OUT_FOR_DELIVERY",
      },
      {
        id: "002-e5",
        occurredAt: "2026-09-14T13:47:00Z",
        location: "Dublin, Ireland",
        message: "Delivered and signed for by recipient.",
        status: "DELIVERED",
      },
    ],
  },
  {
    trackingNumber: "TRK-DEMO-003",
    status: "DELAYED",
    originCity: "Hamburg",
    originRegion: "Germany",
    destinationCity: "Lisbon",
    destinationRegion: "Portugal",
    currentLocation: "Rotterdam Customs Facility, Netherlands",
    estimatedDeliveryAt: "2026-09-23T18:00:00Z",
    previousEstimatedDeliveryAt: "2026-09-16T18:00:00Z",
    etaNote: "Estimate updated after an unplanned customs hold in Rotterdam.",
    serviceLevel: "Standard Freight",
    packageCount: 2,
    referenceCode: "PO-55871",
    weightKg: 27.9,
    events: [
      {
        id: "003-e1",
        occurredAt: "2026-09-12T10:00:00Z",
        location: "Hamburg, Germany",
        message: "Shipment record created.",
        status: "CREATED",
      },
      {
        id: "003-e2",
        occurredAt: "2026-09-13T08:30:00Z",
        location: "Hamburg, Germany",
        message: "Collected from sender by carrier.",
        status: "COLLECTED",
      },
      {
        id: "003-e3",
        occurredAt: "2026-09-14T20:10:00Z",
        location: "Rotterdam Customs Facility, Netherlands",
        message: "Arrived at customs facility for routine inspection.",
        status: "IN_TRANSIT",
      },
      {
        id: "003-e4",
        occurredAt: "2026-09-19T11:25:00Z",
        location: "Rotterdam Customs Facility, Netherlands",
        message:
          "Customs inspection is taking longer than expected. Estimated delivery has moved to 23 Sep.",
        status: "DELAYED",
      },
    ],
  },
  {
    trackingNumber: "TRK-DEMO-004",
    status: "EXCEPTION",
    originCity: "Bristol",
    originRegion: "United Kingdom",
    destinationCity: "Edinburgh",
    destinationRegion: "United Kingdom",
    currentLocation: "Edinburgh Local Depot, United Kingdom",
    estimatedDeliveryAt: "2026-09-20T18:00:00Z",
    etaNote: "Delivery is paused until the address issue below is resolved.",
    serviceLevel: "Standard",
    packageCount: 1,
    referenceCode: "PO-61042",
    weightKg: 6.8,
    events: [
      {
        id: "004-e1",
        occurredAt: "2026-09-15T09:00:00Z",
        location: "Bristol, United Kingdom",
        message: "Shipment record created.",
        status: "CREATED",
      },
      {
        id: "004-e2",
        occurredAt: "2026-09-16T10:15:00Z",
        location: "Bristol, United Kingdom",
        message: "Collected from sender by carrier.",
        status: "COLLECTED",
      },
      {
        id: "004-e3",
        occurredAt: "2026-09-17T18:40:00Z",
        location: "Edinburgh Local Depot, United Kingdom",
        message: "Arrived at local delivery depot.",
        status: "IN_TRANSIT",
      },
      {
        id: "004-e4",
        occurredAt: "2026-09-19T15:05:00Z",
        location: "Edinburgh Local Depot, United Kingdom",
        message:
          "Delivery attempt failed: the address on file is incomplete. Please submit an enquiry to confirm your address.",
        status: "EXCEPTION",
      },
    ],
  },
  {
    trackingNumber: "TRK-DEMO-005",
    status: "COLLECTED",
    originCity: "Bristol",
    originRegion: "United Kingdom",
    destinationCity: "Cardiff",
    destinationRegion: "United Kingdom",
    currentLocation: "Bristol, United Kingdom",
    estimatedDeliveryAt: "2026-09-25T18:00:00Z",
    serviceLevel: "Standard",
    packageCount: 1,
    referenceCode: "PO-70228",
    weightKg: 2.1,
    events: [
      {
        id: "005-e1",
        occurredAt: "2026-09-21T13:20:00Z",
        location: "Bristol, United Kingdom",
        message: "Shipment record created.",
        status: "CREATED",
      },
      {
        id: "005-e2",
        occurredAt: "2026-09-22T08:05:00Z",
        location: "Bristol, United Kingdom",
        message: "Collected from sender by carrier.",
        status: "COLLECTED",
      },
    ],
  },
];

const NETWORK_DELAY_MS = 700;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Loose client-side format check — rejects the obviously wrong before a "network" call. */
export function isValidTrackingNumberFormat(value: string): boolean {
  const trimmed = value.trim();
  return /^[A-Z0-9-]{6,32}$/i.test(trimmed);
}

/** Simulates a public GET /shipments/:trackingNumber lookup. Never rejects; returns null if unknown. */
export async function lookupShipment(trackingNumber: string): Promise<Shipment | null> {
  await delay(NETWORK_DELAY_MS);
  const normalized = trackingNumber.trim().toUpperCase();
  return SHIPMENTS.find((s) => s.trackingNumber === normalized) ?? null;
}

/** Simulates a public POST /enquiries submission. */
export async function submitEnquiry(
  input: EnquiryInput,
): Promise<{ id: string }> {
  await delay(NETWORK_DELAY_MS);
  const suffix = input.trackingNumber.trim().toUpperCase() || "GENERAL";
  return { id: `enq-${suffix}-${Date.now()}` };
}

export const DEMO_TRACKING_NUMBERS = SHIPMENTS.map((s) => s.trackingNumber);

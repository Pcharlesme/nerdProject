import { Enquiry, Shipment } from "@/types";

// === Fictional demo data only, matching the five seed scenarios in the brief.====
export const SHIPMENTS: Shipment[] = [
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
    sender: {
      name: "Priya Nandakumar",
      email: "priya.nandakumar@example.com",
      phone: "+44 7700 900123",
      address: "14 Oldham Road, Manchester, United Kingdom",
    },
    receiver: {
      name: "Bram de Wit",
      phone: "+31 6 1234 5678",
      address: "Coolsingel 42, Rotterdam, Netherlands",
    },
    createdAt: "2026-09-18T09:12:00Z",
    updatedAt: "2026-09-21T22:30:00Z",
    internalNotes: [],
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
    sender: {
      name: "Owen Fairclough",
      email: "owen.fairclough@example.com",
      phone: "+44 7700 900456",
      address: "9 Kirkgate, Leeds, United Kingdom",
    },
    receiver: {
      name: "Aoife Kavanagh",
      email: "aoife.kavanagh@example.com",
      address: "22 Merrion Square, Dublin, Ireland",
    },
    createdAt: "2026-09-10T08:05:00Z",
    updatedAt: "2026-09-14T13:47:00Z",
    internalNotes: [],
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
    sender: {
      name: "Lukas Brandt",
      email: "lukas.brandt@example.com",
      phone: "+49 151 23456789",
      address: "Speicherstadt 5, Hamburg, Germany",
    },
    receiver: {
      name: "Mariana Alves",
      phone: "+351 91 234 5678",
      address: "Rua Augusta 100, Lisbon, Portugal",
    },
    createdAt: "2026-09-12T10:00:00Z",
    updatedAt: "2026-09-19T11:25:00Z",
    internalNotes: [
      {
        id: "003-n1",
        message:
          "Called customs broker in Rotterdam — inspection backlog is affecting several shipments this week, not specific to us. Following up Monday.",
        author: "J. Okoye",
        createdAt: "2026-09-19T13:40:00Z",
      },
    ],
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
    sender: {
      name: "Chidi Okafor",
      email: "chidi.okafor@example.com",
      phone: "+44 7700 900654",
      address: "3 Park Street, Bristol, United Kingdom",
    },
    receiver: {
      name: "Fiona Mactavish",
      phone: "+44 7700 900789",
      address: "Flat 3B, Leith Walk, Edinburgh, United Kingdom (unit number missing)",
    },
    createdAt: "2026-09-15T09:00:00Z",
    updatedAt: "2026-09-19T15:05:00Z",
    internalNotes: [
      {
        id: "004-n1",
        message:
          "Driver couldn't locate the flat — building has no visible unit numbers. Left a card; needs the customer to confirm the correct flat number before we retry.",
        author: "R. Sánchez",
        createdAt: "2026-09-19T15:20:00Z",
      },
    ],
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
    sender: {
      name: "Grace Whitfield",
      email: "grace.whitfield@example.com",
      phone: "+44 7700 900321",
      address: "5 Queen Square, Bristol, United Kingdom",
    },
    receiver: {
      name: "Rhys Morgan",
      phone: "+44 7700 900321",
      address: "8 Cathedral Road, Cardiff, United Kingdom",
    },
    createdAt: "2026-09-21T13:20:00Z",
    updatedAt: "2026-09-22T08:05:00Z",
    internalNotes: [],
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
  {
    // Deliberately has zero tracking events — demonstrates the timeline's empty
    // state (a brand-new record before the carrier has collected it yet).
    trackingNumber: "TRK-DEMO-006",
    status: "CREATED",
    originCity: "Glasgow",
    originRegion: "United Kingdom",
    destinationCity: "Belfast",
    destinationRegion: "United Kingdom",
    currentLocation: "Glasgow, United Kingdom",
    estimatedDeliveryAt: "2026-09-29T18:00:00Z",
    serviceLevel: "Standard",
    packageCount: 1,
    referenceCode: "PO-81734",
    weightKg: 3.4,
    sender: {
      name: "Niamh Robertson",
      email: "niamh.robertson@example.com",
      phone: "+44 7700 900876",
      address: "21 Sauchiehall Street, Glasgow, United Kingdom",
    },
    receiver: {
      name: "Aaron Kelly",
      phone: "+44 7700 900432",
      address: "10 Botanic Avenue, Belfast, United Kingdom",
    },
    createdAt: "2026-09-25T09:00:00Z",
    updatedAt: "2026-09-25T09:00:00Z",
    internalNotes: [],
    events: [],
  },
];

// === Fictional demo enquiries — deliberately span both states and several categories.====
export const ENQUIRIES: Enquiry[] = [
  {
    id: "enq-1001",
    trackingNumber: "TRK-DEMO-003",
    category: "DELAY",
    message: "This shipment was supposed to arrive last week — is the new date definitely going to hold this time?",
    contactEmail: "lukas.brandt@example.com",
    status: "OPEN",
    createdAt: "2026-09-19T14:05:00Z",
  },
  {
    id: "enq-1002",
    trackingNumber: "TRK-DEMO-004",
    category: "ADDRESS_CHANGE",
    message: "The flat number is 3B — the buzzer just isn't labelled. Please retry delivery and call ahead if possible.",
    contactEmail: "fiona.mactavish@example.com",
    status: "OPEN",
    createdAt: "2026-09-19T16:02:00Z",
  },
  {
    id: "enq-1003",
    trackingNumber: "TRK-DEMO-001",
    category: "MISSING_ITEM",
    message: "We were expecting 3 packages but the tracking page only shows one package count — can you confirm this is correct?",
    contactEmail: "priya.nandakumar@example.com",
    status: "OPEN",
    createdAt: "2026-09-21T10:15:00Z",
  },
  {
    id: "enq-1004",
    trackingNumber: "TRK-DEMO-002",
    category: "OTHER",
    message: "Could you send proof of delivery for our records? It was signed for but we don't have a copy.",
    contactEmail: "owen.fairclough@example.com",
    status: "RESOLVED",
    createdAt: "2026-09-15T09:30:00Z",
  },
  {
    id: "enq-1005",
    trackingNumber: "TRK-DEMO-005",
    category: "DAMAGE",
    message: "The outer box looked a little crushed when the courier collected it — please double check it's packed securely before it goes out.",
    contactEmail: "grace.whitfield@example.com",
    status: "RESOLVED",
    createdAt: "2026-09-22T09:00:00Z",
  },
];

const NETWORK_DELAY_MS = 700;

export function delay(ms: number = NETWORK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Loose client-side format check — rejects the obviously wrong before a "network" call. */
export function isValidTrackingNumberFormat(value: string): boolean {
  const trimmed = value.trim();
  return /^[A-Z0-9-]{6,32}$/i.test(trimmed);
}

/** Generates a unique-looking demo tracking number for newly created shipments. */
export function generateTrackingNumber(): string {
  const suffix = Math.floor(100 + Math.random() * 900);
  return `TRK-${Date.now().toString(36).toUpperCase().slice(-5)}-${suffix}`;
}

export const DEMO_TRACKING_NUMBERS = SHIPMENTS.map((s) => s.trackingNumber);

import type { EnquiryCategory, EnquiryStatus, ShipmentStatus } from "@prisma/client";

// All people, places, references and messages below are fictional demo data.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function hoursAgo(now: Date, hours: number): Date {
  return new Date(now.getTime() - hours * HOUR);
}

export function at(now: Date, offsetDays: number, hour = 9, minute = 0): Date {
  const date = new Date(now.getTime() + offsetDays * DAY);
  date.setUTCHours(hour, minute, 0, 0);
  return date;
}

interface SeedContact {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface SeedEvent {
  occurredAt: Date;
  location: string;
  message: string;
  status?: ShipmentStatus;
}

export interface SeedShipment {
  trackingNumber: string;
  status: ShipmentStatus;
  originCity: string;
  originRegion: string;
  destinationCity: string;
  destinationRegion: string;
  currentLocation: string;
  estimatedDeliveryAt: Date;
  previousEstimatedDeliveryAt?: Date;
  etaNote?: string;
  serviceLevel: string;
  packageCount: number;
  weightKg: number;
  referenceCode: string;
  sender: SeedContact;
  receiver: SeedContact;
  events: SeedEvent[];
  notes: { message: string; createdAt: Date }[];
}

export interface SeedEnquiry {
  trackingNumber: string;
  category: EnquiryCategory;
  message: string;
  contactEmail?: string;
  status: EnquiryStatus;
  createdAt: Date;
}

export function buildShipments(now: Date): SeedShipment[] {
  return [
    {
      trackingNumber: "TRK-DEMO-001",
      status: "IN_TRANSIT",
      originCity: "Brackenford",
      originRegion: "Northvale",
      destinationCity: "Port Elsin",
      destinationRegion: "Coastmarch",
      currentLocation: "Harrowgate Distribution Hub, Midreach",
      estimatedDeliveryAt: at(now, 2, 17),
      serviceLevel: "Standard Freight",
      packageCount: 3,
      weightKg: 18.4,
      referenceCode: "PO-48213",
      sender: {
        name: "Demo Sender Alpha",
        email: "sender.alpha@example.test",
        phone: "+00 0000 000101",
        address: "14 Fictional Row, Brackenford",
      },
      receiver: { name: "Demo Receiver Alpha", phone: "+00 0000 000102", address: "42 Placeholder Quay, Port Elsin" },
      events: [
        {
          occurredAt: at(now, -4, 9, 12),
          location: "Brackenford, Northvale",
          message: "Shipment record created.",
          status: "CREATED",
        },
        {
          occurredAt: at(now, -3, 7, 40),
          location: "Brackenford, Northvale",
          message: "Collected from sender by carrier.",
          status: "COLLECTED",
        },
        {
          occurredAt: at(now, -2, 14, 5),
          location: "Northvale Gateway",
          message: "Departed origin region, in transit to Coastmarch.",
          status: "IN_TRANSIT",
        },
        {
          occurredAt: at(now, -1, 22, 30),
          location: "Harrowgate Distribution Hub, Midreach",
          message: "Arrived at sorting hub, continuing to destination.",
        },
      ],
      notes: [],
    },
    {
      trackingNumber: "TRK-DEMO-002",
      status: "DELIVERED",
      originCity: "Oakhollow",
      originRegion: "Northvale",
      destinationCity: "Lindmere",
      destinationRegion: "Westfold",
      currentLocation: "Lindmere, Westfold",
      estimatedDeliveryAt: at(now, -6, 18),
      serviceLevel: "Express",
      packageCount: 1,
      weightKg: 4.2,
      referenceCode: "PO-30119",
      sender: { name: "Demo Sender Bravo", email: "sender.bravo@example.test", address: "9 Sample Lane, Oakhollow" },
      receiver: {
        name: "Demo Receiver Bravo",
        email: "receiver.bravo@example.test",
        address: "22 Mock Square, Lindmere",
      },
      events: [
        {
          occurredAt: at(now, -10, 8, 5),
          location: "Oakhollow, Northvale",
          message: "Shipment record created.",
          status: "CREATED",
        },
        {
          occurredAt: at(now, -9, 9, 50),
          location: "Oakhollow, Northvale",
          message: "Collected from sender by carrier.",
          status: "COLLECTED",
        },
        {
          occurredAt: at(now, -8, 16, 20),
          location: "Greywater Port",
          message: "In transit toward Westfold.",
          status: "IN_TRANSIT",
        },
        {
          occurredAt: at(now, -6, 8, 15),
          location: "Lindmere, Westfold",
          message: "Out for delivery with local courier.",
          status: "OUT_FOR_DELIVERY",
        },
        {
          occurredAt: at(now, -6, 13, 47),
          location: "Lindmere, Westfold",
          message: "Delivered and signed for by recipient.",
          status: "DELIVERED",
        },
      ],
      notes: [],
    },
    {
      trackingNumber: "TRK-DEMO-003",
      status: "DELAYED",
      originCity: "Vesterholm",
      originRegion: "Eastmark",
      destinationCity: "Solcaster",
      destinationRegion: "Southreach",
      currentLocation: "Kessel Customs Facility, Midreach",
      estimatedDeliveryAt: at(now, 3, 18),
      previousEstimatedDeliveryAt: at(now, -2, 18),
      etaNote: "Estimate updated after an unplanned customs hold at Kessel.",
      serviceLevel: "Standard Freight",
      packageCount: 2,
      weightKg: 27.9,
      referenceCode: "PO-55871",
      sender: { name: "Demo Sender Charlie", email: "sender.charlie@example.test", phone: "+00 0000 000301" },
      receiver: { name: "Demo Receiver Charlie", phone: "+00 0000 000302", address: "100 Example Street, Solcaster" },
      events: [
        {
          occurredAt: at(now, -8, 10),
          location: "Vesterholm, Eastmark",
          message: "Shipment record created.",
          status: "CREATED",
        },
        {
          occurredAt: at(now, -7, 8, 30),
          location: "Vesterholm, Eastmark",
          message: "Collected from sender by carrier.",
          status: "COLLECTED",
        },
        {
          occurredAt: at(now, -6, 20, 10),
          location: "Kessel Customs Facility, Midreach",
          message: "Arrived at customs facility for routine inspection.",
          status: "IN_TRANSIT",
        },
        {
          occurredAt: at(now, -1, 11, 25),
          location: "Kessel Customs Facility, Midreach",
          message:
            "Customs inspection is taking longer than expected. Your estimated delivery date has moved back — see the updated estimate above.",
          status: "DELAYED",
        },
      ],
      notes: [
        {
          message:
            "Spoke to the (fictional) customs broker — inspection backlog is affecting several shipments this week. Following up tomorrow.",
          createdAt: at(now, -1, 13, 40),
        },
      ],
    },
    {
      trackingNumber: "TRK-DEMO-004",
      status: "EXCEPTION",
      originCity: "Brackenford",
      originRegion: "Northvale",
      destinationCity: "Thornbury",
      destinationRegion: "Highcrest",
      currentLocation: "Thornbury Local Depot, Highcrest",
      estimatedDeliveryAt: at(now, 1, 18),
      etaNote: "Delivery is paused until the address issue below is resolved.",
      serviceLevel: "Standard",
      packageCount: 1,
      weightKg: 6.8,
      referenceCode: "PO-61042",
      sender: {
        name: "Demo Sender Delta",
        email: "sender.delta@example.test",
        address: "3 Invented Park, Brackenford",
      },
      receiver: {
        name: "Demo Receiver Delta",
        phone: "+00 0000 000402",
        address: "Flat ?, 7 Test Walk, Thornbury (unit number missing)",
      },
      events: [
        {
          occurredAt: at(now, -5, 9),
          location: "Brackenford, Northvale",
          message: "Shipment record created.",
          status: "CREATED",
        },
        {
          occurredAt: at(now, -4, 10, 15),
          location: "Brackenford, Northvale",
          message: "Collected from sender by carrier.",
          status: "COLLECTED",
        },
        {
          occurredAt: at(now, -3, 18, 40),
          location: "Thornbury Local Depot, Highcrest",
          message: "Arrived at local delivery depot.",
          status: "IN_TRANSIT",
        },
        {
          occurredAt: at(now, -1, 15, 5),
          location: "Thornbury Local Depot, Highcrest",
          message:
            "Delivery attempt failed: the address on file is missing a flat number. Please send us an enquiry to confirm your address.",
          status: "EXCEPTION",
        },
      ],
      notes: [
        {
          message:
            "Driver couldn't locate the flat — building has no visible unit numbers. Needs the customer to confirm before we retry.",
          createdAt: at(now, -1, 15, 20),
        },
      ],
    },
    {
      trackingNumber: "TRK-DEMO-005",
      status: "COLLECTED",
      originCity: "Oakhollow",
      originRegion: "Northvale",
      destinationCity: "Merrowby",
      destinationRegion: "Westfold",
      currentLocation: "Oakhollow, Northvale",
      estimatedDeliveryAt: at(now, 3, 18),
      serviceLevel: "Standard",
      packageCount: 1,
      weightKg: 2.1,
      referenceCode: "PO-70228",
      sender: { name: "Demo Sender Echo", email: "sender.echo@example.test" },
      receiver: { name: "Demo Receiver Echo", address: "8 Sample Road, Merrowby" },
      events: [
        {
          occurredAt: at(now, -1, 13, 20),
          location: "Oakhollow, Northvale",
          message: "Shipment record created.",
          status: "CREATED",
        },
        {
          occurredAt: hoursAgo(now, 2),
          location: "Oakhollow, Northvale",
          message: "Collected from sender by carrier.",
          status: "COLLECTED",
        },
      ],
      notes: [],
    },
    {
      trackingNumber: "TRK-DEMO-006",
      status: "OUT_FOR_DELIVERY",
      originCity: "Solcaster",
      originRegion: "Southreach",
      destinationCity: "Brackenford",
      destinationRegion: "Northvale",
      currentLocation: "Brackenford, Northvale",
      estimatedDeliveryAt: at(now, 1, 12),
      serviceLevel: "Express",
      packageCount: 2,
      weightKg: 9.5,
      referenceCode: "PO-81130",
      sender: { name: "Demo Sender Foxtrot", email: "sender.foxtrot@example.test" },
      receiver: { name: "Demo Receiver Foxtrot", phone: "+00 0000 000602" },
      events: [
        {
          occurredAt: at(now, -3, 9),
          location: "Solcaster, Southreach",
          message: "Shipment record created.",
          status: "CREATED",
        },
        {
          occurredAt: at(now, -2, 11),
          location: "Solcaster, Southreach",
          message: "Collected from sender by carrier.",
          status: "COLLECTED",
        },
        {
          occurredAt: at(now, -1, 19),
          location: "Harrowgate Distribution Hub, Midreach",
          message: "In transit to destination region.",
          status: "IN_TRANSIT",
        },
        {
          occurredAt: hoursAgo(now, 3),
          location: "Brackenford, Northvale",
          message: "Out for delivery. Expect your parcel today.",
          status: "OUT_FOR_DELIVERY",
        },
      ],
      notes: [],
    },
    {
      trackingNumber: "TRK-DEMO-007",
      status: "CREATED",
      originCity: "Lindmere",
      originRegion: "Westfold",
      destinationCity: "Vesterholm",
      destinationRegion: "Eastmark",
      currentLocation: "Lindmere, Westfold",
      estimatedDeliveryAt: at(now, 5, 18),
      serviceLevel: "Economy",
      packageCount: 4,
      weightKg: 41,
      referenceCode: "PO-90412",
      sender: { name: "Demo Sender Golf", email: "sender.golf@example.test" },
      receiver: { name: "Demo Receiver Golf" },
      events: [],
      notes: [],
    },
  ];
}

export function buildEnquiries(now: Date): SeedEnquiry[] {
  return [
    {
      trackingNumber: "TRK-DEMO-003",
      category: "DELAY",
      message: "[Demo] My parcel was due earlier this week — is the new date likely to hold?",
      contactEmail: "customer.one@example.test",
      status: "OPEN",
      createdAt: at(now, -1, 14, 5),
    },
    {
      trackingNumber: "TRK-DEMO-004",
      category: "ADDRESS_CHANGE",
      message: "[Demo] The flat number is 3B — the buzzer just isn't labelled. Please retry delivery.",
      contactEmail: "customer.two@example.test",
      status: "OPEN",
      createdAt: at(now, -1, 16, 2),
    },
    {
      trackingNumber: "TRK-DEMO-001",
      category: "MISSING_ITEM",
      message: "[Demo] We expected three boxes — can you confirm all three are travelling together?",
      status: "OPEN",
      createdAt: hoursAgo(now, 4),
    },
    {
      trackingNumber: "TRK-DEMO-002",
      category: "OTHER",
      message: "[Demo] Could you share proof of delivery for our records?",
      contactEmail: "customer.four@example.test",
      status: "RESOLVED",
      createdAt: at(now, -5, 9, 30),
    },
    {
      trackingNumber: "TRK-DEMO-005",
      category: "DAMAGE",
      message: "[Demo] The outer box looked a little crushed at collection — please check the packing.",
      status: "RESOLVED",
      createdAt: hoursAgo(now, 1),
    },
  ];
}

// ==== Historical deliveries (delivery-performance analytics) ====

const FICTIONAL_CITIES: [string, string][] = [
  ["Brackenford", "Northvale"],
  ["Oakhollow", "Northvale"],
  ["Port Elsin", "Coastmarch"],
  ["Lindmere", "Westfold"],
  ["Merrowby", "Westfold"],
  ["Vesterholm", "Eastmark"],
  ["Solcaster", "Southreach"],
  ["Thornbury", "Highcrest"],
  ["Greywater", "Coastmarch"],
];

const SERVICE_LEVELS = ["Standard", "Express", "Economy", "Standard Freight"];
const HISTORY_DAYS = 28;

// Deterministic PRNG so every seed run produces the same history.
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildHistoricalShipments(now: Date): SeedShipment[] {
  const random = mulberry32(20260925);
  const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
  const shipments: SeedShipment[] = [];

  for (let daysAgo = HISTORY_DAYS; daysAgo >= 1; daysAgo -= 1) {
    const deliveriesToday = random() < 0.18 ? 0 : 1 + Math.floor(random() * 3);

    for (let i = 0; i < deliveriesToday; i += 1) {
      const index = shipments.length + 1;
      const code = String(index).padStart(3, "0");
      const [originCity, originRegion] = pick(FICTIONAL_CITIES);
      const [destinationCity, destinationRegion] = pick(FICTIONAL_CITIES.filter(([city]) => city !== originCity));
      const deliveredAt = at(now, -daysAgo, 10 + Math.floor(random() * 7), Math.floor(random() * 60));
      const late = index % 7 === 3;
      const eta = at(now, -daysAgo - (late ? 1 + Math.floor(random() * 2) : 0), 18);
      const origin = `${originCity}, ${originRegion}`;
      const destination = `${destinationCity}, ${destinationRegion}`;

      shipments.push({
        trackingNumber: `TRK-HIST-${code}`,
        status: "DELIVERED",
        originCity,
        originRegion,
        destinationCity,
        destinationRegion,
        currentLocation: destination,
        estimatedDeliveryAt: eta,
        serviceLevel: pick(SERVICE_LEVELS),
        packageCount: 1 + Math.floor(random() * 4),
        weightKg: Math.round((1 + random() * 30) * 10) / 10,
        referenceCode: `PO-H${code}`,
        sender: { name: `Demo Sender H${code}`, email: `sender.h${code}@example.test` },
        receiver: { name: `Demo Receiver H${code}` },
        events: [
          {
            occurredAt: at(now, -daysAgo - 4, 9),
            location: origin,
            message: "Shipment record created.",
            status: "CREATED",
          },
          {
            occurredAt: at(now, -daysAgo - 3, 11),
            location: origin,
            message: "Collected from sender by carrier.",
            status: "COLLECTED",
          },
          {
            occurredAt: at(now, -daysAgo - 2, 16),
            location: "Harrowgate Distribution Hub, Midreach",
            message: "In transit to destination region.",
            status: "IN_TRANSIT",
          },
          {
            occurredAt: at(now, -daysAgo, 7, 30),
            location: destination,
            message: "Out for delivery.",
            status: "OUT_FOR_DELIVERY",
          },
          {
            occurredAt: deliveredAt,
            location: destination,
            message: "Delivered and signed for by recipient.",
            status: "DELIVERED",
          },
        ],
        notes: [],
      });
    }
  }

  return shipments;
}

import type { PublicShipment, StaffShipment, ShipmentSummary } from "@/types";

const BASE = {
  trackingNumber: "TRK-TEST-001",
  status: "IN_TRANSIT" as const,
  originCity: "Manchester",
  originRegion: "United Kingdom",
  destinationCity: "Rotterdam",
  destinationRegion: "Netherlands",
  currentLocation: "Lille Distribution Hub, France",
  estimatedDeliveryAt: "2026-09-24T17:00:00Z",
  serviceLevel: "Standard Freight",
  packageCount: 1,
  referenceCode: "PO-00001",
  weightKg: 5,
  updatedAt: "2026-09-21T22:30:00Z",
};

export function makePublicShipment(overrides: Partial<PublicShipment> = {}): PublicShipment {
  return { ...BASE, events: [], ...overrides };
}

export function makeStaffShipment(overrides: Partial<StaffShipment> = {}): StaffShipment {
  return {
    ...BASE,
    createdAt: "2026-09-18T09:12:00Z",
    sender: { name: "Priya Nandakumar" },
    receiver: { name: "Bram de Wit" },
    events: [],
    internalNotes: [],
    ...overrides,
  };
}

export function makeShipmentSummary(overrides: Partial<ShipmentSummary> = {}): ShipmentSummary {
  return { ...BASE, senderName: "Priya Nandakumar", ...overrides };
}

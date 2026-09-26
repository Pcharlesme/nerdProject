import type { Prisma, Shipment, TrackingEvent } from "@prisma/client";

export const eventsInclude = {
  events: { orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }] },
} satisfies Prisma.ShipmentInclude;

export const staffInclude = {
  ...eventsInclude,
  notes: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true } } } },
} satisfies Prisma.ShipmentInclude;

type ShipmentWithEvents = Prisma.ShipmentGetPayload<{ include: typeof eventsInclude }>;
type ShipmentWithStaffData = Prisma.ShipmentGetPayload<{ include: typeof staffInclude }>;

function toEvent(event: TrackingEvent) {
  return {
    id: event.id,
    occurredAt: event.occurredAt,
    location: event.location,
    message: event.message,
    status: event.status,
  };
}

function toShipmentCore(shipment: Shipment) {
  return {
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    originCity: shipment.originCity,
    originRegion: shipment.originRegion,
    destinationCity: shipment.destinationCity,
    destinationRegion: shipment.destinationRegion,
    currentLocation: shipment.currentLocation,
    estimatedDeliveryAt: shipment.estimatedDeliveryAt,
    previousEstimatedDeliveryAt: shipment.previousEstimatedDeliveryAt,
    etaNote: shipment.etaNote,
    serviceLevel: shipment.serviceLevel,
    packageCount: shipment.packageCount,
    weightKg: shipment.weightKg.toNumber(),
    referenceCode: shipment.referenceCode,
    updatedAt: shipment.updatedAt,
  };
}

// Allow-list only: contact details, internal notes and database ids never reach the public API.
export function toPublicShipment(shipment: ShipmentWithEvents) {
  return { ...toShipmentCore(shipment), events: shipment.events.map(toEvent) };
}

export function toStaffShipment(shipment: ShipmentWithStaffData) {
  return {
    ...toShipmentCore(shipment),
    sender: {
      name: shipment.senderName,
      email: shipment.senderEmail,
      phone: shipment.senderPhone,
      address: shipment.senderAddress,
    },
    receiver: {
      name: shipment.receiverName,
      email: shipment.receiverEmail,
      phone: shipment.receiverPhone,
      address: shipment.receiverAddress,
    },
    createdAt: shipment.createdAt,
    events: shipment.events.map(toEvent),
    internalNotes: shipment.notes.map((note) => ({
      id: note.id,
      message: note.message,
      author: note.author.name,
      createdAt: note.createdAt,
    })),
  };
}

export function toShipmentSummary(shipment: Shipment) {
  return {
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    originCity: shipment.originCity,
    originRegion: shipment.originRegion,
    destinationCity: shipment.destinationCity,
    destinationRegion: shipment.destinationRegion,
    currentLocation: shipment.currentLocation,
    estimatedDeliveryAt: shipment.estimatedDeliveryAt,
    serviceLevel: shipment.serviceLevel,
    referenceCode: shipment.referenceCode,
    senderName: shipment.senderName,
    updatedAt: shipment.updatedAt,
  };
}

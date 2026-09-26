import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { STATUS_AUTO_MESSAGE } from "../../lib/domain";
import { eventsInclude, staffInclude } from "./shipment.serializers";
import type {
  AddEventBody,
  ChangeStatusBody,
  CreateShipmentBody,
  ListShipmentsQuery,
  UpdateShipmentBody,
} from "./shipment.schemas";

const TRACKING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_GENERATION_ATTEMPTS = 5;

function randomTrackingNumber(): string {
  const suffix = Array.from({ length: 8 }, () => TRACKING_ALPHABET[randomInt(TRACKING_ALPHABET.length)]).join("");
  return `TRK-${suffix}`;
}

function shipmentNotFound(trackingNumber: string) {
  return AppError.notFound(`No shipment found with tracking number ${trackingNumber}.`);
}

function duplicateTrackingNumber(trackingNumber: string) {
  return AppError.conflict(`Tracking number ${trackingNumber} is already in use.`, [
    { field: "trackingNumber", message: "This tracking number already exists" },
  ]);
}

async function resolveTrackingNumber(requested?: string): Promise<string> {
  if (requested) {
    const existing = await prisma.shipment.findUnique({ where: { trackingNumber: requested }, select: { id: true } });
    if (existing) throw duplicateTrackingNumber(requested);
    return requested;
  }

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const candidate = randomTrackingNumber();
    const existing = await prisma.shipment.findUnique({ where: { trackingNumber: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique tracking number");
}

async function requireShipmentId(trackingNumber: string): Promise<string> {
  const shipment = await prisma.shipment.findUnique({ where: { trackingNumber }, select: { id: true } });
  if (!shipment) throw shipmentNotFound(trackingNumber);
  return shipment.id;
}

// ==== Queries ====

export async function getPublicShipment(trackingNumber: string) {
  const shipment = await prisma.shipment.findUnique({ where: { trackingNumber }, include: eventsInclude });
  if (!shipment) throw shipmentNotFound(trackingNumber);
  return shipment;
}

export async function getStaffShipment(trackingNumber: string) {
  const shipment = await prisma.shipment.findUnique({ where: { trackingNumber }, include: staffInclude });
  if (!shipment) throw shipmentNotFound(trackingNumber);
  return shipment;
}

export async function listShipments({ search, status, order, page, limit }: ListShipmentsQuery) {
  const where: Prisma.ShipmentWhereInput = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { trackingNumber: { contains: search, mode: "insensitive" } },
        { referenceCode: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [total, shipments] = await Promise.all([
    prisma.shipment.count({ where }),
    prisma.shipment.findMany({
      where,
      orderBy: [{ updatedAt: order }, { trackingNumber: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { shipments, total };
}

// ==== Mutations ====

export async function createShipment({ sender, receiver, ...input }: CreateShipmentBody) {
  const trackingNumber = await resolveTrackingNumber(input.trackingNumber);
  const now = new Date();

  try {
    await prisma.shipment.create({
      data: {
        ...input,
        trackingNumber,
        senderName: sender.name,
        senderEmail: sender.email,
        senderPhone: sender.phone,
        senderAddress: sender.address,
        receiverName: receiver.name,
        receiverEmail: receiver.email,
        receiverPhone: receiver.phone,
        receiverAddress: receiver.address,
        status: "CREATED",
        events: {
          create: {
            occurredAt: now,
            location: [input.originCity, input.originRegion].filter(Boolean).join(", "),
            message: STATUS_AUTO_MESSAGE.CREATED,
            status: "CREATED",
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw duplicateTrackingNumber(trackingNumber);
    }
    throw error;
  }

  return getStaffShipment(trackingNumber);
}

export async function updateShipment(trackingNumber: string, patch: UpdateShipmentBody) {
  const current = await prisma.shipment.findUnique({
    where: { trackingNumber },
    select: { estimatedDeliveryAt: true },
  });
  if (!current) throw shipmentNotFound(trackingNumber);

  const { etaNote, ...fields } = patch;
  const etaChanged =
    fields.estimatedDeliveryAt !== undefined &&
    fields.estimatedDeliveryAt.getTime() !== current.estimatedDeliveryAt.getTime();

  await prisma.shipment.update({
    where: { trackingNumber },
    data: {
      ...fields,
      ...(etaNote !== undefined && { etaNote: etaNote || null }),
      ...(etaChanged && { previousEstimatedDeliveryAt: current.estimatedDeliveryAt }),
    },
  });

  return getStaffShipment(trackingNumber);
}

// Events are append-only. Only an event that is the newest on the timeline moves the shipment's
// current status/location, so back-filling an older event never rewinds what the customer sees.
// The check sits in the UPDATE's WHERE so this needs no interactive transaction (which times out on slow links).
export async function addTrackingEvent(trackingNumber: string, input: AddEventBody) {
  const shipmentId = await requireShipmentId(trackingNumber);

  await prisma.$transaction([
    prisma.trackingEvent.create({ data: { ...input, shipmentId } }),
    // `updatedAt` moves with the same guard as status/location — a back-filled older
    // event is inert everywhere, so it can't jump the shipment to the top of a
    // "most recently updated" staff list either.
    prisma.shipment.updateMany({
      where: { id: shipmentId, events: { none: { occurredAt: { gt: input.occurredAt } } } },
      data: {
        currentLocation: input.location,
        ...(input.status && { status: input.status }),
        updatedAt: new Date(),
      },
    }),
  ]);

  return getStaffShipment(trackingNumber);
}

export async function changeStatus(trackingNumber: string, input: ChangeStatusBody) {
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber },
    select: { status: true, currentLocation: true },
  });
  if (!shipment) throw shipmentNotFound(trackingNumber);

  if (shipment.status === input.status) {
    throw AppError.validation("The shipment already has this status.", [
      { field: "status", message: "Choose a different status" },
    ]);
  }

  return addTrackingEvent(trackingNumber, {
    status: input.status,
    occurredAt: new Date(),
    location: input.location ?? shipment.currentLocation,
    message: input.message ?? STATUS_AUTO_MESSAGE[input.status],
  });
}

export async function addInternalNote(trackingNumber: string, message: string, authorId: string) {
  const shipmentId = await requireShipmentId(trackingNumber);
  await prisma.internalNote.create({ data: { shipmentId, authorId, message } });
  return getStaffShipment(trackingNumber);
}

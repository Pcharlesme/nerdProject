import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import { PASSWORD_HASH_ROUNDS } from "../modules/auth/auth.service";
import { buildEnquiries, buildHistoricalShipments, buildShipments } from "./data";

interface SeedOptions {
  staffEmail: string;
  staffPassword: string;
  now?: Date;
}

export const DEMO_STAFF_NAME = "John Charles";

export async function resetDatabase(prisma: PrismaClient) {
  await prisma.$executeRaw`TRUNCATE internal_notes, tracking_events, enquiries, shipments, staff_users CASCADE`;
}

export async function seedDatabase(prisma: PrismaClient, { staffEmail, staffPassword, now = new Date() }: SeedOptions) {
  await resetDatabase(prisma);

  const staff = await prisma.staffUser.create({
    data: {
      email: staffEmail.toLowerCase(),
      name: DEMO_STAFF_NAME,
      passwordHash: await bcrypt.hash(staffPassword, PASSWORD_HASH_ROUNDS),
    },
  });

  const shipmentIds = new Map<string, string>();

  for (const { events, notes, sender, receiver, ...shipment } of [
    ...buildShipments(now),
    ...buildHistoricalShipments(now),
  ]) {
    const created = await prisma.shipment.create({
      data: {
        ...shipment,
        senderName: sender.name,
        senderEmail: sender.email,
        senderPhone: sender.phone,
        senderAddress: sender.address,
        receiverName: receiver.name,
        receiverEmail: receiver.email,
        receiverPhone: receiver.phone,
        receiverAddress: receiver.address,
        createdAt: events[0]?.occurredAt ?? now,
        updatedAt: events.at(-1)?.occurredAt ?? now,
        events: { create: events },
        notes: { create: notes.map((note) => ({ ...note, authorId: staff.id })) },
      },
    });
    shipmentIds.set(shipment.trackingNumber, created.id);
  }

  for (const enquiry of buildEnquiries(now)) {
    const shipmentId = shipmentIds.get(enquiry.trackingNumber);
    if (!shipmentId) throw new Error(`Seed enquiry references unknown shipment ${enquiry.trackingNumber}`);
    await prisma.enquiry.create({
      data: { ...enquiry, shipmentId, resolvedAt: enquiry.status === "RESOLVED" ? now : null },
    });
  }

  return { staff, shipmentCount: shipmentIds.size };
}

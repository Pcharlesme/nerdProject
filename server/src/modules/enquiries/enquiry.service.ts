import type { Enquiry, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import type { CreateEnquiryBody, ListEnquiriesQuery, UpdateEnquiryBody } from "./enquiry.schemas";

export function toEnquiry(enquiry: Enquiry) {
  return {
    id: enquiry.id,
    trackingNumber: enquiry.trackingNumber,
    category: enquiry.category,
    message: enquiry.message,
    contactEmail: enquiry.contactEmail,
    status: enquiry.status,
    resolvedAt: enquiry.resolvedAt,
    createdAt: enquiry.createdAt,
  };
}

export async function createEnquiry(input: CreateEnquiryBody) {
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber: input.trackingNumber },
    select: { id: true },
  });

  if (!shipment) {
    throw AppError.validation("We couldn't find a shipment with that tracking number.", [
      { field: "trackingNumber", message: "No shipment matches this tracking number" },
    ]);
  }

  return prisma.enquiry.create({ data: { ...input, shipmentId: shipment.id } });
}

export async function listEnquiries({ status, page, limit }: ListEnquiriesQuery) {
  const where: Prisma.EnquiryWhereInput = status ? { status } : {};

  const [total, enquiries] = await Promise.all([
    prisma.enquiry.count({ where }),
    prisma.enquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
  ]);

  return { enquiries, total };
}

export async function updateEnquiryStatus(id: string, { status }: UpdateEnquiryBody) {
  const existing = await prisma.enquiry.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw AppError.notFound("Enquiry not found.");

  return prisma.enquiry.update({
    where: { id },
    data: { status, resolvedAt: status === "RESOLVED" ? new Date() : null },
  });
}

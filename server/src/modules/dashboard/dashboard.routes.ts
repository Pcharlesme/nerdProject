import { Router } from "express";
import type { ShipmentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { SHIPMENT_STATUSES } from "../../lib/domain";
import { toShipmentSummary } from "../shipments/shipment.serializers";
import { toEnquiry } from "../enquiries/enquiry.service";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (_req, res) => {
  const [statusGroups, recentShipments, openEnquiryCount, latestOpenEnquiries] = await Promise.all([
    prisma.shipment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.shipment.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.enquiry.count({ where: { status: "OPEN" } }),
    prisma.enquiry.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const byStatus = Object.fromEntries(SHIPMENT_STATUSES.map((status) => [status, 0])) as Record<ShipmentStatus, number>;
  for (const group of statusGroups) byStatus[group.status] = group._count._all;

  res.json({
    data: {
      totalShipments: Object.values(byStatus).reduce((sum, count) => sum + count, 0),
      byStatus,
      recentShipments: recentShipments.map(toShipmentSummary),
      openEnquiryCount,
      latestOpenEnquiries: latestOpenEnquiries.map(toEnquiry),
    },
  });
});

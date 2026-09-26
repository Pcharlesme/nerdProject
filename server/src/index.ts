import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { apiLimiter } from "./middleware/rateLimiters";
import { requireStaff } from "./middleware/requireStaff";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { publicShipmentRouter, staffShipmentRouter } from "./modules/shipments/shipment.routes";
import { publicEnquiryRouter, staffEnquiryRouter } from "./modules/enquiries/enquiry.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { analyticsRouter } from "./modules/analytics/analytics.routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", env.TRUST_PROXY);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.get("/api/health", async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ data: { status: "ok", timestamp: new Date().toISOString() } });
  });

  app.use("/api", apiLimiter);

  app.use("/api/auth", authRouter);
  app.use("/api/shipments", publicShipmentRouter);
  app.use("/api/enquiries", publicEnquiryRouter);

  const staff = express.Router();
  staff.use(requireStaff);
  staff.use("/dashboard", dashboardRouter);
  staff.use("/analytics", analyticsRouter);
  staff.use("/shipments", staffShipmentRouter);
  staff.use("/enquiries", staffEnquiryRouter);
  app.use("/api/staff", staff);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

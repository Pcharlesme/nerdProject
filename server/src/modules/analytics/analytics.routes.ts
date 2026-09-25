import { Router } from "express";
import { validate } from "../../middleware/validate";
import { validatedQuery } from "../../lib/validated";
import { deliveryPerformanceQuerySchema, type DeliveryPerformanceQuery } from "./analytics.schemas";
import { getDeliveryPerformance } from "./analytics.service";

export const analyticsRouter = Router();

analyticsRouter.get("/delivery-performance", validate({ query: deliveryPerformanceQuerySchema }), async (req, res) => {
  const { from, to } = validatedQuery<DeliveryPerformanceQuery>(req);
  res.json({ data: await getDeliveryPerformance(from, to) });
});

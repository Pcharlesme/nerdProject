import { apiClient } from "./client";
import { toApiError } from "./errors";
import type { ApiEnvelope, DeliveryPerformanceParams } from "./types";
import type { DeliveryPerformanceData } from "@/types";

/** GET /api/staff/analytics/delivery-performance?from=&to= — daily on-time rate;
 * defaults to the last 14 days server-side when no range is given. */
export async function getDeliveryPerformance(params: DeliveryPerformanceParams = {}): Promise<DeliveryPerformanceData> {
  try {
    const res = await apiClient.get<ApiEnvelope<DeliveryPerformanceData>>("/staff/analytics/delivery-performance", {
      params,
    });
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

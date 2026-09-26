// The staff overview surface: the dashboard summary and its delivery-performance
// chart. Consolidated into one file since each is a single, small read with no
// mutations of its own — a dedicated file per endpoint here would just be noise.

import { apiClient } from "./client";
import { toApiError } from "./errors";
import type { ApiEnvelope, DeliveryPerformanceParams } from "./types";
import type { DashboardData, DeliveryPerformanceData } from "@/types";

/** GET /api/staff/dashboard — status counts, recent shipments, open-enquiry preview. */
export async function getDashboard(): Promise<DashboardData> {
  try {
    const res = await apiClient.get<ApiEnvelope<DashboardData>>("/staff/dashboard");
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

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

import { apiClient } from "./client";
import { toApiError } from "./errors";
import type { ApiEnvelope } from "./types";
import type { DashboardData } from "@/types";

/** GET /api/staff/dashboard — status counts, recent shipments, open-enquiry preview. */
export async function getDashboard(): Promise<DashboardData> {
  try {
    const res = await apiClient.get<ApiEnvelope<DashboardData>>("/staff/dashboard");
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

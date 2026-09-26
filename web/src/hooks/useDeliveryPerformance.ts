import { useQuery } from "@tanstack/react-query";
import { analyticsApi, queryKeys } from "@/api";
import type { DeliveryPerformanceParams } from "@/api/types";

/** GET /api/staff/analytics/delivery-performance — defaults to the server's last-14-days
 * window. Scope decision: the dashboard/analytics charts fetch this one default window and
 * don't refetch as the calendar picker is navigated to a different month (see
 * requirement/api-integration.md), so `params` is only ever the caller-provided override. */
export function useDeliveryPerformance(params: DeliveryPerformanceParams = {}) {
  return useQuery({
    queryKey: queryKeys.analytics.deliveryPerformance(params),
    queryFn: () => analyticsApi.getDeliveryPerformance(params),
  });
}

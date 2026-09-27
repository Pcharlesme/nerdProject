import { useQuery } from "@tanstack/react-query";
import { analyticsApi, dashboardApi, DeliveryPerformanceParams, queryKeys } from "@/api";
import { hasAccessToken } from "@/api/tokenStore";

/** GET /api/staff/dashboard — status breakdown, recent shipments, open-enquiry preview. */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.root(),
    queryFn: dashboardApi.getDashboard,
    enabled: hasAccessToken(),
  });
}

/** GET /api/staff/analytics/delivery-performance — defaults to the server's last-14-days
 * window. Scope decision: the dashboard/analytics charts fetch this one default window and
 * don't refetch as the calendar picker is navigated to a different month (see
 * requirement/api-integration.md), so `params` is only ever the caller-provided override. */
 
export function useDeliveryPerformance(params: DeliveryPerformanceParams = {}) {
  return useQuery({
    queryKey: queryKeys.analytics.deliveryPerformance(params),
    queryFn: () => analyticsApi.getDeliveryPerformance(params),
    enabled: hasAccessToken(),
  });
}

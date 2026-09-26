import { useQuery } from "@tanstack/react-query";
import { dashboardApi, queryKeys } from "@/api";

/** GET /api/staff/dashboard — status breakdown, recent shipments, open-enquiry preview. */
export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.root(),
    queryFn: dashboardApi.getDashboard,
  });
}

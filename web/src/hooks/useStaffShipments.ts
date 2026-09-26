import { useQuery } from "@tanstack/react-query";
import { queryKeys, shipmentsApi } from "@/api";
import type { ListShipmentsParams } from "@/api/types";

/** GET /api/staff/shipments — search/filter/sort/paginate. `placeholderData` keeps the
 * previous page's rows on screen while a new page/filter loads, instead of flashing empty. */
export function useStaffShipments(params: ListShipmentsParams) {
  return useQuery({
    queryKey: queryKeys.shipments.staffList(params),
    queryFn: () => shipmentsApi.listStaffShipments(params),
    placeholderData: (previousData) => previousData,
  });
}

import { useQuery } from "@tanstack/react-query";
import { queryKeys, shipmentsApi } from "@/api";

/** GET /api/staff/shipments/:trackingNumber — full record incl. contacts/notes. */
export function useStaffShipmentDetail(trackingNumber: string) {
  return useQuery({
    queryKey: queryKeys.shipments.staffDetail(trackingNumber),
    queryFn: () => shipmentsApi.getStaffShipment(trackingNumber),
    retry: false,
  });
}

import { useQuery } from "@tanstack/react-query";
import { queryKeys, shipmentsApi } from "@/api";

/** GET /api/shipments/:trackingNumber — the public tracking lookup. Disabled until a
 * tracking number is provided, so it never fires on mount with an empty string. */
export function useGetTrackingDetail(trackingNumber: string | null) {
  return useQuery({
    queryKey: queryKeys.shipments.public(trackingNumber ?? ""),
    queryFn: () => shipmentsApi.getPublicShipment(trackingNumber as string),
    enabled: Boolean(trackingNumber),
    retry: false,
  });
}

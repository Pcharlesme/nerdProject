import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, shipmentsApi } from "@/api";
import type { ChangeShipmentStatusRequest } from "@/api/types";

/** PATCH /api/staff/shipments/:trackingNumber/status — writes a matching timeline
 * event server-side, so the badge and the timeline can never disagree. */
export function useChangeShipmentStatus(trackingNumber: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ChangeShipmentStatusRequest) => shipmentsApi.changeShipmentStatus(trackingNumber, body),
    onSuccess: (shipment) => {
      queryClient.setQueryData(queryKeys.shipments.staffDetail(trackingNumber), shipment);
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.root() });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

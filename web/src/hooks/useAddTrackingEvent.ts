import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, shipmentsApi } from "@/api";
import type { AddTrackingEventRequest } from "@/api/types";

/** POST /api/staff/shipments/:trackingNumber/events — append-only; may also change status. */
export function useAddTrackingEvent(trackingNumber: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddTrackingEventRequest) => shipmentsApi.addTrackingEvent(trackingNumber, body),
    onSuccess: (shipment) => {
      queryClient.setQueryData(queryKeys.shipments.staffDetail(trackingNumber), shipment);
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.root() });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

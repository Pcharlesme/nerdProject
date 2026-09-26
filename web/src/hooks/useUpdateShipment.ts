import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, shipmentsApi } from "@/api";
import type { UpdateShipmentRequest } from "@/api/types";

/** PATCH /api/staff/shipments/:trackingNumber — never touches tracking history. */
export function useUpdateShipment(trackingNumber: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateShipmentRequest) => shipmentsApi.updateShipment(trackingNumber, body),
    onSuccess: (shipment) => {
      queryClient.setQueryData(queryKeys.shipments.staffDetail(trackingNumber), shipment);
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all() });
    },
  });
}

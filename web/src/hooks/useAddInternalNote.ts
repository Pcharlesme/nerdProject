import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, shipmentsApi } from "@/api";
import type { AddInternalNoteRequest } from "@/api/types";

/** POST /api/staff/shipments/:trackingNumber/notes — the author is derived from the
 * session cookie server-side; the request body never carries an author field. */
export function useAddInternalNote(trackingNumber: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddInternalNoteRequest) => shipmentsApi.addInternalNote(trackingNumber, body),
    onSuccess: (shipment) => {
      queryClient.setQueryData(queryKeys.shipments.staffDetail(trackingNumber), shipment);
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, shipmentsApi } from "@/api";

/** POST /api/staff/shipments — invalidates every shipments list/detail query and the
 * dashboard so the new record shows up immediately wherever it's listed. */
export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: shipmentsApi.createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.root() });
    },
  });
}

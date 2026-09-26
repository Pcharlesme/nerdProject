import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enquiriesApi, queryKeys } from "@/api";
import type { EnquiryStatus } from "@/types";

/** PATCH /api/staff/enquiries/:id — resolve or reopen. */
export function useUpdateEnquiryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EnquiryStatus }) =>
      enquiriesApi.updateEnquiryStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enquiries.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.root() });
    },
  });
}

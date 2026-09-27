import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enquiriesApi, queryKeys } from "@/api";
import { hasAccessToken } from "@/api/tokenStore";
import type { ListEnquiriesParams } from "@/api/types";
import type { EnquiryStatus } from "@/types";

/** POST /api/enquiries — public, no auth. Not cached; nothing customer-facing reads it back. */
export function useSubmitEnquiry() {
  return useMutation({
    mutationFn: enquiriesApi.createEnquiry,
  });
}

/** GET /api/staff/enquiries — newest first, optionally filtered by status. */
export function useStaffEnquiries(params: ListEnquiriesParams) {
  return useQuery({
    queryKey: queryKeys.enquiries.staffList(params),
    queryFn: () => enquiriesApi.listStaffEnquiries(params),
    placeholderData: (previousData) => previousData,
    enabled: hasAccessToken(),
  });
}

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

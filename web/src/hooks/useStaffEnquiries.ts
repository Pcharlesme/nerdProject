import { useQuery } from "@tanstack/react-query";
import { enquiriesApi, queryKeys } from "@/api";
import type { ListEnquiriesParams } from "@/api/types";

/** GET /api/staff/enquiries — newest first, optionally filtered by status. */
export function useStaffEnquiries(params: ListEnquiriesParams) {
  return useQuery({
    queryKey: queryKeys.enquiries.staffList(params),
    queryFn: () => enquiriesApi.listStaffEnquiries(params),
    placeholderData: (previousData) => previousData,
  });
}

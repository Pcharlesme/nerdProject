import { useMutation } from "@tanstack/react-query";
import { enquiriesApi } from "@/api";

/** POST /api/enquiries — public, no auth. Not cached; nothing customer-facing reads it back. */
export function useSubmitEnquiry() {
  return useMutation({
    mutationFn: enquiriesApi.createEnquiry,
  });
}

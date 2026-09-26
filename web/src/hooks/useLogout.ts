import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api";

/** POST /api/auth/logout — clears the cookie server-side. Also drops every cached
 * query so nothing from the ended session (dashboard, shipments, enquiries) lingers
 * in memory for whoever signs in next on this device. */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, queryKeys } from "@/api";

/** GET /api/auth/me — the source of truth for "is there a valid staff session right
 * now". A 401 is an expected, normal outcome (logged out), so this never retries. */
export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: authApi.getSession,
    retry: false,
    staleTime: 60_000,
  });
}

/** POST /api/auth/login — stores the returned bearer access token; invalidates the
 * session query so the next `useSession()` read re-fetches `/auth/me` with it. */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.session(),
      });
    },
  });
}

/** POST /api/auth/logout — clears the in-memory/sessionStorage access token. Also
 * drops every cached query so nothing from the ended session (dashboard, shipments,
 * enquiries) lingers in memory for whoever signs in next on this device. */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

import { useQuery } from "@tanstack/react-query";
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

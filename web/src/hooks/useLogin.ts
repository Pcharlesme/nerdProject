import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, queryKeys } from "@/api";

/** POST /api/auth/login — sets the httpOnly session cookie; seeds the session
 * query with the response so the next `useSession()` read doesn't refetch. */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (staff) => {
      queryClient.setQueryData(queryKeys.auth.session(), staff);
    },
  });
}

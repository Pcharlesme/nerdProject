import { apiClient } from "./client";
import { toApiError } from "./errors";
import type { ApiEnvelope, LoginRequest } from "./types";
import type { StaffUser } from "@/types";

/** POST /api/auth/login — sets the httpOnly session cookie; the response body
 * is just who signed in, never a token (the browser never sees the token itself). */
export async function login(body: LoginRequest): Promise<StaffUser> {
  try {
    const res = await apiClient.post<ApiEnvelope<StaffUser>>("/auth/login", body);
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** POST /api/auth/logout — clears the cookie server-side. 204, no body. */
export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    throw toApiError(error);
  }
}

/** GET /api/auth/me — the source of truth for "is there a valid session right
 * now", checked server-side every time (never inferred from client storage). */
export async function getSession(): Promise<StaffUser> {
  try {
    const res = await apiClient.get<ApiEnvelope<StaffUser>>("/auth/me");
    return res.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

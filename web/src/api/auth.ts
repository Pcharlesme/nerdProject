import { apiClient } from "./client";
import { setAccessToken } from "./tokenStore";
import { toApiError } from "./errors";
import type { ApiEnvelope, LoginRequest, LoginResponse } from "./types";
import type { StaffUser } from "@/types";

/** POST /api/auth/login — the response carries the access token once; from here
 * on it lives only in the token store (memory + sessionStorage), never in state
 * a component holds directly. */
export async function login(body: LoginRequest): Promise<StaffUser> {
  try {
    const res = await apiClient.post<ApiEnvelope<LoginResponse>>("/auth/login", body);
    const { accessToken, staff } = res.data.data;
    setAccessToken(accessToken);
    return staff;
  } catch (error) {
    throw toApiError(error);
  }
}

/** POST /api/auth/logout — the token is stateless (nothing to revoke server-side);
 * this call exists mainly so future server-side revocation has a home. The token
 * store is cleared either way. */
export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    throw toApiError(error);
  } finally {
    setAccessToken(null);
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

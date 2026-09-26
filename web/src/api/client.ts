import axios from "axios";

/**
 * Relative by default so requests go through Next's own `/api/:path*` rewrite
 * (web/next.config.ts), which proxies to the Express API — same origin in the
 * browser either way, in dev or production. Override via env only if the API
 * is ever reached directly (e.g. pointing a preview build at a different host).
 */
export const API_BASE_URL = "https://nerdlogic.onrender.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // The staff session is an httpOnly cookie (server/src/modules/auth) — axios
  // must be told to send/accept cookies on every request, or the browser never
  // includes it and every staff route looks unauthenticated.
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

import axios from "axios";

/**
 * Relative (`/api`) by default so requests go through Next's own `/api/:path*`
 * rewrite (`web/next.config.ts`) — same-origin in the browser, which matters
 * because the staff session is an httpOnly cookie (same-origin avoids third-party
 * cookie restrictions entirely). That works whenever the frontend and API are
 * served from the same origin (local dev, or the combined single-service deploy
 * described in `server/README.md` §9).
 *
 * When the frontend is deployed separately from the API (e.g. the frontend on
 * Vercel, the API on Render), same-origin isn't possible, so production builds
 * fall back to the deployed API's own origin. `NEXT_PUBLIC_API_BASE_URL` always
 * wins if set, so this default never needs to be hard-coded elsewhere.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production" ? "https://nerdlogic.onrender.com/api" : "/api");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // The staff session is an httpOnly cookie (server/src/modules/auth) — axios
  // must be told to send/accept cookies on every request, or the browser never
  // includes it and every staff route looks unauthenticated.
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

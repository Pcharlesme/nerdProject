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

// Every API function's own catch block normalizes an error through `toApiError()`
// (errors.ts), which only ever reads `message`/`code`/`status`/`details` — never
// `config`. But axios attaches the *entire original request* (including the raw
// JSON body — e.g. the plaintext password on a login call) to every error object,
// for its own debugging purposes. If that raw error is ever logged by anything
// downstream of this client (a browser's own "uncaught in promise" handler, a
// future console.error, a bug-reporting tool) before or instead of being
// normalized, the request body would be logged right along with it. Stripping it
// here, at the one place every request passes through, means no request's body
// can ever reach a log — regardless of what does or doesn't handle the error later.
apiClient.interceptors.response.use(undefined, (error) => {
  if (axios.isAxiosError(error) && error.config) {
    delete error.config.data;
  }
  return Promise.reject(error);
});

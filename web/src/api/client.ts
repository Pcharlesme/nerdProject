import axios from "axios";
import { getAccessToken, setAccessToken } from "./tokenStore";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "production" ? "https://nerdlogic.onrender.com/api" : "/api");

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(undefined, (error) => {
  if (axios.isAxiosError(error) && error.config) {
    delete error.config.data;

    // Only a *rejected* Bearer token means a live session just died — a 401 with
    // no Authorization header is just an anonymous check (e.g. the initial
    // `/auth/me` read), which the session hook + RouteGuard already handle by
    // routing to the login page without a jarring full-page reload.
    const hadToken = Boolean(error.config.headers?.Authorization);
    if (error.response?.status === 401 && hadToken) {
      setAccessToken(null);
      if (typeof window !== "undefined") {
        window.location.href = "/staff?reason=expired";
      }
    }
  }
  return Promise.reject(error);
});

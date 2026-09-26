// Barrel for the whole API layer. Components/hooks should generally import from
// `@/api` rather than reaching into individual files — see
// `requirement/api-integration.md` for the full endpoint ↔ hook ↔ consumer map.

export { apiClient, API_BASE_URL } from "./client";
export { ApiError, toApiError } from "./errors";
export { queryKeys } from "./queryKeys";

export * as shipmentsApi from "./shipments";
export * as enquiriesApi from "./enquiries";
export * as authApi from "./auth";
export * as dashboardApi from "./dashboard";
export * as analyticsApi from "./analytics";

export type * from "./types";

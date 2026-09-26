// Barrel for the whole API layer. Components/hooks should generally import from
// `@/api` rather than reaching into individual files — see
// `requirement/api-integration.md` for the full endpoint ↔ hook ↔ consumer map.

export { apiClient, API_BASE_URL } from "./client";
export { ApiError, toApiError } from "./errors";
export { queryKeys } from "./queryKeys";

export * as shipmentsApi from "./shipments";
export * as enquiriesApi from "./enquiries";
export * as authApi from "./auth";
// `dashboardApi` and `analyticsApi` are two names for the same small, consolidated
// module (`./staff`) — see the note there.
export * as dashboardApi from "./staff";
export * as analyticsApi from "./staff";

export type * from "./types";

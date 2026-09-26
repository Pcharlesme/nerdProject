import type { DeliveryPerformanceParams, ListEnquiriesParams, ListShipmentsParams } from "./types";

/** Centralised TanStack Query keys — every hook builds its key from here, so
 * invalidation (e.g. "refresh every shipments list after a mutation") never
 * relies on hand-typed, easy-to-typo key arrays scattered across hooks. */
export const queryKeys = {
  shipments: {
    all: () => ["shipments"] as const,
    public: (trackingNumber: string) => [...queryKeys.shipments.all(), "public", trackingNumber] as const,
    staffList: (params: ListShipmentsParams) => [...queryKeys.shipments.all(), "staff", "list", params] as const,
    staffDetail: (trackingNumber: string) =>
      [...queryKeys.shipments.all(), "staff", "detail", trackingNumber] as const,
  },
  enquiries: {
    all: () => ["enquiries"] as const,
    staffList: (params: ListEnquiriesParams) => [...queryKeys.enquiries.all(), "staff", "list", params] as const,
  },
  auth: {
    session: () => ["auth", "session"] as const,
  },
  dashboard: {
    root: () => ["dashboard"] as const,
  },
  analytics: {
    deliveryPerformance: (params: DeliveryPerformanceParams) =>
      ["analytics", "delivery-performance", params] as const,
  },
};

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStaffShipments } from "../useShipments";
import { shipmentsApi } from "@/api";
import { setAccessToken } from "@/api/tokenStore";
import { createQueryWrapper } from "@/test/queryWrapper";
import { makeShipmentSummary } from "@/test/fixtures";

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api")>();
  return { ...actual, shipmentsApi: { listStaffShipments: vi.fn() } };
});

describe("useStaffShipments", () => {
  beforeEach(() => {
    vi.mocked(shipmentsApi.listStaffShipments).mockReset();
    setAccessToken("test-token");
  });

  it("returns the page of shipments and pagination meta", async () => {
    const shipments = [makeShipmentSummary({ trackingNumber: "TRK-1" }), makeShipmentSummary({ trackingNumber: "TRK-2" })];
    vi.mocked(shipmentsApi.listStaffShipments).mockResolvedValue({
      shipments,
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
    });

    const { result } = renderHook(() => useStaffShipments({ page: 1, limit: 20 }), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.shipments).toHaveLength(2);
    expect(result.current.data?.meta.totalPages).toBe(1);
    expect(shipmentsApi.listStaffShipments).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it("re-queries with new params when the page changes", async () => {
    vi.mocked(shipmentsApi.listStaffShipments).mockResolvedValue({
      shipments: [makeShipmentSummary()],
      meta: { total: 40, page: 1, limit: 20, totalPages: 2 },
    });

    const { result, rerender } = renderHook(({ page }) => useStaffShipments({ page, limit: 20 }), {
      wrapper: createQueryWrapper(),
      initialProps: { page: 1 },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    vi.mocked(shipmentsApi.listStaffShipments).mockResolvedValue({
      shipments: [makeShipmentSummary({ trackingNumber: "TRK-PAGE-2" })],
      meta: { total: 40, page: 2, limit: 20, totalPages: 2 },
    });
    rerender({ page: 2 });

    await waitFor(() => expect(result.current.data?.meta.page).toBe(2));
    expect(shipmentsApi.listStaffShipments).toHaveBeenCalledWith({ page: 2, limit: 20 });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGetTrackingDetail } from "../useGetTrackingDetail";
import { shipmentsApi, ApiError } from "@/api";
import { createQueryWrapper } from "@/test/queryWrapper";
import { makePublicShipment } from "@/test/fixtures";

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api")>();
  return { ...actual, shipmentsApi: { getPublicShipment: vi.fn() } };
});

describe("useGetTrackingDetail", () => {
  beforeEach(() => {
    vi.mocked(shipmentsApi.getPublicShipment).mockReset();
  });

  it("stays disabled until a tracking number is provided", () => {
    const { result } = renderHook(() => useGetTrackingDetail(null), { wrapper: createQueryWrapper() });

    expect(result.current.fetchStatus).toBe("idle");
    expect(shipmentsApi.getPublicShipment).not.toHaveBeenCalled();
  });

  it("returns the shipment on success", async () => {
    const shipment = makePublicShipment({ trackingNumber: "TRK-DEMO-001" });
    vi.mocked(shipmentsApi.getPublicShipment).mockResolvedValue(shipment);

    const { result } = renderHook(() => useGetTrackingDetail("TRK-DEMO-001"), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(shipment);
    expect(shipmentsApi.getPublicShipment).toHaveBeenCalledWith("TRK-DEMO-001");
  });

  it("surfaces a 404 as an ApiError with isNotFound set", async () => {
    vi.mocked(shipmentsApi.getPublicShipment).mockRejectedValue(
      new ApiError("No shipment found for that tracking number.", "NOT_FOUND", 404),
    );

    const { result } = renderHook(() => useGetTrackingDetail("MISSING"), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect((result.current.error as ApiError).isNotFound).toBe(true);
  });
});

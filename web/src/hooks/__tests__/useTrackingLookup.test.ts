import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useTrackingLookup } from "../useTrackingLookup";
import { shipmentsApi, ApiError } from "@/api";
import { createQueryWrapper } from "@/test/queryWrapper";
import { makePublicShipment } from "@/test/fixtures";

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api")>();
  return { ...actual, shipmentsApi: { getPublicShipment: vi.fn() } };
});

describe("useTrackingLookup", () => {
  beforeEach(() => {
    vi.mocked(shipmentsApi.getPublicShipment).mockReset();
  });

  it("starts idle and has never called the API", () => {
    const { result } = renderHook(() => useTrackingLookup(), { wrapper: createQueryWrapper() });
    expect(result.current.status).toBe("idle");
    expect(shipmentsApi.getPublicShipment).not.toHaveBeenCalled();
  });

  it("moves idle -> loading -> found for a successful lookup", async () => {
    const shipment = makePublicShipment({ trackingNumber: "TRK-DEMO-001" });
    vi.mocked(shipmentsApi.getPublicShipment).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(shipment), 10)),
    );

    const { result } = renderHook(() => useTrackingLookup(), { wrapper: createQueryWrapper() });

    act(() => result.current.search("trk-demo-001"));
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("found"));
    expect(result.current.shipment).toEqual(shipment);
    expect(result.current.trackingNumber).toBe("TRK-DEMO-001");
  });

  it("reports a 404 as not-found, distinct from a real error", async () => {
    vi.mocked(shipmentsApi.getPublicShipment).mockRejectedValue(new ApiError("Not found", "NOT_FOUND", 404));

    const { result } = renderHook(() => useTrackingLookup(), { wrapper: createQueryWrapper() });
    act(() => result.current.search("UNKNOWN"));

    await waitFor(() => expect(result.current.status).toBe("not-found"));
  });

  it("reports a network/server failure as error, not not-found", async () => {
    vi.mocked(shipmentsApi.getPublicShipment).mockRejectedValue(new ApiError("Server exploded", "INTERNAL_ERROR", 500));

    const { result } = renderHook(() => useTrackingLookup(), { wrapper: createQueryWrapper() });
    act(() => result.current.search("TRK-DEMO-001"));

    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("resets back to idle", async () => {
    vi.mocked(shipmentsApi.getPublicShipment).mockResolvedValue(makePublicShipment());
    const { result } = renderHook(() => useTrackingLookup(), { wrapper: createQueryWrapper() });

    act(() => result.current.search("TRK-DEMO-001"));
    await waitFor(() => expect(result.current.status).toBe("found"));

    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
    expect(result.current.trackingNumber).toBeNull();
  });
});

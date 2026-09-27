import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useChangeShipmentStatus } from "../useShipments";
import { shipmentsApi, queryKeys } from "@/api";
import { createQueryWrapper } from "@/test/queryWrapper";
import { makeStaffShipment } from "@/test/fixtures";
import { useQueryClient } from "@tanstack/react-query";

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api")>();
  return { ...actual, shipmentsApi: { changeShipmentStatus: vi.fn() } };
});

describe("useChangeShipmentStatus", () => {
  beforeEach(() => {
    vi.mocked(shipmentsApi.changeShipmentStatus).mockReset();
  });

  it("writes the returned shipment straight into the staff-detail cache", async () => {
    const updated = makeStaffShipment({ trackingNumber: "TRK-DEMO-001", status: "DELIVERED" });
    vi.mocked(shipmentsApi.changeShipmentStatus).mockResolvedValue(updated);

    const wrapper = createQueryWrapper();
    const { result } = renderHook(
      () => ({ mutation: useChangeShipmentStatus("TRK-DEMO-001"), queryClient: useQueryClient() }),
      { wrapper },
    );

    act(() => {
      result.current.mutation.mutate({ status: "DELIVERED" });
    });

    await waitFor(() => expect(result.current.mutation.isSuccess).toBe(true));
    expect(shipmentsApi.changeShipmentStatus).toHaveBeenCalledWith("TRK-DEMO-001", { status: "DELIVERED" });
    expect(result.current.queryClient.getQueryData(queryKeys.shipments.staffDetail("TRK-DEMO-001"))).toEqual(updated);
  });
});

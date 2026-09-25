import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { AppDataProvider, useAppData } from "../AppDataProvider";
import type { Shipment } from "@/types";

const wrapper = ({ children }: { children: ReactNode }) => <AppDataProvider>{children}</AppDataProvider>;

const NEW_SHIPMENT = {
  originCity: "Bristol",
  originRegion: "United Kingdom",
  destinationCity: "York",
  destinationRegion: "United Kingdom",
  currentLocation: "Bristol, United Kingdom",
  estimatedDeliveryAt: "2026-10-01T18:00:00Z",
  serviceLevel: "Standard",
  packageCount: 1,
  referenceCode: "PO-99999",
  weightKg: 1,
  sender: { name: "Test Sender" },
  receiver: { name: "Test Receiver" },
};

describe("AppDataProvider (the frontend's data/service layer)", () => {
  it("looks up a seeded shipment by tracking number, and returns null for an unknown one", async () => {
    const { result } = renderHook(() => useAppData(), { wrapper });

    const found: Shipment | null = await act(() => result.current.lookupShipment("trk-demo-001"));
    expect(found?.trackingNumber).toBe("TRK-DEMO-001");

    const missing: Shipment | null = await act(() => result.current.lookupShipment("TRK-DOES-NOT-EXIST"));
    expect(missing).toBeNull();
  });

  it("rejects creating a shipment with a tracking number that already exists", async () => {
    const { result } = renderHook(() => useAppData(), { wrapper });

    const outcome = await act(() => result.current.createShipment({ ...NEW_SHIPMENT, trackingNumber: "TRK-DEMO-001" }));

    expect(outcome.success).toBe(false);
    expect(outcome.error).toMatch(/already exists/i);
  });

  it("creates a shipment with a fresh tracking number and seeds its first tracking event", async () => {
    const { result } = renderHook(() => useAppData(), { wrapper });

    const outcome = await act(() => result.current.createShipment({ ...NEW_SHIPMENT, trackingNumber: "TRK-TEST-001" }));

    expect(outcome.success).toBe(true);
    expect(outcome.shipment?.status).toBe("CREATED");
    expect(outcome.shipment?.events).toHaveLength(1);
  });
});

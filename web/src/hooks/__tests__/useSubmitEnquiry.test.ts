import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSubmitEnquiry } from "../useEnquiries";
import { enquiriesApi, ApiError } from "@/api";
import { createQueryWrapper } from "@/test/queryWrapper";

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api")>();
  return { ...actual, enquiriesApi: { createEnquiry: vi.fn() } };
});

describe("useSubmitEnquiry", () => {
  beforeEach(() => {
    vi.mocked(enquiriesApi.createEnquiry).mockReset();
  });

  it("submits and reports success", async () => {
    vi.mocked(enquiriesApi.createEnquiry).mockResolvedValue({
      id: "enq-1",
      trackingNumber: "TRK-DEMO-001",
      status: "OPEN",
      createdAt: "2026-09-21T10:15:00Z",
    });

    const { result } = renderHook(() => useSubmitEnquiry(), { wrapper: createQueryWrapper() });

    act(() => {
      result.current.mutate({ trackingNumber: "TRK-DEMO-001", category: "DELAY", message: "Where is it?" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(enquiriesApi.createEnquiry).mock.calls[0][0]).toEqual({
      trackingNumber: "TRK-DEMO-001",
      category: "DELAY",
      message: "Where is it?",
    });
  });

  it("reports a backend failure as an error state", async () => {
    vi.mocked(enquiriesApi.createEnquiry).mockRejectedValue(new ApiError("Rate limited", "RATE_LIMITED", 429));

    const { result } = renderHook(() => useSubmitEnquiry(), { wrapper: createQueryWrapper() });

    act(() => {
      result.current.mutate({ trackingNumber: "TRK-DEMO-001", category: "OTHER", message: "Hello" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
  });
});

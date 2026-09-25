import { describe, expect, it, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { StaffAuthProvider, useStaffAuth } from "../StaffAuthProvider";

const wrapper = ({ children }: { children: ReactNode }) => <StaffAuthProvider>{children}</StaffAuthProvider>;

describe("StaffAuthProvider", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("rejects an unauthenticated / incorrect login attempt", async () => {
    const { result } = renderHook(() => useStaffAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("ready"));

    let outcome!: Awaited<ReturnType<typeof result.current.login>>;
    await act(async () => {
      outcome = await result.current.login("staff@shiptrack.com", "wrong-password");
    });

    expect(outcome.success).toBe(false);
    expect(result.current.email).toBeNull();
  });

  it("accepts the seeded demo credentials and clears the session on logout", async () => {
    const { result } = renderHook(() => useStaffAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("ready"));

    let outcome!: Awaited<ReturnType<typeof result.current.login>>;
    await act(async () => {
      outcome = await result.current.login("staff@shiptrack.com", "demo1234");
    });

    expect(outcome.success).toBe(true);
    expect(result.current.email).toBe("staff@shiptrack.com");

    act(() => {
      result.current.logout();
    });

    expect(result.current.email).toBeNull();
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { StaffAuthProvider, useStaffAuth } from "../StaffAuthProvider";
import { ApiError, authApi } from "@/api";
import { createQueryWrapper } from "@/test/queryWrapper";

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api")>();
  return {
    ...actual,
    authApi: {
      getSession: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    },
  };
});

function createWrapper() {
  const QueryWrapper = createQueryWrapper();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryWrapper>
        <StaffAuthProvider>{children}</StaffAuthProvider>
      </QueryWrapper>
    );
  };
}

describe("StaffAuthProvider", () => {
  beforeEach(() => {
    vi.mocked(authApi.getSession).mockReset();
    vi.mocked(authApi.login).mockReset();
    vi.mocked(authApi.logout).mockReset();
    vi.mocked(authApi.getSession).mockRejectedValue(new ApiError("Authentication is required.", "UNAUTHENTICATED", 401));
  });

  it("rejects an unauthenticated / incorrect login attempt", async () => {
    vi.mocked(authApi.login).mockRejectedValue(new ApiError("Incorrect email or password.", "INVALID_CREDENTIALS", 401));

    const { result } = renderHook(() => useStaffAuth(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.sessionReason).toBe("missing");

    let outcome!: Awaited<ReturnType<typeof result.current.login>>;
    await act(async () => {
      outcome = await result.current.login("staff@shiptrack.com", "wrong-password");
    });

    expect(outcome).toEqual({ success: false, error: "Incorrect email or password." });
    expect(result.current.email).toBeNull();
  });

  it("surfaces an expired session distinctly from a missing one", async () => {
    vi.mocked(authApi.getSession).mockRejectedValue(
      new ApiError("Your session has expired. Please sign in again.", "SESSION_EXPIRED", 401),
    );

    const { result } = renderHook(() => useStaffAuth(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.status).toBe("ready"));

    expect(result.current.sessionReason).toBe("expired");
    expect(result.current.email).toBeNull();
  });

  it("accepts a successful login and clears the session on logout", async () => {
    vi.mocked(authApi.login).mockResolvedValue({ id: "staff-1", email: "staff@shiptrack.com", name: "John Charles" });
    vi.mocked(authApi.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useStaffAuth(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.status).toBe("ready"));

    // After a real login, the re-fetched `/auth/me` succeeds — reflect that here since
    // `getSession` is mocked independently of `login`.
    vi.mocked(authApi.getSession).mockResolvedValue({
      id: "staff-1",
      email: "staff@shiptrack.com",
      name: "John Charles",
    });

    let outcome!: Awaited<ReturnType<typeof result.current.login>>;
    await act(async () => {
      outcome = await result.current.login("staff@shiptrack.com", "demo1234");
    });

    expect(outcome).toEqual({ success: true });
    await waitFor(() => expect(result.current.email).toBe("staff@shiptrack.com"));
    expect(result.current.name).toBe("John Charles");

    vi.mocked(authApi.getSession).mockRejectedValue(new ApiError("Authentication is required.", "UNAUTHENTICATED", 401));

    act(() => {
      result.current.logout();
    });

    await waitFor(() => expect(result.current.email).toBeNull());
  });
});

"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { ApiError } from "@/api";
import { useSession } from "@/hooks/useSession";
import { useLogin } from "@/hooks/useLogin";
import { useLogout } from "@/hooks/useLogout";

export type LoginResult = { success: true } | { success: false; error: string };

interface StaffAuthContextValue {
  /** "checking" until the initial `GET /api/auth/me` has settled — avoids flashing protected content. */
  status: "checking" | "ready";
  email: string | null;
  name: string | null;
  /** Why the current visitor isn't signed in — lets the login page explain itself. */
  sessionReason: "expired" | "missing" | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const StaffAuthContext = createContext<StaffAuthContextValue | null>(null);

/** Wraps the real `/api/auth/*` session cookie in the same shape the app already
 * consumed when this was a sessionStorage mock — no consumer had to change. */
export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const status: "checking" | "ready" = session.isLoading ? "checking" : "ready";
  const email = session.data?.email ?? null;
  const name = session.data?.name ?? null;

  const sessionReason: "expired" | "missing" | null =
    session.isError && session.error instanceof ApiError
      ? session.error.code === "SESSION_EXPIRED"
        ? "expired"
        : "missing"
      : null;

  const login = useCallback(
    async (loginEmail: string, password: string): Promise<LoginResult> => {
      try {
        await loginMutation.mutateAsync({ email: loginEmail, password });
        return { success: true };
      } catch (error) {
        const message = error instanceof ApiError ? error.message : "Incorrect email or password.";
        return { success: false, error: message };
      }
    },
    [loginMutation],
  );

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const value = useMemo<StaffAuthContextValue>(
    () => ({ status, email, name, sessionReason, login, logout }),
    [status, email, name, sessionReason, login, logout],
  );

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
}

export function useStaffAuth(): StaffAuthContextValue {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error("useStaffAuth must be used within a StaffAuthProvider");
  return ctx;
}

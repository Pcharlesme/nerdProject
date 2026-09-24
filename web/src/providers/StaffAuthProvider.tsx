"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { delay } from "@/constant/mockData";

const SESSION_KEY = "shiptrack.staff.session";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

const DEMO_EMAIL = "staff@shiptrack.com";
const DEMO_PASSWORD = "demo1234";

interface StaffSession {
  email: string;
  expiresAt: number;
}

type SessionCheck = { state: "valid"; email: string } | { state: "expired" } | { state: "missing" };

/** Reading (and, for an expired entry, clearing) the session is only ever meaningful client-side. */
function checkSession(): SessionCheck {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { state: "missing" };
    const session: StaffSession = JSON.parse(raw);
    if (session.expiresAt < Date.now()) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return { state: "expired" };
    }
    return { state: "valid", email: session.email };
  } catch {
    return { state: "missing" };
  }
}

export type LoginResult = { success: true } | { success: false; error: string };

interface StaffAuthContextValue {
  /** "checking" until the client has read sessionStorage once — avoids flashing protected content. */
  status: "checking" | "ready";
  email: string | null;
  /** Why the current visitor isn't signed in — lets the login page explain itself. */
  sessionReason: "expired" | "missing" | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const StaffAuthContext = createContext<StaffAuthContextValue | null>(null);

/** Simulated staff auth — no backend, so "session" is a TTL-stamped flag in sessionStorage. */
export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "ready">("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [sessionReason, setSessionReason] = useState<"expired" | "missing" | null>(null);

  // sessionStorage doesn't exist during SSR, so this can only run after mount —
  // reading it during render would make the server/client output disagree. This is
  // exactly the "sync with an external system on mount" case effects are for, not
  // the derived-state anti-pattern the lint rule usually catches.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const result = checkSession();
    if (result.state === "valid") {
      setEmail(result.email);
    } else {
      setSessionReason(result.state);
    }
    setStatus("ready");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const login = useCallback(async (inputEmail: string, password: string): Promise<LoginResult> => {
    await delay(600);

    if (inputEmail.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return { success: false, error: "Incorrect email or password." };
    }

    const session: StaffSession = { email: DEMO_EMAIL, expiresAt: Date.now() + SESSION_TTL_MS };
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setEmail(DEMO_EMAIL);
    setSessionReason(null);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setEmail(null);
    setSessionReason("missing");
  }, []);

  return (
    <StaffAuthContext.Provider value={{ status, email, sessionReason, login, logout }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth(): StaffAuthContextValue {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error("useStaffAuth must be used within a StaffAuthProvider");
  return ctx;
}

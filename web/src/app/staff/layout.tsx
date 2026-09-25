"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { StaffAuthProvider, useStaffAuth } from "@/providers/StaffAuthProvider";
import { StaffSidebar } from "@/components/staff/StaffSidebar";

const LOGIN_PATH = "/staff";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { status, email, sessionReason } = useStaffAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === LOGIN_PATH;

  useEffect(() => {
    if (status !== "ready" || isLoginPage || email) return;
    const reason = sessionReason === "expired" ? "expired" : "required";
    router.replace(`${LOGIN_PATH}?reason=${reason}`);
  }, [status, email, sessionReason, isLoginPage, router]);

  // The login page renders itself, with no staff chrome — it's the one page a
  // logged-out visitor is meant to see.
  if (isLoginPage) {
    return children;
  }

  // Never flash a protected page's content before we've confirmed there's a session.
  if (status === "checking" || !email) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted motion-reduce:animate-none" aria-label="Checking session" />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <StaffSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffAuthProvider>
      <RouteGuard>{children}</RouteGuard>
    </StaffAuthProvider>
  );
}

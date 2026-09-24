"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useStaffAuth } from "@/providers/StaffAuthProvider";

const NAV_LINKS = [
  { href: "/staff/dashboard", label: "Dashboard" },
  { href: "/staff/shipments", label: "Shipments" },
  { href: "/staff/enquiries", label: "Enquiries" },
];

export function StaffTopBar() {
  const { email, logout } = useStaffAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/staff");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/staff/dashboard" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-on-primary">
              S
            </span>
            <span className="text-sm font-semibold text-text">ShipTrack Staff</span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted sm:inline">{email}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-text transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-primary"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </button>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-5 py-2 sm:hidden">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-text"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

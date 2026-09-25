"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  ChartColumnBig,
  CheckCircle2,
  ArrowRight,
  Inbox,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  X,
  type LucideIcon,
} from "lucide-react";
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { useAppData } from "@/providers/AppDataProvider";
import { Logo, Wordmark } from "@/components/ui/Logo";

const NAV_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/staff/shipments", label: "Orders", icon: Package },
  { href: "/staff/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/staff/analytics", label: "Analytics", icon: ChartColumnBig },
];

const DASHBOARD_LINK = { href: "/staff/dashboard", label: "Dashboard", icon: LayoutGrid };

export function StaffSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { email, logout } = useStaffAuth();
  const { shipments, enquiries } = useAppData();
  const [mobileOpen, setMobileOpen] = useState(false);

  const openEnquiries = enquiries.filter((e) => e.status === "OPEN").length;
  const exceptions = shipments.filter((s) => s.status === "EXCEPTION").length;

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    logout();
    router.push("/staff");
  };

  return (
    <>
      {/* Mobile top bar — the sidebar collapses into this + a slide-down panel below `lg` */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <Link href="/staff/dashboard" className="flex items-center gap-2">
          <Logo />
          <Wordmark />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="flex size-9 items-center justify-center rounded-md border border-border text-text"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {mobileOpen && (
        <div className="border-b border-border bg-surface px-4 pb-4 lg:hidden">
          <SidebarNav
            isActive={isActive}
            badges={{ "/staff/enquiries": openEnquiries }}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-surface p-5 lg:flex">
        <Link href="/staff/dashboard" className="flex items-center gap-2 px-1">
          <Logo />
          <Wordmark />
        </Link>

        <div className="flex items-center gap-3 rounded-2xl border border-border p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            SA
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text">Staff</p>
            <p className="text-xs text-muted">Admin</p>
          </div>
          <Link
            href="/staff/enquiries"
            aria-label={`Notifications${openEnquiries > 0 ? ` — ${openEnquiries} open enquiries` : ""}`}
            className="relative flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-text"
          >
            <Bell className="size-4" aria-hidden="true" />
            {openEnquiries > 0 && (
              <span className="absolute right-1 top-1 size-2 rounded-full bg-danger" aria-hidden="true" />
            )}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-text"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>

        <SidebarNav isActive={isActive} badges={{ "/staff/enquiries": openEnquiries }} />

        <div className="mt-auto">
          <ExceptionsCard count={exceptions} />
        </div>

        <p className="truncate px-1 text-xs text-muted">{email}</p>
      </aside>
    </>
  );
}

function SidebarNav({
  isActive,
  badges = {},
  onNavigate,
}: {
  isActive: (href: string) => boolean;
  badges?: Record<string, number>;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-3">
      <Link
        href={DASHBOARD_LINK.href}
        onClick={onNavigate}
        className={`flex items-center gap-3 rounded-2xl px-4 py-8 text-sm font-semibold transition-colors ${
          isActive(DASHBOARD_LINK.href)
            ? "bg-text text-white"
            : "border border-border text-text hover:bg-background"
        }`}
      >
        <DASHBOARD_LINK.icon className="size-5" aria-hidden="true" />
        {DASHBOARD_LINK.label}
      </Link>

      <div className="grid grid-cols-2 gap-3">
        {NAV_LINKS.map((link) => {
          const badge = badges[link.href] ?? 0;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "border-primary/30 bg-primary-soft text-primary"
                  : "border-border text-text hover:border-primary/30 hover:bg-background"
              }`}
            >
              {badge > 0 && (
                <span
                  className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white"
                  aria-hidden="true"
                >
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
              <link.icon className="size-5" aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function ExceptionsCard({ count }: { count: number }) {
  const clear = count === 0;

  return (
    <div className="rounded-2xl bg-primary-soft p-5 text-center">
      <span
        className={`mx-auto flex size-12 items-center justify-center rounded-full ${
          clear ? "bg-success-bg text-success" : "bg-white text-danger"
        }`}
      >
        {clear ? <CheckCircle2 className="size-6" aria-hidden="true" /> : <AlertTriangle className="size-6" aria-hidden="true" />}
      </span>

      <p className="mt-4 font-semibold text-text">
        {clear ? "All clear" : "Exceptions need attention"}
      </p>
      <p className="mt-1 text-sm text-muted">
        {clear
          ? "No shipment exceptions right now."
          : `${count} shipment${count === 1 ? "" : "s"} flagged with an issue.`}
      </p>

      <Link
        href={clear ? "/staff/shipments" : "/staff/shipments?status=EXCEPTION"}
        className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-text px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
      >
        {clear ? "View shipments" : "Review now"}
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

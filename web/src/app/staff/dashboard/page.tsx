"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Inbox, Package, Plus, Truck } from "lucide-react";
import { useAppData } from "@/providers/AppDataProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SummaryCard } from "@/components/staff/SummaryCard";
import { formatDateTime } from "@/lib/formatDate";

export default function StaffDashboardPage() {
  const { shipments, enquiries } = useAppData();

  const stats = {
    total: shipments.length,
    inTransit: shipments.filter((s) => s.status === "IN_TRANSIT").length,
    delivered: shipments.filter((s) => s.status === "DELIVERED").length,
    delayed: shipments.filter((s) => s.status === "DELAYED").length,
    exceptions: shipments.filter((s) => s.status === "EXCEPTION").length,
  };

  const openEnquiries = enquiries.filter((e) => e.status === "OPEN");

  const recentShipments = [...shipments]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-primary">Operations</p>
            <h1 className="mt-1 text-2xl font-semibold text-text sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-muted">What&apos;s happening with our shipments right now.</p>
          </div>

          <Link
            href="/staff/shipments/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create shipment
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <SummaryCard label="Total shipments" value={stats.total} icon={Package} href="/staff/shipments" />
          <SummaryCard
            label="In transit"
            value={stats.inTransit}
            icon={Truck}
            href="/staff/shipments?status=IN_TRANSIT"
          />
          <SummaryCard
            label="Delivered"
            value={stats.delivered}
            icon={CheckCircle2}
            tone="success"
            href="/staff/shipments?status=DELIVERED"
          />
          <SummaryCard
            label="Delayed"
            value={stats.delayed}
            icon={Clock}
            tone="warning"
            href="/staff/shipments?status=DELAYED"
          />
          <SummaryCard
            label="Exceptions"
            value={stats.exceptions}
            icon={AlertTriangle}
            tone="danger"
            href="/staff/shipments?status=EXCEPTION"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border border-border bg-surface lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-semibold text-text">Recent shipments</h2>
              <Link
                href="/staff/shipments"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
              >
                View all
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>

            <ul className="divide-y divide-border">
              {recentShipments.map((shipment) => (
                <li key={shipment.trackingNumber}>
                  <Link
                    href={`/staff/shipments/${shipment.trackingNumber}`}
                    className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-background"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-text">{shipment.trackingNumber}</p>
                      <p className="mt-0.5 truncate text-sm text-muted">
                        {shipment.originCity} → {shipment.destinationCity} · updated{" "}
                        {formatDateTime(shipment.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={shipment.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="font-semibold text-text">Customer enquiries</h2>
              <p className="mt-1 text-sm text-muted">
                {openEnquiries.length === 0
                  ? "Nothing waiting on you right now."
                  : `${openEnquiries.length} open ${openEnquiries.length === 1 ? "enquiry needs" : "enquiries need"} a response.`}
              </p>
            </div>

            <div className="p-5">
              {openEnquiries.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <Inbox className="size-8 text-muted" aria-hidden="true" />
                  <p className="mt-3 text-sm text-muted">All caught up.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {openEnquiries.slice(0, 3).map((enquiry) => (
                    <li key={enquiry.id} className="rounded-lg border border-border p-3">
                      <p className="font-mono text-xs text-muted">{enquiry.trackingNumber}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-text">{enquiry.message}</p>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href="/staff/enquiries"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
              >
                Open enquiries
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

"use client";

import { AlertCircle, BarChart3, CheckCircle2, Clock, Package, Truck } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { DeliveryPerformancePanel } from "@/components/staff/DeliveryPerformancePanel";

export default function StaffAnalyticsPage() {
  const { data: dashboard, isLoading, isError } = useDashboard();

  const total = dashboard?.totalShipments ?? 0;
  const inTransit = dashboard?.byStatus.IN_TRANSIT ?? 0;
  const delivered = dashboard?.byStatus.DELIVERED ?? 0;
  const delayed = dashboard?.byStatus.DELAYED ?? 0;
  const delayedOrException = delayed + (dashboard?.byStatus.EXCEPTION ?? 0);
  const onTimeRate = total === 0 ? 0 : Math.round(((total - delayedOrException) / total) * 100);

  return (
    <main className="min-h-screen">
      <div className="border-b border-border bg-surface px-5 py-6 lg:px-8">
        <p className="text-sm font-medium text-primary">Operations</p>
        <h1 className="mt-1 text-2xl font-semibold text-text sm:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-muted">A first look at fleet-wide performance — deeper reporting is next.</p>
      </div>

      <div className="px-5 py-6 lg:px-8">
        {isError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Couldn&apos;t load the fleet summary. The numbers below may be incomplete — try refreshing.
          </div>
        )}

        {isLoading ? (
          <div role="status" className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <span className="sr-only">Loading summary…</span>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-19 animate-pulse rounded-2xl border border-border bg-surface" aria-hidden="true" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile icon={Package} label="Total shipments" value={total} />
            <StatTile icon={Truck} label="In transit" value={inTransit} tone="primary" />
            <StatTile icon={CheckCircle2} label="Delivered" value={delivered} tone="success" />
            <StatTile icon={Clock} label="Delayed" value={delayed} tone="warning" />
            <StatTile icon={Clock} label="On-time rate" value={`${onTimeRate}%`} tone="warning" />
          </div>
        )}

        <div className="mt-6">
          <DeliveryPerformancePanel />
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-cta/10 text-cta">
            <BarChart3 className="size-6" aria-hidden="true" />
          </span>
          <p className="font-medium text-text">More analytics are coming soon</p>
          <p className="max-w-sm text-sm text-muted">
            Trend breakdowns by route, service level and staff response time will land here next.
          </p>
        </div>
      </div>
    </main>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: typeof Package;
  label: string;
  value: number | string;
  tone?: "neutral" | "primary" | "success" | "warning";
}) {
  const toneClasses = {
    neutral: "bg-cta/10 text-cta",
    primary: "bg-primary/10 text-primary",
    success: "bg-success-bg text-success",
    warning: "bg-warning-bg text-warning",
  }[tone];

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-5">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${toneClasses}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-1 text-xl font-semibold text-text">{value}</p>
      </div>
    </div>
  );
}

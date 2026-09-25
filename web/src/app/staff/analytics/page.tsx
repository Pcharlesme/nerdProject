"use client";

import { BarChart3, CheckCircle2, Clock, Package } from "lucide-react";
import { useAppData } from "@/providers/AppDataProvider";

export default function StaffAnalyticsPage() {
  const { shipments } = useAppData();

  const total = shipments.length;
  const delivered = shipments.filter((s) => s.status === "DELIVERED").length;
  const delayedOrException = shipments.filter((s) => s.status === "DELAYED" || s.status === "EXCEPTION").length;
  const onTimeRate = total === 0 ? 0 : Math.round(((total - delayedOrException) / total) * 100);

  return (
    <main className="min-h-screen">
      <div className="border-b border-border bg-surface px-5 py-6 lg:px-8">
        <p className="text-sm font-medium text-primary">Operations</p>
        <h1 className="mt-1 text-2xl font-semibold text-text sm:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-muted">A first look at fleet-wide performance — deeper reporting is next.</p>
      </div>

      <div className="px-5 py-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile icon={Package} label="Total shipments" value={total} />
          <StatTile icon={CheckCircle2} label="Delivered" value={delivered} tone="success" />
          <StatTile icon={Clock} label="On-time rate" value={`${onTimeRate}%`} tone="warning" />
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
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
  tone = "primary",
}: {
  icon: typeof Package;
  label: string;
  value: number | string;
  tone?: "primary" | "success" | "warning";
}) {
  const toneClasses = {
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

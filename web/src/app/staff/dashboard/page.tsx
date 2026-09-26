"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowUpDown, Check, Copy, Download, Package, Plus, Search } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useStaffShipments } from "@/hooks/useStaffShipments";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { DeliveryPerformancePanel } from "@/components/staff/DeliveryPerformancePanel";
import { STATUS_LABEL } from "@/lib/shipmentStatus";
import { formatDateShort, formatDateTime } from "@/lib/formatDate";
import { downloadCsv } from "@/lib/exportCsv";
import type { ShipmentSummary, ShipmentStatus } from "@/types";

type OrderFilter = "ALL" | ShipmentStatus;

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "COLLECTED", label: "Collected" },
  { key: "IN_TRANSIT", label: "In transit" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "DELAYED", label: "Delayed" },
  { key: "EXCEPTION", label: "Exception" },
];

const PAGE_SIZE = 10;

export default function StaffDashboardPage() {
  const router = useRouter();
  const { data: dashboard, isLoading: isDashboardLoading, isError: isDashboardError } = useDashboard();
  const dashboardUnknown = isDashboardLoading || isDashboardError;

  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("ALL");
  const [copiedTrackingNumber, setCopiedTrackingNumber] = useState<string | null>(null);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchValue), 300);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  const shipmentsQuery = useStaffShipments({
    search: debouncedSearch.trim() || undefined,
    status: activeFilter === "ALL" ? undefined : activeFilter,
    order: sortNewestFirst ? "desc" : "asc",
    page,
    limit: PAGE_SIZE,
  });

  const shipments = shipmentsQuery.data?.shipments ?? [];
  const meta = shipmentsQuery.data?.meta;

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = searchValue.trim();
    if (!value) return;
    router.push(`/staff/shipments/${value.toUpperCase()}`);
  };

  const handleExport = () => {
    downloadCsv(
      `shipments-${new Date().toISOString().slice(0, 10)}.csv`,
      shipments,
      [
        { header: "Tracking number", value: (s) => s.trackingNumber },
        { header: "Status", value: (s) => STATUS_LABEL[s.status] },
        { header: "Origin", value: (s) => `${s.originCity}, ${s.originRegion}` },
        { header: "Destination", value: (s) => `${s.destinationCity}, ${s.destinationRegion}` },
        { header: "Estimated delivery", value: (s) => s.estimatedDeliveryAt },
        { header: "Service level", value: (s) => s.serviceLevel },
        { header: "Reference", value: (s) => s.referenceCode },
        { header: "Last updated", value: (s) => s.updatedAt },
      ],
    );
  };

  const handleCopy = async (trackingNumber: string) => {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopiedTrackingNumber(trackingNumber);
      setTimeout(() => setCopiedTrackingNumber((id) => (id === trackingNumber ? null : id)), 1500);
    } catch {
      // Clipboard access can be denied by the browser — silently ignored, nothing to recover.
    }
  };

  return (
    <main className="min-h-screen">
      <div className="border-b border-border bg-surface px-5 py-4 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <label htmlFor="dashboard-search" className="sr-only">
              Search order
            </label>
            <input
              id="dashboard-search"
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setPage(1);
              }}
              placeholder="Search order..."
              className="h-11 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </form>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-text transition-colors hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Download className="size-4" aria-hidden="true" />
              Export
            </button>

            <Link
              href="/staff/shipments/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-cta px-4 text-sm font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Plus className="size-4" aria-hidden="true" />
              Create shipment
            </Link>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 lg:px-8">
        <DeliveryPerformancePanel />

        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-text">Orders</h2>
              <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-muted">
                {dashboardUnknown ? "…" : (dashboard?.totalShipments ?? 0)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((filter) => {
                const count = dashboardUnknown
                  ? "…"
                  : filter.key === "ALL"
                    ? (dashboard?.totalShipments ?? 0)
                    : (dashboard?.byStatus[filter.key] ?? 0);
                const active = activeFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => {
                      setActiveFilter(filter.key);
                      setPage(1);
                    }}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-cta bg-cta text-white"
                        : "border-border text-text hover:border-cta/30"
                    }`}
                  >
                    {filter.label}
                    <span
                      className={`flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs ${
                        active ? "bg-white/20 text-white" : "bg-background text-muted"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setSortNewestFirst((value) => !value);
                  setPage(1);
                }}
                aria-label={sortNewestFirst ? "Sorted newest first — click for oldest first" : "Sorted oldest first — click for newest first"}
                title={sortNewestFirst ? "Newest first" : "Oldest first"}
                className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors ${
                  sortNewestFirst ? "border-border text-muted hover:border-cta/30 hover:text-cta" : "border-cta bg-cta text-white"
                }`}
              >
                <ArrowUpDown className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {shipmentsQuery.isError ? (
            <div className="flex items-start gap-2 px-5 py-12 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Couldn&apos;t load orders. Please try again.
            </div>
          ) : shipmentsQuery.isLoading ? (
            <TableSkeleton />
          ) : shipments.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Package className="mx-auto size-8 text-muted" aria-hidden="true" />
              <p className="mt-3 font-medium text-text">No orders in this view</p>
              <p className="mt-1 text-sm text-muted">Try a different filter.</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-xs font-semibold text-muted">
                      <th className="px-5 py-4">Tracking number</th>
                      <th className="px-5 py-4">Route</th>
                      <th className="px-5 py-4">Service</th>
                      <th className="px-5 py-4">Est. delivery</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Last updated</th>
                      <th className="px-5 py-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((shipment) => (
                      <OrderRow
                        key={shipment.trackingNumber}
                        shipment={shipment}
                        copied={copiedTrackingNumber === shipment.trackingNumber}
                        onCopy={handleCopy}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-border lg:hidden">
                {shipments.map((shipment) => (
                  <OrderCard
                    key={shipment.trackingNumber}
                    shipment={shipment}
                    copied={copiedTrackingNumber === shipment.trackingNumber}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            </>
          )}

          {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />}
        </section>
      </div>
    </main>
  );
}

function TableSkeleton() {
  return (
    <div role="status" className="space-y-4 p-5">
      <span className="sr-only">Loading orders…</span>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-lg bg-background" aria-hidden="true" />
      ))}
    </div>
  );
}

function OrderRow({
  shipment,
  copied,
  onCopy,
}: {
  shipment: ShipmentSummary;
  copied: boolean;
  onCopy: (trackingNumber: string) => void;
}) {
  return (
    <tr className="border-b border-border text-sm transition-colors last:border-0 hover:bg-primary-soft">
      <td className="px-5 py-5">
        <Link href={`/staff/shipments/${shipment.trackingNumber}`} className="font-semibold text-text hover:underline">
          {shipment.trackingNumber}
        </Link>
        <p className="mt-1 text-xs text-muted">{shipment.referenceCode}</p>
      </td>
      <td className="px-5 py-5 text-muted">
        {shipment.originCity} → {shipment.destinationCity}
      </td>
      <td className="px-5 py-5 text-muted">{shipment.serviceLevel}</td>
      <td className="px-5 py-5 text-muted">{formatDateShort(shipment.estimatedDeliveryAt)}</td>
      <td className="px-5 py-5">
        <StatusBadge status={shipment.status} />
      </td>
      <td className="px-5 py-5 text-muted">{formatDateTime(shipment.updatedAt)}</td>
      <td className="px-5 py-5">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/staff/shipments/${shipment.trackingNumber}`}
            className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-cta/40 hover:text-cta"
          >
            See more
          </Link>
          <button
            type="button"
            onClick={() => onCopy(shipment.trackingNumber)}
            aria-label={`Copy tracking number ${shipment.trackingNumber}`}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-primary-soft hover:text-text"
          >
            {copied ? <Check className="size-4 text-success" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </td>
    </tr>
  );
}

function OrderCard({
  shipment,
  copied,
  onCopy,
}: {
  shipment: ShipmentSummary;
  copied: boolean;
  onCopy: (trackingNumber: string) => void;
}) {
  return (
    <div className="space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/staff/shipments/${shipment.trackingNumber}`} className="font-semibold text-text hover:underline">
            {shipment.trackingNumber}
          </Link>
          <p className="mt-0.5 text-xs text-muted">{shipment.referenceCode}</p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <p className="text-sm text-muted">
        {shipment.originCity} → {shipment.destinationCity}
      </p>
      <p className="text-sm text-muted">
        {shipment.serviceLevel} · Est. {formatDateShort(shipment.estimatedDeliveryAt)}
      </p>
      <p className="text-xs text-muted">Last updated {formatDateTime(shipment.updatedAt)}</p>

      <div className="flex items-center gap-2 pt-1">
        <Link
          href={`/staff/shipments/${shipment.trackingNumber}`}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:border-cta/40 hover:text-cta"
        >
          See more
        </Link>
        <button
          type="button"
          onClick={() => onCopy(shipment.trackingNumber)}
          aria-label={`Copy tracking number ${shipment.trackingNumber}`}
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-text"
        >
          {copied ? <Check className="size-4 text-success" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

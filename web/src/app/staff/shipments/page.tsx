"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ChevronDown, Loader2, Package, Plus, Search, X } from "lucide-react";
import { useStaffShipments } from "@/hooks/useStaffShipments";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { STATUS_OPTIONS } from "@/lib/shipmentStatus";
import { formatDateShort } from "@/lib/formatDate";
import type { ShipmentStatus, ShipmentSummary } from "@/types";

type StatusFilter = ShipmentStatus | "ALL";

const PAGE_SIZE = 20;

function isStatusFilter(value: string | null): value is StatusFilter {
  return value === "ALL" || STATUS_OPTIONS.some((option) => option.value === value);
}

function ShipmentsPageContent() {
  const initialStatus = useSearchParams().get("status");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>(isStatusFilter(initialStatus) ? initialStatus : "ALL");
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);

  // A short debounce gives search a real, demonstrable loading state instead of
  // instantly re-querying on every keystroke — synchronizing with a timer is a
  // legitimate effect, not the derived-state anti-pattern this lint rule targets.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setIsSearching(true);
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setIsSearching(false);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const shipmentsQuery = useStaffShipments({
    search: debouncedSearch.trim() || undefined,
    status: status === "ALL" ? undefined : status,
    page,
    limit: PAGE_SIZE,
  });

  const shipments = shipmentsQuery.data?.shipments ?? [];
  const meta = shipmentsQuery.data?.meta;

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-primary">Operations</p>
            <h1 className="mt-1 text-2xl font-semibold text-text sm:text-3xl">Shipments</h1>
            <p className="mt-1 text-sm text-muted">Find and manage shipment records and delivery updates.</p>
          </div>

          <Link
            href="/staff/shipments/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cta px-4 text-sm font-medium text-on-primary transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create shipment
          </Link>
        </div>

        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row">
            <div className="relative flex-1">
              {isSearching ? (
                <Loader2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              )}

              <label htmlFor="shipment-search" className="sr-only">
                Search by tracking number or reference
              </label>

              <input
                id="shipment-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tracking number or reference..."
                className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-9 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-border/60 hover:text-text"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="relative">
              <label htmlFor="status-filter" className="sr-only">
                Filter by status
              </label>

              <select
                id="status-filter"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as StatusFilter);
                  setPage(1);
                }}
                className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-border bg-surface px-4 pr-10 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 lg:w-48"
              >
                <option value="ALL">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            </div>
          </div>

          {shipmentsQuery.isError ? (
            <div className="flex items-start gap-2 px-5 py-12 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Couldn&apos;t load shipments. Please try again.
            </div>
          ) : shipmentsQuery.isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left">
                  <thead className="bg-background">
                    <tr className="border-b border-border text-xs font-semibold text-muted">
                      <th className="px-5 py-4">Tracking number</th>
                      <th className="px-5 py-4">Sender</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Route</th>
                      <th className="px-5 py-4">ETA</th>
                      <th className="px-5 py-4">Last update</th>
                      <th className="px-5 py-4" />
                    </tr>
                  </thead>

                  <tbody>
                    {shipments.map((shipment) => (
                      <ShipmentRow key={shipment.trackingNumber} shipment={shipment} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-border lg:hidden">
                {shipments.map((shipment) => (
                  <ShipmentCard key={shipment.trackingNumber} shipment={shipment} />
                ))}
              </div>

              {shipments.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <Package className="mx-auto size-8 text-muted" aria-hidden="true" />
                  <p className="mt-3 font-medium text-text">No shipments found</p>
                  <p className="mt-1 text-sm text-muted">Try another tracking number or status.</p>
                </div>
              )}
            </>
          )}

          {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />}
        </section>
      </section>
    </main>
  );
}

function TableSkeleton() {
  return (
    <div role="status" className="space-y-4 p-5">
      <span className="sr-only">Loading shipments…</span>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-lg bg-background" aria-hidden="true" />
      ))}
    </div>
  );
}

function ShipmentRow({ shipment }: { shipment: ShipmentSummary }) {
  return (
    <tr className="border-b border-border text-sm transition-colors last:border-0 hover:bg-background">
      <td className="px-5 py-5">
        <Link href={`/staff/shipments/${shipment.trackingNumber}`} className="font-semibold text-text hover:underline">
          {shipment.trackingNumber}
        </Link>
        <p className="mt-1 text-xs text-muted">{shipment.referenceCode}</p>
      </td>
      <td className="px-5 py-5 text-muted">{shipment.senderName}</td>
      <td className="px-5 py-5">
        <StatusBadge status={shipment.status} />
      </td>
      <td className="px-5 py-5 text-muted">
        {shipment.originCity} → {shipment.destinationCity}
      </td>
      <td className="px-5 py-5 text-muted">{formatDateShort(shipment.estimatedDeliveryAt)}</td>
      <td className="px-5 py-5 text-muted">{formatDateShort(shipment.updatedAt)}</td>
      <td className="px-5 py-5">
        <Link
          href={`/staff/shipments/${shipment.trackingNumber}`}
          className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-xs font-semibold text-cta transition-colors hover:border-cta/40 hover:bg-cta-soft"
        >
          View
        </Link>
      </td>
    </tr>
  );
}

function ShipmentCard({ shipment }: { shipment: ShipmentSummary }) {
  return (
    <div className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-text">{shipment.trackingNumber}</p>
          <p className="mt-1 text-xs text-muted">
            {shipment.senderName} · {shipment.referenceCode}
          </p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <Info label="Route">
          {shipment.originCity} → {shipment.destinationCity}
        </Info>
        <Info label="ETA">{formatDateShort(shipment.estimatedDeliveryAt)}</Info>
        <Info label="Last update">{formatDateShort(shipment.updatedAt)}</Info>
      </div>

      <Link
        href={`/staff/shipments/${shipment.trackingNumber}`}
        className="block w-full rounded-lg border border-border py-2.5 text-center text-sm font-medium text-cta transition-colors hover:border-cta/40 hover:bg-cta-soft"
      >
        View shipment
      </Link>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-medium text-text">{children}</p>
    </div>
  );
}

export default function StaffShipmentsPage() {
  return (
    <Suspense fallback={null}>
      <ShipmentsPageContent />
    </Suspense>
  );
}

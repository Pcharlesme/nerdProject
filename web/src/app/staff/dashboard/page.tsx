"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  Calendar,
  Check,
  Copy,
  Download,
  Maximize2,
  Package,
  Plus,
  Search,
} from "lucide-react";
import { useAppData } from "@/providers/AppDataProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DeliveryPerformanceChart } from "@/components/staff/DeliveryPerformanceChart";
import { STATUS_LABEL } from "@/lib/shipmentStatus";
import { formatDateShort } from "@/lib/formatDate";
import { downloadCsv } from "@/lib/exportCsv";
import type { Shipment, ShipmentStatus } from "@/types";

type OrderFilter = "ALL" | ShipmentStatus;

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "IN_TRANSIT", label: "In transit" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "DELAYED", label: "Delayed" },
  { key: "EXCEPTION", label: "Exception" },
];

export default function StaffDashboardPage() {
  const { shipments } = useAppData();
  const router = useRouter();

  const [searchValue, setSearchValue] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("ALL");
  const [copiedTrackingNumber, setCopiedTrackingNumber] = useState<string | null>(null);

  const filteredShipments = [...shipments]
    .filter((s) => activeFilter === "ALL" || s.status === activeFilter)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = searchValue.trim();
    if (!value) return;

    const match = shipments.find((s) => s.trackingNumber.toUpperCase() === value.toUpperCase());
    if (match) {
      setSearchError(null);
      router.push(`/staff/shipments/${match.trackingNumber}`);
    } else {
      setSearchError(`No shipment found for "${value}".`);
    }
  };

  const handleExport = () => {
    downloadCsv(
      `shipments-${new Date().toISOString().slice(0, 10)}.csv`,
      filteredShipments,
      [
        { header: "Tracking number", value: (s) => s.trackingNumber },
        { header: "Status", value: (s) => STATUS_LABEL[s.status] },
        { header: "Origin", value: (s) => `${s.originCity}, ${s.originRegion}` },
        { header: "Destination", value: (s) => `${s.destinationCity}, ${s.destinationRegion}` },
        { header: "Estimated delivery", value: (s) => s.estimatedDeliveryAt },
        { header: "Service level", value: (s) => s.serviceLevel },
        { header: "Reference", value: (s) => s.referenceCode },
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
                if (searchError) setSearchError(null);
              }}
              placeholder="Search order..."
              className="h-11 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </form>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-text transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Download className="size-4" aria-hidden="true" />
              Export
            </button>

            <Link
              href="/staff/shipments/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-text px-4 text-sm font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Plus className="size-4" aria-hidden="true" />
              Create shipment
            </Link>
          </div>
        </div>

        {searchError && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {searchError}
          </p>
        )}
      </div>

      <div className="px-5 py-6 lg:px-8">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text">Delivery performance</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Change date range"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary/30 hover:text-text"
              >
                <Calendar className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Expand chart"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary/30 hover:text-text"
              >
                <Maximize2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <DeliveryPerformanceChart />
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-text">Orders</h2>
              <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-muted">
                {shipments.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((filter) => {
                const count =
                  filter.key === "ALL" ? shipments.length : shipments.filter((s) => s.status === filter.key).length;
                const active = activeFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-text bg-text text-white"
                        : "border-border text-text hover:border-primary/30"
                    }`}
                  >
                    {filter.label}
                    <span className={active ? "text-white/70" : "text-muted"}>{count}</span>
                  </button>
                );
              })}
              <button
                type="button"
                aria-label="Sort orders"
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary/30 hover:text-text"
              >
                <ArrowUpDown className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {filteredShipments.length === 0 ? (
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
                      <th className="px-5 py-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.map((shipment) => (
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
                {filteredShipments.map((shipment) => (
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
        </section>
      </div>
    </main>
  );
}

function OrderRow({
  shipment,
  copied,
  onCopy,
}: {
  shipment: Shipment;
  copied: boolean;
  onCopy: (trackingNumber: string) => void;
}) {
  return (
    <tr className="border-b border-border text-sm transition-colors last:border-0 hover:bg-background">
      <td className="px-5 py-5">
        <Link href={`/staff/shipments/${shipment.trackingNumber}`} className="font-semibold text-text hover:text-primary">
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
      <td className="px-5 py-5">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/staff/shipments/${shipment.trackingNumber}`}
            className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-primary/40 hover:text-primary"
          >
            See more
          </Link>
          <button
            type="button"
            onClick={() => onCopy(shipment.trackingNumber)}
            aria-label={`Copy tracking number ${shipment.trackingNumber}`}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-text"
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
  shipment: Shipment;
  copied: boolean;
  onCopy: (trackingNumber: string) => void;
}) {
  return (
    <div className="space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/staff/shipments/${shipment.trackingNumber}`} className="font-semibold text-text hover:text-primary">
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

      <div className="flex items-center gap-2 pt-1">
        <Link
          href={`/staff/shipments/${shipment.trackingNumber}`}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:border-primary/40 hover:text-primary"
        >
          See more
        </Link>
        <button
          type="button"
          onClick={() => onCopy(shipment.trackingNumber)}
          aria-label={`Copy tracking number ${shipment.trackingNumber}`}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-text"
        >
          {copied ? <Check className="size-4 text-success" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

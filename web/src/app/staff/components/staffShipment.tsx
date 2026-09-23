"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  ChevronDown,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Truck,
} from "lucide-react";
import { Shipment } from "@/types";
import Link from "next/link";

interface StaffShipmentsProps {
  shipments: Shipment[];
}

export default function StaffShipments({ shipments }: StaffShipmentsProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const matchesSearch = shipment.trackingNumber
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus = status === "ALL" || shipment.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [shipments, search, status]);

  const stats = {
    total: shipments.length,
    delivered: shipments.filter((s) => s.status === "DELIVERED").length,
    inTransit: shipments.filter((s) => s.status === "IN_TRANSIT").length,
    delayed: shipments.filter((s) => s.status === "DELAYED").length,
    exceptions: shipments.filter((s) => s.status === "EXCEPTION").length,
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-primary">Operations</p>

            <h1 className="mt-1 text-2xl font-semibold text-text sm:text-3xl">
              Shipments
            </h1>

            <p className="mt-1 text-sm text-muted">
              Find and manage shipment records and delivery updates.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus className="size-4" />
            Create shipment
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <SummaryCard
            label="Total"
            value={stats.total}
            icon={<Package className="size-5" />}
          />

          <SummaryCard
            label="In transit"
            value={stats.inTransit}
            icon={<Truck className="size-5" />}
          />

          <SummaryCard
            label="Delivered"
            value={stats.delivered}
            tone="success"
          />

          <SummaryCard label="Delayed" value={stats.delayed} tone="warning" />

          <SummaryCard
            label="Exceptions"
            value={stats.exceptions}
            tone="danger"
          />
        </div>

        {/* Shipment list */}
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />

              <label htmlFor="shipment-search" className="sr-only">
                Search by tracking number
              </label>

              <input
                id="shipment-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tracking number..."
                className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="relative">
              <label htmlFor="status-filter" className="sr-only">
                Filter by status
              </label>

              <select
                id="status-filter"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-border bg-surface px-4 pr-10 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 lg:w-44"
              >
                <option value="ALL">All statuses</option>
                <option value="CREATED">Created</option>
                <option value="COLLECTED">Collected</option>
                <option value="IN_TRANSIT">In transit</option>
                <option value="OUT_FOR_DELIVERY">Out for delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="DELAYED">Delayed</option>
                <option value="EXCEPTION">Exception</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left">
              <thead className="bg-background">
                <tr className="border-b border-border text-xs font-semibold text-muted">
                  <th className="px-5 py-4">Tracking number</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Route</th>
                  <th className="px-5 py-4">Current location</th>
                  <th className="px-5 py-4">ETA</th>
                  <th className="px-5 py-4">Last update</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>

              <tbody>
                {filteredShipments.map((shipment) => (
                  <ShipmentRow
                    key={shipment.trackingNumber}
                    shipment={shipment}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-border lg:hidden">
            {filteredShipments.map((shipment) => (
              <ShipmentCard key={shipment.trackingNumber} shipment={shipment} />
            ))}
          </div>

          {filteredShipments.length === 0 && (
            <div className="px-5 py-12 text-center">
              <Package className="mx-auto size-8 text-muted" />
              <p className="mt-3 font-medium text-text">No shipments found</p>
              <p className="mt-1 text-sm text-muted">
                Try another tracking number or status.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function ShipmentRow({ shipment }: { shipment: Shipment }) {
  const latestEvent = shipment.events.at(-1);

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-border text-sm last:border-0"
    >
      <td className="px-5 py-5 font-semibold text-text">
        {shipment.trackingNumber}
        <p className="mt-1 text-xs font-normal text-muted">
          {shipment.referenceCode}
        </p>
      </td>

      <td className="px-5 py-5">
        <StatusBadge status={shipment.status} />
      </td>

      <td className="px-5 py-5 text-muted">
        {shipment.originCity} → {shipment.destinationCity}
      </td>

      <td className="px-5 py-5 text-muted">{shipment.currentLocation}</td>

      <td className="px-5 py-5 text-muted">
        {formatDate(shipment.estimatedDeliveryAt)}
      </td>

      <td className="px-5 py-5 text-muted">
        {latestEvent ? formatDate(latestEvent.occurredAt) : "No update"}
      </td>

      <td className="px-5 py-5">
        <Link
          href={`/staff/home/shipments/${shipment.trackingNumber}`}
          className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-background"
        >
          View
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-background focus-visible:outline-2 focus-visible:outline-primary"
        >
          Update
          <MoreHorizontal className="size-4" />
        </button>
      </td>
    </motion.tr>
  );
}

function ShipmentCard({ shipment }: { shipment: Shipment }) {
  return (
    <div className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-text">{shipment.trackingNumber}</p>
          <p className="mt-1 text-xs text-muted">{shipment.referenceCode}</p>
        </div>

        <StatusBadge status={shipment.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <Info label="Route">
          {shipment.originCity} → {shipment.destinationCity}
        </Info>

        <Info label="Current location">{shipment.currentLocation}</Info>

        <Info label="ETA">{formatDate(shipment.estimatedDeliveryAt)}</Info>

        <Info label="Last update">
          {shipment.events.at(-1)
            ? formatDate(shipment.events.at(-1)!.occurredAt)
            : "No update"}
        </Info>
      </div>

      <button
        type="button"
        className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-primary"
      >
        View shipment
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DELIVERED: "bg-success-bg text-success",
    IN_TRANSIT: "bg-blue-50 text-blue-700",
    COLLECTED: "bg-blue-50 text-blue-700",
    OUT_FOR_DELIVERY: "bg-indigo-50 text-indigo-700",
    CREATED: "bg-slate-100 text-slate-700",
    DELAYED: "bg-warning-bg text-warning",
    EXCEPTION: "bg-danger-bg text-danger",
  };

  const label = status.replaceAll("_", " ");

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {label.toLowerCase()}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone = "primary",
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  const styles = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success-bg text-success",
    warning: "bg-warning-bg text-warning",
    danger: "bg-danger-bg text-danger",
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 items-center justify-center rounded-full ${styles[tone]}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs text-muted">{label}</p>
          <p className="mt-1 text-xl font-semibold text-text">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-medium text-text">{children}</p>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

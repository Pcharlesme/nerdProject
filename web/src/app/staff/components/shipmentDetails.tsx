"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { useParams } from "next/navigation";
import { SHIPMENTS } from "@/constant/mockData";

const statuses = [
  "CREATED",
  "COLLECTED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "DELAYED",
  "EXCEPTION",
];

export default function ShipmentDetailsPage() {
  const params = useParams();
  const trackingNumber = params.trackingNumber as string;

  const shipment = SHIPMENTS.find(
    (item) => item.trackingNumber === trackingNumber,
  );

  if (!shipment) {
    return (
      <main className="min-h-screen bg-background p-6">
        <Link
          href="/staffhome"
          className="inline-flex items-center gap-2 text-sm text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to shipments
        </Link>

        <div className="mt-10 rounded-xl border border-border bg-surface p-8 text-center">
          <h1 className="text-xl font-semibold text-text">
            Shipment not found
          </h1>

          <p className="mt-2 text-sm text-muted">
            The shipment you're looking for does not exist.
          </p>
        </div>
      </main>
    );
  }

  const latestEvent = shipment.events.at(-1);

  const [status, setStatus] = useState(shipment.status);
  const [originCity, setOriginCity] = useState(shipment.originCity);
  const [originRegion, setOriginRegion] = useState(shipment.originRegion);
  const [destinationCity, setDestinationCity] = useState(
    shipment.destinationCity,
  );
  const [destinationRegion, setDestinationRegion] = useState(
    shipment.destinationRegion,
  );
  const [currentLocation, setCurrentLocation] = useState(
    shipment.currentLocation,
  );
  const [eta, setEta] = useState(shipment.estimatedDeliveryAt.slice(0, 16));
  const [eventMessage, setEventMessage] = useState("");
  const [eventLocation, setEventLocation] = useState(shipment.currentLocation);
  const [eventStatus, setEventStatus] = useState(status);
  const [internalNote, setInternalNote] = useState("");

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        {/* Header */}
        <Link
          href="/staffhome"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-text"
        >
          <ArrowLeft className="size-4" />
          Back to shipments
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm text-muted">Shipment</p>

            <h1 className="mt-1 text-2xl font-semibold text-text">
              {shipment.trackingNumber}
            </h1>

            <p className="mt-1 text-sm text-muted">
              Reference: {shipment.referenceCode}
            </p>
          </div>

          <StatusBadge status={status} />
        </div>

        <div className="mt-6 space-y-6">
          {/* Shipment details */}
          <section className="rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="font-semibold text-text">Shipment details</h2>

                <p className="mt-1 text-sm text-muted">
                  Update the shipment information shown to customers.
                </p>
              </div>

              {/* UI only: connect this to PATCH /staff/shipments/:id later */}
              <button
                type="button"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-hover"
              >
                <Save className="size-4" />
                Save changes
              </button>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2">
              <Field
                label="Origin city"
                value={originCity}
                onChange={setOriginCity}
              />

              <Field
                label="Origin region"
                value={originRegion}
                onChange={setOriginRegion}
              />

              <Field
                label="Destination city"
                value={destinationCity}
                onChange={setDestinationCity}
              />

              <Field
                label="Destination region"
                value={destinationRegion}
                onChange={setDestinationRegion}
              />

              <Field
                label="Current location"
                value={currentLocation}
                onChange={setCurrentLocation}
              />

              <Field
                label="Estimated delivery"
                type="datetime-local"
                value={eta}
                onChange={setEta}
              />

              <Field
                label="Service level"
                value={shipment.serviceLevel}
                disabled
              />

              <Field
                label="Package count"
                value={String(shipment.packageCount)}
                disabled
              />

              <Field
                label="Weight"
                value={`${shipment.weightKg} kg`}
                disabled
              />

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) => {
                    const nextStatus = event.target.value;
                    setStatus(nextStatus as typeof status);
                    // setEventStatus(nextStatus);
                  }}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {formatStatus(item)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Tracking history */}
          <section className="rounded-xl border border-border bg-surface">
            <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-semibold text-text">Tracking history</h2>

                <p className="mt-1 text-sm text-muted">
                  Existing events are kept as shipment history.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-text hover:bg-background"
              >
                <Plus className="size-4" />
                Add event
              </button>
            </div>

            <div className="p-5">
              <div className="space-y-6">
                {[...shipment.events].reverse().map((event, index) => (
                  <div key={event.id} className="relative flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="mt-1 size-3 rounded-full bg-primary" />

                      {index !== shipment.events.length - 1 && (
                        <div className="absolute top-4 h-full w-px bg-border" />
                      )}
                    </div>

                    <div className="pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-text">
                          {/* {formatStatus(event.status)} */}
                        </p>

                        {index === 0 && (
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            Latest
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-muted">
                        {formatDate(event.occurredAt)} · {event.location}
                      </p>

                      <p className="mt-2 text-sm text-text">{event.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Add event */}
          <section className="rounded-xl border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="font-semibold text-text">Add tracking event</h2>

              <p className="mt-1 text-sm text-muted">
                Add a new customer-visible update without changing previous
                tracking history.
              </p>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2">
              <Field
                label="Location"
                value={eventLocation}
                onChange={setEventLocation}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Event status
                </label>

                <select
                  value={eventStatus}
                  //   onChange={(event) =>
                  // setEventStatus(event.target.value)
                  //   }
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {formatStatus(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="event-message"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Customer-visible message
                </label>

                <textarea
                  id="event-message"
                  value={eventMessage}
                  onChange={(event) => setEventMessage(event.target.value)}
                  rows={3}
                  placeholder="e.g. Shipment arrived at the local distribution centre."
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* UI only: later POST /staff/shipments/:id/events */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary hover:bg-primary-hover"
                >
                  Add tracking event
                </button>
              </div>
            </div>
          </section>

          {/* Internal note */}
          <section className="rounded-xl border border-border bg-surface">
            <div className="border-b border-border p-5">
              <h2 className="font-semibold text-text">Internal note</h2>

              <p className="mt-1 text-sm text-muted">
                Internal notes are for staff only and are not shown on the
                public tracking page.
              </p>
            </div>

            <div className="p-5">
              <textarea
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
                rows={3}
                placeholder="Add a note for other staff members..."
                className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <button
                type="button"
                className="mt-3 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-background"
              >
                Add internal note
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted"
      />
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

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

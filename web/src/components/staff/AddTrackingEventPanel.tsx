"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { STATUS_OPTIONS } from "@/lib/shipmentStatus";
import { useAddTrackingEvent } from "@/hooks/useShipments";
import { ApiError } from "@/api";
import type { StaffShipment, ShipmentStatus } from "@/types";

function nowForInput(): string {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
}

export function AddTrackingEventPanel({ shipment }: { shipment: StaffShipment }) {
  const addTrackingEvent = useAddTrackingEvent(shipment.trackingNumber);
  const [status, setStatus] = useState<ShipmentStatus>(shipment.status);
  const [location, setLocation] = useState(shipment.currentLocation);
  const [occurredAt, setOccurredAt] = useState(nowForInput());
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!location.trim() || !message.trim() || !occurredAt) {
      setValidationError("Location, date/time and message are all required.");
      return;
    }

    setValidationError(null);
    addTrackingEvent.mutate(
      {
        status,
        location: location.trim(),
        occurredAt: new Date(occurredAt).toISOString(),
        message: message.trim(),
      },
      { onSuccess: () => setMessage("") },
    );
  };

  const error =
    validationError ??
    (addTrackingEvent.error instanceof ApiError
      ? addTrackingEvent.error.message
      : addTrackingEvent.isError
        ? "Something went wrong adding this event."
        : null);

  return (
    <CollapsiblePanel
      icon={PlusCircle}
      title="Add tracking event"
      subtitle="Appends a new customer-visible update — history is never overwritten"
      tone="cta"
    >
      {({ close }) => (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="event-status" className="mb-1.5 block text-sm font-medium text-text">
                Status/event type
              </label>
              <select
                id="event-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as ShipmentStatus)}
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="event-datetime" className="mb-1.5 block text-sm font-medium text-text">
                Date/time
              </label>
              <input
                id="event-datetime"
                type="datetime-local"
                value={occurredAt}
                onChange={(event) => setOccurredAt(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="event-location" className="mb-1.5 block text-sm font-medium text-text">
                Location
              </label>
              <input
                id="event-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Manchester Distribution Hub, United Kingdom"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="event-message" className="mb-1.5 block text-sm font-medium text-text">
                Customer-visible message
              </label>
              <textarea
                id="event-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                placeholder="e.g. Shipment arrived at the local distribution centre."
                className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          {addTrackingEvent.isSuccess && <p className="text-sm text-success">Event added to the timeline.</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="cta" loading={addTrackingEvent.isPending} disabled={addTrackingEvent.isPending}>
              Add tracking event
            </Button>
          </div>
        </form>
      )}
    </CollapsiblePanel>
  );
}

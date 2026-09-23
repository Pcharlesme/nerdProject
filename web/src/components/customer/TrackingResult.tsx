import type { Shipment, ShipmentStatus } from "@/types";

const STATUS_LABEL: Record<ShipmentStatus, string> = {
  CREATED: "Created",
  COLLECTED: "Collected",
  IN_TRANSIT: "In transit",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  DELAYED: "Delayed",
  EXCEPTION: "Exception",
};

type StatusTone = "primary" | "success" | "warning" | "danger";

const STATUS_TONE: Record<ShipmentStatus, StatusTone> = {
  CREATED: "primary",
  COLLECTED: "primary",
  IN_TRANSIT: "primary",
  OUT_FOR_DELIVERY: "primary",
  DELIVERED: "success",
  DELAYED: "warning",
  EXCEPTION: "danger",
};

const TONE_CLASSES: Record<StatusTone, string> = {
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-success-border bg-success-bg text-success",
  warning: "border-warning-border bg-warning-bg text-warning",
  danger: "border-danger-border bg-danger-bg text-danger",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium ${TONE_CLASSES[STATUS_TONE[status]]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function TrackingResult({ shipment }: { shipment: Shipment }) {
  const latestEvent = shipment.events[shipment.events.length - 1];
  const timeline = [...shipment.events].reverse();

  return (
    <div className="w-full max-w-xl rounded-lg border border-border bg-surface p-6 text-left shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Tracking number</p>
          <p className="font-mono text-lg font-semibold text-text">{shipment.trackingNumber}</p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      {shipment.etaNote && (
        <p className="mt-4 rounded-md bg-background px-3 py-2 text-sm text-muted">{shipment.etaNote}</p>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted">Route</dt>
          <dd className="mt-0.5 text-text">
            {shipment.originCity} → {shipment.destinationCity}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Estimated delivery</dt>
          <dd className="mt-0.5 text-text">
            {formatDateTime(shipment.estimatedDeliveryAt)}
            {shipment.previousEstimatedDeliveryAt && (
              <span className="block text-xs text-muted line-through">
                {formatDateTime(shipment.previousEstimatedDeliveryAt)}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Current location</dt>
          <dd className="mt-0.5 text-text">{shipment.currentLocation}</dd>
        </div>
        <div>
          <dt className="text-muted">Service</dt>
          <dd className="mt-0.5 text-text">{shipment.serviceLevel}</dd>
        </div>
        <div>
          <dt className="text-muted">Packages</dt>
          <dd className="mt-0.5 text-text">
            {shipment.packageCount} · {shipment.weightKg} kg
          </dd>
        </div>
        <div>
          <dt className="text-muted">Reference</dt>
          <dd className="mt-0.5 text-text">{shipment.referenceCode}</dd>
        </div>
      </dl>

      <div className="mt-6 border-t border-border pt-5">
        <h2 className="text-sm font-semibold text-text">Tracking history</h2>

        {timeline.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No tracking events yet. Check back once the shipment has been collected.
          </p>
        ) : (
          <ol className="mt-3 space-y-4">
            {timeline.map((event) => {
              const isLatest = event.id === latestEvent.id;
              return (
                <li key={event.id} className="flex gap-3">
                  <span
                    className={`mt-1.5 size-2 flex-shrink-0 rounded-full ${isLatest ? "bg-primary" : "bg-border"}`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm text-text">
                      {event.message}
                      {isLatest && <span className="ml-2 text-xs font-medium text-primary">Latest</span>}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDateTime(event.occurredAt)} · {event.location}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

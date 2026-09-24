import {
  AlertTriangle,
  Boxes,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  Hash,
  MapPin,
  Navigation,
  Package,
  PackageCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Shipment, ShipmentStatus, TrackingEvent } from "@/types";

const STATUS_LABEL: Record<ShipmentStatus, string> = {
  CREATED: "Created",
  COLLECTED: "Collected",
  IN_TRANSIT: "In transit",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  DELAYED: "Delayed",
  EXCEPTION: "Exception",
};

const STATUS_ICON: Record<ShipmentStatus, LucideIcon> = {
  CREATED: Package,
  COLLECTED: PackageCheck,
  IN_TRANSIT: Truck,
  OUT_FOR_DELIVERY: Navigation,
  DELIVERED: CheckCircle2,
  DELAYED: Clock,
  EXCEPTION: AlertTriangle,
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

const BADGE_TONE_CLASSES: Record<StatusTone, string> = {
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-success-border bg-success-bg text-success",
  warning: "border-warning-border bg-warning-bg text-warning",
  danger: "border-danger-border bg-danger-bg text-danger",
};

// The five stages a shipment always progresses through; delayed/exception are incidents
// overlaid on whichever of these stages the shipment last reached, not stages of their own.
const CORE_STEPS: { status: ShipmentStatus; label: string }[] = [
  { status: "CREATED", label: "Created" },
  { status: "COLLECTED", label: "Collected" },
  { status: "IN_TRANSIT", label: "In transit" },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

function getCoreStepIndex(shipment: Shipment): number {
  if (shipment.status === "DELIVERED") return CORE_STEPS.length - 1;

  for (let i = shipment.events.length - 1; i >= 0; i -= 1) {
    const coreIndex = CORE_STEPS.findIndex((step) => step.status === shipment.events[i].status);
    if (coreIndex !== -1) return coreIndex;
  }
  return 0;
}

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
  const Icon = STATUS_ICON[status];
  const isLive = status === "IN_TRANSIT";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium ${BADGE_TONE_CLASSES[STATUS_TONE[status]]}`}
    >
      <span className="relative flex size-2" aria-hidden="true">
        {isLive && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75 motion-reduce:hidden" />
        )}
        <span className="relative inline-flex size-2 rounded-full bg-current" />
      </span>
      <Icon className="size-3.5" aria-hidden="true" />
      {STATUS_LABEL[status]}
      {isLive && <span className="sr-only"> — updating live</span>}
    </span>
  );
}

const NODE_TONE_CLASSES: Record<StatusTone, string> = {
  primary: "border-primary bg-primary text-on-primary",
  success: "border-success bg-success text-white",
  warning: "border-warning bg-warning text-white",
  danger: "border-danger bg-danger text-white",
};

function StatusStepper({ shipment }: { shipment: Shipment }) {
  const currentIndex = getCoreStepIndex(shipment);
  const tone = STATUS_TONE[shipment.status];
  const CurrentIcon = STATUS_ICON[shipment.status];

  return (
    <div role="group" aria-label="Shipment progress" className="flex">
      {CORE_STEPS.map((step, index) => {
        const StepIcon = STATUS_ICON[step.status];
        const isCurrent = index === currentIndex;
        const isDone = index < currentIndex;

        // The current node always mirrors the shipment's real status (colour + icon) —
        // past/upcoming nodes just mark the generic stage, in a neutral ink/border tone.
        const nodeClasses = isCurrent
          ? NODE_TONE_CLASSES[tone]
          : isDone
            ? "border-text bg-text text-white"
            : "border-border bg-surface text-muted";

        return (
          <div key={step.status} className="relative flex flex-1 flex-col items-center">
            {index > 0 && (
              <div
                className={`absolute top-4 h-0.5 ${index <= currentIndex ? "bg-text" : "bg-border"}`}
                style={{ left: "-50%", right: "50%" }}
                aria-hidden="true"
              />
            )}
            <div
              aria-current={isCurrent ? "step" : undefined}
              className={`relative z-10 flex size-8 items-center justify-center rounded-full border-2 transition-colors ${nodeClasses}`}
            >
              {isCurrent ? (
                <CurrentIcon className="size-4" aria-hidden="true" />
              ) : (
                <StepIcon className="size-4" aria-hidden="true" />
              )}
            </div>
            <span
              className={`sr-only mt-2 text-center text-xs font-medium sm:not-sr-only ${isCurrent || isDone ? "text-text" : "text-muted"}`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MetaItem({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-muted">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-0.5 text-text">{children}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{children}</h2>;
}

function eventIcon(event: TrackingEvent): LucideIcon {
  return event.status ? STATUS_ICON[event.status] : Circle;
}

export function TrackingResult({ shipment }: { shipment: Shipment }) {
  const latestEvent = shipment.events[shipment.events.length - 1];
  const timeline = [...shipment.events].reverse();

  return (
    <div className="w-full max-w-2xl rounded-lg border border-border bg-surface p-6 text-left shadow-md sm:p-8">
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

      <div className="mt-8">
        <StatusStepper shipment={shipment} />
      </div>

      <div className="mt-8 space-y-3">
        <SectionTitle>Shipment details</SectionTitle>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-3">
          <MetaItem icon={MapPin} label="Route">
            {shipment.originCity} → {shipment.destinationCity}
          </MetaItem>
          <MetaItem icon={CalendarClock} label="Estimated delivery">
            {formatDateTime(shipment.estimatedDeliveryAt)}
            {shipment.previousEstimatedDeliveryAt && (
              <span className="block text-xs text-muted line-through">
                {formatDateTime(shipment.previousEstimatedDeliveryAt)}
              </span>
            )}
          </MetaItem>
          <MetaItem icon={MapPin} label="Current location">
            {shipment.currentLocation}
          </MetaItem>
          <MetaItem icon={Truck} label="Service">
            {shipment.serviceLevel}
          </MetaItem>
          <MetaItem icon={Boxes} label="Packages">
            {shipment.packageCount} · {shipment.weightKg} kg
          </MetaItem>
          <MetaItem icon={Hash} label="Reference">
            {shipment.referenceCode}
          </MetaItem>
        </dl>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <SectionTitle>Tracking history</SectionTitle>

        {timeline.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No tracking events yet. Check back once the shipment has been collected.
          </p>
        ) : (
          <div className="relative mt-4">
            <div className="absolute bottom-1 left-4 top-1 w-px bg-border" aria-hidden="true" />
            <ol className="relative space-y-5">
              {timeline.map((event) => {
                const isLatest = event.id === latestEvent.id;
                const Icon = eventIcon(event);
                return (
                  <li key={event.id} className="flex gap-4">
                    <div
                      className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 ${
                        isLatest ? "border-primary bg-primary text-on-primary" : "border-border bg-surface text-muted"
                      }`}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm text-text">
                        {event.message}
                        {isLatest && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Latest
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatDateTime(event.occurredAt)} · {event.location}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-background ${className}`} />;
}

export function TrackingResultSkeleton() {
  return (
    <div role="status" className="w-full max-w-2xl rounded-lg border border-border bg-surface p-6 shadow-md sm:p-8">
      <span className="sr-only">Looking up your shipment…</span>

      <div className="flex items-center justify-between gap-3" aria-hidden="true">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-5 w-36" />
        </div>
        <SkeletonBlock className="h-6 w-24 rounded-md" />
      </div>

      <div className="mt-8 flex justify-between" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <SkeletonBlock className="size-8 rounded-full" />
            <SkeletonBlock className="h-2.5 w-12" />
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3 border-t border-border pt-6" aria-hidden="true">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="h-10 w-full" />
      </div>
    </div>
  );
}

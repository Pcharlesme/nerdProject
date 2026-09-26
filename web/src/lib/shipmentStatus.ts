import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Navigation,
  Package,
  PackageCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { ShipmentProgress, ShipmentStatus, TrackingEvent } from "@/types";

export const STATUS_LABEL: Record<ShipmentStatus, string> = {
  CREATED: "Created",
  COLLECTED: "Collected",
  IN_TRANSIT: "In transit",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  DELAYED: "Delayed",
  EXCEPTION: "Exception",
};

export const STATUS_ICON: Record<ShipmentStatus, LucideIcon> = {
  CREATED: Package,
  COLLECTED: PackageCheck,
  IN_TRANSIT: Truck,
  OUT_FOR_DELIVERY: Navigation,
  DELIVERED: CheckCircle2,
  DELAYED: Clock,
  EXCEPTION: AlertTriangle,
};

// Every non-terminal status gets its own color — Collected and In Transit used to
// share "primary" (blue), which made them indistinguishable at a glance.
export type StatusTone = "primary" | "success" | "warning" | "danger" | "info" | "accent" | "neutral";

export const STATUS_TONE: Record<ShipmentStatus, StatusTone> = {
  CREATED: "neutral",
  COLLECTED: "info",
  IN_TRANSIT: "primary",
  OUT_FOR_DELIVERY: "accent",
  DELIVERED: "success",
  DELAYED: "warning",
  EXCEPTION: "danger",
};

/** Light badge fill — text/border pick up the same token pair. */
export const BADGE_TONE_CLASSES: Record<StatusTone, string> = {
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-success-border bg-success-bg text-success",
  warning: "border-warning-border bg-warning-bg text-warning",
  danger: "border-danger-border bg-danger-bg text-danger",
  info: "border-teal-200 bg-teal-50 text-teal-700",
  accent: "border-violet-200 bg-violet-50 text-violet-700",
  neutral: "border-border bg-background text-muted",
};

/** Solid fill — used for stepper/timeline nodes that need to read as "current". */
export const NODE_TONE_CLASSES: Record<StatusTone, string> = {
  primary: "border-primary bg-primary text-on-primary",
  success: "border-success bg-success text-white",
  warning: "border-warning bg-warning text-white",
  danger: "border-danger bg-danger text-white",
  info: "border-teal-600 bg-teal-600 text-white",
  accent: "border-violet-600 bg-violet-600 text-white",
  neutral: "border-muted bg-muted text-white",
};

// The five stages a shipment always progresses through; delayed/exception are incidents
// overlaid on whichever of these stages the shipment last reached, not stages of their own.
export const CORE_STEPS: { status: ShipmentStatus; label: string }[] = [
  { status: "CREATED", label: "Created" },
  { status: "COLLECTED", label: "Collected" },
  { status: "IN_TRANSIT", label: "In transit" },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

export function getCoreStepIndex(shipment: ShipmentProgress): number {
  if (shipment.status === "DELIVERED") return CORE_STEPS.length - 1;

  for (let i = shipment.events.length - 1; i >= 0; i -= 1) {
    const coreIndex = CORE_STEPS.findIndex((step) => step.status === shipment.events[i].status);
    if (coreIndex !== -1) return coreIndex;
  }
  return 0;
}

/** A plain circle for events that didn't change the shipment's status. */
export function eventIcon(event: TrackingEvent): LucideIcon {
  return event.status ? STATUS_ICON[event.status] : Circle;
}

export const STATUS_OPTIONS: { value: ShipmentStatus; label: string }[] = CORE_STEPS.map((step) => ({
  value: step.status,
  label: step.label,
})).concat([
  { value: "DELAYED", label: "Delayed" },
  { value: "EXCEPTION", label: "Exception" },
]);

/** Default customer-readable message when staff change status without writing a custom event. */
export const STATUS_AUTO_MESSAGE: Record<ShipmentStatus, string> = {
  CREATED: "Shipment record created.",
  COLLECTED: "Collected from sender by carrier.",
  IN_TRANSIT: "Shipment is in transit.",
  OUT_FOR_DELIVERY: "Out for delivery.",
  DELIVERED: "Delivered.",
  DELAYED: "Delivery is delayed. An updated estimate will follow.",
  EXCEPTION: "An issue needs attention — see the latest update for details.",
};

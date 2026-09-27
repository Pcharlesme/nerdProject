import { CalendarClock, Hash, MapPin, Truck, Boxes } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { InfoField, SectionLabel } from "@/components/ui/InfoField";
import { StatusStepper } from "@/components/shipments/StatusStepper";
import { TrackingTimeline } from "@/components/shipments/TrackingTimeline";
import { formatDateTime, formatDateWithWeekday } from "@/lib/formatDate";
import type { PublicShipment } from "@/types";

export function TrackingResult({ shipment }: { shipment: PublicShipment }) {
  return (
    <div className="w-full max-w-2xl rounded-lg border border-border bg-surface p-6 text-left shadow-md sm:p-8">
      <div className="rounded-2xl bg-background p-4 sm:p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Tracking number */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-muted">
              <span>Tracking number</span>
            </div>

            <p className="mt-1.5 break-all font-mono text-base font-semibold tracking-tight text-text sm:text-lg">
              {shipment.trackingNumber}
            </p>
          </div>

          {/* Status + ETA */}
          <div className="flex items-center gap-4 sm:shrink-0">
            <StatusBadge status={shipment.status} />

            <div className="h-8 w-px bg-border" aria-hidden="true" />

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                Estimated delivery
              </p>
              <p className="mt-0.5 text-sm font-semibold text-text">
                {formatDateWithWeekday(shipment.estimatedDeliveryAt)}
              </p>
            </div>
          </div>
        </div>

        {shipment.etaNote && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-surface px-3.5 py-3 text-sm text-muted">
            <CalendarClock
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="leading-5">{shipment.etaNote}</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <StatusStepper shipment={shipment} />
      </div>

      {/* //Shipment details */}
      <div className="mt-6">
        <SectionLabel>Shipment details</SectionLabel>

        <div className="mt-3 rounded-2xl bg-background p-4 sm:p-5">
          {/* Route */}
          <div className="rounded-xl bg-surface p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted">
              <MapPin className="size-4" aria-hidden="true" />
              Route from
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">
                  {shipment.originCity}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {shipment.originRegion}
                </p>
              </div>

              <div className="hidden h-px flex-1 bg-border sm:block" />

              <div className="flex items-center gap-2 text-muted sm:hidden">
                <span className="h-4 w-px bg-border" />
                <span className="text-xs">to</span>
              </div>

              <div className="min-w-0 sm:text-right">
                <p className="text-sm font-semibold text-text">
                  {shipment.destinationCity}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {shipment.destinationRegion}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoField icon={CalendarClock} label="Estimated delivery">
              <span>{formatDateTime(shipment.estimatedDeliveryAt)}</span>

              {shipment.previousEstimatedDeliveryAt && (
                <span className="mt-0.5 block text-xs text-muted line-through">
                  {formatDateTime(shipment.previousEstimatedDeliveryAt)}
                </span>
              )}
            </InfoField>

            <InfoField icon={MapPin} label="Current location">
              {shipment.currentLocation}
            </InfoField>

            <InfoField icon={Truck} label="Service">
              {shipment.serviceLevel}
            </InfoField>

            <InfoField icon={Boxes} label="Packages">
              {shipment.packageCount} · {shipment.weightKg} kg
            </InfoField>

            <InfoField icon={Hash} label="Reference">
              {shipment.referenceCode}
            </InfoField>
          </dl>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <SectionLabel>Tracking history</SectionLabel>
        <TrackingTimeline
          events={shipment.events}
          emptyMessage="No tracking events yet. Check back once the shipment has been collected."
        />
      </div>
    </div>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-background ${className}`} />;
}

export function TrackingResultSkeleton() {
  return (
    <div
      role="status"
      className="w-full max-w-2xl rounded-lg border border-border bg-surface p-6 shadow-md sm:p-8"
    >
      <span className="sr-only">Looking up your shipment…</span>

      <div
        className="flex items-center justify-between gap-3"
        aria-hidden="true"
      >
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

      <div
        className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3"
        aria-hidden="true"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
        ))}
      </div>

      <div
        className="mt-8 space-y-3 border-t border-border pt-6"
        aria-hidden="true"
      >
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="h-10 w-full" />
      </div>
    </div>
  );
}

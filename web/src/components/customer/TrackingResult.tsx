import { CalendarClock, Hash, MapPin, Truck, Boxes } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { InfoField, SectionLabel } from "@/components/ui/InfoField";
import { StatusStepper } from "@/components/shipments/StatusStepper";
import { TrackingTimeline } from "@/components/shipments/TrackingTimeline";
import { formatDateTime } from "@/lib/formatDate";
import type { Shipment } from "@/types";

export function TrackingResult({ shipment }: { shipment: Shipment }) {
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
        <SectionLabel>Shipment details</SectionLabel>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-3">
          <InfoField icon={MapPin} label="Route">
            {shipment.originCity}, {shipment.originRegion} → {shipment.destinationCity},{" "}
            {shipment.destinationRegion}
          </InfoField>
          <InfoField icon={CalendarClock} label="Estimated delivery">
            {formatDateTime(shipment.estimatedDeliveryAt)}
            {shipment.previousEstimatedDeliveryAt && (
              <span className="block text-xs text-muted line-through">
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

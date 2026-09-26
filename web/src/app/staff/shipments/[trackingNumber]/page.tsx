"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Boxes, CalendarClock, Hash, MapPin, PackageX, Truck } from "lucide-react";
import { ApiError } from "@/api";
import { useStaffShipmentDetail } from "@/hooks/useStaffShipmentDetail";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { InfoField, SectionLabel } from "@/components/ui/InfoField";
import { StatusStepper } from "@/components/shipments/StatusStepper";
import { TrackingTimeline } from "@/components/shipments/TrackingTimeline";
import { ContactCard } from "@/components/staff/ContactCard";
import { InternalNotesList } from "@/components/staff/InternalNotesList";
import { EditShipmentPanel } from "@/components/staff/EditShipmentPanel";
import { UpdateStatusPanel } from "@/components/staff/UpdateStatusPanel";
import { AddTrackingEventPanel } from "@/components/staff/AddTrackingEventPanel";
import { AddInternalNotePanel } from "@/components/staff/AddInternalNotePanel";
import { formatDateTime } from "@/lib/formatDate";

export default function StaffShipmentDetailsPage() {
  const params = useParams<{ trackingNumber: string }>();
  const { data: shipment, isLoading, isError, error } = useStaffShipmentDetail(params.trackingNumber);
  const notFound = isError && error instanceof ApiError && error.isNotFound;

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <Link
          href="/staff/shipments"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-text"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to shipments
        </Link>

        {isLoading ? (
          <DetailSkeleton />
        ) : isError && !notFound ? (
          <div className="mt-10 flex flex-col items-center rounded-xl border border-border bg-surface p-10 text-center">
            <AlertCircle className="size-8 text-danger" aria-hidden="true" />
            <h1 className="mt-3 text-xl font-semibold text-text">Couldn&apos;t load this shipment</h1>
            <p className="mt-2 text-sm text-muted">Please try again in a moment.</p>
          </div>
        ) : notFound || !shipment ? (
          <div className="mt-10 flex flex-col items-center rounded-xl border border-border bg-surface p-10 text-center">
            <PackageX className="size-8 text-muted" aria-hidden="true" />
            <h1 className="mt-3 text-xl font-semibold text-text">Shipment not found</h1>
            <p className="mt-2 text-sm text-muted">
              No shipment matches <span className="font-mono">{params.trackingNumber}</span>.
            </p>
            <Link
              href="/staff/shipments"
              className="mt-4 inline-flex h-10 items-center rounded-lg bg-cta px-4 text-sm font-medium text-on-primary transition-colors hover:opacity-90"
            >
              Back to shipments
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm text-muted">Shipment</p>
                <h1 className="mt-1 text-2xl font-semibold text-text">{shipment.trackingNumber}</h1>
                <p className="mt-1 text-sm text-muted">
                  Reference: {shipment.referenceCode} · Last updated {formatDateTime(shipment.updatedAt)}
                </p>
              </div>
              <StatusBadge status={shipment.status} />
            </div>

            <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
              <StatusStepper shipment={shipment} />

              {shipment.etaNote && (
                <p className="mt-6 rounded-md bg-background px-3 py-2 text-sm text-muted">{shipment.etaNote}</p>
              )}

              <div className="mt-6 space-y-3">
                <SectionLabel>Shipment information</SectionLabel>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-3">
                  <InfoField icon={MapPin} label="Route">
                    {shipment.originCity} → {shipment.destinationCity}
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
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <ContactCard title="Sender" contact={shipment.sender} />
              <ContactCard title="Receiver" contact={shipment.receiver} />
            </div>

            <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
              <SectionLabel>Tracking history</SectionLabel>
              <TrackingTimeline events={shipment.events} />
            </section>

            <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <SectionLabel>Internal notes</SectionLabel>
                <span className="text-xs text-muted">Never shown to customers</span>
              </div>
              <InternalNotesList notes={shipment.internalNotes} />
            </section>

            <div className="space-y-3">
              <SectionLabel>Staff actions</SectionLabel>
              <EditShipmentPanel shipment={shipment} />
              <UpdateStatusPanel shipment={shipment} />
              <AddTrackingEventPanel shipment={shipment} />
              <AddInternalNotePanel shipment={shipment} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function DetailSkeleton() {
  return (
    <div role="status" className="mt-6 space-y-6">
      <span className="sr-only">Loading shipment…</span>
      <div className="h-8 w-64 animate-pulse rounded bg-background" aria-hidden="true" />
      <div className="h-48 animate-pulse rounded-xl bg-background" aria-hidden="true" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-xl bg-background" aria-hidden="true" />
        <div className="h-40 animate-pulse rounded-xl bg-background" aria-hidden="true" />
      </div>
      <div className="h-56 animate-pulse rounded-xl bg-background" aria-hidden="true" />
    </div>
  );
}

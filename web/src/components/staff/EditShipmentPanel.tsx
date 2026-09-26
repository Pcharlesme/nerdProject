"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { useUpdateShipment } from "@/hooks/useUpdateShipment";
import type { EditShipmentInput, StaffShipment } from "@/types";

function toDateTimeLocal(iso: string): string {
  return iso.slice(0, 16);
}

interface EditShipmentPanelProps {
  shipment: StaffShipment;
}

export function EditShipmentPanel({ shipment }: EditShipmentPanelProps) {
  const updateShipment = useUpdateShipment(shipment.trackingNumber);
  const [fields, setFields] = useState<EditShipmentInput>({
    originCity: shipment.originCity,
    originRegion: shipment.originRegion,
    destinationCity: shipment.destinationCity,
    destinationRegion: shipment.destinationRegion,
    currentLocation: shipment.currentLocation,
    estimatedDeliveryAt: toDateTimeLocal(shipment.estimatedDeliveryAt),
    serviceLevel: shipment.serviceLevel,
    packageCount: shipment.packageCount,
    referenceCode: shipment.referenceCode,
    weightKg: shipment.weightKg,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const update = <K extends keyof EditShipmentInput>(key: K, value: EditShipmentInput[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (validationError) setValidationError(null);
    updateShipment.reset();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fields.originCity.trim() || !fields.destinationCity.trim() || !fields.currentLocation.trim() || !fields.estimatedDeliveryAt) {
      setValidationError("Origin, destination, current location and ETA are required.");
      return;
    }

    updateShipment.mutate({
      ...fields,
      estimatedDeliveryAt: new Date(fields.estimatedDeliveryAt).toISOString(),
    });
  };

  const error = validationError ?? (updateShipment.isError ? "Something went wrong saving these changes." : null);

  return (
    <CollapsiblePanel icon={Pencil} title="Edit shipment" subtitle="Update route, ETA and shipment details" tone="cta">
      {({ close }) => (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Origin city" value={fields.originCity} onChange={(v) => update("originCity", v)} required />
            <Field label="Origin region" value={fields.originRegion} onChange={(v) => update("originRegion", v)} />
            <Field
              label="Destination city"
              value={fields.destinationCity}
              onChange={(v) => update("destinationCity", v)}
              required
            />
            <Field
              label="Destination region"
              value={fields.destinationRegion}
              onChange={(v) => update("destinationRegion", v)}
            />
            <Field
              label="Current location"
              value={fields.currentLocation}
              onChange={(v) => update("currentLocation", v)}
              required
            />
            <Field
              label="Estimated delivery"
              type="datetime-local"
              value={fields.estimatedDeliveryAt}
              onChange={(v) => update("estimatedDeliveryAt", v)}
              required
            />
            <Field label="Service level" value={fields.serviceLevel} onChange={(v) => update("serviceLevel", v)} />
            <Field label="Reference" value={fields.referenceCode} onChange={(v) => update("referenceCode", v)} />
            <Field
              label="Package count"
              type="number"
              value={String(fields.packageCount)}
              onChange={(v) => update("packageCount", Math.max(0, Number(v) || 0))}
            />
            <Field
              label="Weight (kg)"
              type="number"
              value={String(fields.weightKg)}
              onChange={(v) => update("weightKg", Math.max(0, Number(v) || 0))}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          {updateShipment.isSuccess && <p className="text-sm text-success">Shipment updated.</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="cta" loading={updateShipment.isPending} disabled={updateShipment.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      )}
    </CollapsiblePanel>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

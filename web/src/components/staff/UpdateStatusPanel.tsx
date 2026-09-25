"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { STATUS_AUTO_MESSAGE, STATUS_OPTIONS } from "@/lib/shipmentStatus";
import { useAppData } from "@/providers/AppDataProvider";
import type { Shipment, ShipmentStatus } from "@/types";

type SaveState = "idle" | "saving" | "success" | "error";

export function UpdateStatusPanel({ shipment }: { shipment: Shipment }) {
  const { changeStatus } = useAppData();
  const [nextStatus, setNextStatus] = useState<ShipmentStatus>(shipment.status);
  const [state, setState] = useState<SaveState>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (nextStatus === shipment.status) {
      setState("error");
      return;
    }

    setState("saving");
    await changeStatus(shipment.trackingNumber, nextStatus);
    setState("success");
  };

  return (
    <CollapsiblePanel icon={RefreshCw} title="Update status" subtitle="Move this shipment to a new state" tone="cta">
      {({ close }) => (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4"
          onChange={() => state !== "idle" && setState("idle")}
        >
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted">Current status</span>
            <StatusBadge status={shipment.status} />
          </div>

          <div>
            <label htmlFor="next-status" className="mb-1.5 block text-sm font-medium text-text">
              New status
            </label>
            <select
              id="next-status"
              value={nextStatus}
              onChange={(event) => setNextStatus(event.target.value as ShipmentStatus)}
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {nextStatus !== shipment.status && (
              <p className="mt-2 text-sm text-muted">
                This adds a tracking event: <span className="text-text">&ldquo;{STATUS_AUTO_MESSAGE[nextStatus]}&rdquo;</span>
              </p>
            )}
          </div>

          {state === "error" && (
            <p role="alert" className="text-sm text-danger">
              Choose a different status to update.
            </p>
          )}
          {state === "success" && <p className="text-sm text-success">Status updated.</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="cta" loading={state === "saving"} disabled={state === "saving"}>
              Update status
            </Button>
          </div>
        </form>
      )}
    </CollapsiblePanel>
  );
}

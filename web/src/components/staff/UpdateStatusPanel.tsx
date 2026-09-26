"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { STATUS_AUTO_MESSAGE, STATUS_OPTIONS } from "@/lib/shipmentStatus";
import { useChangeShipmentStatus } from "@/hooks/useChangeShipmentStatus";
import { ApiError } from "@/api";
import type { StaffShipment, ShipmentStatus } from "@/types";

export function UpdateStatusPanel({ shipment }: { shipment: StaffShipment }) {
  const changeStatus = useChangeShipmentStatus(shipment.trackingNumber);
  const [nextStatus, setNextStatus] = useState<ShipmentStatus>(shipment.status);
  const [sameStatusError, setSameStatusError] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (nextStatus === shipment.status) {
      setSameStatusError(true);
      return;
    }

    setSameStatusError(false);
    changeStatus.mutate({ status: nextStatus });
  };

  return (
    <CollapsiblePanel icon={RefreshCw} title="Update status" subtitle="Move this shipment to a new state" tone="cta">
      {({ close }) => (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4"
          onChange={() => {
            setSameStatusError(false);
            changeStatus.reset();
          }}
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

          {sameStatusError && (
            <p role="alert" className="text-sm text-danger">
              Choose a different status to update.
            </p>
          )}
          {changeStatus.isError && (
            <p role="alert" className="text-sm text-danger">
              {changeStatus.error instanceof ApiError
                ? changeStatus.error.message
                : "Something went wrong updating the status. Please try again."}
            </p>
          )}
          {changeStatus.isSuccess && <p className="text-sm text-success">Status updated.</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="cta" loading={changeStatus.isPending} disabled={changeStatus.isPending}>
              Update status
            </Button>
          </div>
        </form>
      )}
    </CollapsiblePanel>
  );
}

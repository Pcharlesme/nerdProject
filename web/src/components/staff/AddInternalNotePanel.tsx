"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { StickyNote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { useAddInternalNote } from "@/hooks/useShipments";
import { ApiError } from "@/api";
import type { StaffShipment } from "@/types";

export function AddInternalNotePanel({ shipment }: { shipment: StaffShipment }) {
  const addInternalNote = useAddInternalNote(shipment.trackingNumber);
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!message.trim()) {
      setValidationError(true);
      return;
    }

    setValidationError(false);
    // The author is derived from the bearer token server-side — never sent in the body.
    addInternalNote.mutate({ message: message.trim() }, { onSuccess: () => setMessage("") });
  };

  return (
    <CollapsiblePanel
      icon={StickyNote}
      title="Add internal note"
      subtitle="Staff only — never shown on the public tracking page"
      tone="cta"
    >
      {({ close }) => (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="internal-note" className="mb-1.5 block text-sm font-medium text-text">
              Note
            </label>
            <textarea
              id="internal-note"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                if (validationError) setValidationError(false);
                addInternalNote.reset();
              }}
              rows={3}
              placeholder="Add context for other staff members..."
              className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {validationError && (
            <p role="alert" className="text-sm text-danger">
              Enter a note before saving.
            </p>
          )}
          {addInternalNote.isError && (
            <p role="alert" className="text-sm text-danger">
              {addInternalNote.error instanceof ApiError
                ? addInternalNote.error.message
                : "Something went wrong saving this note. Please try again."}
            </p>
          )}
          {addInternalNote.isSuccess && <p className="text-sm text-success">Note added.</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="cta" loading={addInternalNote.isPending} disabled={addInternalNote.isPending}>
              Add note
            </Button>
          </div>
        </form>
      )}
    </CollapsiblePanel>
  );
}

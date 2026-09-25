"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { StickyNote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { useAppData } from "@/providers/AppDataProvider";
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import type { Shipment } from "@/types";

type SaveState = "idle" | "saving" | "success" | "error";

export function AddInternalNotePanel({ shipment }: { shipment: Shipment }) {
  const { addInternalNote } = useAppData();
  const { email } = useStaffAuth();
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SaveState>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!message.trim()) {
      setState("error");
      return;
    }

    setState("saving");
    await addInternalNote(shipment.trackingNumber, message.trim(), email ?? "Staff");
    setState("success");
    setMessage("");
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
                if (state === "error") setState("idle");
              }}
              rows={3}
              placeholder="Add context for other staff members..."
              className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {state === "error" && (
            <p role="alert" className="text-sm text-danger">
              Enter a note before saving.
            </p>
          )}
          {state === "success" && <p className="text-sm text-success">Note added.</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="cta" loading={state === "saving"} disabled={state === "saving"}>
              Add note
            </Button>
          </div>
        </form>
      )}
    </CollapsiblePanel>
  );
}

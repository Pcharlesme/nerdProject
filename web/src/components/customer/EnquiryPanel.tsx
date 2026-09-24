"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Mail, MessageCircleQuestion, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CollapsiblePanel } from "@/components/ui/CollapsiblePanel";
import { useAppData } from "@/providers/AppDataProvider";
import { ENQUIRY_CATEGORIES } from "@/types";
import type { EnquiryCategory } from "@/types";

interface EnquiryPanelProps {
  /** Pre-filled when the customer already searched a tracking number; left blank otherwise. */
  trackingNumber?: string | null;
}

type SubmitState = "idle" | "submitting" | "success" | "error";

export function EnquiryPanel({ trackingNumber }: EnquiryPanelProps) {
  const { submitEnquiry } = useAppData();
  const [trackingInput, setTrackingInput] = useState(trackingNumber ?? "");
  const [category, setCategory] = useState<EnquiryCategory>(ENQUIRY_CATEGORIES[0].value);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SubmitState>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trackingInput.trim() || !message.trim()) {
      setState("error");
      return;
    }

    setState("submitting");
    await submitEnquiry({
      trackingNumber: trackingInput.trim(),
      category,
      message: message.trim(),
      contactEmail: email.trim() || undefined,
    });
    setState("success");
    setMessage("");
    setEmail("");
  };

  return (
    <div className="w-full max-w-2xl">
      <CollapsiblePanel
        icon={MessageCircleQuestion}
        title="Something not right?"
        subtitle="Send us an enquiry about this shipment"
      >
        {({ close }) =>
          state === "success" ? (
            <div className="flex items-center gap-3 py-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
                <Send className="size-4" aria-hidden="true" />
              </span>
              <p className="text-sm text-text">
                Thanks — we&apos;ve received your enquiry and will get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="enquiry-tracking" className="mb-1.5 block text-sm font-medium text-text">
                    Tracking number
                  </label>
                  <input
                    id="enquiry-tracking"
                    value={trackingInput}
                    onChange={(event) => setTrackingInput(event.target.value)}
                    placeholder="e.g. TRK-DEMO-001"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label htmlFor="enquiry-category" className="mb-1.5 block text-sm font-medium text-text">
                    What&apos;s this about?
                  </label>
                  <select
                    id="enquiry-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value as EnquiryCategory)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {ENQUIRY_CATEGORIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="enquiry-email" className="mb-1.5 block text-sm font-medium text-text">
                  Contact email <span className="font-normal text-muted">(optional)</span>
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                  <input
                    id="enquiry-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="enquiry-message" className="mb-1.5 block text-sm font-medium text-text">
                  Message
                </label>
                <textarea
                  id="enquiry-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={3}
                  required
                  aria-required="true"
                  className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {state === "error" && (
                <p role="alert" className="text-sm text-danger">
                  Enter your tracking number and a message before sending.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" loading={state === "submitting"} disabled={state === "submitting"}>
                  Send enquiry
                </Button>
              </div>
            </form>
          )
        }
      </CollapsiblePanel>
    </div>
  );
}

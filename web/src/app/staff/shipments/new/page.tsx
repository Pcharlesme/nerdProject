"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/InfoField";
import { useAppData } from "@/providers/AppDataProvider";
import { generateTrackingNumber } from "@/constant/mockData";
import type { CreateShipmentInput } from "@/types";

const REQUIRED_LABELS: Record<string, string> = {
  trackingNumber: "Tracking number",
  originCity: "Origin city",
  destinationCity: "Destination city",
  currentLocation: "Current location",
  estimatedDeliveryAt: "Estimated delivery",
  referenceCode: "Reference",
  senderName: "Sender name",
  receiverName: "Receiver name",
};

interface FormState {
  trackingNumber: string;
  originCity: string;
  originRegion: string;
  destinationCity: string;
  destinationRegion: string;
  currentLocation: string;
  estimatedDeliveryAt: string;
  serviceLevel: string;
  packageCount: string;
  weightKg: string;
  referenceCode: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  receiverAddress: string;
}

const INITIAL_STATE: FormState = {
  trackingNumber: generateTrackingNumber(),
  originCity: "",
  originRegion: "",
  destinationCity: "",
  destinationRegion: "",
  currentLocation: "",
  estimatedDeliveryAt: "",
  serviceLevel: "Standard",
  packageCount: "1",
  weightKg: "1",
  referenceCode: "",
  senderName: "",
  senderEmail: "",
  senderPhone: "",
  senderAddress: "",
  receiverName: "",
  receiverEmail: "",
  receiverPhone: "",
  receiverAddress: "",
};

type SaveState = "idle" | "saving" | "error";

export default function CreateShipmentPage() {
  const router = useRouter();
  const { createShipment } = useAppData();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [missing, setMissing] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<SaveState>("idle");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredKeys: (keyof typeof REQUIRED_LABELS)[] = [
      "trackingNumber",
      "originCity",
      "destinationCity",
      "currentLocation",
      "estimatedDeliveryAt",
      "referenceCode",
      "senderName",
      "receiverName",
    ];
    const missingFields = requiredKeys.filter((key) => !form[key as keyof FormState].trim());
    setMissing(missingFields);
    setError(null);
    if (missingFields.length > 0) return;

    const input: CreateShipmentInput = {
      trackingNumber: form.trackingNumber.trim(),
      originCity: form.originCity.trim(),
      originRegion: form.originRegion.trim(),
      destinationCity: form.destinationCity.trim(),
      destinationRegion: form.destinationRegion.trim(),
      currentLocation: form.currentLocation.trim(),
      estimatedDeliveryAt: new Date(form.estimatedDeliveryAt).toISOString(),
      serviceLevel: form.serviceLevel.trim() || "Standard",
      packageCount: Math.max(1, Number(form.packageCount) || 1),
      weightKg: Math.max(0.1, Number(form.weightKg) || 0.1),
      referenceCode: form.referenceCode.trim(),
      sender: {
        name: form.senderName.trim(),
        email: form.senderEmail.trim() || undefined,
        phone: form.senderPhone.trim() || undefined,
        address: form.senderAddress.trim() || undefined,
      },
      receiver: {
        name: form.receiverName.trim(),
        email: form.receiverEmail.trim() || undefined,
        phone: form.receiverPhone.trim() || undefined,
        address: form.receiverAddress.trim() || undefined,
      },
    };

    setState("saving");
    const result = await createShipment(input);

    if (!result.success || !result.shipment) {
      setState("error");
      setError(result.error ?? "Something went wrong creating this shipment.");
      return;
    }

    router.push(`/staff/shipments/${result.shipment.trackingNumber}`);
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-3xl px-5 py-6 lg:px-8">
        <Link
          href="/staff/shipments"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-text"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to shipments
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-primary">Operations</p>
          <h1 className="mt-1 text-2xl font-semibold text-text">Create shipment</h1>
          <p className="mt-1 text-sm text-muted">Fields marked with * are required.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-8">
          <section className="space-y-4 rounded-xl border border-border bg-surface p-5 sm:p-6">
            <SectionLabel>Shipment</SectionLabel>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Tracking number"
                required
                value={form.trackingNumber}
                onChange={(v) => set("trackingNumber", v)}
                missing={missing.includes("trackingNumber")}
              />
              <Field
                label="Reference"
                required
                value={form.referenceCode}
                onChange={(v) => set("referenceCode", v)}
                placeholder="e.g. PO-10234"
                missing={missing.includes("referenceCode")}
              />
              <Field
                label="Origin city"
                required
                value={form.originCity}
                onChange={(v) => set("originCity", v)}
                missing={missing.includes("originCity")}
              />
              <Field label="Origin region" value={form.originRegion} onChange={(v) => set("originRegion", v)} />
              <Field
                label="Destination city"
                required
                value={form.destinationCity}
                onChange={(v) => set("destinationCity", v)}
                missing={missing.includes("destinationCity")}
              />
              <Field
                label="Destination region"
                value={form.destinationRegion}
                onChange={(v) => set("destinationRegion", v)}
              />
              <Field
                label="Current location"
                required
                value={form.currentLocation}
                onChange={(v) => set("currentLocation", v)}
                missing={missing.includes("currentLocation")}
              />
              <Field
                label="Estimated delivery"
                required
                type="datetime-local"
                value={form.estimatedDeliveryAt}
                onChange={(v) => set("estimatedDeliveryAt", v)}
                missing={missing.includes("estimatedDeliveryAt")}
              />
              <Field label="Service level" value={form.serviceLevel} onChange={(v) => set("serviceLevel", v)} />
              <Field
                label="Package count"
                type="number"
                value={form.packageCount}
                onChange={(v) => set("packageCount", v)}
              />
              <Field label="Weight (kg)" type="number" value={form.weightKg} onChange={(v) => set("weightKg", v)} />
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border bg-surface p-5 sm:p-6">
            <SectionLabel>Sender</SectionLabel>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Name"
                required
                value={form.senderName}
                onChange={(v) => set("senderName", v)}
                missing={missing.includes("senderName")}
              />
              <Field label="Email" type="email" value={form.senderEmail} onChange={(v) => set("senderEmail", v)} />
              <Field label="Phone" value={form.senderPhone} onChange={(v) => set("senderPhone", v)} />
              <Field label="Address" value={form.senderAddress} onChange={(v) => set("senderAddress", v)} />
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border bg-surface p-5 sm:p-6">
            <SectionLabel>Receiver</SectionLabel>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Name"
                required
                value={form.receiverName}
                onChange={(v) => set("receiverName", v)}
                missing={missing.includes("receiverName")}
              />
              <Field
                label="Email"
                type="email"
                value={form.receiverEmail}
                onChange={(v) => set("receiverEmail", v)}
              />
              <Field label="Phone" value={form.receiverPhone} onChange={(v) => set("receiverPhone", v)} />
              <Field label="Address" value={form.receiverAddress} onChange={(v) => set("receiverAddress", v)} />
            </div>
          </section>

          {missing.length > 0 && (
            <p role="alert" className="text-sm text-danger">
              Fill in: {missing.map((key) => REQUIRED_LABELS[key]).join(", ")}.
            </p>
          )}

          {state === "error" && error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link
              href="/staff/shipments"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-text transition-colors hover:bg-background"
            >
              Cancel
            </Link>
            <Button type="submit" variant="cta" size="lg" loading={state === "saving"} disabled={state === "saving"}>
              Create shipment
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  missing = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  missing?: boolean;
  placeholder?: string;
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
        placeholder={placeholder}
        aria-invalid={missing ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`h-10 w-full rounded-md border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          missing ? "border-danger" : "border-border"
        }`}
      />
    </div>
  );
}

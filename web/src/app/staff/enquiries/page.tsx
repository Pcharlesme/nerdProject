"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  MapPinned,
  MessageCircle,
  PackageMinus,
  RotateCcw,
} from "lucide-react";
import { useAppData } from "@/providers/AppDataProvider";
import { formatDateTime } from "@/lib/formatDate";
import { ENQUIRY_CATEGORIES } from "@/types";
import type { Enquiry, EnquiryCategory, EnquiryStatus } from "@/types";

const CATEGORY_ICON: Record<EnquiryCategory, typeof Clock> = {
  DELAY: Clock,
  DAMAGE: AlertTriangle,
  ADDRESS_CHANGE: MapPinned,
  MISSING_ITEM: PackageMinus,
  OTHER: MessageCircle,
};

const CATEGORY_LABEL: Record<EnquiryCategory, string> = Object.fromEntries(
  ENQUIRY_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<EnquiryCategory, string>;

type FilterState = EnquiryStatus | "ALL";

export default function StaffEnquiriesPage() {
  const { enquiries } = useAppData();
  const [filter, setFilter] = useState<FilterState>("OPEN");

  const filtered = enquiries.filter((e) => filter === "ALL" || e.status === filter);
  const openCount = enquiries.filter((e) => e.status === "OPEN").length;

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-4xl px-5 py-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-primary">Operations</p>
          <h1 className="mt-1 text-2xl font-semibold text-text sm:text-3xl">Customer enquiries</h1>
          <p className="mt-1 text-sm text-muted">
            {openCount === 0 ? "Nothing waiting on you right now." : `${openCount} open, waiting on a response.`}
          </p>
        </div>

        <div className="mb-4 flex gap-1 rounded-lg border border-border bg-surface p-1 text-sm">
          {(["OPEN", "RESOLVED", "ALL"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`flex-1 cursor-pointer rounded-md px-3 py-2 font-medium transition-colors ${
                filter === option ? "bg-cta text-on-primary" : "text-muted hover:bg-background hover:text-text"
              }`}
            >
              {option === "ALL" ? "All" : option === "OPEN" ? "Open" : "Resolved"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-5 py-16 text-center">
            <Inbox className="mx-auto size-8 text-muted" aria-hidden="true" />
            <p className="mt-3 font-medium text-text">No enquiries here</p>
            <p className="mt-1 text-sm text-muted">Try a different filter.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((enquiry) => (
              <EnquiryRow key={enquiry.id} enquiry={enquiry} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function EnquiryRow({ enquiry }: { enquiry: Enquiry }) {
  const { setEnquiryStatus } = useAppData();
  const [isSaving, setIsSaving] = useState(false);
  const CategoryIcon = CATEGORY_ICON[enquiry.category];
  const isOpen = enquiry.status === "OPEN";

  const handleToggle = async () => {
    setIsSaving(true);
    await setEnquiryStatus(enquiry.id, isOpen ? "RESOLVED" : "OPEN");
    setIsSaving(false);
  };

  return (
    <li className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CategoryIcon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-text">{CATEGORY_LABEL[enquiry.category]}</p>
            <Link
              href={`/staff/shipments/${enquiry.trackingNumber}`}
              className="font-mono text-xs text-cta hover:underline"
            >
              {enquiry.trackingNumber}
            </Link>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
            isOpen ? "border-warning-border bg-warning-bg text-warning" : "border-success-border bg-success-bg text-success"
          }`}
        >
          {isOpen ? <Clock className="size-3" aria-hidden="true" /> : <CheckCircle2 className="size-3" aria-hidden="true" />}
          {isOpen ? "Open" : "Resolved"}
        </span>
      </div>

      <p className="mt-3 text-sm text-text">{enquiry.message}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {enquiry.contactEmail && <span className="font-mono">{enquiry.contactEmail}</span>}
          {enquiry.contactEmail && " · "}
          {formatDateTime(enquiry.createdAt)}
        </p>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isSaving}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-text transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : isOpen ? (
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
          ) : (
            <RotateCcw className="size-3.5" aria-hidden="true" />
          )}
          {isOpen ? "Mark resolved" : "Reopen"}
        </button>
      </div>
    </li>
  );
}

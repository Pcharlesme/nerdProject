import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { StatusTone } from "@/lib/shipmentStatus";

const TONE_CLASSES: Record<StatusTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
};

interface SummaryCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: StatusTone;
  href?: string;
}

export function SummaryCard({ label, value, icon: Icon, tone = "primary", href }: SummaryCardProps) {
  const content = (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors group-hover:border-primary/30">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[tone]}`}>
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-1 text-xl font-semibold text-text">{value}</p>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="group block focus-visible:outline-2 focus-visible:outline-primary rounded-xl">
      {content}
    </Link>
  );
}

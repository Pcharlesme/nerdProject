"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface CollapsiblePanelProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  /** "primary" (brand indigo) for customer-facing usage; "cta" (navy) for staff. */
  tone?: "primary" | "cta";
  children: ReactNode | ((controls: { close: () => void }) => ReactNode);
}

const TONE_CLASSES = {
  primary: { hover: "hover:border-primary/40 hover:bg-primary/5", icon: "bg-primary/10 text-primary", chevron: "group-hover:text-primary" },
  cta: { hover: "hover:border-cta/40 hover:bg-cta-soft", icon: "bg-cta/10 text-cta", chevron: "group-hover:text-cta" },
} as const;

/** A trigger row that expands into an inline panel — the shared "no dialogs" interaction pattern. */
export function CollapsiblePanel({ icon: Icon, title, subtitle, defaultOpen = false, tone = "primary", children }: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const toneClasses = TONE_CLASSES[tone];

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface px-5 py-4 text-left shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary ${toneClasses.hover}`}
      >
        <span className="flex items-center gap-3">
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${toneClasses.icon}`}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-text">{title}</span>
            <span className="block text-xs text-muted">{subtitle}</span>
          </span>
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-muted transition-transform ${toneClasses.chevron} ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">
              {typeof children === "function" ? children({ close: () => setOpen(false) }) : children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

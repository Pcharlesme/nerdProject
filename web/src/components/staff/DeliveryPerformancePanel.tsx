"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Calendar, Maximize2, X } from "lucide-react";
import { useDeliveryPerformance } from "@/hooks/useDeliveryPerformance";
import { DeliveryPerformanceChart } from "./DeliveryPerformanceChart";
import { PerformanceCalendar } from "./PerformanceCalendar";

export function DeliveryPerformancePanel({ title = "Delivery performance" }: { title?: string }) {
  const { data, isLoading, isError } = useDeliveryPerformance();
  const days = data?.days ?? [];
  const defaultHighlightDate = days[days.length - 1]?.date;

  const [highlightDate, setHighlightDate] = useState<string | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calendarOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCalendarOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [calendarOpen]);

  useEffect(() => {
    if (!expanded) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [expanded]);

  const activeHighlight = highlightDate ?? defaultHighlightDate;

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-text">{title}</h2>
        <div className="flex items-center gap-2">
          <div ref={calendarRef} className="relative">
            <button
              type="button"
              onClick={() => setCalendarOpen((value) => !value)}
              aria-label="Choose a date to view"
              aria-expanded={calendarOpen}
              disabled={!data}
              className={`flex size-9 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                calendarOpen ? "border-text bg-cta text-white" : "border-border text-muted hover:border-cta/30 hover:text-cta"
              }`}
            >
              <Calendar className="size-4" aria-hidden="true" />
            </button>

            <AnimatePresence>
              {calendarOpen && data && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 z-20"
                >
                  <PerformanceCalendar
                    availableDates={data.availableDates}
                    selected={activeHighlight ?? data.availableDates[data.availableDates.length - 1] ?? ""}
                    onSelect={(date) => {
                      setHighlightDate(date);
                      setCalendarOpen(false);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Expand chart"
            disabled={!data}
            className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-cta/30 hover:text-cta disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Maximize2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-6">
        {isError ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-sm text-danger">
            <AlertCircle className="size-6" aria-hidden="true" />
            Couldn&apos;t load delivery performance.
          </div>
        ) : isLoading ? (
          <ChartSkeleton />
        ) : (
          <DeliveryPerformanceChart days={days} highlightDate={activeHighlight} />
        )}
      </div>

      <AnimatePresence>
        {expanded && data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setExpanded(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} — expanded`}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-5"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              onClick={(event: React.MouseEvent) => event.stopPropagation()}
              className="w-full max-w-3xl rounded-2xl border border-border bg-surface p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-text">{title}</h2>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label="Close"
                  className="flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-text"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6">
                <DeliveryPerformanceChart days={days} highlightDate={activeHighlight} className="h-96" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ChartSkeleton() {
  return (
    <div role="status" className="flex h-64 items-end gap-2 sm:gap-3" aria-label="Loading delivery performance">
      {Array.from({ length: 14 }).map((_, index) => (
        <div
          key={index}
          className="flex-1 animate-pulse rounded-t-md bg-background"
          style={{ height: `${30 + ((index * 17) % 60)}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

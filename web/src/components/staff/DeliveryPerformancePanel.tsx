"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Calendar, Maximize2, X } from "lucide-react";
import { DELIVERY_PERFORMANCE_DATA, DEFAULT_HIGHLIGHT_DATE, DeliveryPerformanceChart } from "./DeliveryPerformanceChart";
import { PerformanceCalendar } from "./PerformanceCalendar";

const AVAILABLE_DATES = DELIVERY_PERFORMANCE_DATA.map((d) => d.date);

export function DeliveryPerformancePanel({ title = "Delivery performance" }: { title?: string }) {
  const [highlightDate, setHighlightDate] = useState(DEFAULT_HIGHLIGHT_DATE);
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
              className={`flex size-9 items-center justify-center rounded-full border transition-colors ${
                calendarOpen ? "border-text bg-text text-white" : "border-border text-muted hover:border-text/30 hover:text-text"
              }`}
            >
              <Calendar className="size-4" aria-hidden="true" />
            </button>

            <AnimatePresence>
              {calendarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-11 z-20"
                >
                  <PerformanceCalendar
                    availableDates={AVAILABLE_DATES}
                    selected={highlightDate}
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
            className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-text/30 hover:text-text"
          >
            <Maximize2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <DeliveryPerformanceChart highlightDate={highlightDate} />
      </div>

      <AnimatePresence>
        {expanded && (
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
                <DeliveryPerformanceChart highlightDate={highlightDate} className="h-96" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

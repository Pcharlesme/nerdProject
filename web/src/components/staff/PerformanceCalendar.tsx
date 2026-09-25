"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

interface PerformanceCalendarProps {
  availableDates: string[];
  selected: string;
  onSelect: (date: string) => void;
}

/** A real month calendar — dates outside the mocked data range are shown, not hidden, but disabled. */
export function PerformanceCalendar({ availableDates, selected, onSelect }: PerformanceCalendarProps) {
  const available = useMemo(() => new Set(availableDates), [availableDates]);
  const [viewedMonth, setViewedMonth] = useState(() => {
    const [year, month] = selected.split("-").map(Number);
    return new Date(year, month - 1, 1);
  });

  const year = viewedMonth.getFullYear();
  const month = viewedMonth.getMonth();
  const monthLabel = viewedMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const leadingBlanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const hasAnyAvailableThisMonth = cells.some((day) => day !== null && available.has(toIso(year, month, day)));

  const goToMonth = (delta: number) => setViewedMonth(new Date(year, month + delta, 1));

  return (
    <div className="w-72 rounded-2xl border border-border bg-surface p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToMonth(-1)}
          aria-label="Previous month"
          className="flex size-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-text"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <p className="text-sm font-semibold text-text">{monthLabel}</p>
        <button
          type="button"
          onClick={() => goToMonth(1)}
          aria-label="Next month"
          className="flex size-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-text"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />;

          const iso = toIso(year, month, day);
          const isAvailable = available.has(iso);
          const isSelected = iso === selected;

          return (
            <button
              key={iso}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelect(iso)}
              aria-label={isAvailable ? `${iso} — view this day` : `${iso} — no performance data`}
              className={`flex size-9 items-center justify-center rounded-full text-sm transition-colors ${
                isSelected
                  ? "bg-text font-semibold text-white"
                  : isAvailable
                    ? "text-text hover:bg-background"
                    : "cursor-not-allowed text-border"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {!hasAnyAvailableThisMonth && (
        <p className="mt-3 border-t border-border pt-3 text-center text-xs text-muted">
          No performance data for {monthLabel}.
        </p>
      )}
    </div>
  );
}

import { formatDateShort } from "@/lib/formatDate";

// Mocked on-time delivery rate for the last 14 days — illustrative only, not derived
// from the (tiny) seed dataset. ISO dates so the calendar picker can reason about
// which days actually have data.
export const DELIVERY_PERFORMANCE_DATA = [
  { date: "2026-09-12", value: 62 },
  { date: "2026-09-13", value: 71 },
  { date: "2026-09-14", value: 58 },
  { date: "2026-09-15", value: 80 },
  { date: "2026-09-16", value: 74 },
  { date: "2026-09-17", value: 66 },
  { date: "2026-09-18", value: 85 },
  { date: "2026-09-19", value: 90 },
  { date: "2026-09-20", value: 77 },
  { date: "2026-09-21", value: 69 },
  { date: "2026-09-22", value: 82 },
  { date: "2026-09-23", value: 88 },
  { date: "2026-09-24", value: 73 },
  { date: "2026-09-25", value: 94 },
];

export const DEFAULT_HIGHLIGHT_DATE = DELIVERY_PERFORMANCE_DATA[DELIVERY_PERFORMANCE_DATA.length - 1].date;

function shortLabel(iso: string) {
  return formatDateShort(iso).replace(/ \d{4}$/, "");
}

interface DeliveryPerformanceChartProps {
  /** ISO date (yyyy-mm-dd) of the bar to highlight — defaults to the most recent day. */
  highlightDate?: string;
  className?: string;
}

export function DeliveryPerformanceChart({ highlightDate = DEFAULT_HIGHLIGHT_DATE, className = "" }: DeliveryPerformanceChartProps) {
  return (
    <div className={`flex gap-3 ${className || "h-64"}`}>
      <div className="flex h-full flex-col justify-between pb-6 text-right text-xs text-muted">
        <span>100%</span>
        <span>50%</span>
        <span>0%</span>
      </div>

      <div className="relative flex-1 border-l border-border pl-4">
        <div className="pointer-events-none absolute inset-x-4 top-0 h-full">
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-border" />
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-border" />
        </div>

        <div className="flex h-full items-end gap-2 sm:gap-3">
          {DELIVERY_PERFORMANCE_DATA.map((day) => {
            const isHighlight = day.date === highlightDate;
            return (
              <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                {isHighlight && (
                  <span className="mb-1 whitespace-nowrap text-xs font-semibold text-text">{shortLabel(day.date)}</span>
                )}
                <div
                  className={`w-full rounded-t-md transition-colors ${isHighlight ? "bg-text" : "bg-text/10"}`}
                  style={{ height: `${day.value}%` }}
                  title={`${shortLabel(day.date)}: ${day.value}% on-time`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

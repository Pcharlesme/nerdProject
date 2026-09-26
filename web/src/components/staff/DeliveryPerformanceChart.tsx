import { formatDateShort } from "@/lib/formatDate";
import type { DeliveryPerformanceDay } from "@/types";

function shortLabel(iso: string) {
  return formatDateShort(iso).replace(/ \d{4}$/, "");
}

interface DeliveryPerformanceChartProps {
  days: DeliveryPerformanceDay[];
  /** ISO date (yyyy-mm-dd) of the bar to highlight — defaults to the most recent day. */
  highlightDate?: string;
  className?: string;
}

export function DeliveryPerformanceChart({
  days,
  highlightDate,
  className = "",
}: DeliveryPerformanceChartProps) {
  const activeDate = highlightDate ?? days[days.length - 1]?.date;
  

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
          {days.map((day) => {
            const isHighlight = day.date === activeDate;
            const hasData = day.onTimeRate !== null;
            
            return (
              <div
                key={day.date}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                {isHighlight && (
                  <span className="mb-1 whitespace-nowrap text-xs font-semibold text-text">
                    {shortLabel(day.date)}
                  </span>
                )}
                <div
                  className={`w-full rounded-t-md transition-colors ${
                    !hasData
                      ? "bg-border/70"
                      : isHighlight 
                        ? "bg-cta"
                        : "bg-cta/20 border-blue-400"
                  }`}
                  style={{ height: `${hasData ? day.onTimeRate : 2}%` }}
                  title={
                    hasData
                      ? `${shortLabel(day.date)}: ${day.onTimeRate}% on-time (${day.onTime}/${day.delivered} delivered)`
                      : `${shortLabel(day.date)}: no deliveries`
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

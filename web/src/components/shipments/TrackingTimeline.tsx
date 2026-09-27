import { formatDateTime } from "@/lib/formatDate";
import { eventIcon } from "@/lib/shipmentStatus";
import type { TrackingEvent } from "@/types";

interface TrackingTimelineProps {
  events: TrackingEvent[];
  emptyMessage?: string;
}

export function TrackingTimeline({
  events,
  emptyMessage = "No tracking events yet.",
}: TrackingTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background px-4 py-5 text-center">
        <p className="text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  const latestEvent = events[events.length - 1];
  const timeline = [...events].reverse();

  return (
    <div className="relative mt-5">
      {/* Timeline connector */}
      <div
        className="absolute bottom-5 left-7 top-5 w-px bg-primary"
        aria-hidden="true"
      />

      <ol className="relative space-y-2">
        {timeline.map((event) => {
          const isLatest = event.id === latestEvent.id;
          const Icon = eventIcon(event);

          return (
            <li
              key={event.id}
              className={`relative flex gap-4 rounded-xl p-3 transition-colors ${
                isLatest ? "bg-primary/4 " : ""
              }`}
            >
              {/* Event icon */}
              <div
                className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border ${
                  isLatest
                    ? "border-primary bg-primary text-on-primary shadow-sm "
                    : "border-primary bg-surface text-muted"
                }`}
              >
                <Icon
                  className={isLatest ? "size-4" : "size-3.5"}
                  aria-hidden="true"
                />
              </div>

              {/* Event content */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-sm ${
                      isLatest
                        ? "font-semibold text-text"
                        : "font-medium text-text"
                    }`}
                  >
                    {event.message}
                  </p>

                  {isLatest && (
                    <span className="rounded-xs bg-primary/10 px-2 py-0.5 text-[12px] mx-2 font-semibold text-primary">
                      Latest
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                  <span>{formatDateTime(event.occurredAt)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

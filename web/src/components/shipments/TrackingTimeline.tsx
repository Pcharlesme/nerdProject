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
    return <p className="mt-3 text-sm text-muted">{emptyMessage}</p>;
  }

  const latestEvent = events[events.length - 1];
  const timeline = [...events].reverse();

  return (
    <div className="relative mt-4">
      <div className="absolute bottom-1 left-4 top-1 w-px bg-border" aria-hidden="true" />
      <ol className="relative space-y-5">
        {timeline.map((event) => {
          const isLatest = event.id === latestEvent.id;
          const Icon = eventIcon(event);
          return (
            <li key={event.id} className="flex gap-4">
              <div
                className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  isLatest ? "border-primary bg-primary text-on-primary" : "border-border bg-surface text-muted"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-text">
                  {event.message}
                  {isLatest && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Latest
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {formatDateTime(event.occurredAt)} · {event.location}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

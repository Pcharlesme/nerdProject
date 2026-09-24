import { BADGE_TONE_CLASSES, STATUS_ICON, STATUS_LABEL, STATUS_TONE } from "@/lib/shipmentStatus";
import type { ShipmentStatus } from "@/types";

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const Icon = STATUS_ICON[status];
  const isLive = status === "IN_TRANSIT";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-sm font-medium ${BADGE_TONE_CLASSES[STATUS_TONE[status]]}`}
    >
      <span className="relative flex size-2" aria-hidden="true">
        {isLive && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75 motion-reduce:hidden" />
        )}
        <span className="relative inline-flex size-2 rounded-full bg-current" />
      </span>
      <Icon className="size-3.5" aria-hidden="true" />
      {STATUS_LABEL[status]}
      {isLive && <span className="sr-only"> — updating live</span>}
    </span>
  );
}

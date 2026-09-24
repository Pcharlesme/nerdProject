import { CORE_STEPS, NODE_TONE_CLASSES, STATUS_ICON, STATUS_TONE, getCoreStepIndex } from "@/lib/shipmentStatus";
import type { Shipment } from "@/types";

export function StatusStepper({ shipment }: { shipment: Pick<Shipment, "status" | "events"> }) {
  const currentIndex = getCoreStepIndex(shipment);
  const tone = STATUS_TONE[shipment.status];
  const CurrentIcon = STATUS_ICON[shipment.status];

  return (
    <div role="group" aria-label="Shipment progress" className="flex">
      {CORE_STEPS.map((step, index) => {
        const StepIcon = STATUS_ICON[step.status];
        const isCurrent = index === currentIndex;
        const isDone = index < currentIndex;

        // The current node always mirrors the shipment's real status (colour + icon) —
        // past/upcoming nodes just mark the generic stage, in a neutral ink/border tone.
        const nodeClasses = isCurrent
          ? NODE_TONE_CLASSES[tone]
          : isDone
            ? "border-text bg-text text-white"
            : "border-border bg-surface text-muted";

        return (
          <div key={step.status} className="relative flex flex-1 flex-col items-center">
            {index > 0 && (
              <div
                className={`absolute top-4 h-0.5 ${index <= currentIndex ? "bg-text" : "bg-border"}`}
                style={{ left: "-50%", right: "50%" }}
                aria-hidden="true"
              />
            )}
            <div
              aria-current={isCurrent ? "step" : undefined}
              className={`relative z-10 flex size-8 items-center justify-center rounded-full border-2 transition-colors ${nodeClasses}`}
            >
              {isCurrent ? (
                <CurrentIcon className="size-4" aria-hidden="true" />
              ) : (
                <StepIcon className="size-4" aria-hidden="true" />
              )}
            </div>
            <span
              className={`sr-only mt-2 text-center text-xs font-medium sm:not-sr-only ${isCurrent || isDone ? "text-text" : "text-muted"}`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

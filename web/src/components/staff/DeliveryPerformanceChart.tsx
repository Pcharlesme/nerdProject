// Mocked on-time delivery rate for the last 14 days — illustrative only, not derived
// from the (tiny) seed dataset. The last bar stands in for "today".
const DAILY_ON_TIME_RATE = [
  { label: "12 Sep", value: 62 },
  { label: "13 Sep", value: 71 },
  { label: "14 Sep", value: 58 },
  { label: "15 Sep", value: 80 },
  { label: "16 Sep", value: 74 },
  { label: "17 Sep", value: 66 },
  { label: "18 Sep", value: 85 },
  { label: "19 Sep", value: 90 },
  { label: "20 Sep", value: 77 },
  { label: "21 Sep", value: 69 },
  { label: "22 Sep", value: 82 },
  { label: "23 Sep", value: 88 },
  { label: "24 Sep", value: 73 },
  { label: "25 Sep", value: 94 },
];

const HIGHLIGHT_INDEX = DAILY_ON_TIME_RATE.length - 1;

export function DeliveryPerformanceChart() {
  return (
    <div className="flex h-64 gap-3">
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
          {DAILY_ON_TIME_RATE.map((day, index) => {
            const isHighlight = index === HIGHLIGHT_INDEX;
            return (
              <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                {isHighlight && (
                  <span className="mb-1 whitespace-nowrap text-xs font-semibold text-text">{day.label}</span>
                )}
                <div
                  className={`w-full rounded-t-md transition-colors ${isHighlight ? "bg-text" : "bg-primary/15"}`}
                  style={{ height: `${day.value}%` }}
                  title={`${day.label}: ${day.value}% on-time`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

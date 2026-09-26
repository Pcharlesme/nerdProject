/** "23 Sep 2026, 14:05" — used wherever a full timestamp is shown (timelines, notes, enquiries). */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "23 Sep 2026" — used in compact contexts like table columns. */
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "Thursday, 23 Sep 2026" — date only, no time. Used where the time would just
 * repeat what's already shown elsewhere on the same screen (e.g. the tracking
 * status display), so only the day matters here. */
export function formatDateWithWeekday(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

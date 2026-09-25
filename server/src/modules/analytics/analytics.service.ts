import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { DEFAULT_RANGE_DAYS, MAX_RANGE_DAYS } from "./analytics.schemas";

const DAY_MS = 24 * 60 * 60 * 1000;

const toIsoDay = (date: Date) => date.toISOString().slice(0, 10);
const parseIsoDay = (value: string) => new Date(`${value}T00:00:00.000Z`);

function resolveRange(from?: string, to?: string) {
  const end = to ? parseIsoDay(to) : parseIsoDay(toIsoDay(new Date()));
  const start = from ? parseIsoDay(from) : new Date(end.getTime() - (DEFAULT_RANGE_DAYS - 1) * DAY_MS);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw AppError.validation("The date range is invalid.");
  }
  const days = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
  if (days < 1)
    throw AppError.validation("from must be on or before to.", [
      { field: "from", message: "from must be on or before to" },
    ]);
  if (days > MAX_RANGE_DAYS) {
    throw AppError.validation(`The date range can span at most ${MAX_RANGE_DAYS} days.`, [
      { field: "from", message: `Range is limited to ${MAX_RANGE_DAYS} days` },
    ]);
  }
  return { start, end, days };
}

const rate = (onTime: number, delivered: number) => (delivered === 0 ? null : Math.round((onTime / delivered) * 100));

// On time = the delivered event happened no later than the shipment's (latest) estimated delivery.
export async function getDeliveryPerformance(from?: string, to?: string) {
  const { start, end, days } = resolveRange(from, to);

  const [deliveries, datesWithData] = await Promise.all([
    prisma.trackingEvent.findMany({
      where: { status: "DELIVERED", occurredAt: { gte: start, lt: new Date(end.getTime() + DAY_MS) } },
      select: { occurredAt: true, shipment: { select: { estimatedDeliveryAt: true } } },
    }),
    prisma.$queryRaw<{ day: Date }[]>`
      SELECT DISTINCT date_trunc('day', occurred_at AT TIME ZONE 'UTC') AS day
      FROM tracking_events WHERE status = 'DELIVERED'::"ShipmentStatus" ORDER BY day`,
  ]);

  const buckets = new Map<string, { delivered: number; onTime: number }>();
  for (let i = 0; i < days; i += 1)
    buckets.set(toIsoDay(new Date(start.getTime() + i * DAY_MS)), { delivered: 0, onTime: 0 });

  for (const event of deliveries) {
    const bucket = buckets.get(toIsoDay(event.occurredAt));
    if (!bucket) continue;
    bucket.delivered += 1;
    if (event.occurredAt <= event.shipment.estimatedDeliveryAt) bucket.onTime += 1;
  }

  const series = [...buckets].map(([date, { delivered, onTime }]) => ({
    date,
    delivered,
    onTime,
    onTimeRate: rate(onTime, delivered),
  }));
  const totalDelivered = series.reduce((sum, day) => sum + day.delivered, 0);
  const totalOnTime = series.reduce((sum, day) => sum + day.onTime, 0);

  return {
    from: toIsoDay(start),
    to: toIsoDay(end),
    days: series,
    summary: { delivered: totalDelivered, onTime: totalOnTime, onTimeRate: rate(totalOnTime, totalDelivered) },
    availableDates: datesWithData.map(({ day }) => toIsoDay(new Date(day))),
  };
}

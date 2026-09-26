import { beforeEach, describe, expect, it } from "vitest";
import type { Agent } from "supertest";
import { app, request, seed, signedInAgent } from "./support/helpers";

interface Day {
  date: string;
  delivered: number;
  onTime: number;
  onTimeRate: number | null;
}

describe("GET /api/staff/analytics/delivery-performance", () => {
  let agent: Agent;

  beforeEach(async () => {
    await seed();
    agent = await signedInAgent();
  });

  it("returns a daily on-time series for the last 14 days by default", async () => {
    const res = await agent.get("/api/staff/analytics/delivery-performance").expect(200);
    const { days, summary, availableDates } = res.body.data;

    expect(days).toHaveLength(14);
    expect(days.at(-1).date).toBe(new Date().toISOString().slice(0, 10));
    for (const day of days as Day[]) {
      expect(day.onTime).toBeLessThanOrEqual(day.delivered);
      expect(day.onTimeRate).toBe(day.delivered === 0 ? null : Math.round((day.onTime / day.delivered) * 100));
    }
    expect(summary.delivered).toBe((days as Day[]).reduce((sum, day) => sum + day.delivered, 0));
    expect(availableDates.length).toBeGreaterThan(0);
  });

  it("counts a delivery as late when it happens after the estimated delivery", async () => {
    const res = await agent.get("/api/staff/analytics/delivery-performance?from=2000-01-01&to=2000-03-31").expect(200);
    expect(res.body.data.summary).toEqual({ delivered: 0, onTime: 0, onTimeRate: null });

    const month = await agent
      .get(`/api/staff/analytics/delivery-performance?from=${daysAgo(29)}&to=${daysAgo(0)}`)
      .expect(200);
    const { delivered, onTime } = month.body.data.summary;
    expect(delivered).toBeGreaterThan(onTime);
    expect(onTime).toBeGreaterThan(0);
  });

  it("validates the date range", async () => {
    await agent.get("/api/staff/analytics/delivery-performance?from=25-09-2026").expect(422);
    await agent.get("/api/staff/analytics/delivery-performance?from=2026-09-20&to=2026-09-10").expect(422);
    await agent.get("/api/staff/analytics/delivery-performance?from=2026-01-01&to=2026-09-10").expect(422);
  });

  it("is staff-only", async () => {
    await request(app).get("/api/staff/analytics/delivery-performance").expect(401);
  });
});

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

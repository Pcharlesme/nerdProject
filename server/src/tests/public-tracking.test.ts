import { beforeEach, describe, expect, it } from "vitest";
import { app, request, seed } from "./support/helpers";

describe("GET /api/shipments/:trackingNumber", () => {
  beforeEach(seed);

  it("returns the public view of a shipment with its timeline in chronological order", async () => {
    const res = await request(app).get("/api/shipments/TRK-DEMO-001").expect(200);

    expect(res.body.data).toMatchObject({ trackingNumber: "TRK-DEMO-001", status: "IN_TRANSIT" });
    const times = res.body.data.events.map((event: { occurredAt: string }) => Date.parse(event.occurredAt));
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(res.body.data.events).toHaveLength(4);
  });

  it("never exposes internal notes, contact details or database ids", async () => {
    const res = await request(app).get("/api/shipments/TRK-DEMO-003").expect(200);

    expect(res.body.data).not.toHaveProperty("internalNotes");
    expect(res.body.data).not.toHaveProperty("notes");
    expect(res.body.data).not.toHaveProperty("sender");
    expect(res.body.data).not.toHaveProperty("receiver");
    expect(res.body.data).not.toHaveProperty("id");
    expect(JSON.stringify(res.body)).not.toContain("customs broker");
  });

  it("normalises the tracking number case", async () => {
    const res = await request(app).get("/api/shipments/trk-demo-002").expect(200);
    expect(res.body.data.status).toBe("DELIVERED");
  });

  it("returns a NOT_FOUND error for an unknown tracking number", async () => {
    const res = await request(app).get("/api/shipments/TRK-NOPE-999").expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("rejects a malformed tracking number with field-level details", async () => {
    const res = await request(app).get("/api/shipments/bad!!").expect(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details[0].field).toBe("trackingNumber");
  });
});

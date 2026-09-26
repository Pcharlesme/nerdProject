import { beforeEach, describe, expect, it } from "vitest";
import type { Agent } from "supertest";
import { app, request, seed, signedInAgent, validShipmentPayload } from "./support/helpers";
import { DEMO_STAFF_NAME } from "../seed/seed";

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

describe("staff shipment management", () => {
  let agent: Agent;

  beforeEach(async () => {
    await seed();
    agent = await signedInAgent();
  });

  describe("creating shipments", () => {
    it("creates a shipment with a generated tracking number and an initial CREATED event", async () => {
      const res = await agent.post("/api/staff/shipments").send(validShipmentPayload()).expect(201);

      expect(res.body.data.trackingNumber).toMatch(/^TRK-[A-Z0-9]{8}$/);
      expect(res.body.data.status).toBe("CREATED");
      expect(res.body.data.events).toHaveLength(1);
      expect(res.headers.location).toBe(`/api/staff/shipments/${res.body.data.trackingNumber}`);

      await request(app).get(`/api/shipments/${res.body.data.trackingNumber}`).expect(200);
    });

    it("accepts a supplied tracking number and rejects a duplicate with a conflict", async () => {
      await agent
        .post("/api/staff/shipments")
        .send(validShipmentPayload({ trackingNumber: "trk-unique-01" }))
        .expect(201);

      const res = await agent
        .post("/api/staff/shipments")
        .send(validShipmentPayload({ trackingNumber: "TRK-UNIQUE-01" }))
        .expect(409);

      expect(res.body.error.code).toBe("CONFLICT");
      expect(res.body.error.details).toEqual([{ field: "trackingNumber", message: expect.any(String) }]);
    });

    it("reports every missing required field", async () => {
      const res = await agent.post("/api/staff/shipments").send({ originCity: "Testford" }).expect(422);

      const fields = res.body.error.details.map((detail: { field: string }) => detail.field);
      expect(fields).toEqual(
        expect.arrayContaining([
          "destinationCity",
          "currentLocation",
          "estimatedDeliveryAt",
          "referenceCode",
          "sender",
          "receiver",
        ]),
      );
      expect(fields).not.toContain("originCity");
    });

    it("strips fields the client is not allowed to set", async () => {
      const res = await agent
        .post("/api/staff/shipments")
        .send(validShipmentPayload({ status: "DELIVERED", id: "abc" }))
        .expect(201);
      expect(res.body.data.status).toBe("CREATED");
    });
  });

  describe("updating shipments", () => {
    it("edits details, records the previous ETA and keeps the tracking history", async () => {
      const before = await agent.get("/api/staff/shipments/TRK-DEMO-001").expect(200);
      const newEta = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

      const res = await agent
        .patch("/api/staff/shipments/TRK-DEMO-001")
        .send({ destinationCity: "New Samplebury", estimatedDeliveryAt: newEta })
        .expect(200);

      expect(res.body.data.destinationCity).toBe("New Samplebury");
      expect(res.body.data.estimatedDeliveryAt).toBe(newEta);
      expect(res.body.data.previousEstimatedDeliveryAt).toBe(before.body.data.estimatedDeliveryAt);
      expect(res.body.data.events).toEqual(before.body.data.events);
    });

    it("rejects an empty update", async () => {
      const res = await agent.patch("/api/staff/shipments/TRK-DEMO-001").send({}).expect(422);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 when updating an unknown shipment", async () => {
      await agent.patch("/api/staff/shipments/TRK-NOPE-404").send({ originCity: "X" }).expect(404);
    });
  });

  describe("status and tracking events", () => {
    it("appends an event, moves status/location and the public view reflects it immediately", async () => {
      const res = await agent
        .post("/api/staff/shipments/TRK-DEMO-001/events")
        .send({
          occurredAt: minutesAgo(1),
          location: "Samplebury Depot",
          message: "Out for delivery.",
          status: "OUT_FOR_DELIVERY",
        })
        .expect(201);

      expect(res.body.data.events).toHaveLength(5);
      expect(res.body.data.status).toBe("OUT_FOR_DELIVERY");
      expect(res.body.data.currentLocation).toBe("Samplebury Depot");

      const publicView = await request(app).get("/api/shipments/TRK-DEMO-001").expect(200);
      expect(publicView.body.data.status).toBe("OUT_FOR_DELIVERY");
      expect(publicView.body.data.events.at(-1).message).toBe("Out for delivery.");
    });

    it("back-filled events join the history without rewinding the current status", async () => {
      const res = await agent
        .post("/api/staff/shipments/TRK-DEMO-003/events")
        .send({
          occurredAt: minutesAgo(60 * 24 * 9),
          location: "Vesterholm",
          message: "Label printed.",
          status: "CREATED",
        })
        .expect(201);

      expect(res.body.data.status).toBe("DELAYED");
      expect(res.body.data.events[0].message).toBe("Label printed.");
    });

    it("rejects future-dated events and unsupported statuses", async () => {
      const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const res = await agent
        .post("/api/staff/shipments/TRK-DEMO-001/events")
        .send({ occurredAt: future, location: "X", message: "Y", status: "TELEPORTED" })
        .expect(422);

      const fields = res.body.error.details.map((detail: { field: string }) => detail.field);
      expect(fields).toEqual(expect.arrayContaining(["occurredAt", "status"]));
    });

    it("changing status writes a matching timeline event", async () => {
      const res = await agent
        .patch("/api/staff/shipments/TRK-DEMO-005/status")
        .send({ status: "IN_TRANSIT" })
        .expect(200);

      expect(res.body.data.status).toBe("IN_TRANSIT");
      expect(res.body.data.events.at(-1)).toMatchObject({ status: "IN_TRANSIT", message: "Shipment is in transit." });
    });

    it("rejects an invalid or unchanged status", async () => {
      await agent.patch("/api/staff/shipments/TRK-DEMO-005/status").send({ status: "LOST" }).expect(422);
      await agent.patch("/api/staff/shipments/TRK-DEMO-005/status").send({ status: "COLLECTED" }).expect(422);
    });
  });

  describe("internal notes", () => {
    it("attaches a staff-only note authored by the signed-in user", async () => {
      const res = await agent
        .post("/api/staff/shipments/TRK-DEMO-001/notes")
        .send({ message: "Secret staff context" })
        .expect(201);

      expect(res.body.data.internalNotes.at(-1)).toMatchObject({
        message: "Secret staff context",
        author: DEMO_STAFF_NAME,
      });

      const publicView = await request(app).get("/api/shipments/TRK-DEMO-001").expect(200);
      expect(JSON.stringify(publicView.body)).not.toContain("Secret staff context");
    });
  });

  describe("listing shipments", () => {
    it("filters by status and searches by tracking number", async () => {
      const byStatus = await agent.get("/api/staff/shipments?status=DELAYED").expect(200);
      expect(byStatus.body.data.map((s: { trackingNumber: string }) => s.trackingNumber)).toEqual(["TRK-DEMO-003"]);

      const bySearch = await agent.get("/api/staff/shipments?search=demo-00").expect(200);
      expect(bySearch.body.meta.total).toBe(7);

      const none = await agent.get("/api/staff/shipments?search=zzz").expect(200);
      expect(none.body).toMatchObject({ data: [], meta: { total: 0 } });
    });

    it("paginates and rejects invalid query parameters", async () => {
      const page = await agent.get("/api/staff/shipments?limit=2&page=2").expect(200);
      expect(page.body.data).toHaveLength(2);
      expect(page.body.meta).toMatchObject({ page: 2, limit: 2, totalPages: Math.ceil(page.body.meta.total / 2) });

      await agent.get("/api/staff/shipments?status=NOPE").expect(422);
      await agent.get("/api/staff/shipments?limit=1000").expect(422);
      await agent.get("/api/staff/shipments?order=sideways").expect(422);
    });

    it("sorts by last update in either direction", async () => {
      const newest = await agent.get("/api/staff/shipments?limit=100").expect(200);
      const oldest = await agent.get("/api/staff/shipments?limit=100&order=asc").expect(200);
      const times = (body: { data: { updatedAt: string }[] }) => body.data.map((s) => Date.parse(s.updatedAt));

      expect(times(newest.body)).toEqual([...times(newest.body)].sort((a, b) => b - a));
      expect(times(oldest.body)).toEqual([...times(oldest.body)].sort((a, b) => a - b));
    });
  });
});

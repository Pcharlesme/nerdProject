import { beforeEach, describe, expect, it } from "vitest";
import { app, request, seed, signedInAgent } from "./support/helpers";

describe("customer enquiries", () => {
  beforeEach(seed);

  it("lets a customer submit an enquiry that staff can then see and resolve", async () => {
    const created = await request(app)
      .post("/api/enquiries")
      .send({ trackingNumber: "trk-demo-001", category: "DELAY", message: "Is this still arriving on time?" })
      .expect(201);

    expect(created.body.data).toMatchObject({ trackingNumber: "TRK-DEMO-001", status: "OPEN" });

    const agent = await signedInAgent();
    const list = await agent.get("/api/staff/enquiries?status=OPEN").expect(200);
    expect(list.body.data[0]).toMatchObject({ id: created.body.data.id, message: "Is this still arriving on time?" });

    const resolved = await agent
      .patch(`/api/staff/enquiries/${created.body.data.id}`)
      .send({ status: "RESOLVED" })
      .expect(200);
    expect(resolved.body.data.status).toBe("RESOLVED");
    expect(resolved.body.data.resolvedAt).toEqual(expect.any(String));

    const reopened = await agent
      .patch(`/api/staff/enquiries/${created.body.data.id}`)
      .send({ status: "OPEN" })
      .expect(200);
    expect(reopened.body.data.resolvedAt).toBeNull();
  });

  it("rejects an enquiry for a tracking number that does not exist", async () => {
    const res = await request(app)
      .post("/api/enquiries")
      .send({ trackingNumber: "TRK-NOPE-404", category: "OTHER", message: "Where is it?" })
      .expect(422);
    expect(res.body.error.details[0].field).toBe("trackingNumber");
  });

  it("validates category and message", async () => {
    const res = await request(app)
      .post("/api/enquiries")
      .send({ trackingNumber: "TRK-DEMO-001", category: "COMPLAINT", message: "" })
      .expect(422);
    const fields = res.body.error.details.map((detail: { field: string }) => detail.field);
    expect(fields).toEqual(expect.arrayContaining(["category", "message"]));
  });

  it("returns 404 for an unknown enquiry and 422 for a malformed id", async () => {
    const agent = await signedInAgent();
    await agent
      .patch("/api/staff/enquiries/00000000-0000-4000-8000-000000000000")
      .send({ status: "RESOLVED" })
      .expect(404);
    await agent.patch("/api/staff/enquiries/not-an-id").send({ status: "RESOLVED" }).expect(422);
  });
});

import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it } from "vitest";
import { STAFF_CREDENTIALS, app, prisma, request, seed, signedInAgent } from "./support/helpers";

describe("staff authentication", () => {
  beforeEach(seed);

  it("signs in with valid credentials and returns a bearer access token", async () => {
    const res = await request(app).post("/api/auth/login").send(STAFF_CREDENTIALS).expect(200);

    expect(res.body.data.staff).toMatchObject({ email: STAFF_CREDENTIALS.email });
    expect(res.body.data.staff).not.toHaveProperty("passwordHash");
    expect(typeof res.body.data.accessToken).toBe("string");
    expect(res.body.data.accessToken.length).toBeGreaterThan(0);
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("stores the password hashed, never in plain text", async () => {
    const user = await prisma.staffUser.findUniqueOrThrow({ where: { email: STAFF_CREDENTIALS.email } });
    expect(user.passwordHash).not.toBe(STAFF_CREDENTIALS.password);
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it.each([
    ["wrong password", { email: STAFF_CREDENTIALS.email, password: "nope" }],
    ["unknown email", { email: "ghost@example.test", password: STAFF_CREDENTIALS.password }],
  ])("rejects a %s with the same generic error", async (_label, body) => {
    const res = await request(app).post("/api/auth/login").send(body).expect(401);
    expect(res.body.error).toEqual({ code: "INVALID_CREDENTIALS", message: "Incorrect email or password." });
  });

  it("validates the login payload", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "not-an-email" }).expect(422);
    const fields = res.body.error.details.map((detail: { field: string }) => detail.field);
    expect(fields).toEqual(expect.arrayContaining(["email", "password"]));
  });

  it("rejects unauthenticated requests to every staff endpoint", async () => {
    const endpoints = [
      request(app).get("/api/staff/dashboard"),
      request(app).get("/api/staff/shipments"),
      request(app).post("/api/staff/shipments").send({}),
      request(app).patch("/api/staff/shipments/TRK-DEMO-001").send({ originCity: "X" }),
      request(app).post("/api/staff/shipments/TRK-DEMO-001/events").send({}),
      request(app).get("/api/staff/enquiries"),
      request(app).get("/api/auth/me"),
    ];

    for (const pending of endpoints) {
      const res = await pending;
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHENTICATED");
    }
  });

  it("rejects a malformed Authorization header", async () => {
    const res = await request(app).get("/api/staff/shipments").set("Authorization", "Bearer").expect(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("reports an expired token distinctly", async () => {
    const user = await prisma.staffUser.findUniqueOrThrow({ where: { email: STAFF_CREDENTIALS.email } });
    const expired = jwt.sign(
      { sub: user.id, email: user.email, name: user.name, exp: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET!,
    );

    const res = await request(app)
      .get("/api/staff/shipments")
      .set("Authorization", `Bearer ${expired}`)
      .expect(401);

    expect(res.body.error.code).toBe("SESSION_EXPIRED");
  });

  it("rejects a token signed with a different secret", async () => {
    const forged = jwt.sign({ sub: "x", email: "x@example.test", name: "X" }, "some-other-secret-that-is-long-enough");
    const res = await request(app).get("/api/staff/shipments").set("Authorization", `Bearer ${forged}`).expect(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns the current staff member for a valid bearer token", async () => {
    const agent = await signedInAgent();

    const me = await agent.get("/api/auth/me").expect(200);
    expect(me.body.data.email).toBe(STAFF_CREDENTIALS.email);
  });

  it("logs out with a 204 and no body", async () => {
    const agent = await signedInAgent();

    const res = await agent.post("/api/auth/logout").expect(204);
    expect(res.body).toEqual({});
  });
});

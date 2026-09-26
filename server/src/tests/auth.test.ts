import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it } from "vitest";
import { STAFF_CREDENTIALS, app, prisma, request, seed, signedInAgent } from "./support/helpers";

describe("staff authentication", () => {
  beforeEach(seed);

  it("signs in with valid credentials and sets an httpOnly session cookie", async () => {
    const res = await request(app).post("/api/auth/login").send(STAFF_CREDENTIALS).expect(200);

    expect(res.body.data).toMatchObject({ email: STAFF_CREDENTIALS.email });
    expect(res.body.data).not.toHaveProperty("passwordHash");
    const cookie = res.headers["set-cookie"]?.[0] ?? "";
    expect(cookie).toMatch(/^ns_session=/);
    expect(cookie).toMatch(/HttpOnly/i);
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

  it("reports an expired session distinctly and clears the cookie", async () => {
    const user = await prisma.staffUser.findUniqueOrThrow({ where: { email: STAFF_CREDENTIALS.email } });
    const expired = jwt.sign(
      { sub: user.id, email: user.email, name: user.name, exp: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET!,
    );

    const res = await request(app).get("/api/staff/shipments").set("Cookie", `ns_session=${expired}`).expect(401);

    expect(res.body.error.code).toBe("SESSION_EXPIRED");
    expect(res.headers["set-cookie"]?.[0]).toMatch(/ns_session=;/);
  });

  it("rejects a token signed with a different secret", async () => {
    const forged = jwt.sign({ sub: "x", email: "x@example.test", name: "X" }, "some-other-secret-that-is-long-enough");
    const res = await request(app).get("/api/staff/shipments").set("Cookie", `ns_session=${forged}`).expect(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns the current staff member and logs out cleanly", async () => {
    const agent = await signedInAgent();

    const me = await agent.get("/api/auth/me").expect(200);
    expect(me.body.data.email).toBe(STAFF_CREDENTIALS.email);

    await agent.post("/api/auth/logout").expect(204);
    await agent.get("/api/auth/me").expect(401);
  });
});

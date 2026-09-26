import { beforeAll, describe, expect, it } from "vitest";
import type { Express } from "express";
import request from "supertest";

describe("login rate limiting", () => {
  let app: Express;

  beforeAll(async () => {
    process.env.LOGIN_RATE_LIMIT_MAX = "3";
    const { createApp } = await import("../src/app");
    app = createApp();
  });

  it("blocks repeated failed sign-in attempts with a RATE_LIMITED error", async () => {
    const attempt = () => request(app).post("/api/auth/login").send({ email: "brute@example.test", password: "guess" });

    for (let i = 0; i < 3; i += 1) {
      expect((await attempt()).status).toBe(401);
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe("RATE_LIMITED");
    expect(blocked.headers).toHaveProperty("ratelimit-policy");
  });
});

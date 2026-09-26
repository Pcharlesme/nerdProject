import { describe, expect, it, vi } from "vitest";
import express from "express";
import { Prisma } from "@prisma/client";
import request from "supertest";
import { errorHandler } from "../middleware/errorHandler";
import { app } from "./support/helpers";

describe("error handling", () => {
  it("hides internal details of unexpected failures", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const failing = express();
    failing.get("/boom", () => {
      throw new Error("connection string postgresql://user:secret@host leaked");
    });
    failing.use(errorHandler);

    const res = await request(failing).get("/boom").expect(500);

    expect(res.body).toEqual({
      error: { code: "INTERNAL_ERROR", message: "Something went wrong on our side. Please try again." },
    });
    expect(JSON.stringify(res.body)).not.toContain("secret");
    consoleError.mockRestore();
  });

  it.each(["P1001", "P2024", "P2028"])("reports database connectivity failure %s as a retryable 503", async (code) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const failing = express();
    failing.get("/db", () => {
      throw new Prisma.PrismaClientKnownRequestError("Can't reach database server at secret-host:5432", {
        code,
        clientVersion: "test",
      });
    });
    failing.use(errorHandler);

    const res = await request(failing).get("/db").expect(503);

    expect(res.body.error.code).toBe("SERVICE_UNAVAILABLE");
    expect(JSON.stringify(res.body)).not.toContain("secret-host");
    consoleError.mockRestore();
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist").expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("rejects malformed JSON bodies with a validation error", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{ not json")
      .expect(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { apiClient } from "../client";
import { getAccessToken, hasAccessToken, setAccessToken } from "../tokenStore";

// A tiny real HTTP server stands in for the backend so we exercise the actual
// axios request/response interceptor pipeline, not a re-implementation of it.
let baseUrl: string;
const server = createServer((req, res) => {
  const authorization = req.headers.authorization;
  res.setHeader("Content-Type", "application/json");
  if (authorization === "Bearer good-token") {
    res.writeHead(200);
    res.end(JSON.stringify({ data: { ok: true } }));
    return;
  }
  res.writeHead(401);
  res.end(JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "Authentication is required." } }));
});

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("apiClient", () => {
  let originalLocation: Location;

  beforeEach(() => {
    setAccessToken(null);
    originalLocation = window.location;
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "" },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { value: originalLocation, writable: true, configurable: true });
  });

  // jsdom's XHR adapter enforces same-origin/CORS, which our bare test server
  // doesn't speak — use axios's Node http adapter to hit it directly instead.
  const nodeHttp = { adapter: "http" as const };

  it("attaches no Authorization header when there is no stored token", async () => {
    const res = await apiClient.get(`${baseUrl}/protected`, nodeHttp).catch((error) => error.response);
    expect(res.status).toBe(401);
  });

  it("attaches Authorization: Bearer <token> once a token is stored", async () => {
    setAccessToken("good-token");
    const res = await apiClient.get(`${baseUrl}/protected`, nodeHttp);
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ data: { ok: true } });
  });

  it("does not clear the token or redirect on a 401 with no Authorization header sent", async () => {
    setAccessToken(null);
    await apiClient.get(`${baseUrl}/protected`, nodeHttp).catch(() => {});
    expect(hasAccessToken()).toBe(false);
    expect(window.location.href).toBe("");
  });

  it("clears the token and redirects to login on a 401 for a request that carried a token", async () => {
    setAccessToken("stale-token");
    await apiClient.get(`${baseUrl}/protected`, nodeHttp).catch(() => {});
    expect(getAccessToken()).toBeNull();
    expect(window.location.href).toBe("/staff?reason=expired");
  });
});

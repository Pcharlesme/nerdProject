import { describe, expect, it, beforeEach } from "vitest";
import { getAccessToken, hasAccessToken, setAccessToken } from "../tokenStore";

describe("tokenStore", () => {
  beforeEach(() => {
    setAccessToken(null);
  });

  it("has no token by default", () => {
    expect(getAccessToken()).toBeNull();
    expect(hasAccessToken()).toBe(false);
  });

  it("stores and clears a token in memory", () => {
    setAccessToken("abc123");
    expect(getAccessToken()).toBe("abc123");
    expect(hasAccessToken()).toBe(true);

    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
    expect(hasAccessToken()).toBe(false);
  });

  it("mirrors the token to sessionStorage, never localStorage", () => {
    setAccessToken("abc123");
    expect(window.sessionStorage.getItem("ns_access_token")).toBe("abc123");
    expect(window.localStorage.getItem("ns_access_token")).toBeNull();

    setAccessToken(null);
    expect(window.sessionStorage.getItem("ns_access_token")).toBeNull();
  });
});

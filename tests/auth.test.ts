import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session-token";

describe("session tokens", () => {
  const originalSecret = process.env.AUTH_SECRET;

  beforeEach(() => {
    process.env.AUTH_SECRET = "super-secret-key-that-is-at-least-32-bytes-long";
  });

  afterEach(() => {
    process.env.AUTH_SECRET = originalSecret;
  });

  it("creates a signed token that verifies successfully", async () => {
    const token = await createSessionToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const valid = await verifySessionToken(token);
    expect(valid).toBe(true);
  });

  it("rejects an invalid token", async () => {
    expect(await verifySessionToken("invalid.token.here")).toBe(false);
    expect(await verifySessionToken("")).toBe(false);
    expect(await verifySessionToken(undefined)).toBe(false);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken();
    process.env.AUTH_SECRET = "another-secret-key-that-is-different-and-32-chars";
    expect(await verifySessionToken(token)).toBe(false);
  });

  it("exports sensible cookie constants", () => {
    expect(SESSION_COOKIE).toBe("session");
    expect(SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 30);
  });
});

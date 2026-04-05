import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows max requests within the window then blocks", () => {
    const key = `test-${randomUUID()}`;
    const windowMs = 60_000;
    const max = 5;

    for (let i = 0; i < max; i++) {
      expect(rateLimit(key, max, windowMs)).toEqual({ ok: true });
    }

    const blocked = rateLimit(key, max, windowMs);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThanOrEqual(1);
    }
  });

  it("uses independent buckets per key", () => {
    const a = `test-a-${randomUUID()}`;
    const b = `test-b-${randomUUID()}`;
    const windowMs = 60_000;
    const max = 5;

    for (let i = 0; i < max; i++) {
      expect(rateLimit(a, max, windowMs)).toEqual({ ok: true });
    }
    expect(rateLimit(a, max, windowMs).ok).toBe(false);
    expect(rateLimit(b, max, windowMs).ok).toBe(true);
  });
});

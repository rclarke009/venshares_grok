const buckets = new Map<string, number[]>();

/**
 * Fixed-window style limiter (per server instance). For strict production limits, add Redis/Upstash.
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const prev = buckets.get(key) ?? [];
  const windowStart = now - windowMs;
  const recent = prev.filter((t) => t > windowStart);
  if (recent.length >= max) {
    const oldest = recent[0]!;
    const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000);
    return { ok: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }
  recent.push(now);
  buckets.set(key, recent);
  return { ok: true };
}

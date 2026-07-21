/**
 * In-process login failure buckets (not shared across replicas / restarts).
 * Fine for a single teacher instance; use Redis if you scale out.
 */
type Bucket = { failures: number[] };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

function prune(now: number, failures: number[]): number[] {
  return failures.filter((t) => now - t < WINDOW_MS);
}

export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

/** Returns true if this IP is currently blocked. */
export function isRateLimited(key: string, now = Date.now()): boolean {
  const bucket = buckets.get(key);
  if (!bucket) return false;
  bucket.failures = prune(now, bucket.failures);
  if (bucket.failures.length === 0) {
    buckets.delete(key);
    return false;
  }
  return bucket.failures.length >= MAX_FAILURES;
}

export function recordAuthFailure(key: string, now = Date.now()): void {
  const bucket = buckets.get(key) ?? { failures: [] };
  bucket.failures = prune(now, bucket.failures);
  bucket.failures.push(now);
  buckets.set(key, bucket);
}

export function clearAuthFailures(key: string): void {
  buckets.delete(key);
}

/** Test helper — wipe all buckets. */
export function resetRateLimitStore(): void {
  buckets.clear();
}

export const RATE_LIMIT = {
  windowMs: WINDOW_MS,
  maxFailures: MAX_FAILURES,
} as const;

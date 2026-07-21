import { afterEach, describe, expect, it } from "vitest";
import {
  RATE_LIMIT,
  clearAuthFailures,
  isRateLimited,
  recordAuthFailure,
  resetRateLimitStore,
} from "@/lib/rate-limit";

afterEach(() => {
  resetRateLimitStore();
});

describe("rate-limit", () => {
  it("allows under the failure threshold", () => {
    const key = "1.2.3.4";
    const t0 = 1_000_000;
    for (let i = 0; i < RATE_LIMIT.maxFailures - 1; i++) {
      recordAuthFailure(key, t0 + i);
      expect(isRateLimited(key, t0 + i)).toBe(false);
    }
  });

  it("blocks after max failures within the window", () => {
    const key = "9.9.9.9";
    const t0 = 2_000_000;
    for (let i = 0; i < RATE_LIMIT.maxFailures; i++) {
      recordAuthFailure(key, t0 + i * 1000);
    }
    expect(isRateLimited(key, t0 + 10_000)).toBe(true);
  });

  it("clears on success", () => {
    const key = "8.8.8.8";
    const t0 = 3_000_000;
    for (let i = 0; i < RATE_LIMIT.maxFailures; i++) {
      recordAuthFailure(key, t0 + i);
    }
    expect(isRateLimited(key, t0 + 1)).toBe(true);
    clearAuthFailures(key);
    expect(isRateLimited(key, t0 + 2)).toBe(false);
  });

  it("expires failures outside the window", () => {
    const key = "7.7.7.7";
    const t0 = 4_000_000;
    for (let i = 0; i < RATE_LIMIT.maxFailures; i++) {
      recordAuthFailure(key, t0);
    }
    expect(isRateLimited(key, t0 + 1)).toBe(true);
    expect(isRateLimited(key, t0 + RATE_LIMIT.windowMs + 1)).toBe(false);
  });
});

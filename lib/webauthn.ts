import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";

/**
 * In-process challenge store (not shared across Railway replicas / restarts).
 * Fine for a single teacher instance; use Redis if you scale out.
 * Map: challenge → expiresAt
 */
const challenges = new Map<string, number>();
const TTL_MS = 5 * 60 * 1000;

function prune(now = Date.now()) {
  for (const [k, exp] of challenges) {
    if (exp <= now) challenges.delete(k);
  }
}

/** Store a WebAuthn challenge string (supports multiple in-flight). */
export function storeWebAuthnChallenge(challenge: string): void {
  prune();
  challenges.set(challenge, Date.now() + TTL_MS);
}

/** Accept challenge if it was issued recently (and consume it). */
export function consumeWebAuthnChallenge(challenge: string): boolean {
  prune();
  const exp = challenges.get(challenge);
  if (exp == null || exp <= Date.now()) return false;
  challenges.delete(challenge);
  return true;
}

/**
 * Prefer the browser Origin (so localhost vs 127.0.0.1 match).
 * Fall back to PUBLIC_APP_URL.
 */
export function webAuthnRpConfig(req?: Request): {
  rpID: string;
  origin: string;
  rpName: string;
  expectedOrigins: string[];
} {
  const headerOrigin = req?.headers.get("origin")?.trim();
  const publicUrl = (process.env.PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );

  let origin = headerOrigin || publicUrl;
  let rpID = "localhost";
  try {
    const u = new URL(origin);
    rpID = u.hostname;
    origin = u.origin;
  } catch {
    origin = "http://localhost:3000";
    rpID = "localhost";
  }

  const expectedOrigins = new Set<string>([origin]);
  try {
    expectedOrigins.add(new URL(publicUrl).origin);
  } catch {
    /* ignore */
  }
  if (rpID === "localhost" || rpID === "127.0.0.1") {
    expectedOrigins.add("http://localhost:3000");
    expectedOrigins.add("http://127.0.0.1:3000");
  }

  return {
    rpID,
    origin,
    rpName: "presentpo",
    expectedOrigins: [...expectedOrigins],
  };
}

export const TEACHER_WEBAUTHN_USER_ID = new TextEncoder().encode("teacher");
export const TEACHER_WEBAUTHN_USER_NAME = "teacher@presentpo.com";

export function toAuthenticatorTransports(
  values: string[],
): AuthenticatorTransportFuture[] | undefined {
  if (!values.length) return undefined;
  return values as AuthenticatorTransportFuture[];
}

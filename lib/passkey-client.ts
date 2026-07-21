"use client";

import {
  browserSupportsWebAuthnAutofill,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";

export async function enrollTeacherPasskey(): Promise<void> {
  const optRes = await fetch("/api/teacher/webauthn/register/options", {
    method: "POST",
  });
  if (!optRes.ok) {
    const data = await optRes.json().catch(() => ({}));
    throw new Error(data.message || "Could not start passkey registration");
  }
  const options = await optRes.json();
  const attestation = await startRegistration({ optionsJSON: options });
  const label =
    typeof navigator !== "undefined"
      ? `${navigator.platform || "device"} · ${new Date().toLocaleDateString()}`
      : null;
  const verifyRes = await fetch("/api/teacher/webauthn/register/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...attestation, label }),
  });
  if (!verifyRes.ok) {
    const data = await verifyRes.json().catch(() => ({}));
    throw new Error(data.message || "Could not save passkey");
  }
}

export async function authenticateTeacherPasskey(opts?: {
  useBrowserAutofill?: boolean;
}): Promise<void> {
  const optRes = await fetch("/api/teacher/webauthn/auth/options", {
    method: "POST",
  });
  if (!optRes.ok) {
    const data = await optRes.json().catch(() => ({}));
    throw new Error(data.message || "Could not start passkey sign-in");
  }
  const options = await optRes.json();
  const assertion = await startAuthentication({
    optionsJSON: options,
    useBrowserAutofill: opts?.useBrowserAutofill === true,
  });
  const verifyRes = await fetch("/api/teacher/webauthn/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assertion),
  });
  if (!verifyRes.ok) {
    const data = await verifyRes.json().catch(() => ({}));
    throw new Error(data.message || "Passkey sign-in failed");
  }
}

export async function supportsPasskeyAutofill(): Promise<boolean> {
  try {
    return await browserSupportsWebAuthnAutofill();
  } catch {
    return false;
  }
}

/** Set on logout so the next login landing skips auto passkey prompt. */
export const SKIP_AUTO_PASSKEY_KEY = "presentpo.login.skipAutoPasskey";
/** Once auto-offered in this tab, don't auto again until a new tab. */
export const AUTO_PASSKEY_OFFERED_KEY = "presentpo.login.autoPasskeyOffered";

export function markSkipAutoPasskeyOnNextLogin(): void {
  try {
    sessionStorage.setItem(SKIP_AUTO_PASSKEY_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Returns true once if logout asked us to skip; clears the flag. */
export function consumeSkipAutoPasskey(): boolean {
  try {
    if (sessionStorage.getItem(SKIP_AUTO_PASSKEY_KEY) !== "1") return false;
    sessionStorage.removeItem(SKIP_AUTO_PASSKEY_KEY);
    return true;
  } catch {
    return false;
  }
}

function isReloadOrBackForward(): boolean {
  try {
    const nav = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;
    return nav?.type === "reload" || nav?.type === "back_forward";
  } catch {
    return false;
  }
}

/**
 * Whether to auto-show the passkey sheet on this login page load.
 * Skips: post-logout, refresh/back, already offered in this tab.
 */
export function shouldAutoOfferPasskey(): boolean {
  if (consumeSkipAutoPasskey()) return false;
  if (isReloadOrBackForward()) return false;
  try {
    if (sessionStorage.getItem(AUTO_PASSKEY_OFFERED_KEY) === "1") return false;
  } catch {
    /* ignore */
  }
  return true;
}

/** Call when starting an auto passkey offer in this tab. */
export function markAutoPasskeyOffered(): void {
  try {
    sessionStorage.setItem(AUTO_PASSKEY_OFFERED_KEY, "1");
  } catch {
    /* ignore */
  }
}

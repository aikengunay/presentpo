"use client";

import {
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

const SKIP_AUTO_KEY = "presentpo.login.skipAutoPasskey";
const OFFERED_AUTO_KEY = "presentpo.login.autoPasskeyOffered";

/** After logout: skip one auto passkey prompt on the login page. */
export function skipAutoPasskeyOnce(): void {
  try {
    sessionStorage.setItem(SKIP_AUTO_KEY, "1");
  } catch {
    /* ignore */
  }
}

function takeSkipAutoPasskey(): boolean {
  try {
    if (sessionStorage.getItem(SKIP_AUTO_KEY) !== "1") return false;
    sessionStorage.removeItem(SKIP_AUTO_KEY);
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
export function canAutoPasskey(): boolean {
  if (takeSkipAutoPasskey()) return false;
  if (isReloadOrBackForward()) return false;
  try {
    if (sessionStorage.getItem(OFFERED_AUTO_KEY) === "1") return false;
  } catch {
    /* ignore */
  }
  return true;
}

/** Remember that this tab already auto-offered passkey. */
export function noteAutoPasskeyShown(): void {
  try {
    sessionStorage.setItem(OFFERED_AUTO_KEY, "1");
  } catch {
    /* ignore */
  }
}

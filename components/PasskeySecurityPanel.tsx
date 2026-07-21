"use client";

import { enrollTeacherPasskey } from "@/lib/passkey-client";
import { useCallback, useEffect, useState } from "react";

type PasskeyRow = {
  id: string;
  label: string | null;
  deviceType: string | null;
  backedUp: boolean;
  createdAt: string;
};

type Support = "checking" | "yes" | "no";

const SKIP_KEY = "presentpo.passkey.enroll.skip";

export function PasskeySecurityPanel({
  autoPrompt = false,
}: {
  /** After first password login: open enroll offer if none exist. */
  autoPrompt?: boolean;
}) {
  const [passkeys, setPasskeys] = useState<PasskeyRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [support, setSupport] = useState<Support>("checking");
  const [showOffer, setShowOffer] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/teacher/webauthn/passkeys");
    if (!res.ok) return [];
    const data = await res.json();
    const list = (data.passkeys ?? []) as PasskeyRow[];
    setPasskeys(list);
    return list;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hasApi =
        typeof window !== "undefined" &&
        typeof window.PublicKeyCredential !== "undefined";
      if (!hasApi) {
        if (!cancelled) setSupport("no");
        return;
      }
      if (!cancelled) setSupport("yes");
      const list = await load();
      if (cancelled) return;
      if (autoPrompt && list.length === 0) {
        const skipped =
          typeof sessionStorage !== "undefined" &&
          sessionStorage.getItem(SKIP_KEY) === "1";
        if (!skipped) setShowOffer(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load, autoPrompt]);

  async function addPasskey() {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await enrollTeacherPasskey();
      await load();
      setShowOffer(false);
      setSuccess("Passkey enrolled. Next visit you can sign in with it from the login page.");
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError(
          "Cancelled or blocked. Stay on http://localhost:3000 (not 127.0.0.1) and try again.",
        );
      } else {
        setError(err instanceof Error ? err.message : "Passkey registration failed");
      }
    } finally {
      setBusy(false);
    }
  }

  async function removePasskey(id: string) {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/teacher/webauthn/passkeys/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Could not remove passkey");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  function dismissOffer() {
    try {
      sessionStorage.setItem(SKIP_KEY, "1");
    } catch {
      /* ignore */
    }
    setShowOffer(false);
  }

  if (support === "checking") {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
        <h2 className="text-sm font-semibold tracking-tight">Security</h2>
        <p className="mt-1 text-sm text-zinc-500">Checking passkey support…</p>
      </section>
    );
  }

  if (support === "no") {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
        <h2 className="text-sm font-semibold tracking-tight">Security</h2>
        <p className="mt-1 text-sm text-zinc-600">
          This browser does not expose WebAuthn. Try Chrome or Safari, or keep using
          password.
        </p>
      </section>
    );
  }

  return (
    <>
      {showOffer ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
          <div
            role="dialog"
            aria-labelledby="passkey-offer-title"
            className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg"
          >
            <h2
              id="passkey-offer-title"
              className="text-lg font-semibold tracking-tight text-zinc-900"
            >
              Set up a passkey?
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Next time you can unlock with Face ID / Touch ID from the login page — password
              stays as a backup.
            </p>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={dismissOffer}
                disabled={busy}
                className="rounded-md px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-60"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={addPasskey}
                disabled={busy}
                className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {busy ? "Waiting for device…" : "Set up passkey"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Security · Passkeys</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Manage devices that can unlock teacher access. Password always remains a
              backup. If passkey sign-in fails, remove old keys and add a new one.
            </p>
          </div>
          <button
            type="button"
            onClick={addPasskey}
            disabled={busy}
            className="shrink-0 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? "Waiting…" : "Add passkey"}
          </button>
        </div>

        {error && !showOffer ? (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        ) : null}
        {success ? <p className="mt-3 text-sm text-emerald-700">{success}</p> : null}

        {passkeys.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            No passkeys yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 rounded-md border border-zinc-200">
            {passkeys.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {p.label || p.deviceType || "Passkey"}
                    {p.backedUp ? " · synced" : ""}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Added {new Date(p.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removePasskey(p.id)}
                  disabled={busy}
                  className="text-sm text-red-700 underline disabled:opacity-60"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

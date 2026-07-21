"use client";

import {
  authenticateTeacherPasskey,
  canAutoPasskey,
  noteAutoPasskeyShown,
} from "@/lib/passkey-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextPath = search.get("next") || "/teacher";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [hasPasskeys, setHasPasskeys] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [allowAutoPasskey] = useState(() => canAutoPasskey());
  const nextRef = useRef(nextPath);
  nextRef.current = nextPath;

  function goNext() {
    const dest = nextRef.current.startsWith("/teacher")
      ? nextRef.current
      : "/teacher";
    router.replace(dest);
    router.refresh();
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/teacher/webauthn/status");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setHasPasskeys(Boolean(data.hasPasskeys));
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setStatusLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-offer passkey once per tab (skip logout landing + refresh)
  useEffect(() => {
    if (!statusLoaded || !hasPasskeys || !allowAutoPasskey) return;
    let cancelled = false;
    noteAutoPasskeyShown();

    (async () => {
      setPasskeyLoading(true);
      setError(null);
      try {
        await authenticateTeacherPasskey({ useBrowserAutofill: false });
        if (!cancelled) goNext();
      } catch (err) {
        if (cancelled) return;
        // Cancel / dismiss → stay on password form quietly
        if (err instanceof Error && err.name === "NotAllowedError") return;
        setError(err instanceof Error ? err.message : "Passkey sign-in failed");
      } finally {
        if (!cancelled) setPasskeyLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [statusLoaded, hasPasskeys, allowAutoPasskey]);

  async function signInWithPasskey() {
    if (passkeyLoading || loading) return;
    setPasskeyLoading(true);
    setError(null);
    try {
      await authenticateTeacherPasskey({ useBrowserAutofill: false });
      goNext();
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Passkey sign-in was cancelled");
        return;
      }
      setError(err instanceof Error ? err.message : "Passkey sign-in failed");
    } finally {
      setPasskeyLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Invalid password");
        return;
      }
      goNext();
    } finally {
      setLoading(false);
    }
  }

  const showPasskey = statusLoaded && hasPasskeys;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            presentpo
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign in to presentpo
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              {showPasskey
                ? passkeyLoading
                  ? "Waiting for passkey…"
                  : "Use your passkey, or cancel and enter your password."
                : "Teacher access for attendance sessions."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-base outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
                required
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading || passkeyLoading}
              className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Continue"}
            </button>
          </form>

          {showPasskey ? (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden>
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide">
                  <span className="bg-white px-3 text-zinc-500">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void signInWithPasskey()}
                disabled={passkeyLoading || loading}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 disabled:opacity-60"
              >
                {passkeyLoading ? "Waiting for passkey…" : "Sign in with passkey"}
              </button>
            </>
          ) : statusLoaded ? (
            <p className="mt-6 text-center text-xs text-zinc-500">
              First time here? After you continue, we’ll offer to set up a passkey.
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default function TeacherLoginPage() {
  return (
    <Suspense
      fallback={
        <p className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500">
          Loading…
        </p>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

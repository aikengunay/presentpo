"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
    <div className="flex min-h-svh flex-col bg-muted">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            presentpo
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in to presentpo</CardTitle>
            <CardDescription>
              {showPasskey
                ? passkeyLoading
                  ? "Waiting for passkey…"
                  : "Use your passkey, or cancel and enter your password."
                : "Teacher access for attendance sessions."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                disabled={loading || passkeyLoading}
                className="w-full"
              >
                {loading ? "Signing in…" : "Continue"}
              </Button>
            </form>

            {showPasskey ? (
              <>
                <div className="relative my-6">
                  <Separator />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs uppercase tracking-wide text-muted-foreground">
                    or
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => void signInWithPasskey()}
                  disabled={passkeyLoading || loading}
                >
                  {passkeyLoading
                    ? "Waiting for passkey…"
                    : "Sign in with passkey"}
                </Button>
              </>
            ) : statusLoaded ? (
              <p className="mt-6 text-center text-xs text-muted-foreground">
                First time here? After you continue, we’ll offer to set up a
                passkey.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function TeacherLoginPage() {
  return (
    <Suspense
      fallback={
        <p className="flex min-h-svh items-center justify-center bg-muted text-sm text-muted-foreground">
          Loading…
        </p>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

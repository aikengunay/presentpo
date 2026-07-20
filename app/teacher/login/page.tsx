"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/teacher";
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Invalid PIN");
        return;
      }
      router.replace(next.startsWith("/teacher") ? next : "/teacher");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Teacher</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Enter PIN</h1>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="text-sm text-zinc-600" htmlFor="pin">
          Teacher PIN
        </label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-500"
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Checking…" : "Unlock"}
        </button>
      </form>
    </main>
  );
}

export default function TeacherLoginPage() {
  return (
    <Suspense
      fallback={
        <p className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          Loading…
        </p>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

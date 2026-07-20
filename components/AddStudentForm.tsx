"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AddStudentForm({ sectionId }: { sectionId: string }) {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sections/${sectionId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, name, email: email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not add student");
        return;
      }
      setStudentId("");
      setName("");
      setEmail("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded border border-zinc-200 bg-white p-4 sm:grid-cols-2"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600">Student ID</span>
        <input
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
          className="rounded border border-zinc-300 px-3 py-2"
          placeholder="2023-100964"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-600">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded border border-zinc-300 px-3 py-2"
          placeholder="LAST, FIRST"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-zinc-600">Email (optional)</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-600 sm:col-span-2">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-fit rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Add / update"}
      </button>
    </form>
  );
}

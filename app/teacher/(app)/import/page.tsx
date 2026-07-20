"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Preview = {
  termLabel: string;
  subjectName: string;
  sectionCode: string;
  instructor: string | null;
  classLimit: number | null;
  scheduleCount: number;
  studentCount: number;
  schedules: Array<{
    dayOfWeek: number;
    dayLabel: string;
    startTime: string;
    endTime: string;
    roomType: string | null;
    room: string | null;
  }>;
  sampleStudents: Array<{ studentId: string; name: string; status: string | null }>;
  students: Array<{
    studentId: string;
    name: string;
    email: string | null;
    status: string | null;
  }>;
};

export default function ImportPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onPreview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch("/api/import/classlist", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Parse failed");
        return;
      }
      setPreview(data.preview);
    } finally {
      setLoading(false);
    }
  }

  async function onCommit() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/import/classlist?commit=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termLabel: preview.termLabel,
          subjectName: preview.subjectName,
          sectionCode: preview.sectionCode,
          instructor: preview.instructor,
          classLimit: preview.classLimit,
          schedules: preview.schedules,
          students: preview.students,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Commit failed");
        return;
      }
      router.push(`/teacher/sections/${data.sectionId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import classlist</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Upload Registrar TSV <code>.xls</code> (INF231 / INF232). Preview, then
          confirm to upsert.
        </p>
      </div>

      <form
        onSubmit={onPreview}
        className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-4"
      >
        <label className="text-sm text-zinc-600" htmlFor="file">
          Classlist file
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".xls,.tsv,.txt,text/plain,text/tab-separated-values"
          required
          className="text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-fit rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading && !preview ? "Parsing…" : "Preview"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {preview ? (
        <section className="flex flex-col gap-4 rounded border border-zinc-200 bg-white p-4">
          <div>
            <p className="text-lg font-medium">{preview.sectionCode}</p>
            <p className="text-sm text-zinc-600">{preview.subjectName}</p>
            <p className="text-xs text-zinc-500">{preview.termLabel}</p>
            <p className="mt-2 text-sm text-zinc-700">
              {preview.studentCount} students · {preview.scheduleCount} schedules
              {preview.classLimit != null ? ` · limit ${preview.classLimit}` : ""}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-zinc-800">Schedules</h2>
            <ul className="mt-1 space-y-1 text-sm text-zinc-600">
              {preview.schedules.map((s, i) => (
                <li key={i}>
                  {s.dayLabel} {s.startTime}–{s.endTime}
                  {s.roomType ? ` · ${s.roomType}` : ""}
                  {s.room ? ` · ${s.room}` : ""}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-medium text-zinc-800">Sample students</h2>
            <ul className="mt-1 space-y-1 text-sm text-zinc-600">
              {preview.sampleStudents.map((s) => (
                <li key={s.studentId}>
                  {s.studentId} — {s.name}
                  {s.status ? ` (${s.status})` : ""}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={onCommit}
            disabled={loading}
            className="w-fit rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Saving…" : "Confirm import"}
          </button>
        </section>
      ) : null}
    </main>
  );
}

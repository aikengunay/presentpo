import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
        Attendance Tracker
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Classroom check-in
      </h1>
      <p className="text-base leading-7 text-zinc-600">
        Teachers manage sections and sessions. Students join with Student ID and
        the rotating classroom QR (next milestones).
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/teacher"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Teacher
        </Link>
        <Link
          href="/join"
          className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800"
        >
          Student join
        </Link>
      </div>
    </main>
  );
}

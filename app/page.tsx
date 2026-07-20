export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
        Attendance Tracker
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Scaffold ready
      </h1>
      <p className="text-base leading-7 text-zinc-600">
        Next.js + Prisma + SQLite + Docker Compose. Import, session QR, and
        check-in land in the next milestones.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600">
        <li>
          Local: <code className="text-zinc-800">npm run dev</code>
        </li>
        <li>
          Classroom: <code className="text-zinc-800">docker compose up</code>
        </li>
      </ul>
    </main>
  );
}

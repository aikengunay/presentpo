import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TeacherHomePage() {
  const sections = await prisma.section.findMany({
    orderBy: { code: "asc" },
    include: {
      _count: { select: { students: true, templates: true } },
    },
  });

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sections</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Import a Registrar classlist, then open a section roster.
          </p>
        </div>
        <Link
          href="/teacher/import"
          className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
        >
          Import classlist
        </Link>
      </div>

      {sections.length === 0 ? (
        <p className="rounded border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-600">
          No sections yet.{" "}
          <Link href="/teacher/import" className="underline">
            Import INF231 or INF232
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded border border-zinc-200 bg-white">
          {sections.map((s) => (
            <li key={s.id}>
              <Link
                href={`/teacher/sections/${s.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-50"
              >
                <div>
                  <p className="font-medium">{s.code}</p>
                  <p className="text-sm text-zinc-600">{s.subjectName}</p>
                  <p className="text-xs text-zinc-500">{s.termLabel}</p>
                </div>
                <p className="text-sm text-zinc-600">
                  {s._count.students} students · {s._count.templates} schedules
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

import { PasskeySecurityPanel } from "@/components/PasskeySecurityPanel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TeacherHomePage() {
  const [sections, passkeyCount] = await Promise.all([
    prisma.section.findMany({
      orderBy: { code: "asc" },
      include: {
        _count: { select: { students: true, templates: true } },
      },
    }),
    prisma.teacherPasskey.count(),
  ]);

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Sections
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Import a Registrar classlist, then open a section roster.
          </p>
        </div>
        <Button render={<Link href="/teacher/import" />}>
          Import classlist
        </Button>
      </div>

      <PasskeySecurityPanel autoPrompt={passkeyCount === 0} />

      {sections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No sections yet.{" "}
            <Link href="/teacher/import" className="underline underline-offset-4">
              Import INF231 or INF232
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle>Your sections</CardTitle>
            <CardDescription>
              {sections.length} section{sections.length === 1 ? "" : "s"} ready
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {sections.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/teacher/sections/${s.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{s.code}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.subjectName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.termLabel}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {s._count.students} students · {s._count.templates}{" "}
                      schedules
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

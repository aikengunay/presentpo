import { unauthorized } from "@/lib/api";
import { isTeacherAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await isTeacherAuthenticated())) return unauthorized();

  const sections = await prisma.section.findMany({
    orderBy: { code: "asc" },
    include: {
      _count: { select: { students: true, templates: true, meetings: true } },
    },
  });

  return NextResponse.json({
    sections: sections.map((s) => ({
      id: s.id,
      code: s.code,
      subjectName: s.subjectName,
      termLabel: s.termLabel,
      studentCount: s._count.students,
      scheduleCount: s._count.templates,
      meetingCount: s._count.meetings,
    })),
  });
}

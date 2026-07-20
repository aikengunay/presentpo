import { unauthorized } from "@/lib/api";
import { isTeacherAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Params = { params: Promise<{ sectionId: string }> };

export async function GET(_req: Request, { params }: Params) {
  if (!(await isTeacherAuthenticated())) return unauthorized();

  const { sectionId } = await params;
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      templates: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
      students: {
        where: { active: true },
        orderBy: { name: "asc" },
      },
      meetings: {
        orderBy: { startAt: "desc" },
        take: 20,
        include: { session: true },
      },
    },
  });

  if (!section) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Section not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    section: {
      id: section.id,
      code: section.code,
      subjectName: section.subjectName,
      termLabel: section.termLabel,
      schedules: section.templates.map((t) => ({
        id: t.id,
        dayOfWeek: t.dayOfWeek,
        dayLabel: DAY_LABELS[t.dayOfWeek] ?? String(t.dayOfWeek),
        startTime: t.startTime,
        endTime: t.endTime,
        room: t.room,
        roomType: t.roomType,
      })),
      students: section.students.map((s) => ({
        id: s.id,
        studentId: s.studentId,
        name: s.name,
        email: s.email,
        status: s.status,
      })),
      meetings: section.meetings.map((m) => ({
        id: m.id,
        date: m.date,
        startAt: m.startAt,
        endAt: m.endAt,
        title: m.title,
        session: m.session
          ? { id: m.session.id, status: m.session.status }
          : null,
      })),
    },
  });
}

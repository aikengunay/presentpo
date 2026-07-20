import { jsonError, unauthorized } from "@/lib/api";
import { isTeacherAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ sectionId: string }> };

/** Manual late-add student (screen T2). */
export async function POST(req: Request, { params }: Params) {
  if (!(await isTeacherAuthenticated())) return unauthorized();

  const { sectionId } = await params;
  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (!section) {
    return jsonError("NOT_FOUND", "Section not found", 404);
  }

  let body: { studentId?: string; name?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("BAD_REQUEST", "Expected JSON body", 400);
  }

  const studentId = body.studentId?.trim() ?? "";
  const name = body.name?.trim() ?? "";
  if (!studentId || !name) {
    return jsonError("BAD_REQUEST", "studentId and name are required", 400);
  }

  const student = await prisma.student.upsert({
    where: {
      sectionId_studentId: { sectionId, studentId },
    },
    create: {
      sectionId,
      studentId,
      name,
      email: body.email?.trim() || null,
      status: "Manual",
      active: true,
    },
    update: {
      name,
      email: body.email?.trim() || null,
      active: true,
    },
  });

  return NextResponse.json({
    student: {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      status: student.status,
    },
  });
}

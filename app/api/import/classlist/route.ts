import { unauthorized } from "@/lib/api";
import { isTeacherAuthenticated } from "@/lib/auth";
import { commitClasslist } from "@/lib/import/commit";
import {
  parseClasslistBuffer,
  type ParsedClasslist,
} from "@/lib/import/classlist";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

function previewPayload(data: ParsedClasslist) {
  return {
    termLabel: data.termLabel,
    subjectName: data.subjectName,
    sectionCode: data.sectionCode,
    instructor: data.instructor,
    classLimit: data.classLimit,
    scheduleCount: data.schedules.length,
    studentCount: data.students.length,
    schedules: data.schedules,
    sampleStudents: data.students.slice(0, 5),
    students: data.students,
  };
}

export async function POST(req: Request) {
  if (!(await isTeacherAuthenticated())) return unauthorized();

  const url = new URL(req.url);
  const commit =
    url.searchParams.get("commit") === "1" ||
    url.searchParams.get("commit") === "true";

  const contentType = req.headers.get("content-type") ?? "";

  try {
    let parsed: ParsedClasslist;

    if (contentType.includes("application/json")) {
      parsed = (await req.json()) as ParsedClasslist;
      if (!parsed?.sectionCode || !Array.isArray(parsed.students)) {
        return NextResponse.json(
          { error: "BAD_REQUEST", message: "Invalid classlist JSON" },
          { status: 400 },
        );
      }
    } else {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "BAD_REQUEST", message: "Missing file field" },
          { status: 400 },
        );
      }
      const buf = Buffer.from(await file.arrayBuffer());
      parsed = parseClasslistBuffer(buf);
    }

    if (!commit) {
      return NextResponse.json({ preview: previewPayload(parsed) });
    }

    const result = await commitClasslist(prisma, parsed);
    return NextResponse.json({ ok: true, ...result, sectionCode: parsed.sectionCode });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    return NextResponse.json({ error: "IMPORT_FAILED", message }, { status: 400 });
  }
}

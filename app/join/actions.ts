"use server";

import { prisma } from "@/lib/db";
import { lookupStudent } from "@/lib/session/checkin";
import { redirect } from "next/navigation";

function joinRedirect(params: Record<string, string>): never {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) qs.set(k, v);
  }
  redirect(`/join?${qs.toString()}`);
}

export async function lookupStudentAction(formData: FormData) {
  const sectionCode = String(formData.get("sectionCode") ?? "")
    .trim()
    .toUpperCase();
  const studentId = String(formData.get("studentId") ?? "").trim();

  if (!sectionCode || !studentId) {
    joinRedirect({
      error: "Section and Student ID are required",
      sectionCode,
      studentId,
    });
  }

  const student = await lookupStudent(prisma, sectionCode, studentId);
  if (!student) {
    joinRedirect({
      error: "Student not found in section",
      sectionCode,
      studentId,
    });
  }

  joinRedirect({
    step: "confirm",
    sectionCode: student.section.code,
    studentId: student.studentId,
    name: student.name,
    subjectName: student.section.subjectName,
  });
}

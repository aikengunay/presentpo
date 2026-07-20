"use server";

import { prisma } from "@/lib/db";
import { lookupStudent, performCheckIn } from "@/lib/session/checkin";
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
  const token = String(formData.get("token") ?? "").trim();

  if (!sectionCode || !studentId) {
    joinRedirect({
      error: "Section and Student ID are required",
      sectionCode,
      studentId,
      token,
    });
  }

  const student = await lookupStudent(prisma, sectionCode, studentId);
  if (!student) {
    joinRedirect({
      error: "Student not found in section",
      sectionCode,
      studentId,
      token,
    });
  }

  joinRedirect({
    step: "confirm",
    sectionCode: student.section.code,
    studentId: student.studentId,
    name: student.name,
    token,
  });
}

export async function checkInAction(formData: FormData) {
  const sectionCode = String(formData.get("sectionCode") ?? "")
    .trim()
    .toUpperCase();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!token) {
    joinRedirect({
      step: "confirm",
      error: "Enter the fallback code from the projector, or scan the QR again.",
      sectionCode,
      studentId,
      name,
      token,
    });
  }

  let result;
  try {
    result = await performCheckIn(prisma, {
      studentId,
      sectionCode,
      token,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Check-in failed";
    joinRedirect({
      step: "confirm",
      error: message,
      sectionCode,
      studentId,
      name,
      token,
    });
  }

  const qs = new URLSearchParams({
    code: String(result.code),
    label: result.label,
    name: result.name,
  });
  redirect(`/join/done?${qs.toString()}`);
}

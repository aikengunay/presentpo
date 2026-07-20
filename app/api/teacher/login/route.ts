import {
  teacherCookieOptions,
  teacherSessionToken,
  TEACHER_COOKIE,
  verifyTeacherPin,
} from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: { pin?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("BAD_REQUEST", "Expected JSON body", 400);
  }

  const pin = body.pin?.trim() ?? "";
  if (!verifyTeacherPin(pin)) {
    return jsonError("UNAUTHORIZED", "Invalid PIN", 401);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    TEACHER_COOKIE,
    await teacherSessionToken(),
    teacherCookieOptions(),
  );
  return res;
}

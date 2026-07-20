import { TEACHER_COOKIE, teacherCookieOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TEACHER_COOKIE, "", { ...teacherCookieOptions(0), maxAge: 0 });
  return res;
}

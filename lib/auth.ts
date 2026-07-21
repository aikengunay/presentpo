import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { teacherSessionToken, tokensEqual } from "@/lib/teacher-token";
import type { NextResponse } from "next/server";

export const TEACHER_COOKIE = "teacher_session";

/** Prefer TEACHER_PASSWORD; fall back to TEACHER_PIN for one release. */
export function teacherPasswordSecret(): string {
  return process.env.TEACHER_PASSWORD || process.env.TEACHER_PIN || "";
}

export function verifyTeacherPassword(password: string): boolean {
  const expected = teacherPasswordSecret();
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** @deprecated Use verifyTeacherPassword */
export function verifyTeacherPin(pin: string): boolean {
  return verifyTeacherPassword(pin);
}

export async function isTeacherAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const value = jar.get(TEACHER_COOKIE)?.value;
  if (!value) return false;
  const expected = await teacherSessionToken();
  return tokensEqual(value, expected);
}

export async function requireTeacher(): Promise<void> {
  if (!(await isTeacherAuthenticated())) {
    const err = new Error("UNAUTHORIZED") as Error & { status: number };
    err.status = 401;
    throw err;
  }
}

export function teacherCookieOptions(maxAgeSeconds = 60 * 60 * 12) {
  const publicUrl = process.env.PUBLIC_APP_URL ?? "";
  const secure =
    process.env.NODE_ENV === "production" || publicUrl.startsWith("https://");
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function setTeacherSessionCookie(res: NextResponse): Promise<void> {
  res.cookies.set(
    TEACHER_COOKIE,
    await teacherSessionToken(),
    teacherCookieOptions(),
  );
}

export { teacherSessionToken };

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { teacherSessionToken, tokensEqual } from "@/lib/teacher-token";

export const TEACHER_COOKIE = "teacher_session";

export function verifyTeacherPin(pin: string): boolean {
  const expected = process.env.TEACHER_PIN ?? "";
  if (!expected || !pin) return false;
  const a = Buffer.from(pin);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
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
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export { teacherSessionToken };

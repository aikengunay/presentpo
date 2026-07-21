import {
  setTeacherSessionCookie,
  verifyTeacherPassword,
} from "@/lib/auth";
import { jsonError } from "@/lib/api";
import {
  clearAuthFailures,
  clientIpFromHeaders,
  isRateLimited,
  recordAuthFailure,
} from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const ip = clientIpFromHeaders(req.headers);
  if (isRateLimited(ip)) {
    return jsonError(
      "RATE_LIMITED",
      "Too many failed login attempts. Try again in 15 minutes.",
      429,
    );
  }

  let body: { password?: string; pin?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("BAD_REQUEST", "Expected JSON body", 400);
  }

  const password = (body.password ?? body.pin)?.trim() ?? "";
  if (!verifyTeacherPassword(password)) {
    recordAuthFailure(ip);
    return jsonError("UNAUTHORIZED", "Invalid password", 401);
  }

  clearAuthFailures(ip);
  const res = NextResponse.json({ ok: true });
  await setTeacherSessionCookie(res);
  return res;
}

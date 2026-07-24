import { jsonError, unauthorized } from "@/lib/api";
import { isTeacherAuthenticated } from "@/lib/auth";
import { NextResponse } from "next/server";

/** Retired: rotating projector QR. Use Station Scan. */
export async function GET() {
  if (!(await isTeacherAuthenticated())) return unauthorized();
  return jsonError(
    "GONE",
    "Projector QR is retired. Open Station Scan to check students in.",
    410,
  );
}

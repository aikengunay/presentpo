import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { issuePersonalToken } from "@/lib/session/checkin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: { sectionCode?: string; studentId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("BAD_REQUEST", "Expected JSON body", 400);
  }

  try {
    const issued = await issuePersonalToken(
      prisma,
      body.sectionCode ?? "",
      body.studentId ?? "",
    );

    const origin = new URL(req.url).origin;
    const qrPayload = `${origin}/join?token=${encodeURIComponent(issued.token)}`;

    return NextResponse.json({
      ok: true,
      ...issued,
      qrPayload,
    });
  } catch (err) {
    const code = (err as { code?: string }).code ?? "TOKEN_FAILED";
    const message = err instanceof Error ? err.message : "Could not issue token";
    const status =
      code === "NOT_IN_SECTION" ||
      code === "SESSION_CLOSED" ||
      code === "ALREADY_CHECKED_IN"
        ? 409
        : 400;
    return NextResponse.json({ error: code, message }, { status });
  }
}

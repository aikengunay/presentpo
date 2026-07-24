import { jsonError, unauthorized } from "@/lib/api";
import { isTeacherAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { performTeacherScan } from "@/lib/session/checkin";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ sessionId: string }> };

function parseTokenFromPayload(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  try {
    const url = new URL(text);
    const token = url.searchParams.get("token")?.trim();
    if (token) return token;
  } catch {
    /* opaque */
  }
  if (/^[A-Za-z0-9_-]{8,}$/.test(text)) return text;
  return null;
}

export async function POST(req: Request, { params }: Params) {
  if (!(await isTeacherAuthenticated())) return unauthorized();
  const { sessionId } = await params;

  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("BAD_REQUEST", "Expected JSON body", 400);
  }

  const token = parseTokenFromPayload(body.token ?? "");
  if (!token) {
    return jsonError("BAD_REQUEST", "token is required", 400);
  }

  try {
    const result = await performTeacherScan(prisma, sessionId, token);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const code = (err as { code?: string }).code ?? "SCAN_FAILED";
    const message = err instanceof Error ? err.message : "Scan failed";
    const status =
      code === "TOKEN_EXPIRED" ||
      code === "SESSION_CLOSED" ||
      code === "ALREADY_CHECKED_IN" ||
      code === "TOO_EARLY" ||
      code === "INVALID_TOKEN"
        ? 409
        : 400;
    return NextResponse.json({ error: code, message }, { status });
  }
}

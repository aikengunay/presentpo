import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getPersonalCheckInStatus } from "@/lib/session/checkin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return jsonError("BAD_REQUEST", "token query param required", 400);
  }

  const status = await getPersonalCheckInStatus(prisma, token);
  return NextResponse.json(status);
}

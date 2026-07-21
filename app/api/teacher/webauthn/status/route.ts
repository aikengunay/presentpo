import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

/** Public: whether any teacher passkeys exist (drives login CTA). */
export async function GET() {
  const count = await prisma.teacherPasskey.count();
  return NextResponse.json({ hasPasskeys: count > 0 });
}

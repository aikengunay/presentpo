import { requireTeacher } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireTeacher();
  } catch {
    return jsonError("UNAUTHORIZED", "Teacher authentication required", 401);
  }

  const { id } = await params;
  try {
    await prisma.teacherPasskey.delete({ where: { id } });
  } catch {
    return jsonError("NOT_FOUND", "Passkey not found", 404);
  }
  return NextResponse.json({ ok: true });
}

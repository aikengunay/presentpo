import { requireTeacher } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireTeacher();
  } catch {
    return jsonError("UNAUTHORIZED", "Teacher authentication required", 401);
  }

  const passkeys = await prisma.teacherPasskey.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      label: true,
      deviceType: true,
      backedUp: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    passkeys: passkeys.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}

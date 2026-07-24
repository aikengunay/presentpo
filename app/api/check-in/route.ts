import { jsonError } from "@/lib/api";
import { NextResponse } from "next/server";

/** Retired: public board-token finalize. Use teacher station scan. */
export async function POST() {
  return NextResponse.json(
    {
      error: "GONE",
      message:
        "Student self check-in is retired. Show your personal QR for the teacher to scan.",
    },
    { status: 410 },
  );
}

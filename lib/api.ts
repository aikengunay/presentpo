import { NextResponse } from "next/server";

export function jsonError(
  error: string,
  message: string,
  status = 400,
) {
  return NextResponse.json({ error, message }, { status });
}

export function unauthorized() {
  return jsonError("UNAUTHORIZED", "Teacher authentication required", 401);
}

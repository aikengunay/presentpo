import { requireTeacher } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import {
  TEACHER_WEBAUTHN_USER_ID,
  TEACHER_WEBAUTHN_USER_NAME,
  asTransports,
  storeWebAuthnChallenge,
  webAuthnRpConfig,
} from "@/lib/webauthn";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await requireTeacher();
  } catch {
    return jsonError("UNAUTHORIZED", "Teacher authentication required", 401);
  }

  const { rpID, rpName } = webAuthnRpConfig(req);
  const existing = await prisma.teacherPasskey.findMany();

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: TEACHER_WEBAUTHN_USER_NAME,
    userID: TEACHER_WEBAUTHN_USER_ID,
    userDisplayName: "Teacher",
    attestationType: "none",
    excludeCredentials: existing.map((p) => ({
      id: p.credentialId,
      transports: asTransports(p.transports),
    })),
    authenticatorSelection: {
      // Required so Conditional UI can offer the passkey on password focus
      residentKey: "required",
      userVerification: "preferred",
    },
  });

  storeWebAuthnChallenge(options.challenge);
  return NextResponse.json(options);
}

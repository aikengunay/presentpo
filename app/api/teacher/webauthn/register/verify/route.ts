import { requireTeacher } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import {
  consumeWebAuthnChallenge,
  webAuthnRpConfig,
} from "@/lib/webauthn";
import {
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await requireTeacher();
  } catch {
    return jsonError("UNAUTHORIZED", "Teacher authentication required", 401);
  }

  let body: RegistrationResponseJSON & { label?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("BAD_REQUEST", "Expected JSON body", 400);
  }

  const { rpID, expectedOrigins } = webAuthnRpConfig(req);

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: (challenge) => consumeWebAuthnChallenge(challenge),
      expectedOrigin: expectedOrigins,
      expectedRPID: rpID,
      requireUserVerification: false,
    });
  } catch (err) {
    return jsonError(
      "UNAUTHORIZED",
      err instanceof Error ? err.message : "Passkey registration failed",
      401,
    );
  }

  if (!verification.verified || !verification.registrationInfo) {
    return jsonError("UNAUTHORIZED", "Passkey registration could not be verified", 401);
  }

  const { credential, credentialDeviceType, credentialBackedUp } =
    verification.registrationInfo;

  await prisma.teacherPasskey.create({
    data: {
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: BigInt(credential.counter),
      transports: credential.transports ?? [],
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      label: typeof body.label === "string" ? body.label.slice(0, 80) : null,
    },
  });

  return NextResponse.json({ ok: true });
}

import { setTeacherSessionCookie } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/db";
import {
  asTransports,
  consumeWebAuthnChallenge,
  webAuthnRpConfig,
} from "@/lib/webauthn";
import {
  clearAuthFailures,
  clientIpFromHeaders,
  isRateLimited,
  recordAuthFailure,
} from "@/lib/rate-limit";
import {
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const ip = clientIpFromHeaders(req.headers);
  if (isRateLimited(ip)) {
    return jsonError(
      "RATE_LIMITED",
      "Too many failed login attempts. Try again in 15 minutes.",
      429,
    );
  }

  let body: AuthenticationResponseJSON;
  try {
    body = await req.json();
  } catch {
    return jsonError("BAD_REQUEST", "Expected JSON body", 400);
  }

  const passkey = await prisma.teacherPasskey.findUnique({
    where: { credentialId: body.id },
  });
  if (!passkey) {
    recordAuthFailure(ip);
    return jsonError("UNAUTHORIZED", "Unknown passkey", 401);
  }

  const { rpID, expectedOrigins } = webAuthnRpConfig(req);

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: (challenge) => consumeWebAuthnChallenge(challenge),
      expectedOrigin: expectedOrigins,
      expectedRPID: rpID,
      credential: {
        id: passkey.credentialId,
        publicKey: new Uint8Array(passkey.publicKey),
        counter: Number(passkey.counter),
        transports: asTransports(passkey.transports),
      },
      requireUserVerification: false,
    });
  } catch (err) {
    recordAuthFailure(ip);
    return jsonError(
      "UNAUTHORIZED",
      err instanceof Error ? err.message : "Passkey sign-in failed",
      401,
    );
  }

  if (!verification.verified) {
    recordAuthFailure(ip);
    return jsonError("UNAUTHORIZED", "Passkey sign-in could not be verified", 401);
  }

  await prisma.teacherPasskey.update({
    where: { id: passkey.id },
    data: { counter: BigInt(verification.authenticationInfo.newCounter) },
  });

  clearAuthFailures(ip);
  const res = NextResponse.json({ ok: true });
  await setTeacherSessionCookie(res);
  return res;
}

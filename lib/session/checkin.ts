import { randomBytes } from "node:crypto";
import type { PrismaClient } from "@/lib/generated/prisma/client";
import { scoreCheckIn } from "@/lib/scoring";
import { personalTokenTtlSeconds } from "@/lib/time";

export type CheckInSuccess = {
  code: 1 | 2 | 3 | 4;
  name: string;
  studentId: string;
  sectionCode: string;
  checkedInAt: string;
  label: string;
  sessionId: string;
};

const CODE_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Present / on time (or under 15 min late)",
  2: "Late 15–30 min",
  3: "Late 30–60 min",
  4: "Late 60+ min",
};

export function newCheckInTokenValue(): string {
  return randomBytes(9).toString("base64url");
}

export async function lookupStudent(
  prisma: PrismaClient,
  sectionCode: string,
  studentId: string,
) {
  const section = await prisma.section.findUnique({
    where: { code: sectionCode.trim().toUpperCase() },
  });
  if (!section) return null;

  return prisma.student.findFirst({
    where: {
      sectionId: section.id,
      studentId: studentId.trim(),
      active: true,
    },
    select: {
      id: true,
      studentId: true,
      name: true,
      section: {
        select: {
          id: true,
          code: true,
          subjectName: true,
          termLabel: true,
        },
      },
    },
  });
}

export type IssuePersonalTokenResult = {
  token: string;
  expiresAt: string;
  sessionId: string;
  name: string;
  studentId: string;
  sectionCode: string;
  subjectName: string;
  termLabel: string;
  meetingStartAt: string;
  meetingEndAt: string;
  room: string | null;
};

/** Issue (or refresh) a personal QR token for the open session of this section. */
export async function issuePersonalToken(
  prisma: PrismaClient,
  sectionCode: string,
  studentIdRaw: string,
): Promise<IssuePersonalTokenResult> {
  const student = await lookupStudent(prisma, sectionCode, studentIdRaw);
  if (!student) {
    throw Object.assign(new Error("Student not found in section"), {
      code: "NOT_IN_SECTION",
    });
  }

  const session = await prisma.session.findFirst({
    where: {
      status: "open",
      meeting: { sectionId: student.section.id },
    },
    include: {
      meeting: {
        include: { template: true, section: true },
      },
    },
  });
  if (!session) {
    throw Object.assign(new Error("No open session for this section"), {
      code: "SESSION_CLOSED",
    });
  }

  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      sessionId_studentId: {
        sessionId: session.id,
        studentId: student.id,
      },
    },
  });
  if (existingAttendance && existingAttendance.code > 0) {
    throw Object.assign(new Error("Already checked in for this session"), {
      code: "ALREADY_CHECKED_IN",
      codeMark: existingAttendance.code,
    });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + personalTokenTtlSeconds() * 1000);
  const token = newCheckInTokenValue();

  // Invalidate prior unused tokens for this student/session
  await prisma.checkInToken.deleteMany({
    where: {
      sessionId: session.id,
      studentId: student.id,
      consumedAt: null,
    },
  });

  await prisma.checkInToken.create({
    data: {
      sessionId: session.id,
      studentId: student.id,
      token,
      expiresAt,
    },
  });

  const room =
    session.meeting.template?.room ??
    session.meeting.template?.roomType ??
    session.meeting.title;

  return {
    token,
    expiresAt: expiresAt.toISOString(),
    sessionId: session.id,
    name: student.name,
    studentId: student.studentId,
    sectionCode: student.section.code,
    subjectName: student.section.subjectName,
    termLabel: student.section.termLabel,
    meetingStartAt: session.meeting.startAt.toISOString(),
    meetingEndAt: session.meeting.endAt.toISOString(),
    room,
  };
}

export async function getPersonalCheckInStatus(
  prisma: PrismaClient,
  token: string,
) {
  const row = await prisma.checkInToken.findUnique({
    where: { token: token.trim() },
    include: {
      student: true,
      session: {
        include: {
          meeting: { include: { section: true } },
        },
      },
    },
  });
  if (!row) {
    return { checkedIn: false as const, valid: false as const };
  }

  const attendance = await prisma.attendance.findUnique({
    where: {
      sessionId_studentId: {
        sessionId: row.sessionId,
        studentId: row.studentId,
      },
    },
  });
  if (attendance && attendance.code > 0) {
    const code = attendance.code as 1 | 2 | 3 | 4;
    return {
      checkedIn: true as const,
      valid: true as const,
      code,
      label: CODE_LABELS[code],
      name: row.student.name,
      studentId: row.student.studentId,
      sectionCode: row.session.meeting.section.code,
    };
  }

  const expired = row.expiresAt <= new Date();
  return {
    checkedIn: false as const,
    valid: !expired && !row.consumedAt,
    expired,
  };
}

/** Teacher station: scan personal token and mark attendance. */
export async function performTeacherScan(
  prisma: PrismaClient,
  sessionId: string,
  tokenRaw: string,
): Promise<CheckInSuccess> {
  const token = tokenRaw.trim();
  if (!token) {
    throw Object.assign(new Error("token is required"), { code: "BAD_REQUEST" });
  }

  const now = new Date();
  const row = await prisma.checkInToken.findUnique({
    where: { token },
    include: {
      student: true,
      session: {
        include: {
          meeting: { include: { section: true } },
        },
      },
    },
  });

  if (!row || row.expiresAt <= now) {
    throw Object.assign(new Error("QR token expired or invalid"), {
      code: "TOKEN_EXPIRED",
    });
  }
  if (row.sessionId !== sessionId) {
    throw Object.assign(new Error("Token is for a different session"), {
      code: "INVALID_TOKEN",
    });
  }
  if (row.session.status !== "open") {
    throw Object.assign(new Error("Session is closed"), {
      code: "SESSION_CLOSED",
    });
  }

  const existing = await prisma.attendance.findUnique({
    where: {
      sessionId_studentId: {
        sessionId: row.sessionId,
        studentId: row.studentId,
      },
    },
  });
  if (existing && existing.code > 0) {
    throw Object.assign(new Error("Already checked in for this session"), {
      code: "ALREADY_CHECKED_IN",
      codeMark: existing.code,
    });
  }

  const score = scoreCheckIn({
    t0: row.session.t0,
    checkedInAt: now,
    earlyMinutes: row.session.earlyMinutes,
  });
  if (score === "too_early") {
    throw Object.assign(new Error("Too early to check in"), { code: "TOO_EARLY" });
  }

  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.attendance.update({
        where: { id: existing.id },
        data: {
          code: score,
          source: "teacher_scan",
          checkedInAt: now,
        },
      });
    } else {
      await tx.attendance.create({
        data: {
          sessionId: row.sessionId,
          studentId: row.studentId,
          code: score,
          source: "teacher_scan",
          checkedInAt: now,
        },
      });
    }
    await tx.checkInToken.update({
      where: { id: row.id },
      data: { consumedAt: now },
    });
  });

  return {
    code: score,
    name: row.student.name,
    studentId: row.student.studentId,
    sectionCode: row.session.meeting.section.code,
    checkedInAt: now.toISOString(),
    label: CODE_LABELS[score],
    sessionId: row.sessionId,
  };
}

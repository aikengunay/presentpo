/** Student-facing check-in copy (conversational points + short status). */

export type AttendanceCode = 1 | 2 | 3 | 4;

export const STUDENT_STATUS: Record<
  AttendanceCode,
  {
    /** Quality weight from Excel attendance rules */
    points: number;
    /** Conversational reward line */
    pointsLine: string;
    /** Short status under the points line */
    detail: string;
    /** Teacher-oriented label */
    teacherLabel: string;
    /** Vendored Fluent animated emoji (APNG) */
    fluentSrc: string;
  }
> = {
  1: {
    points: 1,
    pointsLine: "You got 1 point",
    detail: "On time",
    teacherLabel: "Present / on time (or under 15 min late)",
    fluentSrc: "/emoji/code-1.png",
  },
  2: {
    points: 0.75,
    pointsLine: "You got 0.75 points",
    detail: "Late 15–30 mins",
    teacherLabel: "Late 15–30 min",
    fluentSrc: "/emoji/code-2.png",
  },
  3: {
    points: 0.69,
    pointsLine: "You got 0.69 points",
    detail: "Late 30–60 mins",
    teacherLabel: "Late 30–60 min",
    fluentSrc: "/emoji/code-3.png",
  },
  4: {
    points: 0.63,
    pointsLine: "You got 0.63 points",
    detail: "Late 60+ mins",
    teacherLabel: "Late 60+ min",
    fluentSrc: "/emoji/code-4.png",
  },
};

export function parseAttendanceCode(
  raw: string | number | null | undefined,
): AttendanceCode | null {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return null;
}

export function studentStatusFor(code: AttendanceCode) {
  return STUDENT_STATUS[code];
}

/** Attendance codes from check-in time. See `.cursor/references/02-attendance-rules.md`. */

export type PresentCode = 1 | 2 | 3 | 4;

export type ScoreCheckInResult = PresentCode | "too_early";

const MINUTE_MS = 60_000;

export function scoreCheckIn(input: {
  t0: Date;
  checkedInAt: Date;
  earlyMinutes?: number;
}): ScoreCheckInResult {
  const earlyMinutes = input.earlyMinutes ?? 15;
  const t0 = input.t0.getTime();
  const tc = input.checkedInAt.getTime();
  const earlyMs = earlyMinutes * MINUTE_MS;

  if (tc < t0 - earlyMs) return "too_early";
  if (tc < t0 + 15 * MINUTE_MS) return 1;
  if (tc < t0 + 30 * MINUTE_MS) return 2;
  if (tc < t0 + 60 * MINUTE_MS) return 3;
  return 4;
}

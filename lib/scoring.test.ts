import { describe, expect, it } from "vitest";
import { scoreCheckIn } from "./scoring";

const t0 = new Date("2026-07-20T13:00:00+08:00");

function atOffsetMinutes(minutes: number) {
  return new Date(t0.getTime() + minutes * 60_000);
}

describe("scoreCheckIn", () => {
  it("rejects too early (before early window)", () => {
    expect(
      scoreCheckIn({ t0, checkedInAt: atOffsetMinutes(-16), earlyMinutes: 15 }),
    ).toBe("too_early");
  });

  it("scores 1 inside early window and under 15m late", () => {
    expect(scoreCheckIn({ t0, checkedInAt: atOffsetMinutes(-15) })).toBe(1);
    expect(scoreCheckIn({ t0, checkedInAt: atOffsetMinutes(0) })).toBe(1);
    expect(scoreCheckIn({ t0, checkedInAt: atOffsetMinutes(14) })).toBe(1);
  });

  it("scores 2 for 15–30m late", () => {
    expect(scoreCheckIn({ t0, checkedInAt: atOffsetMinutes(15) })).toBe(2);
    expect(scoreCheckIn({ t0, checkedInAt: atOffsetMinutes(29) })).toBe(2);
  });

  it("scores 3 for 30–60m late", () => {
    expect(scoreCheckIn({ t0, checkedInAt: atOffsetMinutes(30) })).toBe(3);
    expect(scoreCheckIn({ t0, checkedInAt: atOffsetMinutes(59) })).toBe(3);
  });

  it("scores 4 for 60m+ late", () => {
    expect(scoreCheckIn({ t0, checkedInAt: atOffsetMinutes(60) })).toBe(4);
    expect(scoreCheckIn({ t0, checkedInAt: atOffsetMinutes(120) })).toBe(4);
  });
});

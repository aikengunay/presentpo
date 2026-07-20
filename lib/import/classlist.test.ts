import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  normalizeTime24h,
  parseClasslistBuffer,
  splitTsvLine,
} from "./classlist";

const fixtures = path.join(process.cwd(), "fixtures/classlists");

describe("splitTsvLine", () => {
  it("keeps quoted commas inside name fields", () => {
    const cells = splitTsvLine(
      '1\t2023-100964\t"ABONITA, JOHN GABRIEL SOMERA"\tBSIT-MWA',
    );
    expect(cells[2]).toBe("ABONITA, JOHN GABRIEL SOMERA");
  });
});

describe("normalizeTime24h", () => {
  it("converts 12h registrar times", () => {
    expect(normalizeTime24h("01:00PM")).toBe("13:00");
    expect(normalizeTime24h("05:00PM")).toBe("17:00");
    expect(normalizeTime24h("12:00PM")).toBe("12:00");
    expect(normalizeTime24h("12:00AM")).toBe("00:00");
  });
});

describe("parseClasslistBuffer", () => {
  it("parses INF231 fixture", () => {
    const buf = readFileSync(path.join(fixtures, "inf231.xls"));
    const data = parseClasslistBuffer(buf);
    expect(data.sectionCode).toBe("INF231MWA");
    expect(data.subjectName).toContain("CTADWEBL");
    expect(data.schedules).toHaveLength(2);
    expect(data.schedules[0]).toMatchObject({
      dayOfWeek: 3,
      startTime: "13:00",
      endTime: "15:40",
      roomType: "Lec",
    });
    expect(data.schedules[1]).toMatchObject({
      dayOfWeek: 6,
      startTime: "13:00",
      endTime: "17:00",
      roomType: "Lab",
    });
    expect(data.students.length).toBe(40);
    expect(data.students[0].studentId).toBe("2023-100964");
  });

  it("parses INF232 fixture", () => {
    const buf = readFileSync(path.join(fixtures, "inf232.xls"));
    const data = parseClasslistBuffer(buf);
    expect(data.sectionCode).toBe("INF232MWA");
    expect(data.schedules).toHaveLength(2);
    expect(data.students.length).toBe(22);
  });
});

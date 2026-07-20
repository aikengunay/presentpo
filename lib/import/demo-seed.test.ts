import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { parseClasslistBuffer } from "./classlist";
import { commitClasslist } from "./commit";

describe("INF191 demo fixture", () => {
  it("imports only the demo student into INF191", async () => {
    const buf = readFileSync(
      path.join(process.cwd(), "fixtures/classlists/inf191-demo.xls"),
    );
    const parsed = parseClasslistBuffer(buf);
    expect(parsed.sectionCode).toBe("INF191");
    expect(parsed.students).toHaveLength(1);
    expect(parsed.students[0]?.studentId).toBe("2019-100265");

    const result = await commitClasslist(prisma, parsed);
    const section = await prisma.section.findUniqueOrThrow({
      where: { id: result.sectionId },
      include: { students: true },
    });
    expect(section.code).toBe("INF191");
    expect(section.students).toHaveLength(1);
    expect(section.students[0]?.studentId).toBe("2019-100265");

    // Real sections unchanged by this fixture path
    expect(parsed.subjectName.toLowerCase()).toContain("demo");
  });
});

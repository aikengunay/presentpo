/**
 * Upsert the INF191 demo section + demo student (not part of INF231/INF232).
 *
 *   npx tsx scripts/seed-demo.ts
 *   npm run db:seed-demo
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseClasslistBuffer } from "../lib/import/classlist";
import { commitClasslist } from "../lib/import/commit";
import { prisma } from "../lib/db";

async function main() {
  const file = path.join(
    process.cwd(),
    "fixtures/classlists/inf191-demo.xls",
  );
  const parsed = parseClasslistBuffer(readFileSync(file));
  const result = await commitClasslist(prisma, parsed);

  const section = await prisma.section.findUniqueOrThrow({
    where: { id: result.sectionId },
    include: {
      students: true,
      templates: true,
    },
  });

  console.log("Demo section ready:");
  console.log(`  code:     ${section.code}`);
  console.log(`  subject:  ${section.subjectName}`);
  console.log(`  students: ${section.students.map((s) => `${s.studentId} (${s.name})`).join(", ")}`);
  console.log(`  schedules:${section.templates.length}`);
  console.log("");
  console.log("Demo check-in: section INF191 · Student ID 2019-100265");
  console.log("(Keep INF231/INF232 for real classes; do not export INF191 into term gradebooks.)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

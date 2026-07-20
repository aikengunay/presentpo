/** Parse Registrar classlist TSV (.xls). See `.cursor/references/03-classlist-import.md`. */

export type ParsedSchedule = {
  dayOfWeek: number;
  dayLabel: string;
  startTime: string;
  endTime: string;
  roomType: string | null;
  room: string | null;
};

export type ParsedStudent = {
  studentId: string;
  name: string;
  email: string | null;
  status: string | null;
};

export type ParsedClasslist = {
  termLabel: string;
  subjectName: string;
  sectionCode: string;
  instructor: string | null;
  classLimit: number | null;
  schedules: ParsedSchedule[];
  students: ParsedStudent[];
};

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export function decodeClasslistBytes(buf: Buffer): string {
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.toString("utf8").slice(3);
  }
  // Registrar exports are often Windows-1252 / Latin-1
  return buf.toString("latin1");
}

/** Split a TSV line, respecting double-quoted fields. */
export function splitTsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "\t" && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

export function normalizeTime24h(raw: string): string {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) {
    throw new Error(`Invalid time: ${raw}`);
  }
  let hour = Number(m[1]);
  const minute = m[2];
  const ampm = m[3].toUpperCase();
  if (ampm === "AM") {
    if (hour === 12) hour = 0;
  } else if (hour !== 12) {
    hour += 12;
  }
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function dayOfWeekFromLabel(label: string): number {
  const key = label.trim().toLowerCase();
  const n = DAY_MAP[key];
  if (n === undefined) throw new Error(`Unknown day: ${label}`);
  return n;
}

function cleanName(name: string): string {
  return name.replace(/^"|"$/g, "").trim();
}

export function parseClasslistTsv(text: string): ParsedClasslist {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  let termLabel = "";
  let subjectName = "";
  let sectionCode = "";
  let instructor: string | null = null;
  let classLimit: number | null = null;
  const schedules: ParsedSchedule[] = [];
  const students: ParsedStudent[] = [];

  let mode: "header" | "schedules" | "students" | "none" = "header";

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    const cells = splitTsvLine(line);
    const head = (cells[0] ?? "").trim();
    const headLower = head.toLowerCase();

    if (headLower.startsWith("official classlist")) {
      termLabel = head.replace(/^Official Classlist for\s+/i, "").trim();
      continue;
    }

    if (headLower === "subject schedules") {
      mode = "schedules";
      continue;
    }
    if (headLower === "list of students") {
      mode = "students";
      continue;
    }

    if (mode === "header") {
      if (headLower === "subject name") {
        subjectName = cells[1]?.trim() ?? "";
        continue;
      }
      if (headLower === "section") {
        sectionCode = cells[1]?.trim() ?? "";
        continue;
      }
      if (headLower === "instructor") {
        instructor = cells[1]?.trim() || null;
        continue;
      }
      if (headLower === "class limit") {
        const n = Number(cells[1]);
        classLimit = Number.isFinite(n) ? n : null;
        continue;
      }
      continue;
    }

    if (mode === "schedules") {
      if (head === "#" || headLower === "day") continue;
      if (!/^\d+$/.test(head)) continue;
      const dayLabel = cells[1]?.trim() ?? "";
      const startRaw = cells[2]?.trim() ?? "";
      const endRaw = cells[3]?.trim() ?? "";
      if (!dayLabel || !startRaw || !endRaw) continue;
      schedules.push({
        dayOfWeek: dayOfWeekFromLabel(dayLabel),
        dayLabel,
        startTime: normalizeTime24h(startRaw),
        endTime: normalizeTime24h(endRaw),
        roomType: cells[4]?.trim() || null,
        room: cells[5]?.trim() || null,
      });
      continue;
    }

    if (mode === "students") {
      if (head === "#" || headLower === "student id") continue;
      if (!/^\d+$/.test(head)) continue;
      const studentId = cells[1]?.trim() ?? "";
      const name = cleanName(cells[2] ?? "");
      if (!studentId || !name) continue;
      students.push({
        studentId,
        name,
        email: cells[6]?.trim() || null,
        status: cells[8]?.trim() || null,
      });
    }
  }

  if (!sectionCode) throw new Error("Missing Section in classlist");
  if (!subjectName) throw new Error("Missing Subject Name in classlist");
  if (students.length === 0) throw new Error("No students found in classlist");

  return {
    termLabel: termLabel || "Unknown term",
    subjectName,
    sectionCode,
    instructor,
    classLimit,
    schedules,
    students,
  };
}

export function parseClasslistBuffer(buf: Buffer): ParsedClasslist {
  return parseClasslistTsv(decodeClasslistBytes(buf));
}

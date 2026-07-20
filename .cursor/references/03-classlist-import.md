# University classlist import

## Source files

Registrar exports (TSV disguised as `.xls`):

- `teaching/references/02-ctadwebl/02-classlists/inf231.xls`
- `teaching/references/02-ctadwebl/02-classlists/inf232.xls`

Treat as **UTF-8/Latin-1 TSV**, not real BIFF Excel, unless OpenXML is detected.

## Parsed fields

### Header block

| Field | Example |
|-------|---------|
| Subject Name | `CTADWEBL: ADVANCED WEB PROGRAMMING` |
| Section | `INF231MWA` / `INF232MWA` |
| Instructor | `24-0102: MR. AIKEN JOAQUIN E. GUNAY` |
| Class Limit | `40` |

### Schedules (one or more rows)

| Field | Example |
|-------|---------|
| Day | `Wednesday` / `Saturday` |
| Time Start | `01:00PM` |
| Time End | `03:40PM` |
| Room Type | `Lec` / `Lab` |
| Room | `601ANB` / `413MB` |

### Students

| Field | Example |
|-------|---------|
| Student ID | `2023-100964` |
| Student Name | `ABONITA, JOHN GABRIEL SOMERA` |
| Official Email | `abonitajs@students.national-u.edu.ph` |
| Status | `Enrolled` / `Registered` |

Import **all listed students** (Enrolled + Registered) unless teacher filters later.

## Import behavior (MVP)

1. Upload file → parse → preview section, schedules, N students.
2. Confirm → create/update CourseSection + MeetingTemplates + Students.
3. Re-import same section: upsert by Student ID; do not wipe historical attendance.
4. Allow manual add (e.g. late add like `AVORQUE, JENNY BACLEA-AN`).

## Section schedule notes (CTADWEBL Term 1)

| Section | Lecture | Lab |
|---------|---------|-----|
| INF231MWA | Wed 1:00–3:40 PM | Sat 1:00–5:00 PM |
| INF232MWA | Sat 5:00–7:40 PM | Wed 5:00–9:00 PM |

Sessions are per **meeting instance** (date + section + schedule row), not per calendar week alone.

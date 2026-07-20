# Screen flow (MVP wireframes)

Do **not** invent extra pages beyond this list for the 2-day MVP.

## Roles

| Role | Entry |
|------|--------|
| Teacher | `/teacher` — PIN gate |
| Student | `/` or `/join` — no PIN |
| Projector | `/teacher/sessions/[id]/projector` — opened by teacher after Start |

---

## Teacher screens

### T0 — PIN login
`/teacher/login`

- Input: teacher PIN
- Action: unlock teacher area (session cookie / signed cookie)
- On success → T1

### T1 — Home (sections)
`/teacher`

- List sections (e.g. INF231MWA, INF232MWA)
- Actions: open section → T2; Import classlist → T1b

### T1b — Import classlist
`/teacher/import`

- Upload Registrar `.xls` / TSV
- Preview: section, schedules, student count, sample rows
- Confirm → upsert section + students + meeting templates → T2

### T2 — Section detail
`/teacher/sections/[sectionId]`

- Roster (name, student ID)
- Meeting list (from schedule templates × dates, or upcoming + past sessions)
- Actions: open meeting → T3; add student manually (simple form)

### T3 — Meeting / session control
`/teacher/sections/[sectionId]/meetings/[meetingId]`

- Show scheduled start/end, room
- If no open session: **Start session** (optional: “T0 = now” vs scheduled)
- If open: links to **Projector**, **Live roster**, **End session**
- If closed: summary counts + **Export** + reopen overrides on T5

### T4 — Projector (QR + announcement)
`/teacher/sessions/[sessionId]/projector`

- Huge rotating QR
- Countdown to next rotate
- Base URL / laptop IP hint
- Latest check-in name (large)
- Counts: checked in / roster
- Toggle: **Announce names** (TTS, off by default)
- Fallback code under QR (typeable if no camera)

### T5 — Live roster / overrides
`/teacher/sessions/[sessionId]/roster`

- Table: student, code, source (`qr` / `manual` / `auto`), time
- Search / filter unmarked
- Actions: set code `0–4`, note; manual mark for no-phone
- End session button (also on T3)

### T6 — Export
`/teacher/sections/[sectionId]/export`

- Date range or “all opened sessions”
- Download `.xlsx` (flat + pivot grid)
- No other analytics screens in MVP (`summary` stays in Excel)

---

## Student screens

### S1 — Identify
`/join` (or `/`)

- Enter Student ID
- Lookup → show name → **This is me** / Not me
- Remember ID in `localStorage` for next time (optional)

### S2 — Check in
`/join/check-in`

- Requires identified student + open session context from QR/token
- Scan QR (camera) **or** type short code from projector
- Submit → S3

### S3 — Result
`/join/done`

- Success: code + plain language (“Late 15–30 min → code 2”)
- Errors: expired token, already checked in, not in section, session closed
- Button: done (no extra student dashboard in MVP)

---

## Class-day click path (happy path)

**Teacher:** T0 → T1 → T2 → T3 → Start → T4 (projector) → (teach) → T5/T3 End → T6 later  

**Student:** S1 → S2 → S3  

## Out of scope screens (do not build yet)

- Student history / grade portal
- Multi-teacher admin
- Settings labyrinth
- Dark analytics dashboard
- Native mobile apps

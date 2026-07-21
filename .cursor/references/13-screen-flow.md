# Screen flow (v0.2)

Do **not** invent extra pages beyond this list without updating this doc.

## Roles

| Role | Entry |
|------|--------|
| Teacher | `/teacher` — password / passkey gate |
| Student | `/` or `/join` — no teacher auth |
| Station | `/teacher/sessions/[id]/scan` — tripod phone after Start |
| Presence (optional) | `/teacher/sessions/[id]/board` (or renamed projector) — names only |

---

## Teacher screens

### T0 — Teacher login
`/teacher/login`

- Input: teacher password or passkey → teacher cookie → T1

### T1 — Home (sections)
`/teacher`

- List sections; Import classlist → T1b

### T1b — Import classlist
`/teacher/import`

- Upload Registrar `.xls` / TSV → preview → commit → T2

### T2 — Section detail
`/teacher/sections/[sectionId]`

- Roster; meetings/sessions; start session; export

### T3 — Meeting / session control
(Section page or dedicated meeting view)

- **Start session** / **End session** / **Cancel** (no auto-`0` on cancel — see edge cases)
- If open: **Station Scan**, **Roster**, optional **Presence board**

### T4 — Station Scan (primary check-in UI)
`/teacher/sessions/[sessionId]/scan`

- Continuous camera (secure context / public HTTPS)
- On decode: large **name + Student ID + section**
- Confirm / Reject (or short auto-accept — product choice)
- Stay on page for next student; clear errors for expired / already in / wrong session

### T4b — Presence board (optional)
`/teacher/sessions/[sessionId]/board` (replaces old projector check-in page)

- Latest name + recent list + counts
- **No** rotating check-in QR, **no** typed board fallback code
- Optional TTS (off by default)

### T5 — Live roster / overrides
`/teacher/sessions/[sessionId]/roster`

- Table: student, code, source (`teacher_scan` / `manual` / `auto`), time
- Manual mark for no-phone; End session

### T6 — Export
`/teacher/sections/[sectionId]/export`

- Download `.xlsx` for opened sessions

---

## Student screens

### S1 — Identify
`/join`

- Section + Student ID → Find me → name confirm
- **No** student camera / board QR scanner

### S2 — Show personal QR
`/join` (same flow step) or `/join/show`

- Large QR for open session; short TTL; copy: place under station camera
- Poll or refresh until checked in → S3

### S3 — Result
`/join/done`

- Success: code + plain language
- Errors: expired, already checked in, session closed, etc.

---

## Class-day click path (happy path)

**Teacher:** T0 → T1 → T2 → Start → **T4 Station Scan** (tripod) → teach → End → T5/T6  

**Student:** S1 → S2 (place phone on table) → S3  

## Retired screens (do not rebuild)

- Projector page as rotating **check-in** QR + fallback code
- Student “scan the board / Open camera” on `/join`

## Out of scope screens

- Student history / grade portal
- Multi-teacher admin
- Native mobile apps

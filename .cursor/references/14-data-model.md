# Data model (MVP)

SQLite via Prisma. Keep tables minimal; uniqueness rules are load-bearing.

## Entity overview

```
Section 1──* Student
Section 1──* MeetingTemplate
Section 1──* Meeting
Meeting 1──0..1 Session          (one open/closed capture per meeting)
Session 1──* QrToken
Session 1──* Attendance
Student 1──* Attendance
```

---

## Section

Course offering / class section.

| Field | Type | Notes |
|-------|------|--------|
| `id` | cuid | PK |
| `code` | string | e.g. `INF231MWA` — **unique** |
| `subjectName` | string | e.g. CTADWEBL… |
| `termLabel` | string | e.g. `AY 2026-2027 1st Term` |
| `createdAt` | datetime | |

**Uniqueness:** `code`

---

## Student

| Field | Type | Notes |
|-------|------|--------|
| `id` | cuid | PK |
| `sectionId` | fk → Section | |
| `studentId` | string | Registrar ID, e.g. `2023-100964` |
| `name` | string | `LAST, FIRST …` |
| `email` | string? | official email |
| `status` | string? | Enrolled / Registered |
| `active` | boolean | default true; soft-drop |
| `createdAt` | datetime | |

**Uniqueness:** `@@unique([sectionId, studentId])`  
Same person in two sections = two rows (correct for INF231 vs INF232).

---

## MeetingTemplate

Recurring schedule row from classlist (Wed lec, Sat lab, …).

| Field | Type | Notes |
|-------|------|--------|
| `id` | cuid | PK |
| `sectionId` | fk → Section | |
| `dayOfWeek` | int | 0=Sun … 6=Sat (or store `Wednesday`) |
| `startTime` | string | `13:00` 24h normalized |
| `endTime` | string | `15:40` |
| `room` | string? | |
| `roomType` | string? | Lec / Lab |
| `label` | string? | optional display |

**Uniqueness (soft):** `@@unique([sectionId, dayOfWeek, startTime])`

---

## Meeting

A concrete calendar instance (one date).

| Field | Type | Notes |
|-------|------|--------|
| `id` | cuid | PK |
| `sectionId` | fk → Section | |
| `templateId` | fk? → MeetingTemplate | |
| `date` | date | local class date |
| `startAt` | datetime | scheduled start (timezone: Asia/Manila) |
| `endAt` | datetime | scheduled end |
| `title` | string? | e.g. `Lab` |

**Uniqueness:** `@@unique([sectionId, date, startAt])`  
Unopened meetings may exist as rows **or** be created lazily on Start — pick one in implementation; prefer **create on Start** for MVP to avoid blank calendar spam.

---

## Session

Live capture window for a Meeting.

| Field | Type | Notes |
|-------|------|--------|
| `id` | cuid | PK |
| `meetingId` | fk → Meeting | **unique** (one session per meeting) |
| `status` | enum | `open` \| `closed` |
| `t0` | datetime | scoring start (schedule or “now”) |
| `openedAt` | datetime | |
| `closedAt` | datetime? | |
| `earlyMinutes` | int | default 15 |
| `autoAbsentDone` | boolean | after close marks applied |

**Uniqueness:** `meetingId`  
**Invariant:** at most one `status=open` session per `sectionId` (enforce in app logic).

---

## Attendance

| Field | Type | Notes |
|-------|------|--------|
| `id` | cuid | PK |
| `sessionId` | fk → Session | |
| `studentId` | fk → Student | |
| `code` | int | `0–4` |
| `source` | enum | `qr` \| `manual` \| `auto` |
| `checkedInAt` | datetime? | null for auto-absent |
| `note` | string? | override reason |
| `updatedAt` | datetime | |

**Uniqueness:** `@@unique([sessionId, studentId])` — one mark per student per session.

---

## QrToken

Rotating token for projector QR.

| Field | Type | Notes |
|-------|------|--------|
| `id` | cuid | PK |
| `sessionId` | fk → Session | |
| `token` | string | random, URL-safe |
| `expiresAt` | datetime | now + rotate seconds |
| `createdAt` | datetime | |

**Uniqueness:** `token`  
Check-in accepts only token where `expiresAt > now()` and session `open`.

---

## Non-goals in schema (MVP)

- No `User` table for students
- No photo / device fingerprint tables
- No multi-tenant `School` entity

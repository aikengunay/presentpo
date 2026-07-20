# Attendance Tracker

Web app to capture class attendance **without interrupting teaching**: students scan a **rotating classroom QR**; late codes `1–4` and absences `0` are assigned automatically from server time.

Built for CTADWEBL sections (INF231 / INF232) and designed to export into the existing Excel attendance workflow.

## Status

**Day 0 — project established** (references, Cursor rules, stack, 2-day phases).  
Implementation scaffold is next (see phases).

## Product docs (read these)

All decisions live in [`.cursor/references/`](.cursor/references/):

| Doc | Topic |
|-----|--------|
| [01-product-brief.md](.cursor/references/01-product-brief.md) | Problem, MVP, non-goals |
| [02-attendance-rules.md](.cursor/references/02-attendance-rules.md) | Codes & late windows |
| [03-classlist-import.md](.cursor/references/03-classlist-import.md) | Registrar `.xls` import |
| [04-session-lifecycle.md](.cursor/references/04-session-lifecycle.md) | Rotating QR flow |
| [05-edge-cases.md](.cursor/references/05-edge-cases.md) | Proxy, timing, overrides |
| [06-stack.md](.cursor/references/06-stack.md) | Next.js + Prisma + SQLite |
| [07-phases-2day.md](.cursor/references/07-phases-2day.md) | Day 1 / Day 2 plan |
| [08-excel-export-compat.md](.cursor/references/08-excel-export-compat.md) | Export shape |
| [09-industry-notes.md](.cursor/references/09-industry-notes.md) | Why this model |
| [10-classroom-runbook.md](.cursor/references/10-classroom-runbook.md) | AP + IP + QR classroom setup |
| [11-anti-cheat-and-identity.md](.cursor/references/11-anti-cheat-and-identity.md) | Passwords vs QR layers |
| [12-checkin-announcements.md](.cursor/references/12-checkin-announcements.md) | Live name display + optional TTS |
| [13-screen-flow.md](.cursor/references/13-screen-flow.md) | Teacher / student / projector screens |
| [14-data-model.md](.cursor/references/14-data-model.md) | Prisma entities + uniqueness |
| [15-api-mvp.md](.cursor/references/15-api-mvp.md) | ~12 endpoints only |

Checklist: [`.cursor/plans/2day-mvp.md`](.cursor/plans/2day-mvp.md)

## Stack (MVP)

- Next.js (App Router) + TypeScript  
- Prisma + SQLite  
- Rotating QR check-in  
- TSV classlist import (university `.xls`)  
- Excel export of codes  

## Related files outside this repo

- Classlists: `../../references/02-ctadwebl/02-classlists/` (from `teaching/`)
- Attendance workbooks: `../../attendance/`

## Next command (when starting Day 1)

Scaffold the Next.js app and Prisma schema per `.cursor/references/06-stack.md` and tick Day 1 items in `.cursor/plans/2day-mvp.md`.

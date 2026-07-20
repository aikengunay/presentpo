# Product brief — Attendance Tracker

## Problem

During lecture/lab, late arrivals need attendance codes entered, but stopping mid-teaching to update Excel is distracting. Not all students arrive before the official start (e.g. before 3:00 PM). The teacher needs capture to happen **without interrupting teaching**.

## Goal (2-day testable MVP)

A small web app where:

1. Teacher imports the university classlist (`.xls` / TSV from Registrar).
2. Teacher starts a class session for a section + meeting.
3. Students check in by scanning a **rotating classroom QR**.
4. App assigns codes `1–4` or auto-`0` from arrival time.
5. Teacher can override.
6. Export matches the existing Excel attendance workflow under `teaching/attendance/`.

## Non-goals for MVP

- Face recognition / biometrics
- Teacher scanning every student as the primary flow
- Full LMS integration (Canvas/Teams)
- Perfect anti-cheat beyond rotating QR + time window + one check-in per student
- Replacing Excel as long-term gradebook on day one (export first)

## Primary users

| Role | Job |
|------|-----|
| Teacher | Import roster, start/end session, show QR, override, export |
| Student | Log in / identify self, scan QR, see confirmation |

## Success for the 2-day test

- Import INF231 + INF232 classlists successfully
- Run one live or simulated session per section
- Late rules produce correct codes
- No-show becomes `0` after session end
- Export usable in current attendance sheets
- Teacher does not need to touch attendance mid-lecture

## Related teaching artifacts (outside this repo)

- Classlists: `teaching/references/02-ctadwebl/02-classlists/inf231.xls`, `inf232.xls`
- Excel attendance: `teaching/attendance/attendance-inf231.xlsx`, `attendance-inf232.xlsx`
- University calendar: `teaching/references/02-ctadwebl/02-classlists/university-calendar-ay2026_2027.pdf`

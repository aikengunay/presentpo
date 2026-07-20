# Product brief — Attendance Tracker

## Problem

During lecture/lab, attendance must be captured without stopping mid-teaching to edit Excel. Late arrivals need fair codes. The teacher wants a **quick physical verify** that the person checking in is the roster student—without relying on a classroom access point or offline LAN.

## Goal (v0.2)

A web app hosted on a **public HTTPS domain** (Cloudflare) where:

1. Teacher imports the university classlist (Registrar `.xls` / TSV).
2. Teacher starts a class session for a section + meeting.
3. Students open the site on any internet connection → Student ID → confirm name → **show a personal QR**.
4. Teacher phone on a **tripod** (camera facing a table) runs the **Station Scan** page; students place their phone in frame.
5. Teacher glances person ↔ name on screen → mark lands; app assigns codes `1–4` or auto-`0` from server time.
6. Teacher can override; export matches existing Excel attendance workbooks.

## Non-goals (v0.2)

- Classroom **AP / offline LAN** as the runtime network
- Student scans a **rotating projector QR** as the primary check-in
- Face recognition / biometrics / geofence
- Full LMS integration (Canvas/Teams)
- Student password accounts / school SSO
- Multi-tenant SaaS

## Primary users

| Role | Job |
|------|-----|
| Teacher | Import roster, start/end session, run tripod Scan, override, export |
| Student | Identify self, display personal QR at the station, see confirmation |

## Success

- App reachable at a stable `https://` domain
- Tripod station check-in works on teacher iPhone (secure context)
- Late rules produce correct codes; end session → missing `0`
- Export usable in current attendance sheets
- No AP gear or mkcert-on-phones in the class-day runbook

## Related teaching artifacts (outside this repo)

- Classlists: `teaching/references/02-ctadwebl/02-classlists/inf231.xls`, `inf232.xls`
- Excel attendance: `teaching/attendance/attendance-inf231.xlsx`, `attendance-inf232.xlsx`
- University calendar: `teaching/references/02-ctadwebl/02-classlists/university-calendar-ay2026_2027.pdf`

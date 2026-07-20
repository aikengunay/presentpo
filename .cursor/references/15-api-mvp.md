# API (v0.2 target)

Teacher routes require PIN session. Student identify/show-QR does not finalize attendance.  
**Station scan finalize is teacher-auth only.**

Keep handlers thin; scoring/import/export live in `lib/`.

## Auth

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/teacher/login` | public | `{ pin }` → teacher cookie |
| `POST` | `/api/teacher/logout` | teacher | Clear cookie |

---

## Import & sections

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/import/classlist` | teacher | preview or commit |
| `GET` | `/api/sections` | teacher | List sections |
| `GET` | `/api/sections/[sectionId]` | teacher | Section + roster + sessions |

---

## Session lifecycle

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/sessions/start` | teacher | Open session |
| `POST` | `/api/sessions/[sessionId]/end` | teacher | Close; auto-`0` missing (`source=auto`) |
| `POST` | `/api/sessions/[sessionId]/cancel` | teacher | Discard open session **without** auto-`0` (v0.2) |

---

## Student identify + personal token

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/students/lookup` | public | `?sectionCode=&studentId=` → `{ name }` |
| `POST` | `/api/check-in/token` | public | After confirm: issue **personal** short-lived token for open session (display as QR). Does **not** mark attendance. |
| `GET` | `/api/check-in/status` | public | Optional poll: `{ checkedIn, code? }` for student waiting at station |

---

## Station scan (teacher) & feed

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/sessions/[sessionId]/scan` | teacher | Body `{ token }` → validate personal token → score → upsert Attendance `source=teacher_scan` → return name/code |
| `GET` | `/api/sessions/[sessionId]/feed` | teacher | Recent check-ins + counts (presence board / roster poll) |

---

## Override & export

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `PATCH` | `/api/sessions/[sessionId]/attendance/[studentId]` | teacher | Manual / override |
| `GET` | `/api/sections/[sectionId]/export` | teacher | Download `.xlsx` |

---

## Retired endpoints (remove in implementation)

| Path | Why |
|------|-----|
| `GET /api/sessions/[sessionId]/qr` | Projector rotating check-in QR |
| `POST /api/check-in` as **public** finalize with board token | Replaced by teacher `.../scan` |

Public `POST /api/check-in` may be deleted or reduced to a no-op redirect during cleanup—do not leave a public finalize path.

## Error shape

```json
{ "error": "TOKEN_EXPIRED" | "ALREADY_CHECKED_IN" | "NOT_IN_SECTION" | "SESSION_CLOSED" | "UNAUTHORIZED" | "INVALID_TOKEN", "message": "..." }
```

## Out of scope APIs

- Student registration / password reset  
- Webhooks / Teams  
- Websocket required (polling OK)  
- Geofence / device attestation  

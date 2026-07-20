# API MVP (max ~12 endpoints)

Teacher routes require PIN session. Student check-in does not.  
Keep handlers thin; scoring/import/export live in `lib/`.

## Auth

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/teacher/login` | public | Body `{ pin }` → set teacher cookie |
| `POST` | `/api/teacher/logout` | teacher | Clear cookie |

---

## Import & sections

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/import/classlist` | teacher | multipart file → parse → preview **or** commit (`?commit=1`) |
| `GET` | `/api/sections` | teacher | List sections |
| `GET` | `/api/sections/[sectionId]` | teacher | Section + roster + meetings/sessions summary |

`POST /api/import/classlist` may return preview JSON without write; second call with `commit=true` upserts. One endpoint, two modes — counts as one.

---

## Session lifecycle

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/sessions/start` | teacher | Body `{ sectionId, date, templateId?, t0Mode: "scheduled"\|"now" }` → create Meeting+Session `open` |
| `POST` | `/api/sessions/[sessionId]/end` | teacher | Close; auto-mark missing students `0` (`source=auto`) |
| `GET` | `/api/sessions/[sessionId]/qr` | teacher | Current token + `expiresAt` + payload URL/text (projector polls every few s) |

---

## Check-in & live feed

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/students/lookup` | public | `?sectionCode=&studentId=` → `{ name }` or 404 |
| `POST` | `/api/check-in` | public | Body `{ studentId, sectionCode, token }` → validate → score → upsert Attendance `source=qr` |
| `GET` | `/api/sessions/[sessionId]/feed` | teacher | Recent check-ins + counts (projector/roster poll) |

---

## Override & export

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `PATCH` | `/api/sessions/[sessionId]/attendance/[studentId]` | teacher | Body `{ code, note? }` → manual/`override` mark |
| `GET` | `/api/sections/[sectionId]/export` | teacher | Download `.xlsx` for opened sessions |

---

## Endpoint count

1. login  
2. logout  
3. import classlist  
4. sections list  
5. section detail  
6. session start  
7. session end  
8. qr  
9. student lookup  
10. check-in  
11. feed  
12. attendance patch  
13. export  

If forced to cut one: merge logout into login docs-only and skip dedicated logout (clear cookie client-side). Prefer keeping **13** over inventing more.

## Out of scope APIs

- Student registration / password reset  
- Webhooks / Teams  
- Realtime websocket (use poll 1–2s on QR + feed)  
- Bulk admin CRUD beyond import + patch  

## Error shape (consistent)

```json
{ "error": "TOKEN_EXPIRED" | "ALREADY_CHECKED_IN" | "NOT_IN_SECTION" | "SESSION_CLOSED" | "UNAUTHORIZED", "message": "..." }
```

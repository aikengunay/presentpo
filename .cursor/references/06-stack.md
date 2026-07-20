# Stack (2-day MVP)

Optimize for: ship a testable local demo fast, match teacher’s MERN familiarity, avoid cloud setup friction.

## Chosen stack

| Layer | Choice | Why |
|-------|--------|-----|
| App | **Next.js** (App Router) + **TypeScript** | One repo, API + UI, fast iteration |
| UI | React + simple CSS (Tailwind optional) | Enough for teacher/student screens |
| DB | **SQLite** via **Prisma 7** + `better-sqlite3` adapter | Zero install ops; file-based; easy reset |
| Auth (MVP) | Teacher: shared PIN / password in env. Student: Student ID + last-name check | Fast; upgrade later |
| QR | `qrcode` server/client + rotating token in DB | Standard |
| Import | Custom TSV parser for Registrar `.xls` | Matches real university files |
| Export | `exceljs` or `xlsx` → codes grid | Feeds existing attendance workbooks |
| Hosting (test) | **Docker Compose** (preferred) or `next start` on laptop | Classroom AP + LAN IP; bind `0.0.0.0` |

## Run paths (classroom)

1. **Preferred:** `docker compose up` — app on host port `3000`, SQLite on a named/host volume (`./data`), listen on `0.0.0.0` so phones on the teacher AP can reach `http://<laptop-lan-ip>:3000`.
2. **Dev:** `npm run dev` (or equivalent) with the same bind / env for local iteration.
3. See `10-classroom-runbook.md` for AP + projector QR steps.

## Explicitly deferred

- Postgres / Supabase
- NextAuth + Google Workspace
- Mobile native apps
- Realtime websockets (polling QR every few seconds is enough)
- Multi-tenant SaaS
- Cloud host (Vercel, etc.) for the first classroom test

## Repo layout (target)

```
attendance-tracker/
  .cursor/
    references/     # product truth (this folder)
    rules/          # agent rules
    plans/          # phase checklists
  app/              # Next.js app router
  components/
  lib/              # db, scoring, import, qr, export
  prisma/
  public/
  data/             # SQLite volume (gitignored)
  Dockerfile
  docker-compose.yml
  README.md
  AGENTS.md
```

## Environment (MVP)

```bash
DATABASE_URL="file:./data/dev.db"
TEACHER_PIN="...."
QR_ROTATE_SECONDS=20
EARLY_CHECKIN_MINUTES=15
TZ=Asia/Manila
```

## Scoring module

Pure function, unit-tested:

`scoreCheckIn({ t0, checkedInAt, earlyMinutes }) → 1|2|3|4`

Session close:

`markAbsences(sessionId) → set 0 for students without attendance row`

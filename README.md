# Attendance Tracker

Web app to capture class attendance **without interrupting teaching**: students scan a **rotating classroom QR**; late codes `1–4` and absences `0` are assigned automatically from server time.

Built for CTADWEBL sections (INF231 / INF232). Export fills the same gradebook workbooks as `.cursor/references/complete-attendance-tracker/`.

## Status

**M7 / v0.1.0-mvp** — INF231+INF232 dry-run passed; classroom-ready MVP tagged.

## Quick start (local)

```bash
cp .env.example .env   # set TEACHER_PIN
mkdir -p data
npm install
npx prisma migrate dev
brew install mkcert nss   # once per laptop
npm run certs:setup       # after joining classroom AP (covers LAN IPs)
npm run dev
```

`npm run dev` prints your **HTTPS** LAN URL + a terminal QR when `certs/` exist (mkcert). Phones on the same Wi‑Fi/AP open `https://<PC-IP>:3000` — not `localhost`. Install `certs/rootCA.pem` on phones once so the certificate is trusted (required for in-app camera). Details: [classroom runbook](.cursor/references/10-classroom-runbook.md).

**Next.js 16 note:** phone access needs `allowedDevOrigins` (auto-filled from your LAN IPs in `next.config.ts`). Restart `npm run dev` after network/IP changes. Re-run `npm run certs:setup` when the laptop IP changes.

- App: `https://localhost:3000` on this PC (bound to `0.0.0.0`); HTTP fallback: `npm run dev:http`
- Teacher: `/teacher` → PIN → import classlist → start session → projector
- Student: open `/join` → **Open camera** (in-app on trusted HTTPS) or phone Camera on projector QR → Student ID → confirm
- Export: section → **Export gradebook** → filled `midterms`/`finals`/`all`/`summary` workbook

### Demo section (not a real class)

For walkthroughs without touching INF231/INF232:

```bash
npm run db:seed-demo
```

| Field | Value |
|-------|--------|
| Section | `INF191` |
| Student ID | `2019-100265` |
| Name | GUNAY, AIKEN JOAQUIN E. |

Use **INF191** → Start session → projector → phone joins with that Student ID.  
Do not treat INF191 exports as term gradebooks (template fallback only).

```bash
npm test                 # includes INF231/INF232 dry-run
npm run build
npm run start            # HTTPS (needs certs); HTTP: npm run start:http
SMOKE_BASE=https://127.0.0.1:3000 npm run smoke:http   # uses -k if https
```

Dry-run notes: [`.cursor/references/16-mvp-dryrun-notes.md`](.cursor/references/16-mvp-dryrun-notes.md).

## Quick start (Docker / classroom)

```bash
cp .env.example .env
mkdir -p data
docker compose up --build
```

Docker Compose still serves **HTTP** on `:3000` (good for OS Camera / typed fallback). For in-app camera, prefer host HTTPS: `npm run certs:setup && npm run build && npm run start`.

SQLite persists in `./data`.

### Classroom AP checklist

1. Power AP → SSID e.g. `CTADWEBL-ATTEND` (write password on board).
2. Connect laptop to AP; note LAN IP (`ipconfig getifaddr en0` on macOS).
3. `npm run certs:setup` then `npm run build && npm run start` (or Docker HTTP if you skip in-app camera).
4. Install `certs/rootCA.pem` on phones once; open `https://<IP>:3000`.
5. If phones fail: disable AP / guest isolation; confirm CA trust on iOS.
6. Teacher: login → section → **Start session** → **Projector QR** (fullscreen).
7. Optional: enable **Announce names** (TTS, off by default).
8. **End session** → missing → `0` → **Export gradebook** when convenient.

Full detail: [`.cursor/references/10-classroom-runbook.md`](.cursor/references/10-classroom-runbook.md).

## Env

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `file:./data/dev.db` | SQLite file |
| `TEACHER_PIN` | (required) | Teacher gate |
| `QR_ROTATE_SECONDS` | `20` | Projector QR rotation |
| `EARLY_CHECKIN_MINUTES` | `15` | Early check-in window |
| `TZ` | `Asia/Manila` | Local class time |

## Gradebook templates

| Section | Template |
|---------|----------|
| INF231* | `attendance-inf231.xlsx` |
| INF232* | `attendance-inf232.xlsx` |
| other | `attendance-template.xlsx` |

Path: [`.cursor/references/complete-attendance-tracker/`](.cursor/references/complete-attendance-tracker/).

## Product docs

See [`.cursor/references/`](.cursor/references/) and [`AGENTS.md`](AGENTS.md).  
Plan: [`.cursor/plans/attendance_tracker_mvp_b38f6d11.plan.md`](.cursor/plans/attendance_tracker_mvp_b38f6d11.plan.md).

## Stack

Next.js (App Router) + TypeScript + Tailwind · Prisma 7 + SQLite · Docker Compose for classroom AP runs

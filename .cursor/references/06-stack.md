# Stack

Optimize for: testable product, teacher familiarity, then **public HTTPS** for the tripod station camera.

## Chosen stack (evolution)

| Layer | Choice | Why |
|-------|--------|-----|
| App | **Next.js** (App Router) + **TypeScript** | One repo, API + UI |
| UI | React + Tailwind | Teacher / student / station screens |
| DB (dev) | SQLite via Prisma + `better-sqlite3` | Fast local iteration |
| DB (prod v0.2) | **Cloud DB** (Postgres or equivalent — lock in deploy P1) | Public host; no laptop file DB in class |
| Auth | Teacher PIN in env; student ID + confirm | Fast; SSO later |
| Student QR | `qrcode` + short-lived personal token in DB | Display only on student phone |
| Station scan | Camera + QR decode on **teacher** Scan page (`html5-qrcode` or similar) | Needs public HTTPS |
| Import | Registrar TSV `.xls` parser | Real classlists |
| Export | `exceljs` → gradebook templates | Existing Excel workflow |
| Hosting (v0.2) | **Domain + Cloudflare** (HTTPS) + always-on Node host (Tunnel/VPS) or equivalent | Internet required; no classroom AP |

## Run paths

1. **Production:** deployed public URL; Cloudflare DNS/TLS; cloud DB.
2. **Local dev:** `npm run dev` on laptop for implementation only — not the class-day network model.
3. Class day: see `10-classroom-runbook.md` (tripod + public `/join`).

## Explicitly deferred / abandoned as product path

- Classroom AP + bind `0.0.0.0` as the way students reach the app
- mkcert / LAN HTTPS for the whole class
- Offline-only operation
- Workers/OpenNext rewrite — only if chosen in P1 (default is Node host + Cloudflare for DNS/HTTPS)

## Repo layout

```
attendance-tracker/
  .cursor/
    references/     # product truth
    rules/          # agent rules
    plans/          # phase checklists
  app/              # Next.js routes
  components/
  lib/
  prisma/
  scripts/          # dev/deploy helpers (no AP-required ops)
```

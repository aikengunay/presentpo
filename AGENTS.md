# Agent instructions — attendance-tracker

Before coding product behavior, read:

1. `.cursor/references/01-product-brief.md`
2. `.cursor/references/07-phases-2day.md`
3. `.cursor/references/13-screen-flow.md`
4. `.cursor/references/14-data-model.md`
5. `.cursor/references/15-api-mvp.md`
6. `.cursor/rules/project.mdc`
7. `.cursor/rules/git-commits.mdc`

## Cursor rules

| Rule | When |
|------|------|
| `.cursor/rules/project.mdc` | Always — product locks + reference map |
| `.cursor/rules/stack.mdc` | When editing `app/`, `lib/`, `prisma/`, `components/` |
| `.cursor/rules/git-commits.mdc` | Always — no AI co-author trailers |

## Git commits

- Use the user’s git identity only.
- **Never** add `Co-Authored-By` or any AI co-author / tool attribution trailer.

## Mission

Ship a **2-day testable** attendance web app:

- Import university classlists
- Teacher starts session → rotating classroom QR
- Students self check-in → codes `1–4` / auto `0`
- Export for existing Excel attendance sheets

## Do not

- Build teacher-scan-every-student as the primary flow
- Treat blank (no session) as absent `0`
- Add biometrics, multi-tenant SaaS, or heavy infra before Day 2 exit criteria
- Add student password accounts in MVP (see `11-anti-cheat-and-identity.md`)

## Stack

Next.js (App Router) + TypeScript + Prisma + SQLite — see `.cursor/references/06-stack.md`.

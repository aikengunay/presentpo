# Agent instructions — attendance-tracker

Before coding product behavior, read:

1. `.cursor/references/01-product-brief.md`
2. `.cursor/references/04-session-lifecycle.md`
3. `.cursor/references/10-classroom-runbook.md`
4. `.cursor/references/11-anti-cheat-and-identity.md`
5. `.cursor/references/13-screen-flow.md`
6. `.cursor/references/15-api-mvp.md`
7. `.cursor/references/18-v0.2-remove-overhaul.md`
8. `.cursor/plans/attendance_tracker_v0.2_complete.plan.md`
9. `.cursor/rules/project.mdc`
10. `.cursor/rules/git-commits.mdc`

## Cursor rules

| Rule | When |
|------|------|
| `.cursor/rules/project.mdc` | Always — product locks + reference map |
| `.cursor/rules/stack.mdc` | When editing `app/`, `lib/`, `prisma/`, `components/` |
| `.cursor/rules/git-commits.mdc` | Always — conventional commits when asked; **never push unless user asks**; no AI co-author trailers |

## Git

- Commit **only** when the user asks; use Conventional Commits (`feat:`, `fix:`, `docs:`, …).
- **Never push** unless the user explicitly asks (they want to test locally first).
- **Never** add `Co-Authored-By` or AI attribution trailers.

## Mission (v0.2)

- Public HTTPS app (Cloudflare + domain); internet required
- Teacher **tripod Station Scan** of student personal QR
- Codes `1–4` / auto `0`; Excel export
- Delete retired AP / projector-self-scan paths per `18-v0.2-remove-overhaul.md`

## Do not

- Rebuild classroom AP / offline LAN / mkcert-for-class as the product path
- Rebuild student→projector rotating QR as primary check-in
- Add biometrics, geofence, student passwords, or multi-tenant SaaS in v0.2
- Push to remote after each milestone without being asked

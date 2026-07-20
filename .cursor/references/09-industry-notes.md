# How common attendance systems work (notes)

## Patterns

1. **Teacher roll call / clicker** — accurate, teacher-expensive.
2. **Student self check-in + session code** — LMS style; code changes per class.
3. **Rotating QR on a board** — anti-screenshot; student scans screen (MVP v0.1).
4. **Teacher / station scans student QR** — proximity + visual verify (v0.2).
5. **Bluetooth / location** — stronger presence, more setup pain.
6. **Biometric** — high assurance, high privacy cost; not for this product phase.

## Why tripod station scan for this course (v0.2)

- Teacher already uses a **phone on a tripod** over a table; students present phones in frame.
- Visual glance (person ↔ name) beats board self-scan for buddy check-ins.
- Public HTTPS makes station camera reliable on iPhone without class-wide mkcert.
- Internet-during-class is acceptable; portable AP is dropped.

## Decision record

| Option | Verdict |
|--------|---------|
| Teacher/station scans student QR | **Accept (v0.2 primary)** |
| Student scans rotating projector QR | Retired as primary (was MVP) |
| Student scans static QR | Reject (easy proxy/screenshot) |
| Classroom AP / offline-only | Abandoned for v0.2 hosting model |
| Auto mark from Wi‑Fi only | Reject (unreliable, privacy) |
| Face ID | Reject for now |

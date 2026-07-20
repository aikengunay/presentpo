# How common attendance systems work (notes)

## Patterns

1. **Teacher roll call / clicker** — accurate, teacher-expensive (what we are escaping).
2. **Student self check-in + session code** — Canvas/Top Hat style; code changes per class.
3. **Rotating QR / short-lived token** — classroom screen; good anti-screenshot balance.
4. **Bluetooth / location** — iClicker-ish; stronger presence, more setup pain.
5. **Biometric** — high assurance, high privacy cost; not for this MVP.

## Why rotating QR for this course

- Teacher teaches CTADWEBL; mid-lecture Excel edits are the real cost.
- Class size ~20–40: proxy risk is real but manageable with TTL + overrides.
- No IT procurement for Bluetooth beacons in 2 days.
- Fits phone-based students; fallback = manual mark.

## Decision record

| Option | Verdict |
|--------|---------|
| Teacher scans student QR | Reject as primary (still interrupts teaching) |
| Student scans static QR | Reject (easy proxy/screenshot) |
| Student scans rotating QR | **Accept (MVP primary)** |
| Auto mark from Wi‑Fi only | Reject (unreliable, privacy) |

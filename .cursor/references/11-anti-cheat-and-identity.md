# Anti-cheat and student identity

## Do we create accounts with passwords?

**Recommendation: No full student password accounts** (unchanged).

| Approach | Cheat resistance | Friction | Verdict |
|----------|------------------|----------|---------|
| Student password accounts | Medium | High | Later |
| Student ID + name confirm only | Low alone | Low | Not enough alone |
| **ID + confirm + personal QR + teacher station scan** | Strong for class | Medium (station line) | **v0.2** |
| School Google / Microsoft login | Higher | Medium (IT) | Later |
| Projector self-scan only | Medium | Low | **Retired** |

### Identity (v0.2)

1. Student enters **Student ID** (from classlist).
2. App shows matched **name** → student confirms “This is me”.
3. App shows a **personal QR** (session + student bound, short TTL).
4. Teacher **Station Scan** (PIN session) decodes QR → shows name/ID → confirm → attendance with `source = teacher_scan`.
5. **One attendance row per student per session**.

Passwords for ~60–80 students create support load. Proxy (“give friend your phone”) is harder when they must present at the tripod under your glance.

## How we avoid cheating (layered)

### Must-have (v0.2)

1. **Teacher station** — check-in requires teacher-authenticated scan, not a public board token alone.
2. **Proximity process** — phone must be placed under the tripod camera (classroom procedure, not GPS).
3. **Visual glance** — name/ID on scan UI vs person at the table.
4. **Session must be open** — no check-in outside class window.
5. **Section-bound** student + one check-in per session.
6. **Server time** for late codes.
7. **Optional presence board** of names — social accountability.
8. **Teacher override / audit** — `source = teacher_scan | manual | auto`.

### Nice next (not v0.2 blockers)

- Rate-limit scan attempts
- Optional “lock station” after first N minutes
- School SSO later
- Refreshing student QR while waiting in line

### What we do **not** chase in v0.2

- Face recognition
- GPS geofence
- Classroom AP / offline-only network as security
- Perfect prevention of “two phones in one pocket” if you are not looking

## Network / hosting note

App is on **public HTTPS**. Anyone with the URL can open student pages. Teacher PIN protects admin and Station Scan finalize. Do not treat “same Wi‑Fi as laptop” as a security boundary anymore.

## Decision

- v0.2: **no student passwords**; roster ID + confirm + personal QR + **teacher tripod scan** + optional live names  
- Later: optional school SSO  
- Always keep **manual mark** for dead phones  

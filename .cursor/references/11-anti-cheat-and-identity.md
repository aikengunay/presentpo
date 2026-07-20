# Anti-cheat and student identity

## Do we create accounts with passwords?

**MVP recommendation: No full student password accounts.**

| Approach | Cheat resistance | Teacher/student friction | Verdict |
|----------|------------------|--------------------------|---------|
| Student password accounts | Medium (shared passwords still happen) | High (reset hell, first-week chaos) | Later |
| Student ID + name confirm only | Low alone | Low | Not enough alone |
| **ID + roster bind + rotating QR + one check-in** | Good enough for class | Low | **MVP** |
| School Google / Microsoft login | Higher | Medium (IT dependent) | Phase 3 |
| Teacher scan / visual confirm | Highest | High (interrupts teaching) | Fallback only |

### MVP identity

1. Student enters **Student ID** (from classlist).
2. App shows matched **name** → student confirms “This is me”.
3. Optional light gate: last 4 of ID, or birth year — **only if** import has it (usually not). Prefer skip.
4. Check-in only succeeds with a **valid current QR token** for an **open** session of **their section**.
5. **One attendance row per student per session** (second scan rejected).

Passwords for ~60–80 students across sections create support load that will sink a 2-day test. Proxy (“give friend your ID”) remains possible; rotating QR + live name board is the practical counter.

## How we avoid cheating (layered)

### Must-have (MVP)

1. **Rotating QR** (15–20s TTL) — kills screenshots and hallway lag.
2. **Session must be open** — no check-in outside class window.
3. **Section-bound** — INF231 token won’t mark INF232.
4. **One check-in per student per session**.
5. **Server time** for late codes.
6. **Live projector feed of names** — social accountability (friend scanning for absent peer is visible).
7. **Teacher override / audit** — `source = qr | manual | auto-absent`.

### Nice next (not Day 1–2 blockers)

- Random 4-letter **spoken room code** shown with QR (must type after scan)
- Rate-limit check-ins per IP
- Optional “teacher lock check-ins” after first 20 minutes
- School SSO later

### What we do **not** chase in MVP

- Face recognition
- GPS geofence (flaky indoors; privacy complaints)
- Perfect prevention of “buddy in the room scans two phones” — rare if names are announced/displayed live

## Realistic threat model (your classes)

Most likely abuse: present student checks in an absent friend from inside the room.

**Best cheap counter:** make check-ins **public in the room** (display + optional speak). Social pressure + you noticing a name for someone not there beats password accounts.

## Decision

- MVP: **no student passwords**; roster ID + confirm + rotating QR + live feed  
- Phase 3: optional school SSO if the tool sticks  
- Always keep **manual mark** for edge cases

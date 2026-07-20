# Session lifecycle (rotating classroom QR)

## Chosen model

**Student scans a classroom QR that rotates** (not teacher scanning each student).

Teacher still starts/ends the session. QR is displayed on projector or a door tablet.

## States

```
draft → open → closed
```

| State | Meaning |
|-------|---------|
| `draft` | Meeting exists on calendar; not accepting check-ins |
| `open` | QR active; check-ins accepted; codes assigned live |
| `closed` | No more check-ins; missing students auto-marked `0` (unless already marked) |

## Teacher flow

1. Select section + today’s meeting (or create ad-hoc).
2. **Start session** → state `open`; `T0` = scheduled start (editable) or “use now”.
3. Display **rotating QR** full-screen.
4. Teach. Do not mark attendance.
5. **End session** → state `closed`; write `0` for students with no check-in.
6. Review list; override codes if needed.
7. Export.

## Rotating QR

- Payload: `{ sessionId, token, exp }` signed or looked up server-side.
- New token every **20 seconds** (configurable 15–30s).
- Token single-use per student is optional; MVP: token valid only while current; one check-in per student per session.
- Screenshot of old QR fails after rotation.
- Server time is authoritative (ignore phone clock).

## Student flow

1. Open student check-in page (PWA-friendly mobile browser).
2. Identify: Student ID + name confirm (MVP), or school email later.
3. Scan QR (camera) or paste session link if camera blocked.
4. Server validates token + session open + student enrolled.
5. Compute code from `Tc` vs `T0`; save; show “Checked in: code 2 (late 15–30)”.

## Anti-cheat (MVP tier)

Must have:

- Rotating QR (short TTL)
- Session must be `open`
- One attendance row per student per session
- Student must belong to section

Nice later:

- Optional room code spoken aloud
- Approximate geofence
- Teacher “lock check-ins” mid-session

## Teacher override

Any code `0–4` can be set manually with optional note. Overrides win over auto marks. Keep audit: `source = auto | qr | manual`.

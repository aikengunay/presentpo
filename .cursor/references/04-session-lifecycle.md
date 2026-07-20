# Session lifecycle (tripod station check-in)

## Chosen model (v0.2)

**Teacher station scans a student personal QR** (not student scanning a classroom projector QR).

- App is on a **public HTTPS** host; phones use any internet.
- Teacher phone sits on a **tripod**, camera facing a table.
- Students place their phone (QR up) in frame; teacher glances person ↔ name.

## States

```
draft → open → closed
```

| State | Meaning |
|-------|---------|
| `draft` | Meeting exists on calendar; not accepting check-ins |
| `open` | Station Scan accepts student tokens; codes assigned live |
| `closed` | No more check-ins; missing students auto-marked `0` (unless already marked) |

## Teacher flow

1. Select section + today’s meeting (or create ad-hoc).
2. **Start session** → state `open`; `T0` = scheduled start or “use now”.
3. Open **Station Scan** on the tripod phone (leave page open).
4. Optional: open **Presence board** on a second screen (names/counts only).
5. Students present phones at the table; glance and confirm as needed.
6. **End session** → state `closed`; write `0` for students with no check-in.
7. Review roster; override if needed → Export.

## Student personal QR

- Issued after Student ID + “This is me” while a session is `open` for their section.
- Payload bound to **session + student**; short TTL; **invalidate after successful check-in**.
- Screenshot reuse after check-in fails; expired token fails.
- Server time is authoritative.

## Student flow

1. Open `/join` on the public site.
2. Enter section + Student ID → confirm name.
3. Show **large personal QR**; place phone under the station camera.
4. After teacher scan succeeds → done screen with code meaning.
5. Dead phone → teacher **manual mark** on roster.

## Anti-cheat (v0.2 tier)

Must have:

- Student must belong to section; session must be `open`
- One attendance row per student per session
- Only **teacher-authenticated** Station Scan finalizes the mark (`source = teacher_scan`)
- Short-lived / one-time student token
- Optional presence board (social visibility)

Retired:

- Rotating projector check-in QR as the gate
- Classroom AP / LAN-only trust as the network model

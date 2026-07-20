# Edge cases

## Cheating / proxy

| Case | MVP handling |
|------|----------------|
| Friend scans from outside | Rotating QR + short TTL; optional later: geofence |
| Screenshot QR | Expires on rotation |
| One phone, two students | One check-in per student ID per session |
| Student leaves after scan | Acceptable for MVP (presence, not duration) |

## Timing

| Case | MVP handling |
|------|----------------|
| Teacher starts late | “Start session” can set `T0 = now` or keep schedule |
| Early arrivals | Allow check-in from `T0 - 15m` as code `1` |
| No class that day | Do not open session → blanks stay blank |
| Cancelled / suspended | End without auto-`0`, or delete/cancel session |
| Device clock wrong | Use server timestamps only |

## Operations

| Case | MVP handling |
|------|----------------|
| Dead phone / no camera | Teacher manual mark |
| Wrong section | Session bound to section; reject other roster |
| Late add / drop | Re-import or manual add/deactivate student |
| INF231 + INF232 same Saturday | Separate sessions; different times/rooms |
| Duplicate names | Key by Student ID |

## Data / grading

| Case | MVP handling |
|------|----------------|
| Unopened meeting | No rows / blank export |
| Opened, no show | Auto `0` on close |
| Partial term | Export only existing marks |
| Dispute | Show source + timestamp + allow override note |

## Privacy

- Store Student ID, name, email, attendance events.
- No photos in MVP.
- Local/dev SQLite OK for 2-day test; production needs access control.

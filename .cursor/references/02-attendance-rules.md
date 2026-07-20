# Attendance codes and late rules

Aligned with the existing Excel attendance workbooks.

## Codes

| Code | Meaning (ops) | Score weight (Excel quality %) |
|------|---------------|--------------------------------|
| `1` | Present / on time (or &lt; 15 min late) | 1.00 |
| `2` | Late 15–30 minutes | 0.75 |
| `3` | Late 30–60 minutes | 0.69 |
| `4` | Late 60+ minutes | 0.63 |
| `0` | Absent (confirmed / auto after session end) | 0 |
| blank | Session not opened / not marked | ignored in stats |

## Auto-scoring from check-in time

Let `T0` = session official start (from class schedule, or teacher “Start now” override).  
Let `Tc` = server timestamp of successful check-in.

| Condition | Code |
|-----------|------|
| `Tc < T0 - earlyWindow` | reject (too early) |
| `T0 - earlyWindow ≤ Tc < T0 + 15m` | `1` |
| `T0 + 15m ≤ Tc < T0 + 30m` | `2` |
| `T0 + 30m ≤ Tc < T0 + 60m` | `3` |
| `Tc ≥ T0 + 60m` and session still open | `4` |
| Never checked in when session ends / cutoff | `0` |

Defaults for MVP:

- `earlyWindow` = 15 minutes before `T0`
- Session end / auto-absent cutoff = scheduled end time (lab/lec end), or teacher End Session

## Blank vs zero (critical)

- **Blank**: no session was conducted/opened for that meeting → do not invent absences.
- **`0`**: session was opened and student never checked in (or teacher marked absent).

This matches Excel summary rules: blanks ignored; only marked `0` counts as absent.

## Presence vs quality (Excel summary)

- **Presence %** = count(`1–4`) ÷ count(marked `0–4`)
- **Quality %** = average weight over marked sessions

App export should write raw codes `0–4`; Excel summary remains the analytics layer for MVP.

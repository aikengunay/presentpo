# Check-in announcements (display + speak)

## Goal

When a student successfully checks in, the room gets a clear signal — deterring proxy check-ins and giving the teacher peripheral awareness without opening Excel.

## Recommendation

| Channel | MVP? | Notes |
|---------|------|--------|
| **On-screen live feed** | **Yes — default on** | Large name + code + time; last N check-ins |
| **Text-to-speech name** | **Yes — optional toggle** | Teacher can mute; useful first weeks / large labs |
| Sound chime only | Optional | Less informative than name |

**Default for class:** display on. Speak **off** until teacher enables “Announce names”.

Speaking every name for 40 students can get noisy; toggle + “speak only first 15 minutes” is ideal later. MVP: simple on/off.

## Display (projector companion page)

Show:

1. Session title (section, date, start)
2. Big **latest name** (3–5 seconds emphasis)
3. Code badge (`1` green … `4` amber, etc.)
4. Scrolling list: newest first
5. Counts: checked in / roster size

Keep QR page and feed either:

- **Split screen** (QR left / feed right), or  
- Two windows (QR fullscreen on projector; feed on laptop)

MVP can ship **QR + latest name under it** on one page to save time.

## Speak (Web Speech API)

- Browser TTS on the **teacher projector page** (not each student’s phone).
- Phrase: `"[Last name], checked in"` or full roster name.
- Queue utterances so rapid scans don’t overlap badly.
- Respect toggle; never speak from student devices by default.

Fallback if TTS unsupported: display-only (still fine).

## Privacy / classroom culture

- Names are already known in class; this is not a public website.
- Do not speak Student IDs aloud.
- Teacher can disable speak for sensitive moments (exams, guests).

## MVP acceptance

- [ ] Successful check-in appears on feed within ~2s (poll or light refresh)
- [ ] Name readable from back of room
- [ ] Speak toggle works; off by default
- [ ] No crash if TTS missing

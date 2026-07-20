# Classroom runbook — AP + IP + QR

For the **2-day / local MVP** test. App runs on the teacher laptop; students join the teacher’s access point.

## Gear

- Teacher laptop (app running)
- Portable **access point** (teacher-owned)
- Projector or large screen (QR + live check-in feed)
- Optional: spare phone for teacher manual override

## Network + HTTPS setup (before class)

1. Power on AP. Set a clear SSID, e.g. `CTADWEBL-ATTEND` (and a simple password you can write on the board).
2. Connect **laptop** to that AP (Ethernet to AP LAN if possible; Wi‑Fi is fine).
3. On the laptop, note LAN IP:
   - macOS: `ipconfig getifaddr en0` (or the AP interface) / System Settings → Network
   - Example: `192.168.4.1` or `192.168.1.10`
4. One-time (or after IP change): install [mkcert](https://github.com/FiloSottile/mkcert) and issue certs:
   ```bash
   brew install mkcert nss   # once per laptop
   npm run certs:setup       # after joining the AP (covers current LAN IPs)
   ```
5. Start the app:
   - Dev: `npm run dev` (HTTPS when `certs/` present)
   - Prod-like: `npm run build && npm run start` (HTTPS via mkcert)
   - HTTP-only fallback: `npm run start:http` / `npm run dev:http`
6. Laptop browser: open `https://<LAPTOP_IP>:3000` (accept/trust if needed — mkcert CA is already on the laptop after `certs:setup`).
7. Phones on the **same SSID**: install the classroom CA (below), then open the same HTTPS URL.  
   If it fails: AP client isolation is on — disable “AP isolation / guest isolation”.

**Do not rely on school Wi‑Fi** unless you have already verified phones can reach the laptop IP.

### Install `certs/rootCA.pem` on phones (once per phone)

In-app **Open camera** needs a **trusted HTTPS** origin. After `npm run certs:setup`, share `certs/rootCA.pem` (AirDrop, USB, or a temporary link on the LAN).

**iPhone / iPad**

1. Open `rootCA.pem` → Install Profile.
2. Settings → General → VPN & Device Management → install the mkcert profile.
3. Settings → General → About → **Certificate Trust Settings** → enable full trust for the mkcert CA.

**Android**

1. Settings → Security → Encryption & credentials → **Install a certificate** → CA certificate.
2. Pick `rootCA.pem` and confirm.

Re-run `npm run certs:setup` when the laptop’s LAN IP changes; phones keep the same root CA (only the server cert is re-issued).

## Class start (2 minutes)

1. Board: SSID + password + short URL `https://<LAPTOP_IP>:3000`
2. Teacher: log in → select section → **Start session**
3. Open **Projector QR** page (fullscreen) — QR points at `https://…/join?token=…`
4. Optional: open **Live feed** on a second window (names as they check in)
5. Teach. Do not manage Excel.

## During class

- Students join AP → open site → **Open camera** (in-app) or use phone Camera on the projector QR → enter Student ID → confirm
- Typed **fallback code** under the projector QR still works if camera scan fails
- Live feed shows each successful check-in (see announcement feature)
- Late arrivals keep scanning; codes auto-map to `1–4`
- Dead phone / can’t scan → teacher **manual mark** later or quietly

### In-app camera (secure context)

| Mode | In-app Open camera |
|------|--------------------|
| `https://<LAN-IP>:3000` with trusted mkcert CA | Works (preferred classroom path) |
| `http://localhost` on the laptop only | Works on that machine |
| `http://<LAN-IP>:3000` | Usually blocked on phones — use OS Camera or typed code |

**HTTP fallback still works:** phone Camera app on the projector QR, or type section + Student ID + fallback code.

## Class end (1 minute)

1. **End session** → missing students become `0`
2. Spot-check overrides (excused, wrong mark)
3. Export when convenient (after class is fine)

## Failure cheat-sheet

| Symptom | Fix |
|---------|-----|
| Phones can’t open URL | Same SSID? Isolation off? Correct IP? App on `0.0.0.0`? |
| NET::ERR_CERT / untrusted | Install + fully trust `certs/rootCA.pem` on the phone |
| In-app Open camera fails on HTTPS | Permission denied? Retry; else OS Camera / typed code |
| In-app Open camera fails on HTTP | Expected — switch to HTTPS (`npm run certs:setup`) or use OS Camera |
| Cert name mismatch after new AP | Re-run `npm run certs:setup` on the laptop |
| QR says expired | Normal if slow; wait for next rotate and rescan |
| Already checked in | One check-in per student; use override if needed |
| Laptop sleeps | Disable sleep while session is open |
| AP overload | Cap is usually fine for ~40; move AP centrally |

## Security note (classroom LAN)

This MVP assumes a **trusted classroom AP**. Anyone on the SSID can hit the app. Teacher PIN protects admin; student identity is weaker by design in MVP (see `11-anti-cheat-and-identity.md`). Do not expose the laptop port to the public internet during the test. The mkcert CA is for **this classroom laptop only** — do not distribute `dev-key.pem`.

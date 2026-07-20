#!/usr/bin/env bash
# Issue a mkcert certificate for localhost + current LAN IPs, and export the
# root CA so classroom phones can trust https://<laptop-ip>:3000 (secure context
# for in-app camera).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CERT_DIR="$ROOT/certs"
mkdir -p "$CERT_DIR"
cd "$ROOT"

if ! command -v mkcert >/dev/null 2>&1; then
  echo "mkcert is not installed."
  echo "  macOS:  brew install mkcert nss"
  echo "  Then:   npm run certs:setup"
  exit 1
fi

CAROOT="$(mkcert -CAROOT)"
if [[ ! -f "$CAROOT/rootCA.pem" ]]; then
  echo "→ No local CA yet. Run once in your Terminal (needs Mac password):"
  echo "    mkcert -install"
  echo "  Then re-run: npm run certs:setup"
  exit 1
fi

echo "→ Local CA: $CAROOT"
echo "  Tip: if laptop browsers warn on https://localhost, run once: mkcert -install"

NAMES=(localhost 127.0.0.1 ::1)

while IFS= read -r ip; do
  [[ -n "$ip" ]] && NAMES+=("$ip")
done < <(
  for iface in en0 en1; do
    ipconfig getifaddr "$iface" 2>/dev/null || true
  done
  node -e "require('./scripts/lib-lan').getLocalIPv4s().forEach((ip) => console.log(ip))"
)

DEDUPED=()
for n in "${NAMES[@]}"; do
  skip=0
  for d in "${DEDUPED[@]+"${DEDUPED[@]}"}"; do
    [[ "$d" == "$n" ]] && skip=1 && break
  done
  [[ $skip -eq 1 ]] && continue
  DEDUPED+=("$n")
done

echo "→ Issuing cert for: ${DEDUPED[*]}"
# Avoid Java keytool trust-store probes (often broken / missing keystore on teacher laptops).
export TRUST_STORES="${TRUST_STORES:-system}"
mkcert \
  -cert-file "$CERT_DIR/dev.pem" \
  -key-file "$CERT_DIR/dev-key.pem" \
  "${DEDUPED[@]}"

if [[ ! -f "$CERT_DIR/dev.pem" || ! -f "$CERT_DIR/dev-key.pem" ]]; then
  echo "ERROR: mkcert did not write certs/dev.pem."
  exit 1
fi

cp "$CAROOT/rootCA.pem" "$CERT_DIR/rootCA.pem"
chmod 600 "$CERT_DIR/dev-key.pem" || true

{
  echo "# Generated $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "# Re-run: npm run certs:setup  (after Wi‑Fi / AP IP changes)"
  printf '%s\n' "${DEDUPED[@]}"
} > "$CERT_DIR/hosts.txt"

echo
echo "Done."
echo "  Cert:     certs/dev.pem"
echo "  Key:      certs/dev-key.pem"
echo "  Phone CA: certs/rootCA.pem  ← install once on each student phone"
echo
echo "Next:"
echo "  1. npm run dev     (serves https://<LAN-IP>:3000)"
echo "  2. On phones: install + trust certs/rootCA.pem (see classroom runbook)"
echo "  3. If laptop IP changes on a new AP, run this script again."

#!/usr/bin/env bash
# Smoke against a running server (default http://127.0.0.1:3000).
# For HTTPS: SMOKE_BASE=https://127.0.0.1:3000 npm run smoke:http
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="${SMOKE_BASE:-http://127.0.0.1:3000}"
PASSWORD="${TEACHER_PASSWORD:-${TEACHER_PIN:-1234}}"
TLS_OPTS=()
if [[ "$BASE" == https://* ]]; then
  if [[ -f "$ROOT/certs/rootCA.pem" ]]; then
    TLS_OPTS=(--cacert "$ROOT/certs/rootCA.pem")
  else
    TLS_OPTS=(-k)
  fi
fi
COOKIE_JAR="$(mktemp)"
cleanup() { rm -f "$COOKIE_JAR"; }
trap cleanup EXIT

echo "== health / =="
curl -fsS "${TLS_OPTS[@]}" "$BASE/" >/dev/null

echo "== teacher login =="
curl -fsS "${TLS_OPTS[@]}" -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -H 'Content-Type: application/json' \
  -d "{\"password\":\"$PASSWORD\"}" \
  "$BASE/api/teacher/login" | grep -q '"ok":true'

echo "== sections list =="
curl -fsS "${TLS_OPTS[@]}" -b "$COOKIE_JAR" "$BASE/api/sections" | grep -q 'sections'

echo "== teacher UI =="
code=$(curl -s "${TLS_OPTS[@]}" -o /dev/null -w '%{http_code}' -b "$COOKIE_JAR" "$BASE/teacher")
test "$code" = "200"

echo "== join UI =="
code=$(curl -s "${TLS_OPTS[@]}" -o /dev/null -w '%{http_code}' "$BASE/join")
test "$code" = "200"

echo "Smoke OK against $BASE"

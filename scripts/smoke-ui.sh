#!/usr/bin/env bash
set -euo pipefail
PORT="${PORT:-4173}"
TMP_DIR="$(mktemp -d)"
SERVER_PID=""
cleanup(){
  if [[ -n "${SERVER_PID}" ]]; then kill "${SERVER_PID}" >/dev/null 2>&1 || true; fi
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT
CHROME_BIN="${CHROME_BIN:-}"
if [[ -z "${CHROME_BIN}" ]]; then
  for candidate in google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "${candidate}" >/dev/null 2>&1; then CHROME_BIN="$(command -v "${candidate}")"; break; fi
  done
fi
if [[ -z "${CHROME_BIN}" ]]; then echo 'Chrome/Chromium não encontrado.'; exit 1; fi
export CHROME_BIN
python3 -m http.server "${PORT}" --bind 127.0.0.1 >"${TMP_DIR}/server.log" 2>&1 &
SERVER_PID=$!
for _ in {1..30}; do
  if curl --fail --silent "http://127.0.0.1:${PORT}/index.html" >/dev/null; then break; fi
  sleep 0.2
done
kill -0 "${SERVER_PID}"
export SMOKE_BASE="http://127.0.0.1:${PORT}"
node scripts/smoke-browser.mjs

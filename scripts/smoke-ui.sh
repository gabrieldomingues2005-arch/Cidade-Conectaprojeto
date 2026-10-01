#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4173}"
BASE="http://127.0.0.1:${PORT}"
TMP_DIR="$(mktemp -d)"
SERVER_PID=""
SMOKE_HTML=".smoke-index.html"

cleanup() {
  if [[ -n "${SERVER_PID}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
  rm -rf "${TMP_DIR}"
  rm -f "${SMOKE_HTML}"
}
trap cleanup EXIT

CHROME=""
for candidate in google-chrome google-chrome-stable chromium chromium-browser; do
  if command -v "${candidate}" >/dev/null 2>&1; then
    CHROME="${candidate}"
    break
  fi
done

if [[ -z "${CHROME}" ]]; then
  echo "✖ Chrome/Chromium não encontrado no runner."
  exit 1
fi

echo "Cidade Conecta — smoke UI"
echo "Browser: $("${CHROME}" --version)"

# O Leaflet remoto é bloqueante no HTML real. Para o smoke de rotas,
# removemos somente as tags do CDN em uma cópia temporária do shell.
# Todos os scripts e estilos do Cidade Conecta continuam sendo os reais.
python3 - <<'PY'
from pathlib import Path
source=Path('index.html').read_text(encoding='utf-8')
source='\n'.join(line for line in source.splitlines() if 'unpkg.com' not in line)
probe="""<script>
window.addEventListener('error',function(e){
  document.documentElement.setAttribute('data-smoke-error',(e.message||'error')+' @ '+(e.filename||'')+':'+(e.lineno||0));
});
window.addEventListener('unhandledrejection',function(e){
  document.documentElement.setAttribute('data-smoke-rejection',String(e.reason||'unhandled rejection'));
});
setTimeout(function(){
  var app=document.getElementById('app');
  document.documentElement.setAttribute('data-smoke-app-size',String(app?app.innerHTML.length:-1));
},900);
</script>"""
source=source.replace('</head>',probe+'\n</head>')
Path('.smoke-index.html').write_text(source,encoding='utf-8')
PY

python3 -m http.server "${PORT}" --bind 127.0.0.1 >"${TMP_DIR}/server.log" 2>&1 &
SERVER_PID=$!

for _ in {1..30}; do
  if curl --fail --silent "${BASE}/index.html" >/dev/null; then
    break
  fi
  sleep 0.2
done

curl --fail --silent "${BASE}/assets/design-v56.css?v=5.6.0" >/dev/null
curl --fail --silent "${BASE}/sw.js" >/dev/null

run_route() {
  local name="$1"
  local hash="$2"
  local marker="$3"
  local width="${4:-1366}"
  local height="${5:-900}"
  local out="${TMP_DIR}/${name}.html"

  "${CHROME}" \
    --headless=new \
    --no-sandbox \
    --disable-gpu \
    --disable-dev-shm-usage \
    --hide-scrollbars \
    --window-size="${width},${height}" \
    --virtual-time-budget=1800 \
    --dump-dom "${BASE}/${SMOKE_HTML}${hash}" >"${out}" 2>"${TMP_DIR}/${name}.stderr"

  if ! grep -Fq "${marker}" "${out}"; then
    echo "✖ ${name}: marcador esperado não encontrado: ${marker}"
    echo "--- stderr ---"
    tail -80 "${TMP_DIR}/${name}.stderr" || true
    echo "--- diagnóstico runtime ---"
    grep -o 'data-smoke-error="[^"]*"' "${out}" || true
    grep -o 'data-smoke-rejection="[^"]*"' "${out}" || true
    grep -o 'data-smoke-app-size="[^"]*"' "${out}" || true
    echo "--- DOM (fim) ---"
    tail -80 "${out}" || true
    exit 1
  fi

  if grep -Fq "Página não encontrada" "${out}"; then
    echo "✖ ${name}: caiu na rota 404."
    exit 1
  fi

  echo "✓ ${name}"
}

run_route "home-desktop" "#/" 'id="homeSearch"' 1366 900
run_route "registrar-desktop" "#/registrar" 'id="occForm"' 1366 900
run_route "acompanhar-desktop" "#/acompanhar" 'id="followForm"' 1366 900
run_route "mapa-desktop" "#/mapa" 'id="publicMap"' 1366 900
run_route "dashboard-desktop" "#/dashboard" 'class="dashboardKpisV51"' 1366 900
run_route "rede-desktop" "#/rede-municipal" 'id="municipalNetworkRoot"' 1366 900

run_route "home-mobile" "#/" 'id="homeSearch"' 390 844
run_route "registrar-mobile" "#/registrar" 'id="occForm"' 390 844
run_route "mapa-mobile" "#/mapa" 'id="publicMap"' 390 844
run_route "rede-mobile" "#/rede-municipal" 'id="municipalNetworkRoot"' 390 844

HOME_DOM="${TMP_DIR}/home-desktop.html"
if ! grep -Fq 'id="offlineNoticeV56"' "${HOME_DOM}"; then
  echo "✖ aviso offline v5.6 ausente do shell renderizado."
  exit 1
fi

if ! grep -Fq 'assets/design-v56.css?v=5.6.0' "${HOME_DOM}"; then
  echo "✖ CSS v5.6 não está ligado ao shell."
  exit 1
fi

if ! grep -Fq 'MVP v5.5 · UI v5.6 · 2026' "${HOME_DOM}"; then
  echo "✖ identificação de versão UI v5.6 ausente."
  exit 1
fi

echo "✓ shell v5.6"
echo "✓ smoke UI concluído sem falhas"

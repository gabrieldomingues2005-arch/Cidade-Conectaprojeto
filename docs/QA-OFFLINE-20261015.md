# QA durante indisponibilidade do Supabase — 15/10/2026

Branch: `feature/cidade-conecta-auth-admin-20261008`. Base desta rodada: `b1be857d3aae71e0a381c44e253fc279d4e774e4`.

## Limites

Nenhum acesso ao Supabase nesta rodada. Sem SQL, schema, RLS, migrations, usuários, Auth, Storage, dados ou deploy. A main e o merge do PR #5 ficam fora do escopo. O runtime continua apontando para `yvmkgpijzewssdxgimit`.

## Correções

- Falha 401 em operação interna ou renovação inválida limpa sessão e bloqueia o painel.
- Falha 403 retira a autorização visual, sem tratar autorização como indisponibilidade.
- Rede, 5xx e timeout bloqueiam a visualização, preservando tokens para nova validação no backend.
- Resposta de usuário malformada falha fechada, sem confundir erro lógico com rede.
- Erros na listagem e no detalhe renderizam novamente o estado de autenticação, removendo a fila anterior.
- Senha retirada do campo no envio e nunca persistida pelo cliente; labels e autocomplete preservados.
- Mensagem de erro de login recebe foco; loading da sessão anuncia status e aria-busy.
- Menu anuncia aria-expanded e fecha por Escape com retorno do foco.
- Cache PWA renovado; consultas offline usam apenas o cache atual. Assets de auth permanecem incluídos. Respostas externas de autenticação não são interceptadas pelo SW.

## Verificação executada localmente

- 282 verificações estáticas PASS; aviso conhecido de Guamium R2/R3.
- 31 testes comportamentais PASS: autenticação (24) e SW (7), com rede simulada e sem dependências externas.
- Syntax check e diff check.

## Smoke no CI

`scripts/smoke-browser.mjs` controla Chrome por CDP usando recursos nativos do Node 22, sem npm install ou biblioteca de teste. As requisições externas são interceptadas; os assets locais são os reais. Leaflet/CDN não são exercitados: mapa real, tiles e integração real permanecem pendentes.

Matriz: Home, Registrar, Acompanhar, Mapa, Indicadores, Rede Municipal e Admin anônimo em 390, 768 e 1366 px (21 combinações). Verifica largura real do viewport, overflow global, campos sem label, exceções JS, menu e Tab no login. Outros 7 cenários Admin: indisponibilidade, rede, timeout, offline, 401, 403 e fila vazia autorizada simulada.

Capturas de cada combinação e results.json são guardados em `ui-smoke-screenshots`, inclusive em caso de falha. O upload usa `always()`.

Chrome indisponível no ambiente local; download bloqueado. Resultado do navegador deve ser confirmado no workflow do PR, sem presumir PASS. Contraste, recortes locais, leitor de tela real e usabilidade requerem inspeção das capturas e testes complementares. Testes DOM não equivalem a conformidade WCAG.

## Pendências antes de merge

- Obter PASS do novo smoke e inspecionar as capturas.
- Quando o serviço recuperar, validar autenticação/autorização reais para citizen/agency/triage/admin com escopo autorizado.
- QA em aparelhos físicos e leitor de tela.
- PR #5 permanece sem merge.

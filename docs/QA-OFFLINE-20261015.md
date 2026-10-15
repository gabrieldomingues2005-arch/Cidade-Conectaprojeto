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

- Novo smoke PASS no workflow 52; capturas das 21 combinações inspecionadas em pranchas por largura.
- Quando o serviço recuperar, validar autenticação/autorização reais para citizen/agency/triage/admin com escopo autorizado.
- QA em aparelhos físicos e leitor de tela.
- PR #5 permanece sem merge.


## Evidência de navegador

Workflow 52: https://github.com/gabrieldomingues2005-arch/Cidade-Conectaprojeto/actions/runs/38816266389
Commit testado: `a45576b5ba84e662aff48c99d94e6719aba7940b`.

- 21/21 combinações rota/largura PASS.
- 7/7 cenários Admin PASS.
- Nenhum warning no log desse job.
- 28 PNGs + results.json no artefato; screenshots são de viewport, não de página inteira.
- Inspeção visual das 21 capturas: cabeçalho, títulos e conteúdo inicial se adaptam às três larguras; sem corte horizontal observado. Formulários longos exigem scroll normal.
- Fallback do mapa aparece quando o Leaflet externo é bloqueado. Tiles, marcadores, zoom e contraste sobre mapas reais não foram validados.
- Sem certificação de contraste ou leitor de tela real; as checagens automatizadas cobrem nomes de campos, aria-expanded, Tab do login e exceções JS, não toda a árvore acessível.

| Etapa | Rota | Saúde no cenário isolado |
|---|---|---|
| 1 | `#/` | PASS nas 3 larguras |
| 2 | `#/registrar` | PASS nas 3 larguras; envio real fora do escopo |
| 3 | `#/acompanhar` | PASS nas 3 larguras; consulta real fora do escopo |
| 4 | `#/mapa` | PASS do shell/fallback nas 3 larguras; mapas externos pendentes |
| 5 | `#/dashboard` | PASS nas 3 larguras com conjunto demonstrativo |
| 6 | `#/rede-municipal` | PASS nas 3 larguras com fonte local |
| 7 | `#/admin` | PASS anônimo e estados simulados; autenticação real pendente |

As mensagens de serviço indisponível e a opção de sair da conta no estado de erro foram refinadas após esta evidência e precisam permanecer cobertas pelo workflow subsequente.

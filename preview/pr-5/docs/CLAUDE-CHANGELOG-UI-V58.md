# CLAUDE-CHANGELOG — Cidade Conecta, melhorias de UI/UX do mapa (sobre v5.7.1)

Escopo: somente frontend/apresentação, conforme `docs/CLAUDE-UI-HANDOFF.md`.
Nada foi validado em produção. Todos os testes abaixo foram locais/offline.

## Arquivos alterados (4)

| Arquivo | Natureza |
|---|---|
| `assets/app.js` | `mapPage` e `bindMap` (estrutura, estados, bug), ícone `filter` |
| `assets/design-v56.css` | bloco novo "UI v5.8 — Mapa" ao final do arquivo (nada existente foi removido) |
| `assets/piracicaba-mapas.js` | 2 linhas: posição do resumo territorial e texto das contagens |
| `index.html` | só sufixo de cache `?v=` em 3 assets (`5.7.1-ui2`, `5.5.0-ui2`) |

Intactos (verificado com `cmp`): `auth.js`, `supabase-bridge.js`, `runtime-config.js`, `sw.js`, `data/*.json`, `scripts/*`.
Não foram tocados Supabase, SQL, Auth, RLS, Storage, Edge Functions nem lógica de autorização. O aviso de protótipo acadêmico foi mantido.

## Bug encontrado e corrigido (comportamento, não só visual)

`app.js` (`renderResults`) usava `$('[data-map-open]').forEach(...)`, onde `$` retorna um elemento; o correto é `$$`. Isso lançava `TypeError` toda vez que a lista do mapa era desenhada e, em cadeia:
- os itens da lista nunca focavam o marcador;
- `syncUrl()` e o enquadramento inicial (`fitBounds`) não executavam;
- o `invalidateSize` final do `bindMap` nunca era agendado.

**Por que o CI não pegou:** o smoke bloqueia toda requisição cross-origin (inclusive o Leaflet do unpkg), então `window.L` nunca existe no CI e o caminho real do mapa não é exercitado.

Ao corrigir, apareciam duas corridas latentes, que também foram tratadas: `draw()`/`syncUrl()` rodando depois da troca de rota (o `fetch` do território resolvia com `currentMap` já destruído) e `fitBounds` sobre mapa oculto (0 px) ao filtrar na aba Lista. Agora há guarda de "view viva" (`alive()`) e enquadramento adiado (`pendingFit`) até o mapa ficar visível.

## Mapa — desktop (1366)
- Painel + mapa com altura própria (`clamp(600px, 100dvh − 150px, 820px)`); antes o mapa esticava junto com o painel (~1400 px).
- Só a lista rola; filtros em grade 2 colunas; rótulos curtos nos selects (Categoria / Região / Área de referência).
- "Limpar filtros" saiu da grade e aparece no cabeçalho só quando há filtro ativo.
- Ações do mapa (Perto de mim, Ver todos, Copiar visão) foram para uma barra acima do mapa; "Agrupar pontos" foi para a barra de contexto inferior.
- Regiões 1–9 viram uma faixa compacta de 9 botões.
- Removidos: chips redundantes "OpenStreetMap / Limite IBGE" (a barra de contexto já cita as fontes) e o rótulo decorativo que cobria a atribuição do mapa.

## Mapa — tablet (768)
- Layout empilhado: mapa em largura total, painel abaixo, lista em 2 colunas, regiões depois da lista.

## Mapa — mobile (390)
- Mapa cabe acima da barra inferior; cabeçalho da página e do mapa compactados (mapa passa de ~y 520 para ~y 438 e tem altura útil).
- Barra de ações com "Filtros" (badge com nº de filtros ativos), que leva à aba Lista e abre os filtros.

## Aba Lista (mobile)
- Busca + botão "Filtros" + chips de status ficam fixos no topo; selects recolhidos por padrão (abrem sozinhos em deep link com filtro).
- Primeiro resultado aparece logo abaixo da busca (antes: ~800 px de controles antes do 1º item).
- Itens: título em até 2 linhas (antes truncado em ~5 caracteres), bairro·protocolo, área de referência, status em badge, distância quando há geolocalização, link "Radar do bairro".
- Tocar num item no mobile troca para a aba Mapa e abre o popup do marcador.
- Sem `max-height`/rolagem interna na lista mobile.

## Aba Regiões
- Linhas por região com "N bairros · três primeiros…", usando só os bairros de `data/piracicaba.json` (leitura). **Nenhum nome de região nem polígono foi criado.**
- Contagem por extenso ("1 ocorrência"), faixa de feedback com Ver lista / Ver no mapa / Limpar região.
- Botões ficam desabilitados até a base territorial carregar; se falhar, mensagem explícita.
- O resumo "N de N registros reconhecidos" foi movido para dentro desta aba (`piracicaba-mapas.js`, com fallback ao local antigo).

## Estados
- **Vazio:** 3 variantes (sem dados / sem resultado com filtros / região indisponível) e carregando regiões.
- **Loading/erro de tiles:** aviso "Carregando mapa…" e aviso não bloqueante se os tiles falham (mensagem distinta offline); pontos e lista seguem funcionando.
- **Sem Leaflet:** a lista **e os filtros agora funcionam** (antes os filtros ficavam inertes); botões que dependem do mapa ficam ocultos.
- Modo foco passa a sair com Esc.

## Acessibilidade
- `aria-pressed` em chips, regiões e abas; grupos rotulados; contagem de resultados anunciada em região `aria-live` (a lista inteira deixou de ser live region).
- Campo de busca `type="search"`; fonte 16 px nos campos no mobile (evita zoom do iOS).
- Alvos de toque ≥ 44 px na lista mobile (medido: nenhum abaixo). Textos secundários subiram de ~10–11 px para ≥ 12 px.
- Foco visível global preservado.

## Verificações executadas (locais)
- `validate-project.mjs`: **233 OK, 1 aviso (Guamium), 59 falhas — idêntico à base** (todas por arquivos de backend ausentes neste pacote offline: `supabase/`, `schema.sql`, `.md`). Nenhuma falha nova, nenhuma corrigida.
- Smoke Chrome, cópia sem rotas admin: **18/18** (6 rotas × 390/768/1366: sem erro JS, sem overflow horizontal, sem campo sem label).
- Teste comportamental próprio (Playwright, 24 checagens): lista→mapa no mobile, filtros/URL/aria, estado vazio, deep link de região, troca de rota sem erro, modo foco/Esc, fallback sem Leaflet, falha de tiles, rótulos. **24/24**.
- `scrollWidth` = largura em 390/768/1366 nas 3 visões.

## Riscos e pontos que precisam de validação
1. **Smoke oficial não completa neste pacote:** falha em `#adminLoginForm` — **também no pacote original intocado** (provável efeito do `runtime-config.js` sanitizado). Não é regressão desta entrega, mas os "28 cenários" não puderam ser reproduzidos; rodar no repositório real.
2. **Cobertura de CI cega ao Leaflet:** recomenda-se um cenário de smoke que sirva o Leaflet. Não alterei `scripts/` (fora da lista permitida).
3. **Capturas feitas com stubs:** tiles do OSM substituídos por pixel transparente e Leaflet local do npm; ícone do controle de camadas aparece vazio. Servem para layout, não para aparência cartográfica real. Validar com OSM real.
4. **Correção do bug muda comportamento visível:** o mapa agora enquadra os pontos ao abrir e a URL passa a refletir os filtros (`#/mapa?...`), como já era a intenção. Confirmar que é o desejado.
5. **Navegadores:** `:has()` (cabeçalho compacto no mobile) e `100dvh` — sem `:has()` o cabeçalho só fica maior; não testado em Safari/Firefox reais. Nenhum teste em dispositivo físico.
6. **CSS em camadas com `!important`:** segui o padrão V58 existente (bloco no fim de `design-v56.css`); consolidar com `design-v55.css` fica como dívida técnica.
7. **Chips de status no mobile** rolam na horizontal sem indicador visual de continuação.
8. **Não alterados por falta de permissão:** `sw.js` e rodapé/`VERSION` ainda dizem 5.7.1; apenas o `?v=` dos assets mudou. O SW já serve JS/CSS network-first.
9. Fora do mapa (Home, Registrar, Acompanhar, Dashboard, Rede, Admin) **não foi feito trabalho visual** nesta rodada.

## Evidências
`screenshots/claude-ui-v58/` (5 full-page + 2 viewport mobile). Os screenshots anteriores do pacote não foram sobrescritos.

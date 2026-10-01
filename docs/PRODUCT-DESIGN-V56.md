# Cidade Conecta — Product Design v5.6

**Branch:** `feature/cidade-conecta-product-design-20261001`  
**Base original:** `main` em `41b118fae0fce61e18c368dfffc33583ebd8f6de`  
**Integração:** PR #1 → `main` em `5daf87a99bee73adf0b2a293aea856f7aaea67dd`  
**Escopo:** evolução incremental de UI/UX e front-end estático, sem alteração de banco, Supabase, RLS, Edge Functions ou contratos de dados.

## 1. Diagnóstico atual

A base v5.5 já possui uma direção visual própria e recursos avançados. Os principais pontos de evolução identificados foram:

- **Hierarquia:** algumas telas têm muitos painéis com o mesmo peso visual; a leitura de prioridade pode ser reforçada.
- **Estados:** o projeto já trata diversos estados, mas faltava uma camada visual consistente para loading, vazio, erro, offline e retry.
- **Mapa:** a experiência funcional é forte, porém filtros, contador, lista e contexto territorial podem ganhar contraste e leitura mais orientada à tarefa.
- **Rede Municipal:** a arquitetura informativa está correta; os cartões e o fluxo podem comunicar melhor a escala `problema → referência → setor → canal`.
- **Formulário:** o fluxo guiado funciona, mas a navegação entre etapas e a ação de envio podem ter mais persistência visual durante a rolagem.
- **Mobile:** a base já possui barra inferior, alternância mapa/lista e safe area; a v5.6 reduz cortes, melhora alvos de toque e organiza layouts densos em coluna.
- **Acessibilidade:** foco visível, contraste reforçado e redução de movimento foram consolidados em uma camada única.

## 2. Proposta visual aplicada

A v5.6 não troca a identidade. Ela acrescenta:

- superfícies brancas e verdes suaves com menos ruído;
- bordas e sombras mais consistentes;
- títulos com hierarquia editorial e melhor ritmo de leitura;
- estados de erro/vazio/offline visualmente reconhecíveis;
- contador e filtros do mapa com maior contraste;
- cartões da Rede Municipal com diferenciação entre referência pública e ação interna;
- formulário com jornada e envio visíveis sem transformar o fluxo em wizard obrigatório;
- comportamento mobile específico para mapa, rede, tabelas, cards e controles.

## 3. Antes → depois

| Área | Antes | Depois |
|---|---|---|
| Shell | Boa identidade, mas navegação e foco variavam conforme o componente | Navegação horizontal controlada, foco global visível e CTA preservado |
| Dashboard | KPIs e painéis já existentes, com pesos próximos | Cards com elevação suave, números tabulares e melhor leitura de estados |
| Mapa | Workspace avançado com filtros e lista | Controles com contraste, contador destacado, lista mais legível e vazio orientado |
| Rede Municipal | Fluxo correto, mas cartões densos | Escala visual mais clara e setores/canais com separação semântica |
| Formulário | Jornada visual presente | Jornada sticky durante rolagem e envio com maior permanência visual |
| Mobile | Responsivo com adaptações v5.5 | Colunas mais seguras, tabelas com scroll controlado, alvos de toque e ausência de cortes |
| Acessibilidade | Regras distribuídas nas camadas anteriores | Foco, contraste, reduced motion e estados consolidados em v5.6 |

## 4. Arquivos modificados

- `index.html` — inclui `assets/design-v56.css` e o aviso offline conectado.
- `assets/design-v56.css` — nova camada visual incremental.
- `assets/app.js` — conecta estado online/offline e skeleton da Rede Municipal, sem alterar contratos.
- `sw.js` — atualiza cache offline para v5.6 e inclui o novo CSS.
- `scripts/validate-project.mjs` — valida asset v5.6 e os hardenings de PWA/acessibilidade.
- `WORK-CONTINUAR.md` — registra o ponto de continuidade.
- `docs/PRODUCT-DESIGN-V56.md` — este diagnóstico e checklist.

Nenhuma tabela, migration, Edge Function, RLS, credencial ou integração foi alterada.

## 5. Ajustes pós-handoff

- O Service Worker resolve assets versionados com query string no primeiro uso offline usando `ignoreSearch`.
- A limpeza de cache foi restringida ao prefixo `cidade-conecta-`, evitando apagar caches de outros projetos no mesmo domínio.
- O foco de teclado v5.6 prevalece sobre regras legadas v5.5 com anel de alto contraste.
- O aviso offline foi ligado ao estado real `navigator.onLine`, com eventos `online`/`offline`.
- A Rede Municipal usa skeleton real durante carregamento e remove `aria-busy` ao concluir ou falhar.
- O rodapé diferencia `MVP v5.5` de `UI v5.6`, preservando a versão funcional/contratual do produto.

## 6. Checklist de QA final

### Visual
- [x] Camada v5.6 carrega depois da v5.5.
- [x] Comparação v5.5 vs. v5.5+v5.6 não introduz overflow adicional em 320/390/768/1366 px.
- [x] Foco de teclado v5.6 é computado com outline de 3 px e halo adicional.
- [x] Aviso offline aparece e desaparece conforme estado de conectividade.
- [x] Skeleton da Rede Municipal aparece com `aria-busy="true"`.
- [x] `prefers-reduced-motion` desativa shimmer e transições relevantes.
- [x] Tabelas estreitas mantêm wrapper de rolagem horizontal controlada.

### Funcional/regressão
- [x] JavaScript alterado passa em `node --check`.
- [x] Service Worker alterado passa em `node --check`.
- [x] Validador alterado passa em `node --check`.
- [x] A v5.6 não altera Supabase, banco, migrations, RLS ou Edge Functions.
- [x] Cache v5.6 inclui `assets/design-v56.css`.
- [x] Limpeza de cache fica limitada aos caches do Cidade Conecta.
- [x] CI completo da branch no GitHub: **245 verificações aprovadas, 0 falhas** e 1 aviso conhecido de Guamium.
- [x] PR #1 integrado por squash na `main`.
- [x] Pipeline `Sincronizar site para gh-pages` concluída com sucesso; `gh-pages` sincronizada ao commit da integração.

## 7. Riscos restantes

- O mapa continua dependente de Leaflet/OpenStreetMap/IBGE quando conectado.
- O Admin permanece demonstrativo conforme a arquitetura atual.
- Estados reais de backend devem ser validados em ambiente integrado; a v5.6 não altera esses contratos.
- Teste em aparelhos físicos continua recomendado mesmo após o QA automatizado.

## 8. Estado final e próxima etapa

A v5.6 está integrada à `main` e sincronizada no preview técnico do GitHub Pages. O próximo trabalho deve partir da `main` atual, preservando a camada v5.6. Restam apenas smoke tests em navegador/aparelho físico e as evoluções funcionais futuras já registradas no roadmap; nenhuma mudança adicional de banco ou Supabase foi necessária para esta entrega.

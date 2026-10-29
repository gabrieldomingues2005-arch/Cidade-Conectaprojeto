# QA backend reconstruído — 29/10/2026

Branch: `feature/cidade-conecta-backend-recovery-20261022`. PR #7 permanece aberto, draft e sem merge. `main` e Raiz Carbon não foram alterados.

## Decisão final — GO técnico para o Supabase v2

O QA da recuperação foi concluído. Os bloqueios de segurança, Admin autenticado real e navegador com dados reais foram resolvidos/validados.

O backend `qzpofoxxrjunyayczcfu` está apto para ser usado pelo preview oficial em uma etapa controlada posterior. Este QA não alterou o preview oficial nem fez merge porque `main` deve permanecer preservada e o PR #7 continua explicitamente sem merge.

## Infraestrutura — PASS

Projeto `qzpofoxxrjunyayczcfu` ACTIVE_HEALTHY, região `sa-east-1`. Doze migrations `recovery_001`–`recovery_012` registradas. PostGIS e pgcrypto instalados. Todas as 13 tabelas `public` e três `private` verificadas têm RLS. Bucket `occurrence-attachments` permanece privado. Base territorial: 9 regiões administrativas, 85 bairros/núcleos, 72 vínculos e 9 categorias.

A migration aplicada no banco aparece como `recovery_012_exact_client_privileges`. O SQL versionado correspondente está em `supabase/recovery/007_exact_client_privileges.sql`; o mapeamento deve ser preservado/documentado em futuras recuperações para não confundir número do arquivo com número da migration aplicada.

## Segurança — PASS

`anon`: INSERT direto em `occurrences` negado; tabelas sensíveis verificadas negadas; schema `private` não exposto ao cliente; RPCs internos não executáveis por `anon`. `service_role` mantém apenas as permissões necessárias ao backend.

A correção ACL foi validada novamente no estado final:

- `anon` e `authenticated` não possuem `TRUNCATE` em `occurrences` nem `occurrence_history`;
- `TRUNCATE`, `REFERENCES` e `TRIGGER` indevidos foram removidos dos papéis de cliente;
- leitura pública continua limitada às tabelas previstas e sujeita a RLS;
- funções públicas não ficam implicitamente executáveis por `anon/authenticated`;
- default privileges de `postgres` foram endurecidos para reduzir reincidência em objetos futuros.

Nenhuma chave `service_role`, `sb_secret` ou credencial administrativa foi encontrada no frontend.

## Ocorrência, privacidade e tracking — PASS

Ocorrência QA: `CC-2026-01002`, título `Teste QA Cidade Conecta v2`.

O envio real via `submit-occurrence` retornou HTTP 201. Protocolo, token, histórico e auditoria foram criados; o token não é armazenado em claro no banco.

Privacidade validada:

- contato permanece separado dos dados públicos;
- localização exata permanece em estrutura privada;
- coordenadas públicas são aproximadas;
- nenhuma tela pública do QA live expôs `qa@example.invalid` ou a latitude exata `-22.725321`;
- tracking com token correto retorna o registro;
- token ausente/incorreto não revela ocorrência pendente;
- protocolo inválido retorna 400;
- rate limit retorna 429 sem criar ocorrência extra.

Após o QA live, `CC-2026-01002` foi restaurada para `moderation_status=pending` e `public_visible=false`. Ela permanece preservada como evidência de QA, fora da leitura pública.

## Admin autenticado real — PASS

Foi criada somente para o teste uma conta QA temporária, confirmada no Auth e vinculada ao papel interno `admin`. O fluxo real validou:

- login/sessão reais no Supabase Auth;
- leitura real de `users_profile`;
- autorização real da Edge Function `admin-occurrences`;
- fila real contendo `CC-2026-01002`;
- pesquisa/filtro por protocolo;
- abertura do detalhe;
- ausência do contato e da coordenada exata na UI interna testada.

Durante este teste foi encontrado um bug real no detalhe do Admin: `adminCloudDetail()` chamava `formatDate()`, função inexistente. Os dois usos foram corrigidos para o utilitário existente `fmt()` no commit `f8a593295cd5b5ef6a0aa52ceebe2e634b2c885d`.

A evidência do gate Admin foi produzida no run 40968001120; esse run falhou posteriormente em um gate separado de Regiões, depois de o Admin já ter passado.

Ao término, todas as contas QA temporárias foram removidas. Estado final: **0 usuários `qa-live-*@gmail.com`** e nenhum perfil QA temporário mantido.

## Mapa / Lista / Regiões com backend real — PASS

Apenas durante a janela do teste, `CC-2026-01002` foi temporariamente marcada como aprovada/pública. O navegador Chrome headless executou a branch com o Supabase v2 real e Leaflet/tiles reais.

Run final de evidência: https://github.com/gabrieldomingues2005-arch/Cidade-Conectaprojeto/actions/runs/40968931300

Resultado final do artifact `qa-live-v2-evidence`:

- `mapa-real`: PASS em 390 px;
- `lista-real`: PASS em 390 px;
- `regioes-real`: PASS;
- Região 1: contador real `2 ocorrências`, incluindo `CC-2026-01002` e o registro seed do Centro;
- `popup-real`: PASS para a ocorrência QA;
- `mapa-desktop-real`: PASS em 1366 px, sem overflow horizontal;
- sem vazamento do contato privado ou coordenada exata;
- sem erro JavaScript ou request Supabase 4xx/5xx nos gates finais.

Capturas finais preservadas no artifact: `mapa-real-390.png`, `lista-real-390.png`, `regioes-real-390.png` e `mapa-real-1366.png`.

O QA encontrou um segundo bug real: os elementos `data-map-region-count` eram criados com `—`, mas nunca eram atualizados. Foi adicionada `updateRegionCounts()` em `assets/app.js`, com recálculo a partir da base territorial e das ocorrências públicas. Correção no commit `9b041fdf417c0052fac3b317d2e6f0b32de82164`.

Também foi adicionada regressão permanente ao smoke de navegador para exigir que o contador da Região 1 seja preenchido. Commit `07beae1f54b6a8085a34fcac6f3153250a1a7ca4`.

O harness e o workflow live usados apenas para esta investigação foram removidos ao final; não fazem parte da entrega permanente.

## Advisors finais

Security Advisor: **3 INFO** `rls_enabled_no_policy`, somente nas tabelas privadas de tokens/quotas. Permanecem informativos dentro do modelo atual, pois o schema privado e as funções têm acesso restrito.

Referência: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

Performance Advisor: **13 INFO** `unused_index`. A contagem caiu durante o próprio QA conforme índices passaram a ser usados. Nenhum índice foi removido porque a base ainda é nova e ausência de uso neste estágio não justifica remoção automática.

Referência: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

## Validação e CI — PASS

Quality gate do código após as correções:

- 283 verificações estáticas PASS;
- 46 testes Auth/Edge/PWA PASS;
- recovery validator PASS;
- 29 cenários Chrome PASS;
- screenshots do smoke gerados;
- regressão do contador de Regiões incluída.

Run de referência do CI com as correções de produto: https://github.com/gabrieldomingues2005-arch/Cidade-Conectaprojeto/actions/runs/40968734727

O QA live final foi executado separadamente no run 40968931300 e terminou PASS antes da remoção do harness temporário.

## Limpeza e estado final

- `CC-2026-01002`: `Recebida`, `pending`, `public_visible=false`;
- contas QA temporárias: 0;
- contato/token/localização exata continuam privados;
- ACL final: `TRUNCATE=false` para `anon` e `authenticated` nas tabelas críticas verificadas;
- Supabase v2: ACTIVE_HEALTHY;
- workflow/harness live temporários removidos da branch;
- `main` preservada;
- PR #7 sem merge;
- Raiz Carbon intocado.

Conclusão: **QA de recuperação concluído. Backend e frontend da branch estão tecnicamente liberados para o próximo passo controlado de apontar o preview ao Supabase v2, sem realizar esse apontamento ou merge dentro deste QA.**

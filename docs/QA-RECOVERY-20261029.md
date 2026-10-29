# QA backend reconstruído — 29/10/2026

Branch: feature/cidade-conecta-backend-recovery-20261022. Base 283d4dd. Sem merge do PR #7, alteração da main ou acesso ao Raiz Carbon.

## Decisão

O bloqueio ACL encontrado no QA foi CORRIGIDO em 29/10/2026 pela migration `recovery_012_exact_client_privileges`.

Ainda não liberar o preview oficial somente por duas validações funcionais pendentes: Admin autenticado real (não há conta QA provisionada) e renderização da ocorrência real no navegador em Mapa/Lista/Regiões.

## Infraestrutura — PASS

Projeto qzpofoxxrjunyayczcfu ACTIVE_HEALTHY, sa-east-1. Doze migrations recovery_001–012 registradas. PostGIS e pgcrypto instalados. Todas as 13 tabelas public e três private têm RLS. Bucket occurrence-attachments public=false. Base: 9 regiões, 85 bairros/núcleos, 72 vínculos e 9 categorias. Runtime aponta ao ref correto; varredura frontend sem chave service_role ou sb_secret.

## Segurança — PASS

anon: INSERT em occurrences negado; tabelas occurrence_private_location, occurrence_contacts, users_profile e audit_log negadas; private não exposto e sem USAGE; RPCs internos sem EXECUTE para anon. service_role mantém EXECUTE nos RPCs internos necessários.

Correção ACL validada:
- anon tem somente SELECT em municipalities, territorial_sources, administrative_regions, neighborhoods, neighborhood_regions, categories, occurrences e occurrence_history;
- authenticated tem somente SELECT nas tabelas necessárias e UPDATE adicional apenas em users_profile;
- TRUNCATE, REFERENCES e TRIGGER foram removidos de anon/authenticated;
- has_table_privilege confirmou TRUNCATE=false em occurrences e occurrence_history;
- anon continua sem EXECUTE em submit_occurrence_internal;
- service_role continua com EXECUTE;
- não há objetos de aplicação em public pertencentes a supabase_admin;
- default privileges de postgres foram endurecidos para novos objetos.

## Ocorrência e tracking — PASS

Uma ocorrência criada via submit-occurrence, HTTP 201, protocolo CC-2026-01002. Título Teste QA Cidade Conecta v2; descrição explícita de QA; contato qa@example.invalid e endereço fictício. Token retornado, não publicado neste relatório; banco guarda hash. Histórico Recebida e auditoria occurrence.submitted presentes. Status Recebida, moderação pending, bairro Centro resolvido por nome. Público -22.725/-47.649; exato -22.725321/-47.649217 somente em tabela privada; contato separado; public_location nulo.

Tracking: token correto 200 com categoria vias, status e histórico; sem token ou token errado retorna occurrence:null enquanto pending; protocolo inválido retorna 400. Nenhum contato/endereço exato/token aparece no retorno. REST público não revelou o registro pendente.

Rate limit: duas tentativas com categoria inválida, sem criar ocorrência adicional: primeira HTTP 400 invalid_category, seguinte HTTP 429 rate_limited com retryAfterSeconds. Mesmo cliente de QA.

## Aprovação e mapa — PASS API / UI real pendente

Apenas a ocorrência QA foi temporariamente aprovada, com evento occurrence.qa_approved em auditoria. REST público passou a retorná-la com coordenadas aproximadas, bairro e região; tracking sem token passou a retornar 200 com ocorrência e sem dados privados. Não foi inventado território. Mapa/Lista/Regiões e Leaflet stub são cobertos pelo smoke da branch; a renderização dessa ocorrência real no navegador/cartografia externa não foi executada nesta rodada.

## Admin — parcial

Anônimo HTTP 401. Papéis citizen/agency e erros 401/403/rede/timeout/5xx cobertos por testes simulados da branch. Não havia conta de QA provisionada: login autorizado, papel sem permissão recebendo 403 real, filtros e fila reais pendentes por ausência de conta. Nenhuma conta criada nem papel alterado. Não confundir fixtures com teste autenticado real.

## Advisors

Security: primeira chamada teve timeout; segunda completou. Três INFO rls_enabled_no_policy nas tabelas private de tokens e quotas. Informativo: backend usa funções restritas e anon não tem USAGE. Referência: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

Performance: vinte INFO unused_index, esperados em base recente; nenhum índice removido. Referência: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

Bloqueio ACL resolvido. Importante: completar QA com conta interna e mapa real. Os advisors permanecem apenas informativos.

## Validação e CI

Local: 283 verificações estáticas PASS (aviso conhecido Guamium), 46 testes Auth/Edge/PWA PASS e recovery validator PASS. O CI completo deve ser conferido no commit deste relatório; inclui syntax, manifesto, smoke Chrome 29 cenários, Leaflet stub e screenshots. Não reutilizar o CI da branch auth-admin como se fosse desta branch.

## Limpeza

Ocorrência CC-2026-01002 mantida explicitamente como QA, pending e public_visible=false. Retirada da leitura pública após o teste. Evento occurrence.qa_retained_private registra essa decisão. Não apagada porque a exclusão em cascata apagaria histórico e relações necessárias à evidência. Dados são fictícios; sem anexo ou usuário criado. Tokens e histórico permanecem privados. Não foram alterados schema, RLS, Auth ou Storage.


## Remediação ACL — 29/10/2026

A migration `recovery_012_exact_client_privileges` foi aplicada ao projeto v2. A regra usa revoke-all + grants mínimos explícitos e protege também novos objetos criados por postgres. Security Advisor permaneceu apenas com três INFO nas tabelas private; Performance Advisor retornou 17 INFO de índices sem uso, esperados numa base nova. Nenhum índice foi removido.

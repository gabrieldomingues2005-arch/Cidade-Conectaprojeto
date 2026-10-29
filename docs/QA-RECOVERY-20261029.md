# QA backend reconstruído — 29/10/2026

Branch: feature/cidade-conecta-backend-recovery-20261022. Base 283d4dd. Sem merge do PR #7, alteração da main ou acesso ao Raiz Carbon.

## Decisão

NÃO liberar o preview oficial ainda. Há privilégio TRUNCATE indevido de anon em oito tabelas públicas, inclusive occurrences e occurrence_history. Confirmado por information_schema.table_privileges e has_table_privilege; não foi executado TRUNCATE nem alterado ACL. RLS habilitado não substitui a revisão desses privilégios. Corrigir em trabalho autorizado e repetir auditoria antes da liberação.

## Infraestrutura — PASS

Projeto qzpofoxxrjunyayczcfu ACTIVE_HEALTHY, sa-east-1. Onze migrations recovery_001–011 registradas. PostGIS e pgcrypto instalados. Todas as 13 tabelas public e três private têm RLS. Bucket occurrence-attachments public=false. Base: 9 regiões, 85 bairros/núcleos, 72 vínculos e 9 categorias. Runtime aponta ao ref correto; varredura frontend sem chave service_role ou sb_secret.

## Segurança — PASS parcial / bloqueio ACL

anon: INSERT em occurrences negado por HTTP 401/42501; tabelas occurrence_private_location, occurrence_contacts, users_profile e audit_log negadas; private não exposto na API (406) e sem USAGE nem grants de tabelas; RPCs internos sem EXECUTE para anon. service_role possui EXECUTE em submit_occurrence_internal, track_occurrence e funções de quota; envio e acompanhamento reais confirmaram execução dos RPCs pelo backend. Não foram extraídas credenciais administrativas.

FAIL: anon mantém SELECT/TRUNCATE/REFERENCES/TRIGGER em municipalities, territorial_sources, administrative_regions, neighborhoods, neighborhood_regions, categories, occurrences e occurrence_history. O teste não demonstrou exploração via HTTP; o ACL é suficiente para bloquear a aprovação de segurança até revisão.

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

Bloqueante encontrado fora dos advisors: ACL TRUNCATE de anon. Importante: completar QA com conta interna e mapa real. Os advisors não substituem a revisão dos grants.

## Validação e CI

Local: 283 verificações estáticas PASS (aviso conhecido Guamium), 46 testes Auth/Edge/PWA PASS e recovery validator PASS. O CI completo deve ser conferido no commit deste relatório; inclui syntax, manifesto, smoke Chrome 29 cenários, Leaflet stub e screenshots. Não reutilizar o CI da branch auth-admin como se fosse desta branch.

## Limpeza

Ocorrência CC-2026-01002 mantida explicitamente como QA, pending e public_visible=false. Retirada da leitura pública após o teste. Evento occurrence.qa_retained_private registra essa decisão. Não apagada porque a exclusão em cascata apagaria histórico e relações necessárias à evidência. Dados são fictícios; sem anexo ou usuário criado. Tokens e histórico permanecem privados. Não foram alterados schema, RLS, Auth ou Storage.

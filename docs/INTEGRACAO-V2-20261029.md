# Integração Cidade Conecta v2 — 29/10/2026

Branch de entrega: `feature/cidade-conecta-auth-admin-20261008`.
Recovery incorporado: `283d4dd15c61c9dc1fd3c5850e3a5ac53e323f06`.
Projeto oficial confirmado: `qzpofoxxrjunyayczcfu` — Cidade Conecta v2, sa-east-1, ACTIVE_HEALTHY. O projeto anterior foi removido; nenhum recurso do Raiz Carbon foi consultado após identificar o projeto correto.

## Entrega

- Integração da configuração v2 e do recovery já aplicado com o frontend/mapa v5.8; nenhum SQL foi executado ou recriado nesta rodada.
- Município, URL e chaves públicas preservados conforme a branch de recuperação. Preconnect corrigido para o novo host.
- Resposta pública bem-sucedida substitui os dados demonstrativos, inclusive quando vazia. Resumos territoriais usam a mesma visão pública do mapa e dos indicadores. Registros locais e tokens do proprietário permanecem guardados para acompanhamento; registros que saíram da listagem pública deixam de entrar nos indicadores.
- Coordenadas ausentes não viram zero; acompanhamento distingue erro de serviço de protocolo não encontrado e ignora respostas antigas após nova consulta.
- Ponte pública tem timeout de 12 s até a leitura do corpo da resposta, sem repetição automática de escrita. Chamadas simultâneas de health compartilham a requisição. Contagem desconhecida não é representada como zero.
- Cache PWA renovado e assets com query string exata incluídos na instalação offline. Sem cache de API externa ou respostas privadas de autenticação.
- Documentação principal atualizada para o projeto vigente.

## Verificação real de leitura — 29/10/2026

Executada com `node scripts/check-backend.mjs`. Não usa SQL nem credenciais administrativas e não cria ocorrências ou usuários. O script fica separado do CI offline.

| Check | HTTP / resultado |
|---|---|
| Município 3538709 | 200, Piracicaba |
| Categorias ativas | 200, 9 |
| Regiões | 200, 9 |
| Bairros e núcleos | 200, 85 |
| Contrato público de ocorrências aprovadas | 200, lista vazia |
| users_profile anônimo | 401 |
| occurrence_private_location anônimo | 401 |
| occurrence_contacts anônimo | 401 |
| audit_log anônimo | 401 |
| Admin sem sessão pessoal | 401 |
| CORS submit-occurrence | 204, origem do GitHub Pages permitida |
| CORS track-occurrence | 204, origem do GitHub Pages permitida |

As três Edge Functions foram conferidas ACTIVE pela API de gerenciamento. A leitura pública e a prontidão de configuração não equivalem a uma nova submissão real. O fluxo real de escrita foi reportado no QA de 22/10; nesta rodada não foi repetido porque a regra de não alterar dados permanece.

## QA local e CI

283 checagens estáticas aprovadas, um aviso territorial conhecido (Guamium); validador do recovery aprovado sem execução de SQL; 85 testes locais aprovados. O CI determinístico cobre rotas, larguras, estados Admin, mapa com stub e casos conectados de lista vazia e aprovada, além de dois novos casos de dashboard e resumo territorial vazios com banco público vazio. Screenshots ficam nos artefatos do workflow. Conferir o resultado do commit final antes de considerar o gate de navegador aprovado.

## Limites

Não foram criados usuários nem alterados Auth, Storage, RLS, dados ou Edge Functions nesta rodada. Login autorizado e fila interna real precisam de conta da equipe já provisionada; citizen/agency/triage/admin continuam cobertos por fixtures, não por novos usuários reais.

O mapa continua usando a biblioteca externa no produto; seu cenário offline de CI usa stub e não valida cartografia real. Sem merge do PR #5, alteração da main ou deploy.

O Security Advisor retornou somente INFO nas três tabelas privadas com RLS sem política, utilizadas pelo backend. [Referência do advisor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). Nenhum ajuste de políticas foi executado.

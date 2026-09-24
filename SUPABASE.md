# Cidade Conecta — Supabase v5.2

O Cidade Conecta usa projeto Supabase próprio, separado de Raiz Carbon / Carbon Track.

## Projeto oficial

- Nome: `Cidade Conecta`
- Project ref: `yvmkgpijzewssdxgimit`
- Região: `sa-east-1`
- URL pública: `https://yvmkgpijzewssdxgimit.supabase.co`

**Nunca usar o projeto RAIZ CARBON `htzigdvatjpvvkwswjof`.**

## Estado atual

O backend foi provisionado em 17/09/2026, foi restaurado em 24/09/2026 e está saudável (`ACTIVE_HEALTHY`).

Já foram aplicadas migrations para:

- PostgreSQL base;
- PostGIS;
- município de Piracicaba;
- 9 regiões administrativas em estado `metadata-only`;
- bairros e vínculo N:N com regiões;
- categorias;
- perfis ligados ao Supabase Auth;
- ocorrências;
- localização pública e localização exata privada;
- histórico;
- anexos;
- auditoria;
- RLS;
- índices geográficos e relacionais;
- bucket privado `occurrence-attachments`.

O Security Advisor não apresenta lints ativos. O Performance Advisor aponta apenas índices ainda não utilizados, esperado enquanto o banco está praticamente vazio. Uma auditoria adicional identificou que as tabelas do schema `private` não têm grants diretos para `anon`/`authenticated`, porém continuam com RLS desabilitado; isso deve ser tratado como hardening pendente.

## Integração do frontend

A configuração pública fica em `assets/runtime-config.js` e a leitura técnica em `assets/supabase-bridge.js`.

O site está em `dataMode: hybrid-write`: leitura pública aprovada vem do Supabase e a criação de ocorrências passa pela Edge Function segura `submit-occurrence`. O Admin visual continua demonstrativo.

No navegador podem existir somente:

- URL pública do projeto Supabase;
- `project_ref` público;
- chave `publishable` do cliente;
- configurações não secretas.

Nunca colocar no GitHub ou JavaScript público:

- `service_role`;
- `sb_secret_*`;
- senha do PostgreSQL;
- tokens administrativos;
- chaves privadas;
- credenciais de outro projeto.

## Segurança

Todas as tabelas expostas têm RLS. Dados territoriais/categorias têm leitura pública controlada. Ocorrências públicas exigem `public_visible = true` e moderação aprovada. Dados privados exigem usuário proprietário ou perfil interno autorizado. Alteração de `role` não é permitida ao próprio usuário pelo cliente.

O bucket de anexos é privado e permite upload/leitura do próprio usuário autenticado; equipe autorizada poderá acessar conforme RLS.

## Próximas etapas

1. Manter leitura do backend validada no preview.
2. Criar fluxo seguro de escrita de ocorrências.
3. Migrar gradualmente os registros do `localStorage`.
4. Conectar Auth à interface.
5. Conectar Storage às fotos.
6. Substituir o Admin demonstrativo por autorização real.
7. Somente depois habilitar integrações externas.

## Princípio

Se houver dúvida sobre qual projeto Supabase está selecionado, nenhuma alteração deve ser executada. Cidade Conecta e Raiz Carbon permanecem totalmente separados.


## Atualização v4.6 — escrita segura

Projeto oficial: `yvmkgpijzewssdxgimit` (`sa-east-1`).

- `submit-occurrence`: valida entrada, aplica rate limiting, cria protocolo/token, salva contato/localização privada e opcionalmente anexo privado.
- `track-occurrence`: aplica rate limiting e chama internamente `track_occurrence`; a RPC é restrita a `service_role`.
- `occurrence_contacts`: dados de contato privados.
- `private.occurrence_tracking_tokens`: somente hash do token.
- `private.submission_rate_limits` e `private.tracking_rate_limits`: controles de abuso.
- `profile_self_update` impede autopromoção de papel por cidadão.

As migrations aplicadas estão em `supabase/migrations/`; as Edge Functions estão em `supabase/functions/`.


## Atualização 24/09/2026

- Projeto restaurado com sucesso: `ACTIVE_HEALTHY`.
- `submit-occurrence` redeployada como versão 3.
- Corrigida a validação de longitude para rejeitar corretamente valores fora de `-180..180`.
- `track-occurrence` segue ativa com `verify_jwt: true`.
- Migrations preservadas: core, índices, submissão segura, reserva de protocolos demo, restrição de papel e tracking seguro.
- Base territorial preservada: 1 município, 5 fontes, 9 regiões, 71 bairros, 72 vínculos e 9 categorias.
- Nenhuma ocorrência, contato, anexo ou token residual ficou gravado após os testes.
- Bucket `occurrence-attachments` permanece privado e aceita apenas JPEG/PNG/WebP.
- Foi endurecido o ACL de `occurrence_contacts`: `authenticated` agora mantém somente `SELECT`, ainda limitado por RLS.
- Hardening pendente: avaliar habilitação de RLS nas tabelas `private.occurrence_tracking_tokens`, `private.submission_rate_limits` e `private.tracking_rate_limits`. Hoje elas não têm grants diretos para `anon` ou `authenticated`, mas a recomendação é não depender apenas de grants.

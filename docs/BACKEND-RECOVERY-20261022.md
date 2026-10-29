# Recuperação do backend — Cidade Conecta

Data: 22/10/2026

Branch: `feature/cidade-conecta-backend-recovery-20261022`

## Situação

O projeto Supabase original `yvmkgpijzewssdxgimit` foi removido após backup técnico parcial, porque permaneceu preso em `COMING_UP`.

Novo projeto criado:
- nome: `Cidade Conecta v2`
- project ref: `qzpofoxxrjunyayczcfu`
- região: `sa-east-1`
- status inicial: `ACTIVE_HEALTHY`
- custo informado na criação: US$ 0/mês

A reconstrução foi aplicada somente ao novo projeto.

Nunca usar o Supabase Raiz Carbon `htzigdvatjpvvkwswjof`.

## Objetivo

Criar um novo projeto Supabase para o Cidade Conecta e reconstruir de forma reproduzível:

- PostgreSQL base;
- PostGIS;
- município de Piracicaba;
- fontes territoriais;
- 9 regiões administrativas;
- 71 bairros urbanos únicos;
- 72 vínculos bairro/região;
- 14 núcleos rurais/isolados;
- 9 categorias;
- perfis e papéis;
- ocorrências;
- histórico;
- localização privada;
- anexos;
- auditoria;
- RLS;
- rate limiting;
- acompanhamento seguro;
- Edge Functions;
- bucket privado de anexos.

## Ordem de aplicação no NOVO projeto

1. `supabase/recovery/001_core_schema_rls.sql`
2. `supabase/recovery/002_piracicaba_seed.sql`
3. `supabase/migrations/20260917_secure_occurrence_submission_v1.sql`
4. `supabase/migrations/20260917_reserve_demo_protocol_range.sql`
5. `supabase/migrations/20260917_restrict_profile_self_role.sql`
6. `supabase/migrations/20260917_secure_occurrence_tracking_edge.sql`
7. `supabase/migrations/20260924_harden_occurrence_contacts_privileges.sql`
8. `supabase/recovery/003_storage_bucket.sql`
9. `supabase/recovery/004_private_hardening.sql`
10. `supabase/recovery/005_post_advisor_tuning.sql`
11. `supabase/recovery/006_sensitive_privilege_hardening.sql`

Depois:
- executar Security Advisor e Performance Advisor;
- validar contagens;
- testar RLS negativo/positivo;
- implantar `submit-occurrence`, `track-occurrence` e `admin-occurrences`;
- testar Auth interno;
- só então obter URL/chave publishable do novo projeto;
- atualizar `assets/runtime-config.js` numa branch própria;
- rodar CI e QA completo;
- manter PR sem merge até todos os gates passarem.

## Regras

- não executar nenhum SQL no projeto travado;
- não recriar `auth`, `realtime` ou `storage`;
- não copiar service_role para frontend;
- não importar usuários automaticamente;
- não liberar `agency` até existir escopo usuário → órgão;
- não liberar escrita administrativa até update + auditoria serem transacionais;
- não inventar polígonos das regiões;
- localização pública permanece aproximada;
- localização exata permanece em tabela privada.

## Criação do novo projeto

Concluída em 22/10/2026 na mesma organização, região `sa-east-1`, com custo informado de US$ 0/mês.

## Checkpoint do novo projeto

Aplicado no `qzpofoxxrjunyayczcfu`:
- recovery 001–011;
- PostGIS e pgcrypto em `extensions`;
- 5 fontes territoriais;
- 9 regiões;
- 71 bairros urbanos únicos;
- 72 vínculos bairro/região;
- 14 núcleos isolados;
- 9 categorias;
- bucket privado `occurrence-attachments`;
- Edge Functions `submit-occurrence`, `track-occurrence` e `admin-occurrences` ativas;
- branch de recovery apontada para o novo project ref com chave publishable moderna;
- privilégios anon removidos de perfis, localização privada, auditoria, contatos e anexos.

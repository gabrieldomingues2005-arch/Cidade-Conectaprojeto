# Cidade Conecta — Supabase v2

O Cidade Conecta usa projeto próprio, separado de Raiz Carbon / Carbon Track.

## Projeto oficial

- Nome: `Cidade Conecta v2`.
- Project ref: `qzpofoxxrjunyayczcfu`.
- Região: `sa-east-1`.
- URL pública: `https://qzpofoxxrjunyayczcfu.supabase.co`.
- Status consultado em 02/11/2026: `ACTIVE_HEALTHY`.

**Nunca usar o Raiz Carbon `htzigdvatjpvvkwswjof`.** O antigo `yvmkgpijzewssdxgimit` foi descartado e não é destino de configuração ou operações.

## Estado validado

O QA de recovery foi aprovado em 29/10/2026. Ver `docs/QA-RECOVERY-20261029.md` para evidências, advisors e limitações.

- PostgreSQL com PostGIS e pgcrypto; schema `private`.
- RLS em todas as tabelas verificadas de `public` e `private`.
- 9 regiões administrativas, 71 bairros urbanos, 72 vínculos bairro/região, 14 núcleos isolados e 9 categorias.
- Bucket privado `occurrence-attachments`.
- Edge Functions `submit-occurrence`, `track-occurrence` e `admin-occurrences`.
- Protocolo real, token com hash no banco, rate limit, histórico e auditoria.
- Contato e posição exata separados da localização pública aproximada.
- `anon` não insere diretamente em `occurrences`, não lê tabelas sensíveis, não acessa `private` e não executa RPCs internos.
- Privilégios indevidos de TRUNCATE/REFERENCES/TRIGGER removidos dos papéis de cliente.

Doze migrations de recovery foram registradas no projeto. Os arquivos de `supabase/recovery/` documentam o estado reconstruído; sua numeração não é idêntica à da migration aplicada. Por exemplo, `007_exact_client_privileges.sql` corresponde a `recovery_012_exact_client_privileges`. Não reaplicar automaticamente os arquivos SQL.

## Integração do frontend

`assets/runtime-config.js` contém somente configuração pública do projeto oficial. `assets/supabase-bridge.js` realiza leitura pública aprovada e envio seguro via Edge Functions, em modo `hybrid-write`.

A interface v6 preserva os contratos validados. Publicação exige moderação aprovada e visibilidade pública. Registros demonstrativos são identificados como demonstração. O código privado de acompanhamento fica no aparelho de origem; os dados privados não integram mapas, contagens ou exportações públicas.

Podem estar no cliente somente URL, project ref, chave publishable e configuração pública. Nunca incluir `service_role`, `sb_secret_*`, senha de banco ou credencial administrativa no frontend.

## Autenticação e Admin

- Cliente: `assets/auth.js`; autorização: Edge Function `admin-occurrences`.
- Papéis internos permitidos: `triage` e `admin`, verificados no backend a partir de `users_profile`.
- `citizen`, `agency` e papéis desconhecidos ficam bloqueados para a fila interna.
- Sessão em `sessionStorage` da aba; `user_metadata` não é fonte de autorização.
- Fila e detalhe internos são somente leitura e não retornam contato ou posição exata.
- Escrita administrativa permanece fora do escopo até existir operação transacional com auditoria.

Não criar contas ou promover papéis automaticamente para testar a interface. O QA aprovado removeu suas contas temporárias; a ocorrência `CC-2026-01002` foi preservada como evidência, pendente e fora da leitura pública.

## Promoção para main

A autorização para integrar o estado aprovado na principal ocorreu em 02/11/2026. Essa promoção altera o código publicado e sua configuração pública; não executa SQL, migrations, deploy de Edge Functions ou alterações em Auth/RLS/Storage. Ver `docs/INTEGRACAO-MAIN-20261102.md`.

Se houver dúvida sobre o projeto selecionado, não executar alteração. Cidade Conecta e Raiz Carbon permanecem separados.

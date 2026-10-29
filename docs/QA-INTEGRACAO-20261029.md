# Integração e QA — 29/10/2026

Branch: `feature/cidade-conecta-auth-admin-20261008`. Integração da recuperação v2 (`283d4dd`) com o mapa v5.8 (`f9ba9a3`). Main preservada; PR #5 aberto, sem merge.

## Integração

O projeto ativo é `qzpofoxxrjunyayczcfu` (Cidade Conecta v2), confirmado `ACTIVE_HEALTHY` via Management API. As funções `submit-occurrence`, `track-occurrence` e `admin-occurrences` estão `ACTIVE`, com `verify_jwt=true`. A configuração pública recuperada foi preservada; preconnect e versões dos assets foram alinhados ao runtime atual.

## Melhorias

- Timeout de 12 s por chamada pública, incluindo leitura do corpo; sem repetição automática de submissões.
- Consultas públicas sem cache HTTP; checagens simultâneas de saúde compartilham a mesma operação. Contagens indisponíveis ficam desconhecidas, sem simular zero.
- Publishable key vai em `apikey`; somente o JWT anônimo legado é usado como bearer nas funções existentes. Nenhum segredo adicionado.
- Acompanhamento distingue indisponibilidade e resposta vazia confirmada. Cópia local aparece com aviso de desatualização quando a consulta falha; resposta antiga não substitui consulta mais recente.
- Coordenadas ausentes permanecem nulas, evitando ponto em 0,0.
- Leitura pública bem-sucedida substitui os dados demonstrativos nos mapas, regiões e indicadores, mesmo quando o backend retorna zero registros. Protocolos locais e seus tokens não são apagados. Registros retirados do conjunto público deixam de compor métricas após nova sincronização.
- Reconexão tenta sincronizar a leitura sem recarregar formulário/rascunho.
- Cache PWA renovado com as mesmas URLs versionadas do HTML, inclusive Auth e runtime, desde a primeira instalação; sem misturar versões por query string.

## Verificação real somente leitura

`node scripts/check-backend.mjs` passou em 12 checagens HTTP:

- município Piracicaba: HTTP 200;
- categorias ativas: 9, HTTP 200;
- regiões administrativas: 9, HTTP 200;
- bairros e núcleos: 85, HTTP 200;
- projeção da listagem pública aprovada: HTTP 200, amostra vazia;
- `users_profile`, `occurrence_private_location`, `occurrence_contacts`, `audit_log`: acesso anônimo HTTP 401 (`limit=0`, sem recuperar conteúdo privado);
- Admin sem sessão: HTTP 401;
- preflight CORS de envio e acompanhamento: HTTP 204 para a origem do GitHub Pages.

Também foi observado HTTP 200 no health do Auth. Não foram enviados registros, tokens de tracking, senhas ou credenciais de usuário. Sem SQL, alterações de schema, migrations, RLS, Auth, Storage, usuários ou dados nesta rodada. Os arquivos de recovery já existentes foram integrados como histórico, não executados.

## Validação automatizada

- 283 verificações estáticas aprovadas; aviso conhecido de Guamium em múltiplas regiões.
- 69 testes de Auth/Edge/ponte pública/acompanhamento/PWA aprovados localmente.
- Syntax checks e `git diff --check` aprovados.
- Smoke ampliado de 29 para 31 cenários: inclui backend público vazio e um registro aprovado simulado. Todos passaram no workflow 40964140428 (commit `1ee062a`), com screenshots como artefato.
- Actions `checkout` e `setup-node` atualizadas para v7, conforme documentação oficial, mantendo Node 22, sem cache de pacotes e sem persistir credenciais. Motivação: aviso DEP0040 emitido por setup-node v5 no workflow anterior.

## Limites

A prévia carregou Leaflet real e a leitura real do Supabase. O provedor de tiles OpenStreetMap mostrou uma mensagem de bloqueio por política de uso neste navegador; não foi contornado e a cartografia visual não está aprovada. Os cenários do CI isolam a rede externa e usam stub de Leaflet. A autenticação com usuário real `triage`/`admin`, operações reais de submissão/tracking, Safari, Firefox, leitor de tela e aparelhos físicos não foram executados nesta rodada. O teste real de escrita anterior está documentado separadamente em `BACKEND-V2-LIVE-QA-20261022.md` e não conta como execução atual.

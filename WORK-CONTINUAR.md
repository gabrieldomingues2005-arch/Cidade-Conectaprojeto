# WORK — CONTINUAR AQUI

Leia este arquivo primeiro. Continue do estado atual da `main`; não recrie o projeto.

## Identidade oficial

- Projeto: **Cidade Conecta Piracicaba**.
- Repositório: `gabrieldomingues2005-arch/Cidade-Conectaprojeto`.
- Branch oficial: `main`.
- Site publicado da main: https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/
- Supabase oficial: **Cidade Conecta v2**, `qzpofoxxrjunyayczcfu`.
- Região: `sa-east-1`. Status conferido em 02/11/2026: `ACTIVE_HEALTHY`.
- Nunca usar ou alterar Raiz Carbon, especialmente `htzigdvatjpvvkwswjof`.

## Checkpoint atual

O usuário autorizou a integração na principal em 02/11/2026, após a entrega visual. A promoção usa o conteúdo aprovado de `3e52308e521f1abc2fe826f7cfb79602c16cce27` como base, sem executar migrations ou alterar o banco. O registro é `docs/INTEGRACAO-MAIN-20261102.md`.

- Backend reconstruído e QA aprovado: `docs/QA-RECOVERY-20261029.md`.
- UI, acessibilidade e responsividade: `DESIGN-SYSTEM.md` e `docs/design-v60/ENTREGA.md`.
- Validação: 283 verificações estáticas, 62 testes Auth/Edge/PWA/design e 65 cenários Chrome em 320/390/768/1366 px.
- Mapa, lista, regiões e dados territoriais existentes preservados. Não inventar bairros ou polígonos.
- Admin real somente leitura, autenticado e autorizado no backend para `triage` e `admin`. Não criar permissões administrativas para forçar QA.
- Contato, token e localização exata não aparecem nas leituras públicas. Anexos permanecem privados.
- GitHub Pages só publica após o quality gate da main, sem push forçado e preservando as prévias históricas de `preview/`.
- PR #7 e PR #8 são referências históricas e não devem ser mergeados automaticamente.

## Continuidade

1. Leia `README.md`, `SUPABASE.md`, `DESIGN-SYSTEM.md` e os relatórios de QA.
2. Confirme sempre o project ref oficial antes de qualquer operação no Supabase.
3. Arquivos de recovery e migrations são referência do backend já aplicado; não reaplique SQL automaticamente.
4. Preserve o smoke e a privacidade. Teste cada bloco relevante de alterações.
5. Complemente a acessibilidade com leitor de tela e aparelhos físicos. Confirme a cartografia no domínio publicado: o OpenStreetMap bloqueou tiles no navegador de QA da rodada visual.

O antigo Supabase `yvmkgpijzewssdxgimit` foi descartado. Relatos de setembro/outubro em documentos históricos não substituem este checkpoint.

# Promoção do estado aprovado para main — 02/11/2026

O usuário autorizou a atualização da principal após a revisão visual: “ja implemente na principal”. Essa autorização substitui a restrição anterior de preservar a `main` nesta etapa. Raiz Carbon permanece fora do escopo.

## Fonte e escopo

- Main anterior: `92b49fa2148fae77179f9111c8306bac2787044d`.
- Estado aprovado de origem: `3e52308e521f1abc2fe826f7cfb79602c16cce27`, tree `0f3a0b17acedd7d5144ad3b09c5cf6fe61c88fb1`.
- Backend aprovado: `docs/QA-RECOVERY-20261029.md`.
- Interface aprovada: `DESIGN-SYSTEM.md` e `docs/design-v60/ENTREGA.md`.
- Supabase conferido por API nesta promoção: `qzpofoxxrjunyayczcfu`, `ACTIVE_HEALTHY`, `sa-east-1`.

A branch de promoção parte da main anterior e incorpora o conteúdo aprovado, preservando os arquivos de runtime, Auth, bridge, aplicação, Edge Functions, SQL e dados exatamente como no checkpoint de origem. Não há execução de SQL/migrations, criação de conta, alteração de RLS/Storage ou redeploy de funções nesta operação.

O PR de integração aponta para `main`. Ele usa um commit de promoção com a main anterior como único pai; os commits das branches de recovery/design não são incorporados como ancestrais. PR #7 e PR #8 não são alvos de merge e permanecem como referências do trabalho anterior.

As mudanças adicionais à fonte aprovada se limitam à documentação atual e à sincronização do GitHub Pages. README, SUPABASE e WORK-CONTINUAR passam a indicar o Supabase v2 e os números de QA atuais. Os relatórios históricos que registram “main preservada” descrevem as etapas anteriores a esta autorização.

## Publicação sem forçar histórico

`gh-pages` estava em `6d32e42ff96f7b9b58dae4257d5e970a27552ecc`, com sete commits de prévias históricas além da main anterior. Por isso, enviar diretamente o novo HEAD da main seria rejeitado por não ser fast-forward.

O workflow mantém o quality gate do mesmo commit da main e passa a:

1. Confirmar que a execução ainda corresponde ao HEAD da main.
2. Mesclar a main validada ao histórico atual de gh-pages, preservando `preview/`.
3. Verificar que os demais caminhos correspondem exatamente à main validada.
4. Conferir novamente se a main avançou e enviar sem `--force`.

O site da main é https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/. O ambiente Manus não é sincronizado por esse workflow.

## Validação

- Fonte aprovada: CI 151, 62 testes, 283 verificações estáticas e 65 cenários Chrome.
- Promoção: os mesmos testes e recovery validator são obrigatórios no PR antes do merge.
- Publicação: o workflow da main repete o quality gate antes de sincronizar gh-pages.
- A lógica de merge de Pages é ensaiada em worktree temporária sobre o histórico real, verificando a igualdade dos caminhos principais e a preservação de `preview/`.
- A inspeção do site publicado confirma a interface v6 e o runtime apontando para o projeto oficial; nenhum envio real de ocorrência é necessário nesta promoção.

Pendências da rodada visual permanecem registradas: leitor de tela/aparelhos físicos e confirmação da cartografia no domínio publicado. Não se declara conformidade WCAG integral.

## Conferência pública e correção pontual

O PR #9 foi incorporado à main em `d364eed83c12e68ade31a10cc84c7c0391758bb5`. O quality gate da main e a publicação de Pages passaram (runs `41510972431` e `41511210976`), com `preview/` preservado e os demais caminhos idênticos à main.

A página pública carregou a interface v6 e confirmou conexão com o backend oficial. A conferência identificou que a folha do Leaflet não carregava: o atributo de integridade do CSS 1.9.4 estava incorreto. O arquivo fixo de https://unpkg.com/leaflet@1.9.4/dist/leaflet.css foi conferido por SHA-256, resultando em `sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=`. Corrige-se o hash mantendo versão, CDN e verificação de integridade.

O HTML também passa a usar o preconnect do Supabase oficial e as URLs canônica/OG/JSON-LD do site publicado da main, coerentes com sitemap e robots. O cache PWA avança para r3 para atualizar o shell offline. Não há mudança no JavaScript da aplicação, geometrias, dados ou backend nessa correção.

# WORK — CONTINUAR AQUI

> **Leia este arquivo primeiro. Não recomece o projeto.** A branch `main` é a fonte de verdade.

## Identidade oficial
- Projeto: **Cidade Conecta Piracicaba**
- GitHub: `gabrieldomingues2005-arch/Cidade-Conectaprojeto`
- Branch: `main`
- Preview: `https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/`
- Site Manus histórico: `https://cidconecta-nztptuci.manus.space`
- Supabase oficial: **Cidade Conecta**
- `project_ref`: `yvmkgpijzewssdxgimit`
- Região: `sa-east-1`

**NUNCA use ou altere Supabase do Raiz Carbon, especialmente `htzigdvatjpvvkwswjof`.**

## Estado entregue — MVP v5.5 + UI v5.6
O trabalho pesado de backend já foi implementado. Não recrie schema, frontend ou banco do zero.

- PostgreSQL + PostGIS no Supabase exclusivo.
- Base territorial de Piracicaba carregada.
- RLS com separação público/privado.
- Contato privado em `occurrence_contacts`.
- Localização exata privada e posição pública reduzida.
- Protocolos reais do backend separados dos protocolos demo.
- Token privado armazenado no banco somente como hash.
- Rate limiting de submissão e acompanhamento.
- Storage privado de anexos.
- Edge Functions `submit-occurrence` e `track-occurrence`.
- RPC de rastreamento SECURITY DEFINER restrita a `service_role`.
- Frontend v5.5 envia para Supabase e lê publicamente somente ocorrências aprovadas.
- Admin visual permanece demonstrativo até autenticação/fluxo institucional real.
- Integração Prefeitura/156 continua futura; não fingir parceria oficial.
- Design v5.5 mantém a arquitetura segura e amplia o produto territorial: Rede Municipal continua, o mapa agora possui clustering próprio e controlável, há Radar de bairros com acompanhamento local e o fluxo mapa → bairro → ocorrência ficou navegável em ambos os sentidos. Arquivo: `assets/design-v55.css`.
- Product Design v5.6 integrada à `main` em `5daf87a99bee73adf0b2a293aea856f7aaea67dd` via PR #1. `assets/design-v56.css` refina hierarquia, foco, estados, mapa, Rede Municipal, formulário e mobile; não altera banco, Supabase, RLS, Edge Functions ou contratos de dados.
- Product Design v5.6 foi seguida pelo QA automatizado de navegador, integrado via PR #3. O checkpoint funcional dessa entrega é `a6bdb22c4b5c1cdfdb483a412c678c416414d83d`.
- Quality gate atual: **247 verificações estáticas aprovadas + smoke em Chrome headless**, cobrindo Home, Registrar, Acompanhar, Mapa, Indicadores e Rede Municipal em desktop, além de Home, Registrar, Mapa e Rede Municipal em 390 px. Permanece apenas o aviso territorial conhecido de Guamium.
- O novo smoke encontrou e permitiu corrigir um bug real no `setupInstall`: os botões de instalação usavam o seletor unitário `# WORK — CONTINUAR AQUI

> **Leia este arquivo primeiro. Não recomece o projeto.** A branch `main` é a fonte de verdade.

## Identidade oficial
- Projeto: **Cidade Conecta Piracicaba**
- GitHub: `gabrieldomingues2005-arch/Cidade-Conectaprojeto`
- Branch: `main`
- Preview: `https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/`
- Site Manus histórico: `https://cidconecta-nztptuci.manus.space`
- Supabase oficial: **Cidade Conecta**
- `project_ref`: `yvmkgpijzewssdxgimit`
- Região: `sa-east-1`

**NUNCA use ou altere Supabase do Raiz Carbon, especialmente `htzigdvatjpvvkwswjof`.**

## Estado entregue — MVP v5.5 + UI v5.6
O trabalho pesado de backend já foi implementado. Não recrie schema, frontend ou banco do zero.

- PostgreSQL + PostGIS no Supabase exclusivo.
- Base territorial de Piracicaba carregada.
- RLS com separação público/privado.
- Contato privado em `occurrence_contacts`.
- Localização exata privada e posição pública reduzida.
- Protocolos reais do backend separados dos protocolos demo.
- Token privado armazenado no banco somente como hash.
- Rate limiting de submissão e acompanhamento.
- Storage privado de anexos.
- Edge Functions `submit-occurrence` e `track-occurrence`.
- RPC de rastreamento SECURITY DEFINER restrita a `service_role`.
- Frontend v5.5 envia para Supabase e lê publicamente somente ocorrências aprovadas.
- Admin visual permanece demonstrativo até autenticação/fluxo institucional real.
- Integração Prefeitura/156 continua futura; não fingir parceria oficial.
- Design v5.5 mantém a arquitetura segura e amplia o produto territorial: Rede Municipal continua, o mapa agora possui clustering próprio e controlável, há Radar de bairros com acompanhamento local e o fluxo mapa → bairro → ocorrência ficou navegável em ambos os sentidos. Arquivo: `assets/design-v55.css`.
- Product Design v5.6 integrada à `main` em `5daf87a99bee73adf0b2a293aea856f7aaea67dd` via PR #1. `assets/design-v56.css` refina hierarquia, foco, estados, mapa, Rede Municipal, formulário e mobile; não altera banco, Supabase, RLS, Edge Functions ou contratos de dados.
 como coleção; agora usam `$` e há uma trava de regressão no validador.
- `gh-pages` foi sincronizada com sucesso ao mesmo commit da `main` após o novo quality gate.

## Segurança/testes já feitos
- Sem `service_role`, senha ou segredo administrativo no frontend.
- Cidadão não pode promover o próprio papel.
- Upload valida tipo/tamanho/assinatura JPG/PNG/WebP.
- Identificadores pessoais são barrados no texto público.
- CSV possui mitigação de Formula Injection.
- Testes SQL de submissão, privacidade, token e rate limiting passaram; dados temporários foram apagados.
- Guamium permanece ambíguo entre referências regionais; não inventar polígono.

## Leia nesta ordem
1. `WORK-CONTINUAR.md`
2. `README.md`
3. `SUPABASE.md`
4. `API.md`
5. `TESTES.md`
6. `DESIGN-SYSTEM.md`
7. `MANUS-UPDATE-20260920.md`
8. `REDE-MUNICIPAL.md`
9. `ATLAS-BAIRROS.md`
10. `supabase/migrations/`
11. `supabase/functions/`
12. `CONTEXTO-PROJETO.md` e `MANUS-CONSOLIDACAO.md`

## Próxima ação no Work
**Continue sempre da `main` atual. O smoke de UI já faz parte do CI e deve permanecer obrigatório. O próximo QA útil é em aparelhos físicos/navegadores reais; depois, a próxima evolução funcional de maior porte é autenticação/roles reais do Admin, mas isso exige escopo explícito antes de qualquer mudança em Supabase, banco, RLS ou Edge Functions.**

Não refaça análises já consolidadas e responda curto.


## Backend Supabase — estado atualizado em 24/09/2026
O projeto correto `yvmkgpijzewssdxgimit` foi restaurado e está `ACTIVE_HEALTHY`.

- `submit-occurrence` está em **v3**, com a validação de longitude corrigida e redeploy concluído.
- `track-occurrence` permanece ativa em v1.
- Migrations e dados territoriais foram preservados após a restauração.
- Foi aplicada a migration `harden_occurrence_contacts_privileges`, removendo de `authenticated` privilégios desnecessários como `TRUNCATE`, `TRIGGER` e `REFERENCES`; permaneceu apenas `SELECT` controlado por RLS.
- O Supabase de homologação da Raiz Carbon `kkzdtiqpabkyzyotalvo` permanece pausado para liberar a vaga gratuita. Não reativá-lo automaticamente enquanto o Cidade Conecta precisar permanecer ativo.
- As tabelas privadas de tracking/rate-limit seguem sem grants diretos para `anon` ou `authenticated`, porém estão com RLS desabilitado. Isso é um hardening pendente que deve ser decidido explicitamente antes de habilitar RLS.

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

## Estado entregue — MVP v5.4
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
- Frontend v5.4 envia para Supabase e lê publicamente somente ocorrências aprovadas.
- Admin visual permanece demonstrativo até autenticação/fluxo institucional real.
- Integração Prefeitura/156 continua futura; não fingir parceria oficial.
- Design v5.4 mantém a arquitetura segura e amplia a experiência cívica: bento/spotlight/command palette continuam, e agora existe uma Rede Municipal de referência com secretarias, órgãos, setores, canais oficiais, escala de competência, integração informativa no formulário, filtro por área pública no mapa e distribuição por competência no dashboard. Arquivo: `assets/design-v54.css`.

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
8. `supabase/migrations/`
9. `supabase/functions/`
10. `CONTEXTO-PROJETO.md` e `MANUS-CONSOLIDACAO.md`

## Próxima ação no Work
**Inspecione a `main` atual → consulte CI → faça QA rigoroso da v5.4 em desktop e mobile → valide Rede Municipal, formulário com área de referência, mapa (incluindo filtro de órgão), busca global, protocolo, dashboard e Supabase → corrija somente falhas comprovadas → teste de novo.**

Não refaça análises já consolidadas e responda curto.


## Backend Supabase — estado atualizado em 24/09/2026
O projeto correto `yvmkgpijzewssdxgimit` foi restaurado e está `ACTIVE_HEALTHY`.

- `submit-occurrence` está em **v3**, com a validação de longitude corrigida e redeploy concluído.
- `track-occurrence` permanece ativa em v1.
- Migrations e dados territoriais foram preservados após a restauração.
- Foi aplicada a migration `harden_occurrence_contacts_privileges`, removendo de `authenticated` privilégios desnecessários como `TRUNCATE`, `TRIGGER` e `REFERENCES`; permaneceu apenas `SELECT` controlado por RLS.
- O Supabase de homologação da Raiz Carbon `kkzdtiqpabkyzyotalvo` permanece pausado para liberar a vaga gratuita. Não reativá-lo automaticamente enquanto o Cidade Conecta precisar permanecer ativo.
- As tabelas privadas de tracking/rate-limit seguem sem grants diretos para `anon` ou `authenticated`, porém estão com RLS desabilitado. Isso é um hardening pendente que deve ser decidido explicitamente antes de habilitar RLS.

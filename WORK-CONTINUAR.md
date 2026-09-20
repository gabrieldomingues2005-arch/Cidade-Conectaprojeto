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

## Estado entregue — MVP v5.2
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
- Frontend v5.2 envia para Supabase e lê publicamente somente ocorrências aprovadas.
- Admin visual permanece demonstrativo até autenticação/fluxo institucional real.
- Integração Prefeitura/156 continua futura; não fingir parceria oficial.
- Design v5.2 aprofunda a integração do Manus sem trocar a arquitetura segura: marca própria, mapa real, registro guiado com prévia pública e detecção de duplicidade, bairro assistido, foto otimizada, protocolo com status explicado, dashboard reestruturado e mapa com região/status/somente abertas. Arquivo: `assets/design-v52.css`.

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
8. `supabase/migrations/`
9. `supabase/functions/`
10. `CONTEXTO-PROJETO.md` e `MANUS-CONSOLIDACAO.md`

## Próxima ação no Work
**Inspecione a `main` atual → consulte CI → faça QA rigoroso da v5.2 em desktop e mobile → valide Home, registro, detecção de semelhantes, protocolo, mapa, dashboard e integração Supabase → corrija somente falhas comprovadas → teste de novo.**

Não refaça análises já consolidadas e responda curto.


## Atenção — backend Supabase em 20/09/2026
O projeto correto `yvmkgpijzewssdxgimit` foi confirmado, porém o Supabase está com status `INACTIVE`. A tentativa de restauração foi bloqueada pelo limite de 2 projetos gratuitos ativos da organização. **Não pause nem apague outro projeto automaticamente.** A correção da validação de longitude foi aplicada no código da `main`, mas o redeploy da Edge Function `submit-occurrence` deve ser feito quando o projeto Cidade Conecta puder ser reativado.

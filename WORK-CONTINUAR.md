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

## Estado entregue — MVP v5.0
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
- Frontend v5.0 envia para Supabase e lê publicamente somente ocorrências aprovadas.
- Admin visual permanece demonstrativo até autenticação/fluxo institucional real.
- Integração Prefeitura/156 continua futura; não fingir parceria oficial.
- Design v5.0 é uma revisão rígida de qualidade: visual cívico editorial, menos aparência de template, ícones lineares, navegação pública mais limpa, seletor visual de categorias, protocolos salvos e mapa avançado com resultados laterais, geolocalização opcional, camadas de mapa e limite municipal IBGE. Arquivo: `assets/design-v50.css`.

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
7. `supabase/migrations/`
8. `supabase/functions/`
9. `CONTEXTO-PROJETO.md` e `MANUS-CONSOLIDACAO.md`

## Próxima ação no Work
**Inspecione a `main` atual → consulte CI → faça QA rigoroso da v5.0 em desktop e mobile → valide formulário, protocolos salvos, mapa avançado e Supabase → corrija somente falhas comprovadas → teste de novo.**

Não refaça análises já consolidadas e responda curto.

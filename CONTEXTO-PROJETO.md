# Cidade Conecta — contexto oficial

> Para continuar no ChatGPT Work sem reprocessar o histórico, leia primeiro **`WORK-CONTINUAR.md`** na raiz da `main`.

Este arquivo consolida as referências principais do projeto para reduzir dependência de chats antigos.

## Fonte de verdade

- Repositório: `gabrieldomingues2005-arch/Cidade-Conectaprojeto`
- Branch oficial: `main`
- Preview técnico: `https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/`
- Site Manus principal existente: `https://cidconecta-nztptuci.manus.space`

## Supabase oficial do Cidade Conecta

- Nome: `Cidade Conecta`
- Project ref: `yvmkgpijzewssdxgimit`
- Região: `sa-east-1`
- URL pública: `https://yvmkgpijzewssdxgimit.supabase.co`

Regra crítica: nunca usar os projetos Supabase do Raiz Carbon no Cidade Conecta.

## Manus — histórico consolidado

### Site principal a preservar

O protótipo identificado no Manus como **“Cidade Conecta — protótipo final”** publicou o site:

- `https://cidconecta-nztptuci.manus.space`

Características visuais registradas: identidade verde-escuro + verde-lima, navegação com mapa da cidade, acompanhamento de ocorrência, como funciona, meu painel e registro de ocorrência. Esse é o site Manus tratado como principal/referência visual histórica.

### Site alternativo/legado

Há também um protótipo Manus identificado como **“Cidade Conecta — Ocorrências urbanas”**, publicado em:

- `https://cidadedata-gyfpfhhu.manus.space`

Ele possui identidade visual clara em verde/azul, rotas como Início, Registrar ocorrência, Acompanhar, Mapa, Indicadores e Painel demonstrativo. Esse endereço é tratado como versão antiga/alternativa, não como nova fonte de verdade.

### Entregáveis antigos do Manus ainda relevantes

Uma tarefa antiga contém arquivos que devem ser comparados com a `main` antes de a tarefa ser excluída:

- `README_CONSOLIDACAO.md`
- `mockData.ts`
- `useOccurrenceStore.ts`
- `robots.txt`
- `sitemap.xml`
- relatório/guia de consolidação do Cidade Conecta

Os materiais antigos também registram requisitos já incorporados ou ainda úteis: fluxo de ocorrências, protocolos, mapa, painel pessoal, privacidade/LGPD por design, filtro contra registros voltados a acusações de pessoas/estabelecimentos privados e preparação de SEO/publicação.

### IDs e links compartilhados de trabalhos anteriores

- `gRCXmqyiZBT5Y7JGY6zpQ6` — visual, mobile, formulário, protocolos, painel, indicadores, privacidade/LGPD e SEO. Share: `https://manus.im/share/gRCXmqyiZBT5Y7JGY6zpQ6`
- `JGfgTKqwF2sTJeYD4rHbeq` — evolução da base principal ligada ao GitHub. Share: `https://manus.im/share/JGfgTKqwF2sTJeYD4rHbeq`
- `QP6gFQQX6TvdngAaaLuEpb` — tarefa inicial, não tratada como base principal. Share: `https://manus.im/share/QP6gFQQX6TvdngAaaLuEpb`

A tarefa `P76YZUrwuxpTJcJz2WeGRp`, criada posteriormente, não deve virar uma base paralela. O projeto existente e o GitHub continuam sendo a referência.

## Regras

- Não recriar o projeto do zero.
- Não criar versões paralelas.
- `main` é a fonte oficial do código.
- O site Manus principal existente deve ser preservado enquanto estiver publicado e útil como referência.
- Sites Manus antigos/alternativos são apenas referência histórica; mudanças novas devem convergir para GitHub + Supabase oficial.
- Antes de apagar uma tarefa Manus com arquivos, conferir se os entregáveis únicos já estão incorporados ao GitHub.
- Supabase, GitHub e Manus devem permanecer separados do Raiz Carbon.
- Integração com Prefeitura/156 só deve ser tratada como oficial após autorização/integração real.
- O Cidade Conecta continua identificado como projeto acadêmico independente enquanto não houver parceria formal.

## Estado técnico resumido

- PostgreSQL + PostGIS preparados no Supabase do Cidade Conecta.
- Base territorial de Piracicaba carregada.
- RLS e segurança devem permanecer obrigatórias para dados expostos.
- GitHub Pages é o preview técnico automático.
- O frontend deve migrar do modo local para o Supabase de forma incremental e testada.


## Estado visual atual — v5.3 (20/09/2026)

O update React/Vite recebido do Manus foi auditado e incorporado seletivamente na `main`, sem substituir a arquitetura segura existente. A versão atual mantém Supabase/RLS/Edge Functions e adiciona identidade própria, mapa real na Home, formulário guiado com prévia pública, otimização de imagens, filtro regional no mapa e dashboard reestruturado. Ver `MANUS-UPDATE-20260920.md` e `DESIGN-SYSTEM.md`.


### Refinamento v5.3
A versão v5.3 adiciona prevenção assistiva de duplicidades, sugestão de bairros, explicação contextual do status, acompanhamento rápido e filtro de ocorrências abertas. O Supabase correto foi confirmado, mas está `INACTIVE` por limite de projetos gratuitos; nenhum outro projeto deve ser pausado/apagado automaticamente para liberar vaga.


### Design e mapa v5.3
A v5.3 incorpora padrões adaptados do 21st.dev sem trocar a arquitetura: bento hierárquico, spotlight CSS leve, busca global por Ctrl/Cmd+K e mapa tratado como workspace com URL de filtros, modo foco e alternância Mapa/Lista no mobile. O objetivo é qualidade de produto e navegação, não copiar templates externos.

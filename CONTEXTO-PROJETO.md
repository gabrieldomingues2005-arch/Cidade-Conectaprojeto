# Cidade Conecta — contexto oficial

Este arquivo consolida as referências principais do projeto para reduzir dependência de chats antigos.

## Fonte de verdade

- Repositório: `gabrieldomingues2005-arch/Cidade-Conectaprojeto`
- Branch oficial: `main`
- Preview técnico: `https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/`
- Site Manus existente: `https://cidconecta-nztptuci.manus.space`

## Supabase oficial do Cidade Conecta

- Nome: `Cidade Conecta`
- Project ref: `yvmkgpijzewssdxgimit`
- Região: `sa-east-1`
- URL pública: `https://yvmkgpijzewssdxgimit.supabase.co`

Regra crítica: nunca usar os projetos Supabase do Raiz Carbon no Cidade Conecta.

## Manus

Trabalhos anteriores relevantes do Cidade Conecta:

- `JGfgTKqwF2sTJeYD4rHbeq` — evolução da base principal ligada ao GitHub.
- `gRCXmqyiZBT5Y7JGY6zpQ6` — visual, mobile, formulário, protocolos, painel, indicadores, privacidade/LGPD e SEO.
- `QP6gFQQX6TvdngAaaLuEpb` — tarefa inicial, não tratada como base principal.

A tarefa `P76YZUrwuxpTJcJz2WeGRp`, criada posteriormente, não deve virar uma base paralela. O projeto existente e o GitHub continuam sendo a referência.

## Regras

- Não recriar o projeto do zero.
- Não criar versões paralelas.
- `main` é a fonte oficial do código.
- O site Manus existente deve ser preservado.
- Supabase, GitHub e Manus devem permanecer separados do Raiz Carbon.
- Integração com Prefeitura/156 só deve ser tratada como oficial após autorização/integração real.
- O Cidade Conecta continua identificado como projeto acadêmico independente enquanto não houver parceria formal.

## Estado técnico resumido

- PostgreSQL + PostGIS preparados no Supabase do Cidade Conecta.
- Base territorial de Piracicaba carregada.
- RLS e segurança devem permanecer obrigatórias para dados expostos.
- GitHub Pages é o preview técnico automático.
- O frontend deve migrar do modo local para o Supabase de forma incremental e testada.

# Cidade Conecta — Mapa e layout v5.7.1

Data: 15/10/2026

Branch: `feature/cidade-conecta-auth-admin-20261008`

## Objetivo

Melhorar a experiência do mapa sem depender da disponibilidade do serviço cartográfico externo e sem alterar banco, Supabase, Auth, RLS, Storage ou `main`.

## Melhorias

- título do mapa simplificado para “Mapa das ocorrências”;
- desktop com mapa como área principal e painel lateral compacto;
- mobile com três visões: Mapa, Lista e Regiões;
- fallback do mapa mantém a lista de ocorrências disponível;
- resumo territorial passa a usar a base visível do app, evitando “0 de 0” quando há registros locais/demonstrativos;
- regiões apresentadas como “Região 1” a “Região 9”, sem inventar nomes;
- botões de região recebem contexto de bairros via `title` quando a base territorial carrega;
- filtros dinâmicos de região e área de referência têm rótulos acessíveis;
- estado vazio de filtros ganhou ação “Limpar filtros”;
- fallback mobile reposicionado para não ficar encoberto pela barra inferior;
- smoke do CI captura também as abas Lista e Regiões em 390 px.

## Restrições preservadas

- nenhum polígono interno de região foi inventado;
- limite municipal continua vindo do IBGE;
- OpenStreetMap/Leaflet continua externo;
- sem alterações em SQL, dados ou infraestrutura;
- PR #5 permanece sem merge.

## QA esperado

- 282 verificações estáticas;
- 46 testes Auth/Edge/PWA;
- 28 cenários principais Chrome;
- screenshots full-page;
- screenshots extras `mapa-lista-390.png` e `mapa-regioes-390.png`;
- único aviso conhecido: ambiguidade territorial de Guamium.

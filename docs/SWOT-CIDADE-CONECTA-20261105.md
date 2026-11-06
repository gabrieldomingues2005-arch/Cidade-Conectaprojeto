# Matriz SWOT — Cidade Conecta Piracicaba

Atualização: 05/11/2026  
Branch oficial: `main`

## Objetivo

Usar a matriz SWOT como ferramenta de decisão para melhorar o Cidade Conecta sem aumentar complexidade desnecessária, preservando privacidade, acessibilidade, clareza entre conteúdo real e DEMO, responsividade e estabilidade.

## Forças

| Força | Impacto |
|---|---|
| Fluxo completo de registrar, acompanhar, mapear e consultar ocorrências | Alto |
| Privacidade por desenho: contato, token e localização exata separados da área pública | Alto |
| Supabase com RLS, Edge Functions, auditoria e Admin operacional | Alto |
| Jornal cívico, problemas resolvidos e mídia antes/depois moderada | Alto |
| Conta cidadã opcional + experiência DEMO isolada | Alto |
| PWA, modo offline, responsividade e CI com Chrome | Alto |
| Radar por bairros, mapa, indicadores, transparência e dados abertos | Alto |
| Identidade visual consistente teal/lima/creme | Médio/alto |

## Fraquezas

| Fraqueza | Risco | Ação |
|---|---|---|
| Muitos recursos para um visitante novo entender de primeira | Abandono / confusão | **Corrigido v8.2:** bloco “O que você quer fazer?” na Home |
| Demonstração muito útil, mas pouco descoberta | Valor do produto fica escondido | **Corrigido v8.2:** link DEMO no aviso superior, Home e busca global |
| Possível confusão entre registros públicos e demonstrativos | Perda de confiança | **Corrigido v8.2:** selo “Público” ou “Demonstração” nos registros recentes |
| Atualidade dos dados não estava explícita na Home | Usuário pode interpretar cache como dado atual | **Corrigido v8.2:** indicador de atualização/cache/offline |
| SPA por hash limita SEO profundo de páginas internas | Menor descoberta orgânica | Futuro: páginas estáticas/SSR para conteúdo editorial prioritário |
| Navegação principal possui muitas áreas | Sobrecarga cognitiva | Monitorar; priorizar busca global e atalhos por intenção antes de remover rotas |
| Dependência de Leaflet/tiles/CDNs externos | Mapa degradado quando serviço externo falha | Fallback já existe; futuro: avaliar hospedagem local do Leaflet |
| Integração municipal oficial ainda não configurada | Fluxo não fecha em sistemas externos | Outbox segura existe; ativar somente com endpoint oficial |

## Oportunidades

| Oportunidade | Próximo ganho |
|---|---|
| Transformar a Home em orientadora de tarefas | Implementado em v8.2 |
| Usar a Central DEMO em apresentações, extensão e validação com usuários | Implementado e destacado |
| Criar resumos de bairro e digest cidadão | Estrutura de preferências já preparada |
| Publicar matérias editoriais reais e resoluções verificadas | Editor/Admin já preparado |
| Integração futura com canal municipal oficial | Outbox pronta, sem envio enquanto não houver adaptador |
| Melhorar SEO do jornal e problemas resolvidos | Próxima etapa de maturidade |
| Evoluir acessibilidade continuamente | Anúncio de rotas e reduced-motion reforçados em v8.2 |
| PWA como acesso rápido em campo | Novo atalho “Acompanhar protocolo” adicionado |

## Ameaças

| Ameaça | Mitigação |
|---|---|
| Usuário confundir o projeto com canal oficial da Prefeitura | Aviso independente persistente + links oficiais + identificação DEMO |
| Dados antigos serem interpretados como atuais | Indicador de atualização/cache/offline |
| Conteúdo fictício contaminar leitura real | Rotas DEMO separadas + selos explícitos de origem |
| Spam, abuso ou publicação de dados pessoais | Moderação, RLS, dados privados separados e mídia moderada |
| Serviços externos ficarem indisponíveis | Estados de erro, cache, offline e fallback de mapa |
| Crescimento de funcionalidades prejudicar simplicidade | Priorizar fluxos por intenção e usar SWOT antes de novas features |
| Regressão visual/acessível em novas entregas | CI, testes estáticos e smoke em 320/390/768/1366 |

## Prioridades resultantes

1. Clareza de primeiro acesso e orientação por intenção.
2. Confiança: origem e atualidade dos dados.
3. Separação inequívoca entre ambiente DEMO e dados públicos.
4. Acessibilidade e navegação por teclado/leitores de tela.
5. Manter estabilidade antes de adicionar novas funcionalidades.
6. Só ativar integrações externas quando houver fonte oficial verificável.

## Regra para próximas melhorias

Toda nova funcionalidade deve responder pelo menos uma destas perguntas:

- reduz uma fraqueza?
- aproveita uma oportunidade concreta?
- reforça uma força existente?
- mitiga uma ameaça real?

Se não responder a nenhuma delas, deve ter prioridade baixa.

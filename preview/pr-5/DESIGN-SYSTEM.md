# Cidade Conecta — Design System v5.5

Este documento consolida a direção visual do Cidade Conecta depois da interrupção da tarefa Manus por limite de créditos. Ele descreve o que está realmente aplicado na `main` e serve como handoff para o Work.

## Princípio visual

A interface v5.5 combina clareza de Swiss/International Typographic Style com Civic Tech editorial, cartografia e sinalização urbana, reduzindo de propósito efeitos decorativos e aparência de template. O resultado deve parecer cívico, acessível e confiável sem imitar identidade governamental oficial.

Evitar: excesso de glassmorphism, gradientes decorativos, aparência de fintech/SaaS genérico, ícones multicoloridos em excesso e linguagem visual burocrática.

## Marca

O símbolo v5.5 substitui o bloco textual “CC” por uma marca abstrata construída em CSS e refletida no `favicon.svg`.

Conceito:
- arco aberto = cidade em movimento / conexão em construção;
- nós = pontos, bairros e ocorrências conectadas;
- verde-lima = ação/progresso;
- teal = território/rede;
- fundo verde cívico = confiança e estabilidade.

Regras:
- nunca usar o símbolo para sugerir vínculo oficial com a Prefeitura;
- manter área de respiro equivalente a pelo menos 25% da largura do símbolo;
- evitar reduzir abaixo de 24 px;
- em fundo claro usar versão verde cívico;
- em fundo escuro manter arco lima e nós claros.

## Paleta

### Primária
- Civic 1000 — `#032f31`
- Civic 950 — `#07383a`
- Civic 900 — `#094649`
- Civic 800 — `#0d5758`
- Civic 700 — `#13706e`
- Civic 600 — `#218784`

### Acento
- Lime — `#bff054`
- Lime Strong — `#a9e93d`
- Lime Soft — `#eef9cb`

### Suporte
- Teal — `#4da9ad`
- Blue — `#4f74bd`
- Paper — `#fbfcf9`
- Warm — `#f6f4ed`
- Ink — `#12353b`
- Ink Soft — `#4f686d`

### Semânticas de status
- Recebida: azul suave
- Em análise: âmbar
- Encaminhada: violeta
- Em andamento: teal
- Resolvida: verde

Status nunca deve depender somente de cor: usar texto e posição no stepper.

## Tipografia

A base atual prioriza a pilha de fontes do sistema para carregamento rápido e boa legibilidade. Manter:
- títulos com alto peso, tracking negativo discreto;
- texto de interface com peso médio/semibold;
- corpo com line-height aproximado de 1.6–1.7;
- evitar caixa alta em textos longos;
- caixa alta reservada para eyebrow/labels curtos.

## Espaçamento e formas

- raios principais: 14–23 px;
- botões principais: formato pill;
- cards: raio de 20–23 px;
- inputs: 14 px;
- sombra leve para cards e sombra maior só em elementos focais;
- grid máximo centralizado pela classe `.wrap`;
- respiro vertical amplo entre seções.

## Componentes principais

### Header
- sticky;
- fundo translúcido muito leve;
- CTA Registrar recebe destaque lima;
- Admin fica visualmente secundário.

### Hero
- verde cívico escuro;
- CTA primário lima;
- mapa visual como assinatura da plataforma;
- evitar adicionar mais efeitos sem função.

### Formulário
O formulário continua em uma única página, mas foi dividido visualmente em:
1. Descreva o problema;
2. Mostre onde está;
3. Contato opcional e privado.

Não transformar em wizard obrigatório sem evidência de melhoria de usabilidade.

### Protocolo
Usar o stepper:
Recebida → Em análise → Encaminhada → Em andamento → Resolvida.

Etapa atual usa maior ênfase, anteriores usam check e futuras permanecem neutras.

### Mapa
Marcadores próprios:
- draft/localização: azul;
- análise/encaminhada: âmbar;
- andamento: teal;
- resolvida: verde.

O centro interno usa o acento lima, mantendo ligação com a identidade.

### Mobile
- barra inferior com Registrar + Acompanhar;
- respeitar `safe-area-inset-bottom`;
- alvos de toque com mínimo visual próximo de 44 px;
- stepper vertical em telas estreitas;
- menu em painel.

## Acessibilidade

- foco visível;
- contraste reforçado em `prefers-contrast: more`;
- animações desativadas em `prefers-reduced-motion: reduce`;
- status com texto + posição, não apenas cor;
- navegação por teclado preservada;
- mensagens de privacidade explícitas.

## Arquivos de referência

- `assets/design-v55.css` — camada visual principal;
- `assets/app.js` — componentes de interface e fluxo;
- `favicon.svg` — símbolo compacto;
- `manifest.webmanifest` — cores PWA;
- `WORK-CONTINUAR.md` — handoff operacional.

## Próximos refinamentos possíveis

1. trocar gradualmente emojis de categoria por um conjunto próprio de ícones lineares;
2. validar contraste e legibilidade em aparelhos físicos;
3. testar o formulário com usuários e decidir se a divisão visual atual é suficiente;
4. fazer QA do mapa em telas pequenas;
5. consolidar componentes repetidos antes de qualquer reescrita maior.

Não recriar o projeto para implementar esses refinamentos.


## Revisão rígida v5.5

A v5.5 aumenta o padrão visual e funcional sem reescrever a arquitetura.

### Mudanças de design
- hero claro/editorial com mapa como elemento focal;
- sombras mais contidas e bordas mais consistentes;
- botões menos arredondados e com aparência mais institucional;
- navegação pública simplificada; Sobre/Admin ficam acessíveis pelo rodapé;
- conjunto de ícones lineares substitui emojis nas áreas principais;
- seletor de categoria em cards de escolha;
- melhor leitura de tabelas, ocorrências, métricas e formulários.

### Mapa avançado
- painel lateral de ocorrências;
- filtros rápidos por status;
- busca também por protocolo;
- duas camadas-base do OpenStreetMap;
- limite municipal carregado pela API do IBGE;
- ação "Perto de mim" com permissão explícita de geolocalização;
- distância aproximada ordenada no navegador;
- marcadores próprios por estado;
- lista e mapa sincronizados.

### Acompanhamento
O usuário pode salvar protocolos públicos no navegador. Isso não cria conta, não envia preferência ao servidor e não altera a ocorrência.

### Regra de qualidade
Não adicionar função apenas por efeito visual. Novas funções devem melhorar localização, compreensão, acompanhamento ou segurança.


## Integração visual Manus — v5.5

O pacote React produzido pelo Manus foi tratado como referência de Product Design, não como substituição automática da arquitetura existente.

Foram incorporados e aprofundados:
- mapa como elemento central da identidade;
- leitura territorial mais visível;
- fluxo de registro guiado visualmente;
- categorias tratadas como escolhas visuais;
- dashboard com melhor hierarquia;
- navegação mobile mais próxima de produto;
- marca gráfica consistente.

A v5.5 também adiciona:
- mapa Leaflet real na Home;
- filtro por região administrativa no mapa público, derivado da base territorial local;
- prévia pública durante o preenchimento;
- medidor de completude do formulário;
- círculo visual de privacidade ao marcar localização;
- compressão de imagem client-side;
- filtro regional sem inventar polígonos internos;
- layout próprio de indicadores de completude do conjunto.

Não foi adotada a migração completa para React porque o pacote Manus estava orientado a estado local/demonstração e não preservava por si só o fluxo seguro já existente com Supabase, Edge Functions, RLS, tokens e moderação.


## Refinamento v5.5

A v5.5 concentra qualidade percebida e prevenção de erro, não apenas decoração.

- página de acompanhamento com acessos rápidos do navegador;
- detalhe do protocolo com explicação do status atual, próximo passo e recência da atualização;
- ocorrência semelhante por proximidade/categoria para reduzir duplicidade;
- sugestão de bairros conhecidos a partir da base territorial local;
- filtro de mapa para mostrar somente registros ainda abertos;
- títulos de página por rota e `aria-current` na navegação;
- acabamento visual específico para detalhe, acompanhamento e prevenção de duplicidades.

Regra: sugestões de duplicidade são apenas assistivas; nunca bloqueiam o envio.


## Referências 21st.dev — v5.5

A v5.5 usa o 21st.dev como referência de padrões, não como origem para copiar uma aplicação pronta.

Padrões adaptados:
- **Bento hierarchy**: cards de tamanhos diferentes para indicar prioridade, em vez de tratar toda métrica como equivalente.
- **Spotlight surface**: radial gradient leve guiado pelo ponteiro somente em superfícies selecionadas; sem dependência de animação pesada.
- **Command palette**: busca global real para ações, páginas e ocorrências, acessível por Ctrl/Cmd + K.
- **Composable map workspace**: mapa, controles, resultados, legenda e ações funcionam como partes independentes e coerentes.

Decisões:
- nenhuma migração para React/Tailwind foi feita apenas para adotar componentes;
- nenhum componente do 21st foi copiado integralmente;
- os padrões foram reimplementados em HTML/CSS/JS compatíveis com a arquitetura atual;
- efeitos que não melhoram navegação, hierarquia ou leitura foram evitados.


## Rede Municipal — v5.5

A nova página de competências usa uma hierarquia visual em cinco níveis: Entrada comunitária → Classificação → Área pública de referência → Setor/serviço → Canal oficial.

Princípios:
- a hierarquia deve explicar, não fingir workflow institucional;
- secretarias e órgãos aparecem como **referência pública**, nunca como destinatários já integrados;
- setores são apresentados a partir de competências/cartas de serviços oficiais consultadas;
- contatos e links externos ficam claramente separados das ações internas do Cidade Conecta;
- o mapa pode filtrar ocorrências pela área de referência da categoria, mas isso não equivale a fila de trabalho real da Prefeitura;
- a identidade continua verde cívico + lima, com cartões de rede mais técnicos e compactos para diferenciar informação institucional de conteúdo comunitário.


## Atlas cívico — v5.5

A v5.5 adiciona uma camada territorial centrada no bairro e melhora a escala do mapa.

Padrões visuais e de UX:
- **cluster cartográfico próprio** em zoom amplo, reduzindo excesso de marcadores DOM;
- o agrupamento pode ser desligado pelo usuário;
- a informação do mapa continua duplicada em lista textual acessível;
- cada bairro tem uma página própria com KPIs, categorias, áreas públicas de referência, mapa e registros recentes;
- bairros podem ser salvos no navegador e reaparecem em `Meus registros` e na busca global;
- nenhum polígono de bairro é inventado: o Radar usa somente o nome do bairro e os pontos existentes;
- a estética do Radar usa grade cartográfica sutil, hero cívico escuro, números tabulares e painéis compactos.

O padrão segue a orientação de produto já adotada do 21st: mapa interativo somente quando pan/zoom/agrupamento realmente fazem parte do produto; em paralelo, manter lista textual para acessibilidade e fallback.

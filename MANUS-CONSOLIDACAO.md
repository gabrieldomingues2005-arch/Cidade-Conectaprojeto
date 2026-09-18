# Cidade Conecta — consolidação dos materiais do Manus

Este documento registra a auditoria dos pacotes exportados das tarefas do Manus para que o projeto não dependa de chats antigos nem de versões paralelas.

## Regra principal

A fonte de verdade continua sendo:

- GitHub: `gabrieldomingues2005-arch/Cidade-Conectaprojeto`
- branch: `main`
- Supabase Cidade Conecta: `yvmkgpijzewssdxgimit`

Os arquivos antigos do Manus servem como referência de requisitos, design e ideias. Eles não devem substituir a `main` em bloco.

## Pacotes revisados

### 1. Plataforma "Cidade Conecta" para Monitoramento Urbano Brasileiro

Protótipo React/TypeScript com identidade visual verde-escuro + verde-lima e fluxo funcional de MVP. Contém:

- Home, mapa, acompanhamento, como funciona, painel e registro;
- cadastro de ocorrência em 3 etapas;
- geração de protocolo;
- histórico/timeline;
- mapa com filtros;
- painel pessoal;
- requisitos de privacidade/LGPD;
- validação desktop e mobile;
- testes de ocorrências.

É uma referência forte para UX/UI e fluxo do produto, mas não deve substituir o código atual automaticamente.

### 2. Enhanced Community Issue Tracking Website Design

Iteração intermediária do protótipo React. Inclui páginas de registro, acompanhamento, mapa, indicadores, administração, detalhe de ocorrência e documentação de design. Parte importante das ideias já existe no projeto atual.

### 3. Desenvolver Protótipo Funcional para Cidade Conecta

Protótipo anterior com materiais de consolidação, incluindo `mockData.ts`, `useOccurrenceStore.ts`, `robots.txt`, `sitemap.xml` e relatório de evolução.

Ponto relevante ainda útil: havia validação ativa para impedir que o formulário fosse usado como canal de acusações contra pessoas ou para conflitos privados. A ideia deve ser preservada, mas qualquer implementação nova precisa evitar filtros excessivamente amplos ou falsos positivos.

### 4. cidade-conecta-piracicaba.zip

Workspace completo gerado pela tarefa Manus posterior `P76YZUrwuxpTJcJz2WeGRp`. Contém uma cópia do projeto estático em `client/public` e estrutura adicional de aplicação/componentes.

Esse material é posterior e paralelo à `main`; portanto não é fonte oficial. Alguns arquivos divergem do repositório atual e não devem ser copiados por cima da `main`.

### 5. Enhancing Cidade Conecta Piracicaba Web Project

Pacote menor com arquivos modificados da mesma linha de trabalho da tarefa `P76YZUrwuxpTJcJz2WeGRp`. É em grande parte duplicado do pacote `cidade-conecta-piracicaba.zip`.

## Decisão de consolidação

- Não importar nenhum dos snapshots React/Manus integralmente para a `main`.
- Aproveitar apenas melhorias pontuais após comparação e teste.
- Preservar como requisitos: fluxo simples de registro, protocolo, histórico, mapa, painel, privacidade, LGPD, acessibilidade, responsividade e limitação do escopo a problemas urbanos.
- O Supabase oficial e a arquitetura atual do GitHub têm precedência sobre qualquer configuração antiga contida nos ZIPs.
- Não armazenar os ZIPs dentro do repositório oficial; este documento é o registro de auditoria suficiente.

## Tarefas Manus conhecidas

- `gRCXmqyiZBT5Y7JGY6zpQ6` — trabalho visual/funcional anterior.
- `JGfgTKqwF2sTJeYD4rHbeq` — evolução/consolidação ligada ao GitHub.
- `QP6gFQQX6TvdngAaaLuEpb` — tarefa inicial.
- `P76YZUrwuxpTJcJz2WeGRp` — tarefa criada posteriormente; não é fonte de verdade e seus arquivos foram preservados nos ZIPs revisados.

## Exclusão de chats/tarefas Manus

A tarefa `P76YZUrwuxpTJcJz2WeGRp` pode ser descartada do ponto de vista do código: seu conteúdo já foi exportado e revisado e não deve virar uma base paralela.

As tarefas antigas `JGfg...` e `QP6...` podem ser descartadas depois de confirmar que não são responsáveis pelo site Manus que ainda se deseja manter publicado.

A tarefa que for proprietária do site principal `https://cidconecta-nztptuci.manus.space` deve ser preservada enquanto esse endereço precisar continuar ativo. Não excluir uma tarefa proprietária de um site publicado sem antes aceitar a perda potencial da publicação associada.

## Próximos incrementos úteis

1. Migrar escrita de ocorrências para o Supabase de forma controlada, mantendo RLS e separação entre dados públicos e privados.
2. Implementar validação de escopo contra acusações/conflitos privados de maneira contextual, sem bloquear relatos urbanos legítimos.
3. Aproveitar apenas elementos visuais/UX dos protótipos Manus que melhorem o projeto atual sem criar outra aplicação paralela.
4. Continuar validando cada alteração pela CI antes do preview do GitHub Pages.


## Aplicação visual v4.7

A direção visual dos protótipos Manus foi incorporada de forma incremental em `assets/design-v47.css`, preservando o código, o Supabase e os fluxos atuais da `main`. Foram aproveitados o contraste verde-escuro + verde-lima, hero mais expressivo, cards elevados, navegação arredondada, hierarquia mobile e sinais de confiança/privacidade. Nenhum snapshot React do Manus foi importado em bloco.


## Polimento visual v4.8

A v4.8 aprofundou a direção visual já consolidada sem consumir uma nova tarefa Manus. Foram refinados hero, navegação, formulários, tabelas, mapas, filtros, mobile/safe-area, contraste e microinterações. O objetivo foi reduzir a aparência de “template” nas telas internas e aproximar o produto de uma interface cívica madura, sem alterar a arquitetura nem criar uma versão paralela.


## Continuidade após limite de créditos — v4.9

A tarefa Manus de evolução visual foi iniciada com briefing completo, mas o limite de créditos interrompeu a execução. A continuidade foi feita diretamente sobre a `main`, preservando o mesmo briefing: símbolo próprio, hierarquia do formulário sem wizard obrigatório, progressão de status que não depende só de cor e marcadores de mapa da marca. Nenhuma base paralela foi criada.

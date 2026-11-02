# Cidade Conecta — Design System 6

Direção aplicada em 02/11/2026 na branch `feature/cidade-conecta-design-system-20261102`, sobre o checkpoint de recuperação `37c161e`. O histórico v5.x permanece no Git. Este documento descreve componentes existentes e o que foi efetivamente implementado, sem implicar aprovação institucional ou conformidade WCAG completa.

## Identidade e princípio

Cidade Conecta organiza participação cidadã, acompanhamento e leitura territorial de Piracicaba. A expressão visual combina verde cívico profundo, acento lima, superfícies de papel e uma hierarquia editorial direta. A cartografia é ferramenta de navegação, não decoração. Dados demográficos de referência, exemplos demonstrativos e ocorrências públicas devem permanecer identificáveis.

Marca: preservar `assets/brand-mark-v51.svg` e `favicon.svg`. A assinatura não representa vínculo com a Prefeitura. Área livre mínima: um quarto da largura do símbolo. Tamanho preferencial: 40 px no desktop e 36 px no mobile. Sem gerar nova marca ou redesenhar o símbolo em CSS.

O aviso de projeto acadêmico independente permanece em todas as rotas. A interface pública evita termos de implementação como nomes de banco, latência, branches ou versão de framework. O status informa Conectado, Somente leitura, Conectando, Serviço indisponível, Offline ou Demonstração; o detalhe explica o impacto no uso.

## Fonte de verdade

`assets/design-system.css`, carregado após as camadas v5.5/v5.6, define tokens `--cc6-*` e regras limitadas a `.cc-product`. A seção final de compatibilidade documenta a substituição das regras históricas com `!important`. Nenhum reset de componente deve depender de cores literais espalhadas pela aplicação. Não acrescentar uma nova folha por versão de tela: evoluir esta camada.

## Cores semânticas

| Token `--cc6-` | Valor | Aplicação |
|---|---|---|
| brand | #07383a | marca, ação primária, navegação ativa |
| brand-hover | #0d5758 | ação primária em hover |
| accent / accent-ink | #bff054 / #234416 | CTA no hero e seleções pontuais |
| accent-soft | #eef9cb | escolha ativa e apoio à ação |
| bg / surface | #f5f6f2 / #ffffff | página e superfície de conteúdo |
| soft / warm | #edf3ef / #f6f4ed | apoio, agrupamento e aviso institucional |
| ink / muted | #153e40 / #526b6d | texto principal e secundário |
| border / border-strong | #d4dfd8 / #71877b | divisões decorativas / contorno de controles |
| focus | #13706e | foco em superfície clara |
| inverse | #f6faf6 | texto sobre verde profundo |
| success / success-bg | #236141 / #e8f4ec | resolvida / confirmação |
| warning / warning-bg | #805317 / #fff5df | em análise / atenção |
| danger / danger-bg | #9b3434 / #fff0ed | erro destrutivo/validação |
| info / info-bg | #355b85 / #edf3fa | recebida / informação |
| forward / forward-bg | #69449a / #f2edf9 | encaminhada |

Status sempre inclui texto. Cor sozinha não comunica resolução, erro, seleção ou indisponibilidade. Acento lima sobre branco não serve como texto; usar `accent-ink` ou `brand`. Os pares textuais da tabela são testados a 4,5:1 e contornos de controle a 3:1. Isso não verifica todos os textos herdados e não equivale a uma certificação de acessibilidade.

## Tipografia e densidade

Fonte do sistema: `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`. Sem download de fonte, troca de tecnologia ou dependência de internet para renderizar a interface.

| Token | Escala | Uso |
|---|---|---|
| text-xs | 0,75 rem | metadados curtos, contagem e badges |
| text-sm | 0,875 rem | controles, apoio, tabelas e labels |
| text-base | 1 rem | campos editáveis e corpo |
| text-lg | 1,125 rem | introdução e etapas |
| title-sm | 1,25 rem | títulos de painéis |
| title-md | 1,625 rem | seções e números de apoio |
| title-lg | clamp 1,875–2,75 rem | título da página |
| display | clamp 2,5–4 rem | apresentação da Home |

Pesos: 400 corpo, 550 apoio, 650 labels, 750 títulos. Entrelinha: 1,6 corpo, 1,12 títulos. Números operacionais usam `tabular-nums`. Caixa alta só em rótulos curtos. No mobile títulos de página usam 1,75–2,25 rem e campos mantêm 16 px para leitura e prevenção de zoom involuntário.

## Grid, espaços e superfícies

- Conteúdo máximo: 1240 px. Margens externas: 32 px desktop, 16 px mobile.
- Escala de espaçamento: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 e 80 px, via `space-*`.
- Header: 76 px desktop; 68 px mobile. Navegação completa a partir de 1200 px. Abaixo disso, menu explícito.
- Layout de formulário: conteúdo flexível + lateral de 320 px; coluna única até 1020 px. Sem wizard obrigatório.
- Mapa: duas áreas no desktop, mapa em largura total e painel abaixo no tablet, Mapa/Lista/Regiões no mobile.
- Raios: 8 px controles, 14 px painéis, 20 px somente elementos focais. Pills apenas quando o agrupamento é naturalmente curto.
- Sombras: pequena para separação, média para superfície focal, flutuante para menu/modal. Painéis de dados não se elevam como se fossem botões.

## Componentes e contratos

| Componente | Aplicação e comportamento |
|---|---|
| Botões | `.btn.primary`, `.secondary`, `.soft`; mínimo 48 px, 44 px em controles compactos; ação principal por contexto; hover sem deslocamento |
| Campos | label persistente, fundo branco, contorno forte; ajuda associada por `aria-describedby`; checkbox nativo com texto clicável |
| Categoria | grupo de rádios com `aria-checked`, setas/Home/End e foco móvel; borda e superfície distinguem seleção; grade de duas colunas no mobile |
| Badges/chips | texto + semântica de cor; 12 px; sem indicar ação se não forem interativos |
| Cards | uma superfície principal, título e conteúdo em sequência; borda discreta e raios constantes |
| Navegação | `aria-current=page`; menu com `aria-expanded`; Escape fecha e devolve foco; clique externo fecha; todos os destinos existentes preservados |
| Busca modal | `role=dialog`, `aria-modal`, nome, pesquisa e botões de resultado nativos; Tab contido, fundo inerte, Escape e retorno de foco; Ctrl/Cmd+K preservado |
| Selects/dropdowns | selects nativos com nome acessível; menu de navegação é uma região de links, sem imitar `role=menu` de aplicação |
| Tooltips | apenas ajuda suplementar (`title`); a ação sempre tem nome/label independente do tooltip |
| Tabelas | caption e cabeçalhos com `scope=col`; linha é leitura; botão Abrir tem protocolo no nome; apresentação em cartões até 480 px, com labels de coluna |
| Indicadores | valores tabulares, unidades e origem do conjunto; gráficos acompanhados de valores textuais; zero não vira desempenho oficial |
| Mapa | Leaflet preservado; atribuição visível inclusive na Home; coordenadas públicas aproximadas; lista textual e filtros disponíveis no fallback |
| Regiões | nomes/bairros derivados da base existente; duas colunas no tablet e uma no mobile; sem polígonos inventados |
| Admin | autenticação e autorização existentes preservadas; layout compacto para entrar; fila somente leitura e exportações mantidas |
| Timeline | status, data e nota em sequência legível; etapa atual não depende só de cor |
| Arquivo | input nativo com botão legível; formatos, limite e orientação de privacidade próximos do campo |

## Estados e movimento

- Loading: mensagem textual e `aria-busy` onde existente; skeleton decorativo oculto do leitor de tela.
- Vazio: informar o conjunto/filtro sem culpar o usuário; oferecer ação aplicável. Indicadores têm estado vazio próprio.
- Erro: mensagem objetiva com efeito sobre a tarefa e possibilidade de tentar novamente; dados/sessão seguem contratos existentes.
- Offline: aviso global persistente, leitura cacheada identificada, sem simular que escrita ocorreu.
- Disabled: elemento nativo realmente desabilitado; explicação do formulário continua visível.
- Foco: contorno de 3 px, afastamento de 3–4 px; no hero escuro usar lima com anel escuro para manter separação.
- Movimento: 160 ms e apenas mudanças de cor/borda/sombra em controles; nenhum pulso contínuo em status. `prefers-reduced-motion` desativa transições, animações e scroll suave.
- `prefers-contrast:more`: contornos mais fortes. O tamanho do texto permanece controlado pelo navegador, com rem e quebra de linha.

## Privacidade e consistência da leitura

A camada visual não recebe nem gera credenciais. Não alterar contratos de `runtime-config.js`, Auth, Edge Functions, RLS ou Storage para resolver um problema de apresentação. A visão territorial pública usa o mesmo conjunto sanitizado dos indicadores, sem dados privados de contato/token. A consulta de registros do próprio navegador mantém seu caminho separado. Dados demonstrativos continuam claramente identificados; não apresentar exemplos como números oficiais.

## Verificação e continuidade

`docs/design-v60/AUDITORIA.md` registra a auditoria inicial. `scripts/test-design.mjs` verifica pares de contraste, cache versionado, semântica/escape da tabela e fonte pública das contagens territoriais. O smoke de navegador cobre rotas, tamanhos, menu, busca por teclado, formulário, filtros, Admin simulado e mapa com Leaflet stub. Screenshots não substituem teste com leitor de tela ou aparelhos físicos.

Antes de alterar componente, identificar seu equivalente existente e o token correspondente. Testar estados, teclado e larguras depois de cada bloco relevante. Não mudar backend, publicar o preview oficial ou fazer merge como consequência automática de uma melhoria visual.

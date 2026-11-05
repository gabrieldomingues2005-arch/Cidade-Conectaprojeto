# Evolução do Cidade Conecta Piracicaba

5 de novembro de 2026. Trabalho feito diretamente em `main`, a partir de `d031cb264d416f9c58119672f0aa28561b3ae317`. O [histórico da rodada](https://github.com/gabrieldomingues2005-arch/Cidade-Conectaprojeto/compare/d031cb264d416f9c58119672f0aa28561b3ae317...main) contém os commits e os arquivos de cada bloco. O PR #7 permanece sem merge. O Raiz Carbon não foi acessado nem alterado.

## Produto entregue

| Área | O que entrou ou melhorou |
|---|---|
| 1–4. Área pessoal, notificações, seguir e favoritos | Meu Cidade Conecta reúne ocorrências criadas aqui, salvos, acompanhados, bairros, consultas e atualizações. Preferências ficam no aparelho. Notificações de mudanças reais têm contador, leitura individual e em lote, deduplicação e limite. Visitantes usam o fluxo sem login obrigatório. |
| 5. Busca | A busca existente agora cobre páginas, protocolos, ocorrências, bairros, regiões, categorias, serviços e setores da base municipal. Resultados agrupados, destaque, estado vazio, teclado e Ctrl+K. |
| 6–9. Cidade Agora, Pulso, tendências e tempos | Novas leituras usam ocorrências aprovadas, sem misturar exemplos. Recortes, status, categorias, bairros, regiões e comparações de 7, 30 e 90 dias. Variação exige leitura completa, ao menos 10 em cada período e 30 no total. Medianas usam datas válidas e histórico público. São tempos observados. |
| 10–12. Avaliação, recorrência e semelhantes | Avaliação privada Sim, Parcialmente ou Não, com nota opcional de 1 a 5 e validação do código do autor após resolução. Satisfação agregada a partir de cinco respostas. Recorrência confirmada pelo servidor e deduplicada por aparelho. Sugestões de semelhantes consideram categoria, bairro, proximidade, texto, período e situação, sem bloquear o envio. |
| 13–16. Mapa | Camada de calor baseada nos pontos públicos aproximados de registros reais. Controle do limite municipal, filtros de bairro, região, período, setor, categoria e situação. Mapa, Lista e Regiões continuam disponíveis. A posição atual só é solicitada após explicação e fica na memória da tela. |
| 17–19. Radar, comparação e Onde resolver? | Radar reaproveita a base territorial com resumo real, atualizações, favoritos e compartilhamento. Comparação de dois ou três bairros respeita o mesmo recorte. Onde resolver? evolui a Rede Municipal e usa os serviços e canais já versionados no projeto. |
| 20–24. Dados Abertos, relatórios, links, feed e resolvidas | CSV e JSON com 12 campos públicos. Relatório do recorte em HTML ou impressão com opção de PDF. Copiar, Web Share quando disponível e QR gerado localmente. Feed e resolvidas recentes vêm do histórico e das datas públicas. |
| 25–26. Admin e qualidade | Fila autorizada com busca, filtros, setor, moderação, ordem por antiguidade ou pontos de atenção, possíveis duplicidades e acesso ao histórico. Exportação interna com campos permitidos. As ações de escrita e a verificação automática de ponto ausente na fila seguem pendentes. |
| 27. Transparência | Centro de Transparência explica localização enviada, ponto aproximado, contato, publicação, histórico, moderação e as seis etapas do registro à resolução. |
| 28–29. PWA e offline | PNGs 192 e 512, ícone maskable, Apple touch icon, atalhos, instalação discreta, modo standalone, aviso de atualização e Service Worker com assets versionados. Cache público identificado. Preferências funcionam offline. A tela informa que nada foi enviado se não há conexão. |
| 30–33. Acessibilidade, desempenho e acabamento | Teclado e foco nos diálogos, busca anunciada, contraste dos tokens, reduced motion, reflow de texto, navegação móvel e filtros recolhidos. Foram medidas latência, bytes, requisições e tempo de layout no mesmo Chrome. |
| 34–40. QA e integração | Testes JavaScript, Auth, Edge, PWA, validators, Chrome, Leaflet stub, verificação do backend, evidências responsivas e commits em `main`. A versão publicada depende do CI verde. |

O projeto já tinha cadastro, protocolo, tracking, Mapa/Lista/Regiões, Radar, Rede Municipal, busca rápida, Admin com Auth e PWA. A rodada preserva esses pontos de entrada e amplia as experiências existentes. Arquivos principais: `assets/app.js`, `assets/civic-*.js`, `assets/civic.css`, `index.html`, `manifest.webmanifest`, `sw.js`, `scripts/smoke-browser.mjs`, `.github/workflows/quality.yml` e `supabase/functions/community-actions/`.

## Segurança e Supabase

O projeto oficial `qzpofoxxrjunyayczcfu` está `ACTIVE_HEALTHY` em `sa-east-1`. PostGIS e pgcrypto ativos. Todas as tabelas de `public` verificadas têm RLS. `anon` e `authenticated` não têm uso do schema `private`. O bucket `occurrence-attachments` permanece privado. As 12 migrations de recuperação e as duas novas migrations constam no projeto. O RPC da participação é de uso exclusivo de `service_role`.

| Migration aplicada | Motivo |
|---|---|
| `20261105004226_community_participation.sql` | Persistir recorrência, avaliação e limite de tentativas em tabelas privadas com RLS. |
| `20261105004551_community_private_schema_hardening.sql` | Remover a permissão antiga e excedente de uso do schema privado por `authenticated`. |

A Edge `community-actions` está ativa. O [QA da participação](COMMUNITY-PARTICIPATION-20261104.md) registra o teste transacional, a validação dos três papéis e o rollback lógico. O teste verificou deduplicação, avaliação privada, código inválido, limite, auditoria e agregação mínima. Foi revertido. A ocorrência anterior `CC-2026-01002` continua pendente e preservada. A última consulta ao banco encontrou zero ocorrências reais aprovadas e zero contas internas.

A [verificação HTTP](qa-evolution-20261105/backend-http.json) passou nos 10 casos. `anon` recebe bloqueio para RPC interno, Admin, localização privada, perfis e auditoria. A inspeção do catálogo confirma que `anon` não pode inserir ocorrências nem executar `submit_occurrence_internal`. A [verificação do cliente](qa-evolution-20261105/frontend-privacy.json) inspecionou 19 arquivos. Encontrou somente JWT `anon` e confirmou o projeto oficial. Páginas, links, caches públicos e exportações excluem contato, telefone, e-mail do cidadão, endereço e coordenada exatos, código privado e IDs Auth. Os contatos institucionais da Rede Municipal vêm da sua base pública versionada.

| Advisor | Classificação |
|---|---|
| Security | Nenhum bloqueante ou importante. Seis avisos informativos de RLS sem políticas nas tabelas privadas de serviço, intencionalmente sem acesso direto do cliente. |
| Performance | Nenhum bloqueante ou importante. Doze índices `unused` informativos em base com pouco uso. Todos foram preservados. |

## QA e evidências

- 101 testes JavaScript passaram localmente. Incluem projeção pública, métricas, acompanhamento local, Auth, Edge, PWA e compartilhamento.
- 283 verificações estáticas passaram, com o aviso territorial existente do Guamium em duas regiões. Recovery passou com 9 regiões, 71 bairros urbanos, 72 vínculos, 14 núcleos e 9 categorias.
- A [execução de referência](https://github.com/gabrieldomingues2005-arch/Cidade-Conectaprojeto/actions/runs/41946630857) passou em 127 cenários Chrome. A [lista de resultados](qa-evolution-20261105/results.json) cobre 320, 390, 768 e 1366 px, Auth e Admin simulados, Leaflet stub, exportação, mapa de calor, geolocalização simulada, QR, atualização do acompanhamento, offline pelo Service Worker e bloqueio de envio offline. A execução gerou 130 capturas. Os cenários preenchidos usam 40 registros sintéticos só no navegador de QA.
- As revisões de texto ampliado corrigiram transbordamento de cards, quebra de palavras no cabeçalho e sobreposição dos rótulos da navegação. A suíte mantém a checagem de reflow e testa os limites dos rótulos. A auditoria usa a árvore de acessibilidade do Chrome, teclado e contraste de tokens. Leitor de tela em aparelho físico e instalação em iOS ficam pendentes.
- Falhas encontradas e corrigidas: coordenada ausente virava zero, leitura indisponível parecia zero confirmado, gráficos antigos acrescentavam demonstrações ao Pulso, filtros ocupavam a primeira tela mobile, e o QR podia perder foco ao terminar de carregar. A fila de QA também encontrou uma espera prematura no teste do mapa.

### Desempenho medido

Medianas de três carregamentos frios por versão, no mesmo runner Chrome com rede externa bloqueada e Service Worker fora da medição. As [amostras](qa-evolution-20261105/performance-before-after.json) correspondem à execução de referência.

| Medida | Inicial | Evolução |
|---|---:|---:|
| DOMContentLoaded | 82,9 ms | 99,0 ms |
| Load | 102,3 ms | 114,7 ms |
| Recursos da mesma origem | 457.819 bytes | 601.268 bytes |
| Requisições de recursos | 24 | 34 |
| Tempo de layout | 17,58 ms | 9,18 ms |

Os módulos acrescentaram peso e requisições, enquanto o tempo de layout caiu nesta amostra. O carregamento de Leaflet usa `defer`, a leitura pública é compartilhada e o QR só executa quando solicitado. A medição é de laboratório e não estima Core Web Vitals de campo.

## Prontidão

O preview oficial pode usar o Supabase validado. A base publicada está vazia até a aprovação de ocorrências reais. O Admin está apto para leitura segura. Aprovação, rejeição, encaminhamento e alteração de status pelo painel ainda exigem fluxo auditado de escrita e uma conta interna de QA válida. A checagem autenticada real do Admin está pendente por ausência dessa conta.

| Critério | Nota / 10 |
|---|---:|
| Estética | 8,5 |
| Experiência do cidadão | 8,5 |
| Mobile | 8,5 |
| Mapa | 8,0 |
| Dashboard | 8,5 |
| Acessibilidade | 8,0 |
| Transparência | 9,0 |
| Privacidade | 9,0 |
| Performance | 7,5 |
| Admin | 6,0 |
| Prontidão para apresentação | 8,5 |
| Prontidão para uso real | 6,0 |

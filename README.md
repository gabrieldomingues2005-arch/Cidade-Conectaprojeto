# Cidade Conecta

Projeto de extensão universitária voltado à participação cidadã e ao registro organizado de problemas urbanos em Piracicaba, São Paulo.

## Site publicado

### Site público principal

https://cidconecta-nztptuci.manus.space

O repositório GitHub é a fonte principal do código. As melhorias devem ser feitas primeiro na branch `main` e depois refletidas na publicação conectada ao projeto.

### Preview técnico automático

https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/

O GitHub Pages funciona como espelho técnico para validar rapidamente a versão mais recente do repositório. Um workflow sincroniza automaticamente `main` com `gh-pages`.

## Contexto local — Piracicaba

O MVP foi contextualizado para Piracicaba/SP. O mapa utiliza Piracicaba como referência inicial, os registros demonstrativos usam bairros do município e a interface recebeu uma paleta inspirada na identidade visual municipal, com predominância de azul e verde e detalhes em amarelo. O Cidade Conecta continua sendo um projeto acadêmico independente e não utiliza a marca oficial da Prefeitura como se fosse um serviço municipal.

A camada territorial usa uma base própria em `data/piracicaba.json`, montada a partir de referências do IBGE e de mapas públicos municipais. Ela reúne dados gerais do município, as 9 regiões administrativas, bairros componentes, área, população, densidade, núcleos urbanos isolados, municípios vizinhos e sugestões demonstrativas de encaminhamento por categoria.

A interface também oferece atalhos externos para o Portal da Prefeitura, Portal de Serviços 156, Geoprocessamento e Mapas do Município, sempre identificados como canais oficiais externos.

## Objetivo

Permitir que moradores registrem ocorrências como buracos, falhas de iluminação, descarte irregular de resíduos, vazamentos, alagamentos, sinalização, acessibilidade e problemas em áreas públicas. Cada registro recebe um protocolo para acompanhamento.

## MVP v4.2 atual

- Interface redesenhada e modular, separando HTML, CSS e JavaScript
- Identidade visual contextualizada para Piracicaba/SP
- Página específica `#/piracicaba` com geografia e leitura territorial
- Dados municipais de referência: população, área, densidade e código IBGE
- 9 regiões administrativas com população, área, densidade e bairros componentes
- Núcleos urbanos isolados/áreas rurais de referência
- Municípios vizinhos como contexto regional
- Identificação automática da região administrativa a partir do bairro quando possível
- Sugestão demonstrativa de área de encaminhamento conforme a categoria da ocorrência
- Indicadores de ocorrências agrupados por região administrativa
- Links para Geoprocessamento, Mapas do Município, IBGE e Atendimento 156
- Página inicial responsiva para computador e celular
- Busca rápida por protocolo já na página inicial
- Registro de ocorrência com categoria, título, descrição, bairro e referência de localização
- Contador de caracteres e validação de formulário
- Seleção de ponto no mapa e geolocalização opcional
- Foto opcional com limite de tamanho no navegador
- Rascunho local com opção de salvar, restaurar e descartar
- Protocolo automático no padrão `CC-2026-00001`
- Consulta por protocolo
- Página pública individual de cada ocorrência
- Área “Meus registros” para ocorrências criadas no navegador atual
- Compartilhamento e cópia do protocolo
- Status: Recebida, Em análise, Encaminhada, Em andamento e Resolvida
- Histórico de atualizações
- Mapa interativo com OpenStreetMap/Leaflet
- Filtros no mapa por categoria, status e busca textual
- Dashboard com indicadores por categoria, bairro, status e leitura territorial
- Taxa demonstrativa de resolução
- Painel administrativo de demonstração
- Alteração de status, setor responsável e observações
- Exportação em JSON e CSV
- Importação de backup JSON no painel demonstrativo
- Separação entre dados públicos e privados
- Página de princípios de privacidade
- Avisos claros de que o protótipo não substitui canais oficiais
- PWA com manifesto, favicon e service worker
- Cache offline dos arquivos principais e da base territorial
- Atalhos mobile para registrar e acompanhar
- SEO local com metadados de Piracicaba, canonical, Open Graph, dados estruturados, robots e sitemap
- Publicação automática do preview via GitHub Pages

## Estrutura do repositório

- `index.html` — estrutura principal da aplicação
- `assets/styles.css` — design system e responsividade
- `assets/app.js` — funcionalidades, rotas, mapa, formulário, dashboard e administração demonstrativa
- `assets/piracicaba.css` — paleta e componentes visuais contextualizados para Piracicaba
- `assets/piracicaba.js` — módulo de geografia, região administrativa, indicadores territoriais e links oficiais externos
- `data/piracicaba.json` — base territorial estruturada do protótipo
- `manifest.webmanifest` — manifesto PWA
- `sw.js` — cache/offline básico
- `favicon.svg` — ícone do projeto
- `robots.txt` — regras de rastreamento
- `sitemap.xml` — mapa do site para mecanismos de busca
- `404.html` — página de erro
- `ARQUITETURA.md` — fluxo funcional e perfis futuros
- `PRIVACIDADE.md` — princípios de privacidade/LGPD
- `API.md` — proposta de integração futura por API
- `schema.sql` — proposta inicial de banco PostgreSQL
- `TESTES.md` — roteiro de testes
- `.github/workflows/pages.yml` — sincronização automática `main` → `gh-pages`

## Privacidade e caráter independente

O foco é registrar problemas urbanos, não acusações contra pessoas. Nome, e-mail e telefone não são mostrados publicamente. O uso de referências territoriais, cores inspiradas na identidade municipal e links oficiais não significa integração, endosso ou operação pela Prefeitura Municipal de Piracicaba.

O MVP atual usa armazenamento local do navegador e dados demonstrativos; antes de uso real será necessário backend seguro, autenticação, moderação, armazenamento protegido de anexos, política de privacidade, validação jurídica/LGPD e validação institucional das regras de encaminhamento.

## Fontes territoriais principais

- IBGE Cidades — Piracicaba
- Prefeitura de Piracicaba — Mapas do Município
- Mapa das Regiões Administrativas, atualização de 12/12/2024
- Geoprocessamento Corporativo de Piracicaba

As referências são usadas para organizar o protótipo. Antes de uma implantação real, os arquivos e limites geográficos devem ser importados diretamente de fontes oficiais atualizadas e validados pela área técnica responsável.

## Fonte principal

A branch `main` deste repositório é a fonte oficial do Cidade Conecta. Melhorias feitas em qualquer ferramenta devem ser consolidadas aqui para evitar versões paralelas e divergentes.

## Próximas etapas

1. Validar o MVP v4.2 contextualizado para Piracicaba em computador e celular.
2. Confirmar que a publicação principal está acompanhando a branch `main`.
3. Evoluir o mapa para consumir limites oficiais em GeoJSON/serviço geográfico quando houver endpoint adequado e autorização de uso.
4. Substituir armazenamento local por PostgreSQL/API.
5. Implementar autenticação e autorização por perfil.
6. Criar moderação de conteúdo e tratamento seguro de anexos.
7. Definir domínio próprio e apontá-lo para a publicação oficial.
8. Configurar Google Search Console após definição do domínio.
9. Realizar testes com usuários.
10. Preparar demonstração e proposta para possível parceria institucional com a Prefeitura.

Projeto acadêmico — 2026.

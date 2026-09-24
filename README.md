# Cidade Conecta

Projeto de extensão universitária para registro, acompanhamento e análise de problemas urbanos em **Piracicaba/SP**.

## Acesso

**Site público principal (Manus):**
https://cidconecta-nztptuci.manus.space

**Preview técnico automático do GitHub:**
https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/

A branch `main` é a fonte oficial do código. O preview do GitHub Pages é atualizado automaticamente para permitir testar as mudanças sem depender do Manus.

A sincronização com `gh-pages` só ocorre após a validação do mesmo commit. Se algum teste falhar, a versão anterior do preview é preservada. Execuções antigas são ignoradas quando a `main` já avançou, e o envio para `gh-pages` não usa força. Pull requests executam a mesma validação, sem publicar.

## Situação atual — MVP v5.3

O protótipo já possui:

- interface responsiva para computador e celular;
- redesign v5.3 com identidade cívica própria e padrões adaptados do 21st: hierarquia bento, superfícies spotlight discretas, busca global por comando e mapa como workspace completo;
- identidade visual inspirada nas cores utilizadas pela cidade de Piracicaba, mantendo caráter independente;
- registro de ocorrências com protocolo;
- acompanhamento por protocolo e histórico;
- área “Meus registros” no navegador atual, incluindo protocolos públicos salvos para acompanhamento;
- mapa OpenStreetMap/Leaflet com painel de resultados, filtros rápidos, filtro por região administrativa, duas camadas-base, limite municipal do IBGE e ordenação por distância quando o usuário autoriza geolocalização;
- geolocalização opcional;
- localização pública aproximada e separação conceitual da localização exata privada;
- foto opcional com otimização/compressão client-side para imagens grandes;
- rascunho local;
- painel administrativo demonstrativo;
- atualização de status, setor e observações;
- exportação/importação de backup;
- indicadores por categoria, bairro, status e região;
- geografia de Piracicaba com dados municipais de referência;
- 9 regiões administrativas e seus bairros;
- localizador de bairro/região;
- tratamento de referências territoriais ambíguas;
- limite municipal carregado por GeoJSON do IBGE;
- catálogo de camadas cartográficas municipais;
- sugestão demonstrativa de encaminhamento por categoria;
- PWA e cache offline dos arquivos principais;
- SEO local;
- validação automática de qualidade no GitHub Actions;
- status visual de conectividade e origem dos dados;
- atalho `Ctrl/Cmd + K` para consulta de protocolo;
- opção de restaurar dados demonstrativos no painel Admin;
- botão para copiar o link do site;
- mapa real também na Home;
- prévia do que ficará público antes do envio da ocorrência;
- detecção de possíveis registros semelhantes por categoria e proximidade para reduzir duplicidades;
- explicação do status atual e próximos passos no detalhe do protocolo;
- filtro “Somente abertas” no mapa;
- Busca rápida global (Ctrl/Cmd + K) para ações, páginas, protocolos, bairros e ocorrências;
- mapa com modo foco, visão compartilhável com filtros na URL e alternância Mapa/Lista no celular;
- bento de leitura rápida na Home com hierarquia visual e insights do conjunto.

## Piracicaba e geografia

A base territorial está em `data/piracicaba.json` e utiliza referências públicas do IBGE e da Prefeitura de Piracicaba.

O projeto não desenha limites internos aproximados das regiões administrativas. Polígonos de bairros/regiões só devem ser incorporados quando houver fonte vetorial adequada e validada.

Documentação detalhada: `GEOGRAFIA.md`.

## Banco de dados — Supabase

O **Cidade Conecta deve usar um projeto Supabase próprio e separado** de Raiz Carbon / Carbon Track.

O projeto usa o Supabase exclusivo do Cidade Conecta (`yvmkgpijzewssdxgimit`) em modo `hybrid-write`: leitura pública aprovada e submissão segura passam pelo backend, mantendo dados privados separados por políticas e Edge Functions.

A preparação para conexão está em:

- `assets/runtime-config.js` — configuração pública de runtime;
- `SUPABASE.md` — regras de conexão e segurança;
- `schema.sql` — proposta de estrutura PostgreSQL;
- `API.md` — contrato de API proposto.

Nunca devem ser colocadas no front-end público chaves `service_role`, senha do PostgreSQL ou credenciais administrativas.

## Estrutura principal

- `index.html` — shell principal;
- `assets/app.js` — aplicação e fluxo de ocorrências;
- `assets/styles.css` — estilos gerais;
- `assets/design-v53.css` — camada visual incremental inspirada nos protótipos Manus;
- `assets/piracicaba.js` — contexto territorial;
- `assets/piracicaba-mapas.js` — geografia avançada e limite municipal;
- `assets/privacy-geo.js` — proteção de localização;
- `assets/runtime-config.js` — modo e configuração do backend;
- `assets/site-enhancements.js` — melhorias de UX e estado do sistema;
- `data/piracicaba.json` — base territorial;
- `schema.sql` — modelo PostgreSQL futuro;
- `SUPABASE.md` — plano de integração Supabase;
- `TESTES.md` — roteiro de validação;
- `.github/workflows/quality.yml` — checagem automática;
- `.github/workflows/pages.yml` — sincronização do preview.

## Privacidade

O foco é registrar **problemas urbanos**, não acusações contra pessoas. Nome, e-mail e telefone não devem aparecer publicamente. A posição pública deve ser aproximada quando a coordenada exata puder expor residência ou pessoa.

O MVP já possui backend seguro, RLS, submissão por Edge Function, armazenamento privado de anexos e trilha de auditoria. Antes de uso institucional ainda são necessários autenticação operacional completa, autorização administrativa real, políticas formais de retenção e revisão LGPD institucional.

## Caráter institucional

Cidade Conecta é um **projeto acadêmico independente**. Referências territoriais, links oficiais e cores inspiradas em Piracicaba não significam integração, aprovação ou operação pela Prefeitura Municipal de Piracicaba.

## Próximas etapas

1. Fazer QA visual/funcional da v5.3 em desktop e celulares reais.
2. Validar usabilidade do novo seletor de categorias e do mapa avançado.
3. Implementar autenticação/roles reais para substituir o Admin demonstrativo.
4. Evoluir moderação e notificações.
5. Incorporar novas camadas geográficas somente quando houver fonte vetorial validada.
6. Preparar demonstração acadêmica e eventual apresentação institucional futura.

Projeto acadêmico — 2026.

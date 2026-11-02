# Handoff para Claude — Cidade Conecta UI/UX v5.7.1

Você recebeu um pacote offline do projeto Cidade Conecta Piracicaba.

## Contexto

Branch de origem:
`feature/cidade-conecta-auth-admin-20261008`

Checkpoint base:
`714aa0b5201db19f78f0dea29e678e07abbc3945`

Esta versão já passou em:
- 282 verificações estáticas;
- 46 testes Auth/Edge/PWA;
- 28 cenários Chrome;
- screenshots full-page em 390, 768 e 1366 px.

O mapa v5.7.1 já possui:
- desktop com painel lateral e mapa principal;
- mobile com abas Mapa / Lista / Regiões;
- lista disponível mesmo quando Leaflet/OpenStreetMap falha;
- resumo territorial usando a base visível;
- filtros por categoria, status, região e área pública de referência;
- regiões 1–9 sem inventar nomes ou polígonos;
- estado vazio e erro explícitos.

## Sua tarefa

Você PODE editar os arquivos deste pacote para melhorar:
- mapa;
- layout;
- hierarquia visual;
- responsividade;
- densidade;
- tipografia;
- filtros;
- abas Mapa / Lista / Regiões;
- estados vazio, erro, loading e offline;
- Home, Registrar, Acompanhar, Dashboard, Rede Municipal e Admin SOMENTE no aspecto visual/copy.

Prioridade especial:
1. refinar o mapa em 390 / 768 / 1366;
2. melhorar a aba Lista no mobile;
3. melhorar a aba Regiões sem inventar dados territoriais;
4. deixar filtros mais compactos e fáceis de usar;
5. melhorar espaçamento e legibilidade;
6. preservar acessibilidade e áreas de toque;
7. manter o visual cívico teal/lima/creme.

## Regras obrigatórias

NÃO:
- altere Supabase;
- escreva SQL;
- altere Auth, RLS ou Storage;
- crie ou modifique Edge Functions;
- mude lógica de autorização;
- exponha dados privados;
- invente nomes de regiões;
- invente polígonos;
- mude a arquitetura de segurança;
- remova o aviso de protótipo acadêmico;
- recrie o projeto do zero.

Não use o projeto Raiz Carbon.

## Arquivos principais permitidos

- `index.html`
- `assets/app.js`
- `assets/styles.css`
- `assets/design-v55.css`
- `assets/design-v56.css`
- `assets/site-enhancements.js`
- `assets/site-enhancements.css`
- `assets/piracicaba.css`
- `assets/piracicaba-mapas.css`
- `assets/piracicaba-mapas.js`
- `assets/privacy-geo.js`
- `data/piracicaba.json` apenas para LEITURA/uso dos dados existentes
- `data/municipal-network.json` apenas para LEITURA/uso dos dados existentes

O `runtime-config.js` do pacote é uma versão local/sanitizada e não contém credenciais do projeto.

## Entrega esperada

Faça as alterações diretamente nos arquivos do pacote.

Depois entregue:
1. arquivos modificados;
2. `CLAUDE-CHANGELOG.md` com cada alteração;
3. lista de arquivos alterados;
4. riscos ou pontos que precisam de validação;
5. não alegue que algo foi validado em produção.

Se puder executar testes locais, faça apenas validações frontend/offline. Não conecte a banco ou serviços privados.

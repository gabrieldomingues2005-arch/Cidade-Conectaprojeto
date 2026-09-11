# Cidade Conecta

Projeto de extensão universitária voltado à participação cidadã e ao registro organizado de problemas urbanos.

## Site publicado

### Site público principal

https://cidconecta-nztptuci.manus.space

O repositório GitHub é a fonte principal do código. As melhorias devem ser feitas primeiro na branch `main` e depois refletidas na publicação conectada ao projeto.

### Preview técnico automático

https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/

O GitHub Pages funciona como espelho técnico para validar rapidamente a versão mais recente do repositório. Um workflow sincroniza automaticamente `main` com `gh-pages`.

## Objetivo

Permitir que moradores registrem ocorrências como buracos, falhas de iluminação, descarte irregular de resíduos, vazamentos, alagamentos, sinalização, acessibilidade e problemas em áreas públicas. Cada registro recebe um protocolo para acompanhamento.

## MVP v4 atual

- Interface redesenhada e modular, separando HTML, CSS e JavaScript
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
- Dashboard com indicadores por categoria, bairro e status
- Taxa demonstrativa de resolução
- Painel administrativo de demonstração
- Alteração de status, setor responsável e observações
- Exportação em JSON e CSV
- Importação de backup JSON no painel demonstrativo
- Separação entre dados públicos e privados
- Página de princípios de privacidade
- Avisos claros de que o protótipo não substitui canais oficiais
- PWA com manifesto, favicon e service worker
- Cache offline dos arquivos principais
- Atalhos mobile para registrar e acompanhar
- SEO básico com canonical, Open Graph, robots e sitemap
- Publicação automática do preview via GitHub Pages

## Estrutura do repositório

- `index.html` — estrutura principal da aplicação
- `assets/styles.css` — design system e responsividade
- `assets/app.js` — funcionalidades, rotas, mapa, formulário, dashboard e administração demonstrativa
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

## Privacidade

O foco é registrar problemas urbanos, não acusações contra pessoas. Nome, e-mail e telefone não são mostrados publicamente. O MVP atual usa armazenamento local do navegador e dados demonstrativos; antes de uso real será necessário backend seguro, autenticação, moderação, armazenamento protegido de anexos, política de privacidade e validação jurídica/LGPD.

## Fonte principal

A branch `main` deste repositório é a fonte oficial do Cidade Conecta. Melhorias feitas em qualquer ferramenta devem ser consolidadas aqui para evitar versões paralelas e divergentes.

## Próximas etapas

1. Validar o MVP v4 em computador e celular.
2. Confirmar que a publicação principal está acompanhando a branch `main`.
3. Substituir armazenamento local por PostgreSQL/API.
4. Implementar autenticação e autorização por perfil.
5. Criar moderação de conteúdo e tratamento seguro de anexos.
6. Definir domínio próprio e apontá-lo para a publicação oficial.
7. Configurar Google Search Console após definição do domínio.
8. Realizar testes com usuários.
9. Preparar demonstração e proposta para possível parceria institucional com a Prefeitura.

Projeto acadêmico — 2026.

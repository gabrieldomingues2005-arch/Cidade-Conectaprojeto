# Cidade Conecta

Projeto de extensão universitária voltado à participação cidadã e ao registro organizado de problemas urbanos.

## Site publicado

### Preview atualizado pelo GitHub

https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/

A branch `main` é a fonte oficial do projeto. Um workflow sincroniza automaticamente o conteúdo da `main` com a branch `gh-pages`; o GitHub Pages publica essa branch. Assim, novas alterações feitas no GitHub podem chegar ao site sem depender do Manus.

### Publicação anterior no Manus

https://cidconecta-nztptuci.manus.space

A versão do Manus fica preservada como publicação anterior. Enquanto a situação da assinatura/reembolso estiver sendo regularizada, não é necessário usar créditos do Manus para manter a evolução do projeto.

## Objetivo

Permitir que moradores registrem ocorrências como buracos, falhas de iluminação, descarte irregular de resíduos, vazamentos, alagamentos, sinalização, acessibilidade e problemas em áreas públicas. Cada registro recebe um protocolo para acompanhamento.

## MVP v3 atual

- Página inicial responsiva para computador e celular
- Registro de ocorrência com categoria, título, descrição, bairro e referência de localização
- Seleção de ponto no mapa e geolocalização opcional
- Foto opcional com limite de tamanho no navegador
- Protocolo automático no padrão `CC-2026-00001`
- Consulta por protocolo
- Página pública individual de cada ocorrência
- Compartilhamento e cópia do protocolo
- Status: Recebida, Em análise, Encaminhada, Em andamento e Resolvida
- Histórico de atualizações
- Mapa interativo com OpenStreetMap/Leaflet
- Filtros no mapa por categoria, status e busca textual
- Dashboard com indicadores por categoria, bairro e status
- Taxa demonstrativa de resolução
- Painel administrativo de demonstração
- Alteração de status, setor responsável e observações
- Exportação dos dados demonstrativos em JSON e CSV
- Separação entre dados públicos e privados
- Página de princípios de privacidade
- Avisos claros de que o protótipo não substitui canais oficiais
- PWA básica com `manifest.webmanifest`, favicon e service worker
- Suporte offline básico para os arquivos principais
- Publicação automática via GitHub Pages

## Estrutura do repositório

- `index.html` — aplicação demonstrativa completa
- `manifest.webmanifest` — manifesto da aplicação web
- `sw.js` — cache/offline básico do protótipo
- `favicon.svg` — ícone do projeto
- `robots.txt` — regras de rastreamento
- `sitemap.xml` — mapa do site para mecanismos de busca
- `404.html` — página de erro
- `ARQUITETURA.md` — fluxo funcional e perfis futuros
- `PRIVACIDADE.md` — princípios de privacidade/LGPD para evolução do projeto
- `schema.sql` — proposta inicial de banco PostgreSQL
- `.github/workflows/pages.yml` — sincronização automática `main` → `gh-pages`

## Privacidade

O foco é registrar problemas urbanos, não acusações contra pessoas. Nome, e-mail e telefone não são mostrados publicamente. O MVP atual usa armazenamento local do navegador e dados demonstrativos; antes de uso real será necessário backend seguro, autenticação, moderação, armazenamento protegido de anexos, política de privacidade e validação jurídica/LGPD.

## Fonte principal

Este repositório é a fonte oficial do Cidade Conecta. Melhorias feitas no ChatGPT, Manus ou em outra ferramenta devem ser consolidadas aqui para evitar versões paralelas e divergentes.

## Próximas etapas

1. Validar o preview do GitHub Pages em celular e computador.
2. Substituir armazenamento local por PostgreSQL/API.
3. Implementar autenticação e autorização por perfil.
4. Criar moderação de conteúdo e tratamento seguro de anexos.
5. Definir domínio próprio e apontá-lo para a publicação oficial.
6. Configurar Google Search Console após definição do domínio.
7. Realizar testes com usuários.
8. Preparar demonstração e proposta para possível parceria institucional com a Prefeitura.

Projeto acadêmico — 2026.

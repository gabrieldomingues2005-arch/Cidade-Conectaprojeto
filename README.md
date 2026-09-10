# Cidade Conecta

Projeto de extensão universitária voltado à participação cidadã e ao registro organizado de problemas urbanos.

## Objetivo

Permitir que moradores registrem ocorrências como buracos, falhas de iluminação, descarte irregular de resíduos, vazamentos, alagamentos, sinalização, acessibilidade e problemas em áreas públicas. Cada registro recebe um protocolo para acompanhamento.

## MVP atual

- Página inicial responsiva para computador e celular
- Registro de ocorrência com categoria, título, descrição, bairro e localização
- Seleção de ponto no mapa e geolocalização opcional
- Foto opcional com compressão no navegador
- Protocolo automático no padrão `CC-2026-00001`
- Consulta por protocolo
- Status: Recebida, Em análise, Encaminhada, Em andamento e Resolvida
- Mapa interativo com OpenStreetMap/Leaflet
- Filtros no mapa por categoria, status e bairro
- Dashboard com indicadores por categoria, bairro, status e órgão/setor
- Painel administrativo de demonstração
- Alteração de status, órgão responsável e observações
- Exportação dos dados demonstrativos em JSON
- Separação entre dados públicos e privados
- Avisos claros de que o protótipo não substitui canais oficiais
- Manifesto web e página 404

## Estrutura do repositório

- `index.html` — aplicação demonstrativa completa
- `manifest.webmanifest` — manifesto da aplicação web
- `robots.txt` — preparação para indexação futura
- `404.html` — página de erro
- `ARQUITETURA.md` — fluxo funcional e perfis futuros
- `PRIVACIDADE.md` — princípios de privacidade/LGPD para evolução do projeto
- `schema.sql` — proposta inicial de banco PostgreSQL

## Privacidade

O foco é registrar problemas urbanos, não acusações contra pessoas. Nome, e-mail e telefone não são mostrados publicamente. O MVP atual usa armazenamento local do navegador e dados demonstrativos; antes de uso real será necessário backend seguro, autenticação, moderação, armazenamento protegido de anexos, política de privacidade e validação jurídica/LGPD.

## Fonte principal

Este repositório é a fonte oficial do Cidade Conecta. Qualquer melhoria futura deve partir daqui para evitar versões paralelas e divergentes.

## Próximas etapas

1. Publicar o protótipo em uma URL pública.
2. Definir domínio próprio.
3. Substituir armazenamento local por PostgreSQL/API.
4. Implementar autenticação e autorização por perfil.
5. Criar moderação de conteúdo e anexos.
6. Configurar SEO, sitemap e Google Search Console após definição da URL.
7. Realizar testes com usuários.
8. Preparar demonstração e proposta para possível parceria com a Prefeitura.

Projeto acadêmico — 2026.

# Cidade Conecta

Projeto de extensão universitária voltado à participação cidadã e ao registro organizado de problemas urbanos.

## Site publicado

Versão pública atualmente publicada pelo Manus:

https://cidconecta-nztptuci.manus.space

> Observação: o GitHub continua sendo a fonte oficial do projeto. A publicação no Manus deve ser sincronizada/atualizada a partir desta base quando a integração for confirmada. Enquanto isso, alterações no `main` podem estar à frente da versão publicada.

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

## Estrutura do repositório

- `index.html` — aplicação demonstrativa completa
- `manifest.webmanifest` — manifesto da aplicação web
- `sw.js` — cache/offline básico do protótipo
- `favicon.svg` — ícone do projeto
- `robots.txt` — preparação para indexação futura
- `404.html` — página de erro
- `ARQUITETURA.md` — fluxo funcional e perfis futuros
- `PRIVACIDADE.md` — princípios de privacidade/LGPD para evolução do projeto
- `schema.sql` — proposta inicial de banco PostgreSQL

## Privacidade

O foco é registrar problemas urbanos, não acusações contra pessoas. Nome, e-mail e telefone não são mostrados publicamente. O MVP atual usa armazenamento local do navegador e dados demonstrativos; antes de uso real será necessário backend seguro, autenticação, moderação, armazenamento protegido de anexos, política de privacidade e validação jurídica/LGPD.

## Fonte principal

Este repositório é a fonte oficial do Cidade Conecta. Melhorias feitas no ChatGPT, Manus ou em outra ferramenta devem ser consolidadas aqui para evitar versões paralelas e divergentes.

## Próximas etapas

1. Comparar a versão pública do Manus com o `main` atual quando a publicação estiver acessível para inspeção automatizada.
2. Confirmar um fluxo de sincronização entre GitHub e a publicação.
3. Definir domínio próprio.
4. Substituir armazenamento local por PostgreSQL/API.
5. Implementar autenticação e autorização por perfil.
6. Criar moderação de conteúdo e tratamento seguro de anexos.
7. Configurar SEO, sitemap e Google Search Console após definição da URL/domínio definitivo.
8. Realizar testes com usuários.
9. Preparar demonstração e proposta para possível parceria institucional com a Prefeitura.

Projeto acadêmico — 2026.

# Design Institucional v8.4 — Cidade Conecta Piracicaba

## Direção

O Cidade Conecta usa uma linguagem **institucional contemporânea**, inspirada na previsibilidade de portais de serviços públicos brasileiros e na organização do portal de Piracicaba, sem copiar identidade visual, brasão, logotipo ou marca governamental.

A plataforma continua explicitamente identificada como **projeto acadêmico independente**.

## Referências de arquitetura de informação

- Portal do Município de Piracicaba: busca como porta de entrada, acesso rápido, serviços, notícias e consultas.
- Design System do Governo Federal: consistência, hierarquia previsível, acessibilidade e foco no cidadão.
- Identidade própria do Cidade Conecta: teal/verde, lima e creme.

## Tokens institucionais próprios

- Navy: `#0b3f55`
- Azul: `#146b83`
- Verde: `#0a6761`
- Lima: `#bfe650`
- Creme: `#fbfaf4`
- Linha: `#d8e2e4`

Estes tokens são do Cidade Conecta. Não representam paleta oficial da Prefeitura nem do gov.br.

## Princípios

1. **Busca primeiro:** “O que você procura?” abre a busca global da plataforma.
2. **Serviço antes de decoração:** Registrar, acompanhar, onde resolver e transparência aparecem como ações diretas.
3. **Hierarquia previsível:** cabeçalho, faixa territorial, aviso de independência, conteúdo e rodapé.
4. **Origem clara:** dados públicos e demonstração nunca devem parecer a mesma coisa.
5. **Institucional sem impersonação:** não usar brasão, marca gov.br ou frases que sugiram vínculo oficial inexistente.
6. **Acessibilidade:** foco visível, leitor de tela, reduced motion, contraste e reflow.
7. **Mobile primeiro:** serviços centrais permanecem acessíveis em telas pequenas.
8. **Resiliência:** falha de mapa-base não pode impedir acesso a pontos, filtros e listas.

## Mapa

Ordem de resiliência:

1. Leaflet 1.9.4 via UNPKG.
2. Fallback da biblioteca via jsDelivr.
3. Se tiles do mapa-base falharem, remover apenas a camada de tiles e manter vetores, marcadores, filtros e listas sobre um fundo cartográfico simplificado.
4. Se a própria biblioteca não carregar, usar os fallbacks de lista já existentes no produto.

## SEO

As rotas SPA continuam sendo a experiência principal, porém páginas estáticas indexáveis servem como porta de descoberta:

- `/participar/`
- `/mapa/`
- `/noticias/`
- `/problemas-resolvidos/`
- `/bairros/`
- `/dados-abertos/`
- `/transparencia/`

Cada uma possui canonical, meta description, Open Graph, JSON-LD, conteúdo útil e link para a experiência interativa.

## Integração municipal

O fluxo público mostra canais oficiais verificados, incluindo SIP-156.

O adaptador automático é **fail-closed**:

- sem URL HTTPS, token e allowlist de host: não envia;
- somente Admin pode acionar;
- preparação e envio são ações separadas;
- payload limitado a dados operacionais públicos;
- contato, token privado e coordenada exata não são enviados;
- toda tentativa gera auditoria;
- nenhuma API municipal é presumida ou simulada.

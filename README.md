# Cidade Conecta

Projeto de extensão universitária para registro, acompanhamento e análise de problemas urbanos em **Piracicaba/SP**.

## Acesso

**Site público principal (Manus):**
https://cidconecta-nztptuci.manus.space

**Preview técnico automático do GitHub:**
https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/

A branch `main` é a fonte oficial do código. O preview do GitHub Pages é atualizado automaticamente para permitir testar as mudanças sem depender do Manus.

A sincronização com `gh-pages` só ocorre após a validação do mesmo commit. Se algum teste falhar, a versão anterior do preview é preservada. Execuções antigas são ignoradas quando a `main` já avançou, e o envio para `gh-pages` não usa força. Pull requests executam a mesma validação, sem publicar.

## Situação atual — MVP v4.7

O protótipo já possui:

- interface responsiva para computador e celular;
- direção visual v4.7 inspirada nos protótipos Manus auditados: verde cívico escuro, acento lima, hero de alto contraste e cards refinados;
- identidade visual inspirada nas cores utilizadas pela cidade de Piracicaba, mantendo caráter independente;
- registro de ocorrências com protocolo;
- acompanhamento por protocolo e histórico;
- área “Meus registros” no navegador atual;
- mapa OpenStreetMap/Leaflet;
- geolocalização opcional;
- localização pública aproximada e separação conceitual da localização exata privada;
- foto opcional;
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
- botão para copiar o link do site.

## Piracicaba e geografia

A base territorial está em `data/piracicaba.json` e utiliza referências públicas do IBGE e da Prefeitura de Piracicaba.

O projeto não desenha limites internos aproximados das regiões administrativas. Polígonos de bairros/regiões só devem ser incorporados quando houver fonte vetorial adequada e validada.

Documentação detalhada: `GEOGRAFIA.md`.

## Banco de dados — Supabase

O **Cidade Conecta deve usar um projeto Supabase próprio e separado** de Raiz Carbon / Carbon Track.

Enquanto o projeto Supabase específico do Cidade Conecta não estiver acessível e validado na integração usada para desenvolvimento, o front-end permanece em **modo local**, evitando qualquer risco de alteração no banco errado.

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
- `assets/design-v47.css` — camada visual incremental inspirada nos protótipos Manus;
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

Antes de uso real serão necessários backend seguro, autenticação, autorização por perfil, RLS/políticas de banco, moderação, armazenamento protegido de anexos, logs de auditoria e revisão LGPD.

## Caráter institucional

Cidade Conecta é um **projeto acadêmico independente**. Referências territoriais, links oficiais e cores inspiradas em Piracicaba não significam integração, aprovação ou operação pela Prefeitura Municipal de Piracicaba.

## Próximas etapas

1. Manter o preview do GitHub atualizado e testar em celular/computador.
2. Conectar exclusivamente o projeto Supabase separado do Cidade Conecta quando ele estiver disponível nesta integração.
3. Validar schema e políticas RLS antes de habilitar escrita remota.
4. Migrar gradualmente leitura pública, criação de ocorrência e painel administrativo para backend real.
5. Obter camada vetorial validada de bairros/regiões para resolução por coordenadas.
6. Evoluir camadas de risco, drenagem, zoneamento e equipamentos públicos.
7. Implementar autenticação e moderação reais.
8. Definir domínio próprio e Search Console.
9. Preparar demonstração para possível parceria institucional.

Projeto acadêmico — 2026.

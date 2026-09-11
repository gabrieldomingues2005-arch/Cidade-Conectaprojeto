# Cidade Conecta — Roteiro de testes do MVP

Use este roteiro antes de qualquer apresentação ou publicação.

## 1. Página inicial
- Abrir no celular e no computador.
- Conferir menu, botões, textos e indicadores.
- Verificar se o aviso de protótipo acadêmico independente está visível.
- Conferir a faixa “Piracicaba, São Paulo”.
- Conferir o bloco territorial após o destaque principal.
- Conferir se os links externos da Prefeitura, 156 e Geoprocessamento abrem em nova aba.

## 2. Registro de ocorrência
- Preencher categoria, título, descrição, bairro e localização.
- Testar seleção pelo mapa quando disponível.
- Testar anexar uma imagem demonstrativa.
- Confirmar geração de protocolo.
- Confirmar que o registro aparece nos indicadores e no painel administrativo local.
- Verificar o autocomplete do campo de bairro.
- Digitar bairros conhecidos como Centro, Vila Rezende, Santa Terezinha, Paulista e Piracicamirim e verificar a identificação da região administrativa.
- Digitar `Guamium` e confirmar que o sistema informa correspondência territorial ambígua entre regiões em vez de escolher uma região silenciosamente.
- Digitar um núcleo como Ártemis ou Tupi e conferir que ele aparece como referência rural/núcleo isolado.
- Trocar a categoria e verificar a sugestão demonstrativa de encaminhamento.
- Confirmar que o texto deixa claro que o encaminhamento sugerido não é roteamento oficial da Prefeitura.

## 3. Acompanhamento
- Consultar `CC-2026-00001`.
- Consultar um protocolo inexistente.
- Conferir status, setor responsável e histórico.
- Confirmar que nome, e-mail e telefone não aparecem publicamente.
- Conferir os chips `Piracicaba · SP` e da região administrativa quando o bairro for reconhecido.
- Conferir a indicação de encaminhamento sugerido do protótipo.

## 4. Mapa comunitário
- Abrir o mapa com internet.
- Testar filtros de categoria, bairro e status.
- Conferir os pontos demonstrativos.
- Confirmar que o mapa inicia em Piracicaba.
- Conferir o resumo territorial por regiões acima do mapa.
- Abrir o atalho para a página de geografia.
- Testar comportamento quando o mapa externo não carregar.

## 5. Geografia de Piracicaba
- Abrir `#/piracicaba` pelo menu.
- Conferir população estimada, população do Censo, área territorial, densidade demográfica e código IBGE.
- Conferir as 9 regiões administrativas.
- Abrir os detalhes de cada região e verificar os bairros listados.
- Conferir área, população e densidade de cada região.
- Conferir núcleos urbanos isolados/áreas rurais de referência.
- Conferir municípios vizinhos.
- Conferir os links para IBGE, Mapas do Município, mapa das Regiões Administrativas e Geoprocessamento.
- Conferir a nota de fontes e a indicação de que os dados devem ser validados antes de uso institucional.

### 5.1 Limite municipal IBGE
- Abrir a seção `Limite municipal no mapa`.
- Confirmar que o mapa-base do OpenStreetMap aparece.
- Confirmar que o contorno municipal é carregado pela API de Malhas Geográficas do IBGE.
- Confirmar a mensagem de sucesso abaixo do mapa.
- Simular indisponibilidade da API e conferir que a aplicação mantém o mapa-base e mostra mensagem de fallback sem quebrar a página.
- Confirmar que o texto diferencia o limite municipal IBGE dos limites internos das regiões administrativas.

### 5.2 Localizador territorial
- Pesquisar `Centro` e confirmar Região 1.
- Pesquisar `Vila Rezende` e confirmar Região 2.
- Pesquisar `Santa Terezinha` e confirmar Região 4.
- Pesquisar `Paulista` e confirmar Região 5.
- Pesquisar `Paulicéia` e confirmar Região 6.
- Pesquisar `Piracicamirim` e confirmar Região 9.
- Pesquisar `Guamium` e confirmar aviso de correspondência em mais de uma região.
- Pesquisar `Ártemis` e confirmar identificação como núcleo/área rural de referência.
- Selecionar uma categoria e conferir a área de triagem sugerida.

### 5.3 Camadas municipais de referência
- Conferir o catálogo de bairros, estradas rurais, zoneamento, parques lineares, áreas de risco, ZEIS, distritos, municípios vizinhos, mancha urbana, perímetro urbano, educação e saúde.
- Confirmar que a página deixa claro que essas referências não estão sendo apresentadas como polígonos próprios do Cidade Conecta.
- Abrir `Mapas do Município` e o novo Geoprocessamento em nova aba.

## 6. Indicadores
- Conferir totais por categoria, bairro, status e setor.
- Conferir a seção territorial por região administrativa.
- Conferir a taxa demonstrativa de ocorrências por 10 mil habitantes de cada região.
- Confirmar o aviso de que a taxa é apenas metodológica enquanto houver poucos registros.
- Criar uma nova ocorrência em bairro conhecido e validar se a contagem da região muda corretamente.
- Criar uma ocorrência com bairro não reconhecido e verificar o aviso de registro sem região identificada.

## 7. Painel administrativo demonstrativo
- Filtrar por protocolo, título, bairro, categoria e status.
- Abrir uma ocorrência e conferir o contexto territorial de Piracicaba.
- Conferir a triagem sugerida para a categoria.
- Alterar o status de uma ocorrência.
- Definir/editar o setor responsável.
- Inserir uma observação e conferir o histórico público.
- Exportar os dados demonstrativos.
- Testar restauração dos dados demo.

## 8. PWA e offline
- Abrir a aplicação uma vez com internet.
- Recarregar depois com rede indisponível.
- Confirmar que HTML, CSS, JavaScript principal, módulos de Piracicaba, `assets/piracicaba-mapas.css` e `data/piracicaba.json` continuam disponíveis pelo cache.
- Confirmar que a camada dinâmica do IBGE pode ficar indisponível offline sem quebrar a página territorial.
- Confirmar que links oficiais externos apenas falham normalmente quando não houver internet, sem quebrar a aplicação.

## 9. Responsividade e acessibilidade básica
- Testar largura pequena de celular.
- Conferir contraste e tamanho dos botões.
- Navegar com Tab no computador.
- Conferir foco visível.
- Conferir textos alternativos das imagens.
- Abrir a página territorial em celular e verificar cards das regiões em coluna única.
- Conferir o mapa de limite municipal em tela pequena.
- Conferir localizador territorial, catálogo de camadas e tabela de triagem em celular.

## 10. Segurança, geografia e privacidade antes de produção
A versão atual ainda é um protótipo. Antes de uso real, validar:
- autenticação real no painel administrativo;
- autorização por perfil;
- backend e banco de dados seguros;
- limites de requisição;
- validação e moderação de imagens;
- política de privacidade e base legal para dados pessoais;
- logs de auditoria;
- proteção contra abuso e conteúdo impróprio;
- validação oficial dos limites territoriais, bairros e regras de encaminhamento;
- camada vetorial oficial das regiões/bairros antes de usar identificação por coordenada;
- definição de localização pública aproximada e localização exata protegida quando aplicável.

## Critério mínimo para demonstração acadêmica
O projeto está pronto para demonstração quando registro, protocolo, acompanhamento, mapa, geografia de Piracicaba, limite municipal IBGE, localizador de bairros, indicadores territoriais e painel administrativo funcionarem sem erros evidentes em celular e computador.

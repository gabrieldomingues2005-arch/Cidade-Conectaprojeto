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
- Digitar bairros conhecidos como Centro, Vila Rezende, Santa Terezinha, Paulista e Piracicamirim e verificar a identificação da região administrativa.
- Trocar a categoria e verificar a sugestão demonstrativa de encaminhamento.
- Confirmar que o texto deixa claro que o encaminhamento sugerido não é roteamento oficial da Prefeitura.

## 3. Acompanhamento
- Consultar `CC-2026-00001`.
- Consultar um protocolo inexistente.
- Conferir status, setor responsável e histórico.
- Confirmar que nome, e-mail e telefone não aparecem publicamente.

## 4. Mapa
- Abrir o mapa com internet.
- Testar filtros de categoria, bairro e status.
- Conferir os pontos demonstrativos.
- Confirmar que o mapa inicia em Piracicaba.
- Testar comportamento quando o mapa externo não carregar.

## 5. Geografia de Piracicaba
- Abrir `#/piracicaba` pelo menu.
- Conferir população estimada, população do Censo, área territorial e densidade demográfica.
- Conferir as 9 regiões administrativas.
- Abrir os detalhes de cada região e verificar os bairros listados.
- Conferir área, população e densidade de cada região.
- Conferir núcleos urbanos isolados/áreas rurais de referência.
- Conferir municípios vizinhos.
- Conferir os links para IBGE, Mapas do Município e Geoprocessamento.
- Conferir a nota de fontes e a indicação de que os dados devem ser validados antes de uso institucional.

## 6. Indicadores
- Conferir totais por categoria, bairro, status e setor.
- Conferir a seção territorial por região administrativa.
- Criar uma nova ocorrência em bairro conhecido e validar se a contagem da região muda corretamente.
- Criar uma ocorrência com bairro não reconhecido e verificar o aviso de registro sem região identificada.

## 7. Painel administrativo demonstrativo
- Filtrar por protocolo, título, bairro, categoria e status.
- Alterar o status de uma ocorrência.
- Definir/editar o setor responsável.
- Inserir uma observação e conferir o histórico público.
- Exportar os dados demonstrativos.
- Testar restauração dos dados demo.

## 8. PWA e offline
- Abrir a aplicação uma vez com internet.
- Recarregar depois com rede indisponível.
- Confirmar que HTML, CSS, JavaScript principal, módulo de Piracicaba e base `data/piracicaba.json` continuam disponíveis pelo cache.
- Confirmar que links oficiais externos apenas falham normalmente quando não houver internet, sem quebrar a aplicação.

## 9. Responsividade e acessibilidade básica
- Testar largura pequena de celular.
- Conferir contraste e tamanho dos botões.
- Navegar com Tab no computador.
- Conferir foco visível.
- Conferir textos alternativos das imagens.
- Abrir a página territorial em celular e verificar cards das regiões em coluna única.

## 10. Segurança e privacidade antes de produção
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
- definição de localização pública aproximada e localização exata protegida quando aplicável.

## Critério mínimo para demonstração acadêmica
O projeto está pronto para demonstração quando registro, protocolo, acompanhamento, mapa, geografia de Piracicaba, indicadores territoriais e painel administrativo funcionarem sem erros evidentes em celular e computador.

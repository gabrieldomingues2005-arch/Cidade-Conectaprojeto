# Cidade Conecta — Roteiro de testes do MVP

Use este roteiro antes de qualquer apresentação ou publicação.

## 1. Página inicial
- Abrir no celular e no computador.
- Conferir menu, botões, textos e indicadores.
- Verificar se o aviso de protótipo acadêmico está visível.

## 2. Registro de ocorrência
- Preencher categoria, título, descrição, bairro e localização.
- Testar seleção pelo mapa quando disponível.
- Testar anexar uma imagem demonstrativa.
- Confirmar geração de protocolo.
- Confirmar que o registro aparece nos indicadores e no painel administrativo local.

## 3. Acompanhamento
- Consultar `CC-2026-00001`.
- Consultar um protocolo inexistente.
- Conferir status, setor responsável e histórico.
- Confirmar que nome, e-mail e telefone não aparecem publicamente.

## 4. Mapa
- Abrir o mapa com internet.
- Testar filtros de categoria, bairro e status.
- Conferir os pontos demonstrativos.
- Testar comportamento quando o mapa externo não carregar.

## 5. Indicadores
- Conferir totais por categoria, bairro, status e setor.
- Criar uma nova ocorrência e validar se os números mudam corretamente.

## 6. Painel administrativo demonstrativo
- Filtrar por protocolo, título, bairro, categoria e status.
- Alterar o status de uma ocorrência.
- Definir/editar o setor responsável.
- Inserir uma observação e conferir o histórico público.
- Exportar os dados demonstrativos.
- Testar restauração dos dados demo.

## 7. Responsividade e acessibilidade básica
- Testar largura pequena de celular.
- Conferir contraste e tamanho dos botões.
- Navegar com Tab no computador.
- Conferir textos alternativos das imagens.

## 8. Segurança e privacidade antes de produção
A versão atual ainda é um protótipo. Antes de uso real, validar:
- autenticação real no painel administrativo;
- autorização por perfil;
- backend e banco de dados seguros;
- limites de requisição;
- validação e moderação de imagens;
- política de privacidade e base legal para dados pessoais;
- logs de auditoria;
- proteção contra abuso e conteúdo impróprio.

## Critério mínimo para demonstração acadêmica
O projeto está pronto para demonstração quando registro, protocolo, acompanhamento, mapa, indicadores e painel administrativo funcionarem sem erros evidentes em celular e computador.

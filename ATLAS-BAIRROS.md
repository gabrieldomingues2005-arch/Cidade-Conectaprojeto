# Cidade Conecta — Atlas cívico de bairros

Versão: v5.5
Atualização: 24/09/2026

## Objetivo

O Atlas cívico cria uma camada de leitura por bairro sobre os registros públicos/demonstrativos do Cidade Conecta.

Rotas:
- `#/bairro`: diretório dos bairros presentes no conjunto.
- `#/bairro?nome=Centro`: perfil de um bairro.
- `#/mapa`: mapa geral com acesso ao Radar de cada bairro.

## O que o Radar mostra

- número de registros;
- registros abertos e resolvidos;
- quantidade com ponto cartográfico;
- categoria mais frequente;
- distribuição por categoria;
- distribuição por área pública de referência;
- registros recentes;
- pontos do bairro no mapa.

## Privacidade e precisão

O Radar não usa localização privada. Ele trabalha com o bairro público e coordenadas públicas aproximadas.

## Limites cartográficos

Não há desenho de polígonos de bairro na v5.5. O projeto não inventa contornos territoriais. Um limite só deve ser exibido quando houver vetor oficial confiável e versionado.

## Clustering

Em zoom amplo, o mapa agrupa pontos próximos em clusters próprios. O objetivo é:
- reduzir poluição visual;
- reduzir quantidade de elementos DOM;
- manter navegação fluida conforme o número de registros crescer.

O agrupamento pode ser desativado pelo usuário.

A lista textual permanece ao lado do mapa e deve continuar sendo a representação acessível/fallback dos mesmos registros.

## Acompanhamento local

O usuário pode salvar um bairro neste navegador. Os bairros salvos aparecem:
- em `Meus registros`;
- na busca global Ctrl/Cmd + K.

Nenhuma conta ou perfil é criado por esse recurso.

## Próximos passos

- avaliar clustering em canvas caso o volume passe a centenas/milhares de pontos;
- integrar polígonos oficiais de bairro somente se houver fonte vetorial municipal confiável;
- adicionar séries temporais apenas quando houver volume real suficiente para não sugerir conclusões estatísticas frágeis.

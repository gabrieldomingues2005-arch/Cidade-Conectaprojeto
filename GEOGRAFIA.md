# Geografia do Cidade Conecta — Piracicaba/SP

Este documento descreve como o protótipo usa informações territoriais de Piracicaba sem se apresentar como sistema oficial da Prefeitura.

## Escopo territorial

- Município: Piracicaba, São Paulo
- Código IBGE: `3538709`
- Centro de referência do mapa: `-22.7253, -47.6492`
- Base municipal resumida: `data/piracicaba.json`

## Fontes principais

1. **IBGE Cidades — Piracicaba**
   - população, área territorial, densidade demográfica e código do município;
   - https://www.ibge.gov.br/cidades-e-estados/sp/piracicaba.html

2. **API de Malhas Geográficas do IBGE**
   - usada pelo módulo `assets/piracicaba-mapas.js` para carregar dinamicamente o limite municipal;
   - endpoint usado pelo protótipo: `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/3538709?formato=application/vnd.geo%2Bjson&qualidade=minima`.

3. **Prefeitura de Piracicaba — Mapas do Município**
   - referência para bairros, zoneamento, estradas rurais, áreas de risco, parques lineares, ZEIS, distritos e equipamentos públicos;
   - https://piracicaba.sp.gov.br/servicos/mapas-do-municipio/

4. **Mapa das Regiões Administrativas — atualização 12/12/2024**
   - referência para as 9 regiões administrativas, população, área, densidade e bairros componentes;
   - https://piracicaba.sp.gov.br/wp-content/uploads/2024/12/MAPA-DAS-REGIOES-ADMINISTRATIVAS-FINAL.pdf

5. **Geoprocessamento de Piracicaba**
   - consulta cartográfica externa;
   - https://piracicaba.geopixel.com.br/geopixelcidades3/

## O que já está implementado

- mapa centrado em Piracicaba;
- limite municipal carregado via GeoJSON da API do IBGE;
- 9 regiões administrativas em base estruturada;
- associação de bairro com região quando o nome permite correspondência segura;
- tratamento de correspondências ambíguas, como áreas que aparecem em mais de uma região;
- localizador de bairro/região;
- população, área e densidade por região;
- núcleos urbanos isolados e áreas rurais de referência;
- municípios vizinhos;
- indicadores de ocorrências por região;
- taxa demonstrativa de ocorrências por 10 mil habitantes;
- sugestão de triagem por categoria;
- catálogo de camadas geográficas publicadas pelo Município;
- atalhos para mapas e serviços oficiais externos.

## Limites internos das regiões

O protótipo **não desenha polígonos aproximados das 9 regiões administrativas**. A divisão regional usada no sistema vem do mapa oficial municipal, mas os polígonos só devem ser incorporados quando houver uma camada vetorial adequada, identificada e validada para uso pela aplicação.

Essa decisão evita que um desenho aproximado seja confundido com limite oficial.

## Regra de localização

Para fins de demonstração, o nome do bairro informado pelo usuário é comparado com a lista de bairros da base territorial. Quando existe uma única correspondência, o sistema mostra a região administrativa. Quando existem múltiplas correspondências, o sistema avisa que é necessário confirmar o trecho no mapa oficial.

Em uma versão de produção, a região deverá ser determinada preferencialmente por **interseção espacial de coordenadas com polígonos oficiais**, e não somente pelo texto do bairro.

## Evolução recomendada

1. obter camada vetorial oficial dos bairros e das regiões administrativas;
2. validar sistema de referência e atributos;
3. converter para GeoJSON otimizado para web quando necessário;
4. implementar busca espacial ponto-em-polígono;
5. adicionar camadas de risco, drenagem, zoneamento e equipamentos públicos somente com fontes autorizadas/adequadas;
6. registrar data da fonte e versão de cada camada;
7. manter dados oficiais separados dos registros comunitários;
8. submeter o fluxo territorial à validação da Prefeitura antes de qualquer uso institucional.

## Aviso

Cidade Conecta é um projeto acadêmico independente. O uso de dados públicos, referências cartográficas, cores inspiradas na cidade e links oficiais não significa integração, aprovação, endosso ou operação pela Prefeitura Municipal de Piracicaba.

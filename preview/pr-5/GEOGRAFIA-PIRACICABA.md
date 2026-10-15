# Geografia de Piracicaba no Cidade Conecta

Este documento registra a origem, o uso e as limitações dos dados territoriais utilizados no protótipo Cidade Conecta.

## Município

- Município: Piracicaba — São Paulo
- Código IBGE: 3538709
- Área territorial: 1.377,173 km² (referência IBGE 2025)
- População no Censo 2022: 423.323 habitantes
- População estimada: 440.835 habitantes (referência IBGE 2025)
- Densidade demográfica: 307,19 hab/km² (referência IBGE 2022)

## Regiões administrativas

O protótipo utiliza a divisão em nove regiões administrativas publicada pela Prefeitura de Piracicaba no mapa atualizado em 12/12/2024.

| Região | População | Área (km²) | Densidade (hab/km²) | Bairros/áreas de referência |
| --- | ---: | ---: | ---: | --- |
| 1 | 61.859 | 10,68 | 5.792,04 | Centro, Cidade Alta, Cidade Jardim, Clube de Campo, Higienópolis, Jardim Elite, Nova América, Parque da Rua do Porto, São Dimas, São Judas, Vila Independência, Vila Monteiro |
| 2 | 36.982 | 37,99 | 973,47 | Água Santa, Algodoal, Areão, Capim Fino, Jardim Monumento, Nhô Quim, Nova Piracicaba, parte do Guamium, Santa Rosa, Vila Rezende |
| 3 | 28.526 | 16,38 | 1.741,51 | Corumbataí, Jardim Primavera, Mário Dedini, parte do Guamium, Vila Fátima, Vila Industrial |
| 4 | 60.002 | 27,94 | 2.147,53 | Itaperu, Parque Residencial Piracicaba, Santa Terezinha, Vale do Sol, Vila Sônia |
| 5 | 30.290 | 17,18 | 1.763,10 | Castelinho, Glebas Califórnia, Jupiá, Morato, Ondas, Ondinhas, Paulista |
| 6 | 46.321 | 5,83 | 7.945,28 | Bairro Verde, Jaraguá, Jardim Itapuã, Monte Líbano, Paulicéia, Vila Cristina |
| 7 | 38.043 | 28,57 | 1.331,57 | Água das Pedras, Campestre, Dona Antonia, Jardim Planalto, Novo Horizonte, Santa Helena, São Jorge |
| 8 | 58.099 | 32,85 | 1.768,61 | Água Branca, CECAP, Chicó, Jardim Califórnia, Jardim Caxambu, Pompéia, Taquaral |
| 9 | 42.210 | 54,01 | 781,52 | Agronomia, Cidade Judiciária, Conceição, Dois Córregos, Jardim Abaeté, Jardim São Francisco, Monte Alegre, Morumbi, Piracicamirim, Santa Cecília, Santa Rita, Unileste |

A soma das populações apresentadas no mapa das nove regiões é 402.332 habitantes. Esse número pertence à base territorial do mapa administrativo e não deve ser confundido com a população total ou estimada do município em outro ano de referência.

## Núcleos urbanos isolados e território rural

A base do protótipo mantém como referências: Anhumas, Ártemis, Ibitiruna, Tanquinho, Tupi, Santana/Santa Olímpia, Brisa da Serra, Canaã, Nova Suíça, Santa Ana, Terra Nova, Vila Belém, Uninorte e Santa Isabel.

No MVP esses nomes são apenas referência territorial. Não são desenhados limites oficiais próprios na aplicação.

## Camadas cartográficas relevantes

A página oficial “Mapas do Município” disponibiliza temas que podem ser incorporados futuramente ao Cidade Conecta, entre eles:

- bairros urbanos e rurais;
- estradas na área rural;
- zoneamento urbano e NUIs;
- parques lineares;
- áreas de risco associadas a enchentes, deslizamentos e solapamento;
- ZEIS;
- distritos;
- municípios vizinhos;
- evolução da mancha e do perímetro urbano;
- equipamentos de educação;
- equipamentos de saúde.

## Uso no Cidade Conecta

A base `data/piracicaba.json` alimenta a página `#/piracicaba`, os cards territoriais da página inicial, a identificação demonstrativa de região administrativa pelo nome do bairro e o agrupamento de ocorrências por região.

A identificação automática por texto é apenas uma ajuda de protótipo. Ela não substitui geocodificação ou cruzamento espacial com polígonos oficiais. Áreas divididas entre mais de uma região ou nomes informados de forma diferente podem exigir revisão manual.

## Próxima evolução geográfica

Para uma versão institucional, a forma mais segura é importar limites oficiais em GeoJSON ou consumir um serviço geográfico autorizado e atualizado. O fluxo ideal é:

1. obter camada oficial de bairros/regiões;
2. armazenar versão e data da fonte;
3. cruzar latitude/longitude da ocorrência com os polígonos;
4. manter localização pública aproximada e coordenada exata protegida quando necessário;
5. habilitar camadas temáticas de risco, zoneamento e equipamentos somente com fonte e licença claramente registradas;
6. validar o resultado com a área técnica municipal antes de uso operacional.

## Fontes principais

- IBGE Cidades — Piracicaba: https://www.ibge.gov.br/cidades-e-estados/sp/piracicaba.html
- Prefeitura de Piracicaba — Mapas do Município: https://piracicaba.sp.gov.br/servicos/mapas-do-municipio/
- Mapa das Regiões Administrativas (atualização 12/12/2024): https://piracicaba.sp.gov.br/wp-content/uploads/2024/12/MAPA-DAS-REGIOES-ADMINISTRATIVAS-FINAL.pdf
- Geoprocessamento Corporativo: https://geo.piracicaba.sp.gov.br/

## Aviso

O Cidade Conecta é um projeto acadêmico independente. O uso de referências territoriais e links da Prefeitura não significa integração oficial, endosso ou operação pela Prefeitura Municipal de Piracicaba.

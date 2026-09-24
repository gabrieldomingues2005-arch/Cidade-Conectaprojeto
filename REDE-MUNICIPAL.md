# Cidade Conecta — Rede Municipal de Referência

Atualização: 24/09/2026

## Objetivo

Este documento registra as referências públicas usadas pela v5.4 para associar as categorias do Cidade Conecta a secretarias, órgãos e setores relacionados.

**Importante:** o Cidade Conecta é um protótipo acadêmico independente. Esta matriz não realiza encaminhamento, despacho, protocolo municipal nem integração com a Prefeitura. Ela apenas orienta a leitura do problema com base em competências e serviços publicados oficialmente.

## Escala usada no protótipo

1. Entrada comunitária no Cidade Conecta.
2. Classificação por categoria e território.
3. Área pública de referência.
4. Setor ou serviço relacionado.
5. Canal oficial externo, quando necessário.

## Referências principais

### Administração e Governo / 156

A Secretaria Municipal de Administração e Governo possui competência de atendimento e informações à população. A Carta de Serviços descreve o 156 como canal municipal de recebimento e encaminhamento de solicitações.

- https://piracicaba.sp.gov.br/sobre-secretaria-municipal-de-administracao-e-governo/
- https://piracicaba.sp.gov.br/carta-de-servicos/
- https://sempapel.pmp.sp.gov.br/156/

### Obras, Infraestrutura e Serviços Públicos

Relacionada no MVP a vias, iluminação, drenagem, obras civis/acessibilidade física, áreas públicas e parte das competências de limpeza/resíduos.

- https://piracicaba.sp.gov.br/sobre-secretaria-municipal-de-obras-infraestrutura-e-servicos-publicos/
- https://piracicaba.sp.gov.br/entidade/secretaria-municipal-de-obras-infraestrutura-e-servicos-publicos/?assunto=rua-e-bairro&eixo=cidadao

### Agricultura, Abastecimento e Meio Ambiente

Relacionada a meio ambiente, arborização, infraestrutura rural e serviços de resíduos publicados no portal municipal.

- https://piracicaba.sp.gov.br/sobre-secretaria-municipal-de-agricultura-abastecimento-e-meio-ambiente/
- https://piracicaba.sp.gov.br/entidade/secretaria-municipal-de-agricultura-abastecimento-e-meio-ambiente/?assunto=rua-e-bairro&eixo=cidadao

### Segurança Pública, Trânsito e Transportes

Relacionada a engenharia de tráfego, sinalização, trânsito, transportes e Defesa Civil.

- https://piracicaba.sp.gov.br/sobre-secretaria-municipal-de-seguranca-publica-transito-e-transportes/
- https://piracicaba.sp.gov.br/entidade/secretaria-municipal-de-seguranca-publica-transito-e-transportes/

### SEMAE

Autarquia relacionada aos sistemas públicos de abastecimento de água e esgoto sanitário.

- https://piracicaba.sp.gov.br/sobre-servico-municipal-de-agua-e-esgoto-semae/

### Cidadania e Parcerias

Relacionada a direitos humanos, cidadania, participação social e articulação intersetorial. No MVP aparece como área relacionada à acessibilidade em sua dimensão de direitos, não como executora de obras físicas.

- https://piracicaba.sp.gov.br/sobre-secretaria-municipal-de-cidadania-e-parcerias/

## Estrutura oficial geral

O diretório geral de secretarias e outros órgãos deve ser consultado na fonte oficial:

- https://transparencia.piracicaba.sp.gov.br/secretarias/

## Regra de manutenção

Antes de alterar nomes de secretarias, contatos, competências, setores ou canais:
1. verificar novamente o portal oficial;
2. atualizar `data/municipal-network.json`;
3. atualizar este documento;
4. rodar `node scripts/validate-project.mjs`;
5. nunca transformar uma referência de competência em afirmação de parceria ou integração.

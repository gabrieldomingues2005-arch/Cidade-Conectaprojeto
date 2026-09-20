# Integração do update Manus — 20/09/2026

## Origem

Pacote enviado pelo usuário: `cidade-conecta-piracicaba(1).zip`.

O ZIP contém uma aplicação React/Vite com componentes próprios, incluindo Home, registro, mapa, dashboard, acompanhamento, painel administrativo demonstrativo, dados territoriais e design system.

## Decisão de integração

O GitHub principal continua sendo:

- `gabrieldomingues2005-arch/Cidade-Conectaprojeto`
- branch `main`

A aplicação do ZIP **não substitui a main**. Ela foi usada como referência de UI/UX porque a main atual já possui integrações de segurança e backend que o pacote Manus não preservava integralmente.

## Elementos aproveitados

- valorização do mapa como centro da experiência;
- uso de regiões administrativas como filtro territorial;
- categorias visuais;
- registro dividido conceitualmente em problema, localização e privacidade;
- dashboard com leitura mais clara;
- linguagem visual verde cívico + lima;
- abordagem mobile orientada a tarefas.

## Melhorias adicionais implementadas na v5.1

- marca gráfica nova e consistente;
- Home com mapa Leaflet real;
- categorias da Home abrem o formulário já selecionadas;
- medidor de completude do registro;
- prévia pública do conteúdo antes do envio;
- indicação visual de raio de privacidade da localização;
- compressão/otimização de fotos no navegador;
- mapa público com filtro por R1–R9;
- região derivada da base territorial existente, sem criar polígonos aproximados;
- dashboard reestruturado;
- barra mobile com quatro tarefas principais.

## Itens do Manus rejeitados ou reescritos

Não foram integrados diretamente:
- criação de protocolos somente por `localStorage`;
- atualização administrativa local como se fosse fluxo municipal real;
- textos de “despacho municipal”, “ordem de serviço” ou “transmitida para triagem municipal”;
- SLAs municipais não formalizados;
- afirmações de integração operacional com secretarias;
- migração integral para React sem preservar o backend atual.

Motivo: o Cidade Conecta continua sendo **protótipo acadêmico independente** e deve manter o backend seguro já construído com Supabase/RLS/Edge Functions.

## Regra para próximas alterações

Continuar incrementalmente na `main`. Não reintroduzir linguagem ou funcionalidades que façam o protótipo parecer um sistema oficial da Prefeitura sem parceria formal.


## Refinamento posterior — v5.2

Depois da integração inicial do pacote Manus, a experiência foi aprofundada diretamente na arquitetura oficial: prevenção de registros duplicados, lista assistida de bairros, acompanhamento rápido, detalhe de status mais explicativo, filtro de ocorrências abertas e refinamento de acessibilidade/navegação. Essas melhorias não dependem de créditos adicionais do Manus.

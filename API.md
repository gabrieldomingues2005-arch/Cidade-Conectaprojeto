# Cidade Conecta — API e backend v4.6

O backend Supabase do MVP já está ativo no projeto exclusivo `yvmkgpijzewssdxgimit`. Contratos implementados hoje:

- `POST /functions/v1/submit-occurrence` — cria ocorrência pendente e retorna `protocol` + `trackingKey`.
- `POST /functions/v1/track-occurrence` — acompanha ocorrência; registros pendentes exigem token privado.
- `GET /rest/v1/occurrences` — leitura pública via RLS somente para `public_visible=true` e `moderation_status=approved`.

A Edge Function de acompanhamento chama internamente a RPC `track_occurrence` com `service_role`; a RPC não possui EXECUTE para `anon`/`authenticated`. As rotas `/api/...` descritas abaixo permanecem como contrato futuro para uma camada dedicada.

O primeiro município do projeto é **Piracicaba/SP**, código IBGE `3538709`, mas a modelagem evita deixar o backend preso a um único município.

## Princípios

- Dados pessoais nunca devem ser retornados em endpoints públicos.
- Toda alteração administrativa deve ser autenticada e auditável.
- Fotos/anexos devem passar por validação e moderação antes de exposição pública.
- Localização pública deve ser aproximada quando necessário para preservar privacidade.
- Endereço e coordenadas exatas ficam em estrutura privada, separada dos dados públicos da ocorrência.
- O protocolo é o identificador amigável usado pelo cidadão para acompanhamento.
- Região administrativa só deve ser resolvida automaticamente por coordenada quando existir uma camada vetorial oficial/validada.
- Correspondências territoriais ambíguas devem retornar `ambiguous`; a API não deve escolher silenciosamente uma região.
- Dados oficiais de território e dados comunitários devem permanecer identificados e separados.

---

## Endpoints públicos de ocorrências

### POST /api/occurrences
Cria uma nova ocorrência.

Campos esperados:

```json
{
  "municipality_ibge_code": "3538709",
  "category": "vias",
  "title": "Buraco grande próximo ao cruzamento",
  "description": "Buraco na pista prejudicando a circulação.",
  "neighborhood": "Centro",
  "public_location": "Próximo ao cruzamento",
  "public_latitude": -22.725,
  "public_longitude": -47.649,
  "private_location": {
    "exact_address": "opcional e privado",
    "exact_latitude": -22.725321,
    "exact_longitude": -47.649217
  },
  "contact": {
    "name": "opcional e privado",
    "email": "opcional e privado",
    "phone": "opcional e privado"
  }
}
```

Regras:
- `category`, `title`, `description` e `neighborhood` são obrigatórios;
- coordenada pública deve respeitar a política de precisão definida pelo projeto;
- `private_location` e `contact` nunca fazem parte da resposta pública;
- bairro e região podem ser resolvidos pelo backend;
- se um nome de bairro corresponder a mais de uma região, o registro pode ser salvo com `territory_resolution_status=ambiguous` até revisão.

Resposta sugerida:

```json
{
  "protocol": "CC-2026-00001",
  "status": "Recebida",
  "territory": {
    "municipality": "Piracicaba",
    "region_id": 1,
    "resolution_status": "name-match"
  }
}
```

### GET /api/occurrences/{protocol}
Retorna somente informações públicas da ocorrência e seu histórico público.

Exemplo de bloco territorial público:

```json
{
  "municipality": {
    "name": "Piracicaba",
    "state": "SP",
    "ibge_code": "3538709"
  },
  "neighborhood": "Centro",
  "administrative_region": 1,
  "public_location": "Região central",
  "public_latitude": -22.725,
  "public_longitude": -47.649
}
```

Nunca retornar `exact_address`, `exact_latitude`, `exact_longitude`, nome, e-mail ou telefone neste endpoint.

### GET /api/occurrences
Lista ocorrências públicas aprovadas para mapa e indicadores.

Filtros planejados:
- `category`
- `status`
- `neighborhood`
- `region_id`
- `municipality_ibge_code`
- `from` / `to`
- `bbox=minLng,minLat,maxLng,maxLat`

Exemplo:

`GET /api/occurrences?municipality_ibge_code=3538709&region_id=4&status=Em%20andamento`

### GET /api/metrics
Retorna dados agregados, sem dados pessoais.

Filtros planejados:
- município;
- região administrativa;
- bairro;
- categoria;
- status;
- período.

Indicadores sugeridos:
- total de ocorrências;
- recebidas / em análise / encaminhadas / em andamento / resolvidas;
- taxa de resolução;
- ocorrências por categoria;
- ocorrências por bairro;
- ocorrências por região;
- ocorrências por 10 mil habitantes quando houver população de referência identificada;
- tempo médio/mediano até resolução quando houver dados suficientes.

---

## Endpoints territoriais

### GET /api/territory/municipalities/{ibgeCode}
Retorna os dados públicos do município usado pelo projeto.

Para Piracicaba:

`GET /api/territory/municipalities/3538709`

Resposta esperada inclui:
- nome;
- UF;
- código IBGE;
- centro cartográfico;
- área;
- população de referência;
- data/ano das fontes.

### GET /api/territory/municipalities/{ibgeCode}/regions
Lista regiões administrativas cadastradas.

Pode retornar:
- número/nome da região;
- população;
- área;
- densidade;
- quantidade de bairros associados;
- `boundary_status`.

### GET /api/territory/municipalities/{ibgeCode}/regions/{regionNumber}
Retorna detalhes públicos de uma região e os bairros associados.

### GET /api/territory/municipalities/{ibgeCode}/neighborhoods
Busca/lista bairros e núcleos territoriais.

Parâmetros:
- `q`: busca textual;
- `kind`: `urban`, `rural`, `isolated_nucleus` ou `other`;
- `region_id`: filtro opcional.

### GET /api/territory/resolve
Resolve o contexto territorial de um registro.

Modo por nome:

`GET /api/territory/resolve?municipality_ibge_code=3538709&neighborhood=Centro`

Resposta possível:

```json
{
  "resolution_status": "name-match",
  "matches": [
    {"region_id": 1, "neighborhood": "Centro"}
  ]
}
```

Resposta ambígua:

```json
{
  "resolution_status": "ambiguous",
  "matches": [
    {"region_id": 2, "neighborhood": "Parte do Guamium"},
    {"region_id": 3, "neighborhood": "Parte do Guamium"}
  ]
}
```

Modo futuro por coordenada:

`GET /api/territory/resolve?municipality_ibge_code=3538709&lat=-22.72&lng=-47.64`

Esse modo só deve retornar `coordinate-match` quando a camada vetorial da região/bairro tiver origem e versão validadas.

### GET /api/territory/municipalities/{ibgeCode}/sources
Retorna metadados das fontes territoriais utilizadas: IBGE, mapas municipais, GeoJSON e geoprocessamento.

---

## Endpoints administrativos

Todos exigem autenticação e perfil autorizado.

### GET /api/admin/occurrences
Lista ocorrências para triagem.

Filtros adicionais recomendados:
- região;
- bairro;
- categoria;
- setor responsável;
- status de moderação;
- status de resolução territorial.

### GET /api/admin/occurrences/{id}
Retorna visão administrativa completa, respeitando permissões, podendo incluir dados privados necessários ao atendimento.

### PATCH /api/admin/occurrences/{id}
Permite atualizar:
- status;
- setor responsável;
- prioridade;
- região após revisão manual;
- status de resolução territorial;
- visibilidade/moderação.

Toda alteração deve gerar auditoria.

### POST /api/admin/occurrences/{id}/history
Adiciona uma atualização ao histórico.

Campos sugeridos:

```json
{
  "status": "Em andamento",
  "note": "Encaminhada para avaliação técnica.",
  "public_note": true
}
```

### POST /api/admin/occurrences/{id}/attachments/{attachmentId}/moderation
Aprova ou rejeita um anexo.

### PATCH /api/admin/occurrences/{id}/territory
Permite correção territorial manual por usuário autorizado.

Exemplo:

```json
{
  "administrative_region_id": "uuid-da-regiao",
  "neighborhood_id": "uuid-do-bairro",
  "resolution_status": "manual-reviewed",
  "note": "Trecho conferido na base cartográfica oficial."
}
```

---

## Perfis de acesso

- `citizen`: cria e acompanha ocorrências próprias quando autenticado;
- `triage`: realiza triagem, revisão territorial e encaminhamento;
- `agency`: acompanha e atualiza ocorrências atribuídas ao setor;
- `admin`: administração geral, configuração e auditoria.

## Segurança e privacidade

Antes de produção:
- autenticação forte e autorização por perfil;
- rate limiting;
- validação de entrada no backend;
- proteção CSRF/CORS conforme arquitetura;
- logs de auditoria;
- política de retenção;
- antivírus/validação de anexos;
- moderação de imagens e textos;
- não expor coordenada exata em endpoints públicos;
- não confiar no `region_id` enviado pelo navegador sem validação;
- versionar fontes territoriais;
- proteger endpoints administrativos e tabelas privadas.

## Próxima implementação

1. Escolher/implantar backend real.
2. Conectar PostgreSQL usando `schema.sql` como base de revisão.
3. Criar seed controlado de Piracicaba a partir de `data/piracicaba.json`.
4. Implementar autenticação e autorização por perfil.
5. Migrar o front-end de `localStorage` para chamadas HTTP.
6. Implementar upload seguro de anexos.
7. Implementar endpoints territoriais.
8. Importar polígonos oficiais de regiões/bairros somente quando houver fonte vetorial validada.
9. Implementar busca ponto-em-polígono no backend quando a geometria estiver disponível.
10. Adicionar logs de auditoria, rate limit, testes e monitoramento.


## Segurança implementada no MVP v4.6

- contato em `occurrence_contacts`;
- localização exata em `occurrence_private_location`;
- coordenadas públicas arredondadas para 3 casas;
- token de acompanhamento armazenado somente como hash;
- rate limiting de submissão e acompanhamento;
- validação de JPG/PNG/WebP por MIME, tamanho e assinatura binária;
- bloqueio de e-mail, telefone e CPF no título/descrição pública;
- RLS e moderação pendente antes da exposição pública.

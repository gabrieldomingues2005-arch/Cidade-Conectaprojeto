# Cidade Conecta — Contrato de API proposto

Este documento define uma primeira versão da API para substituir o armazenamento local do protótipo por um backend real. Ainda não é uma API em produção.

## Princípios

- Dados pessoais nunca devem ser retornados em endpoints públicos.
- Toda alteração administrativa deve ser autenticada e auditável.
- Fotos/anexos devem passar por validação e moderação antes de exposição pública.
- Localização pública deve ser aproximada quando necessário para preservar privacidade.
- O protocolo é o identificador amigável usado pelo cidadão para acompanhamento.

## Endpoints públicos

### POST /api/occurrences
Cria uma nova ocorrência.

Campos esperados:
- category
- title
- description
- neighborhood
- public_location
- exact_address (privado/opcional)
- latitude / longitude (opcionais)
- citizen_name / citizen_email / citizen_phone (privados/opcionais conforme política)

Resposta sugerida:
```json
{
  "protocol": "CC-2026-00001",
  "status": "Recebida"
}
```

### GET /api/occurrences/{protocol}
Retorna somente informações públicas da ocorrência e seu histórico público.

### GET /api/occurrences
Lista ocorrências públicas aprovadas para mapa e indicadores. Deve aceitar filtros por categoria, bairro e status.

### GET /api/metrics
Retorna dados agregados para o dashboard, sem dados pessoais.

## Endpoints administrativos

Todos exigem autenticação e perfil autorizado.

### GET /api/admin/occurrences
Lista ocorrências para triagem.

### PATCH /api/admin/occurrences/{id}
Permite atualizar status, setor responsável, prioridade e dados administrativos.

### POST /api/admin/occurrences/{id}/history
Adiciona uma atualização ao histórico.

### POST /api/admin/occurrences/{id}/attachments/{attachmentId}/moderation
Aprova ou rejeita um anexo.

## Perfis de acesso

- citizen: cria e acompanha ocorrências próprias quando autenticado.
- triage: realiza triagem e encaminhamento.
- agency: acompanha e atualiza ocorrências atribuídas ao setor.
- admin: administração geral.

## Próxima implementação

1. Criar backend real.
2. Conectar PostgreSQL.
3. Implementar autenticação e autorização por perfil.
4. Migrar o front-end de localStorage para chamadas HTTP.
5. Implementar upload seguro de anexos.
6. Adicionar logs de auditoria, rate limit e validação de entrada.

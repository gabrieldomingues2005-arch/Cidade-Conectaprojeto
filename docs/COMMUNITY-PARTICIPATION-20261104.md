# Participação comunitária — 4 de novembro de 2026

Projeto exclusivo: `qzpofoxxrjunyayczcfu` (Cidade Conecta v2, sa-east-1).

## Implementação

- Edge `community-actions`, versão 1, ACTIVE, `verify_jwt=true`.
- RPC `community_participation_internal` executável somente por `service_role`.
- Três tabelas no schema privado com RLS e sem políticas de cliente. Nenhum contato, endereço ou coordenada é armazenado nessa funcionalidade.
- Recorrência idempotente por ocorrência + hash HMAC de identificador aleatório do aparelho. Limpar armazenamento permite novo identificador; o contador não representa pessoas verificadas.
- Avaliação opcional Sim / Parcialmente / Não, nota opcional 1–5, uma resposta atualizável por ocorrência. Exige resolução e o código privado de acompanhamento validado pelo hash existente.
- Respostas individuais são privadas. Agregados de satisfação exigem cinco ocorrências respondidas; média de notas exige cinco notas.
- Limite de 30 chamadas por minuto por fingerprint HMAC da origem de rede. A Edge aceita apenas corpo de até 2.048 bytes, inclusive em streaming; timeout de oito segundos; CORS restrito e respostas `no-store`.
- Auditoria registra participação nova e alteração da avaliação sem copiar código privado, identificador do aparelho ou resposta para o log público.

## Migrations aplicadas

`20261105004226_community_participation.sql` e `20261105004551_community_private_schema_hardening.sql`.

A primeira foi criada pelo CLI e alinhada à versão registrada pelo conector nativo. A segunda usa a versão atribuída pelo próprio conector. O CLI tentou telemetria para `eu.i.posthog.com` e sua execução foi bloqueada pela revisão automática. Nenhuma repetição ou contorno dessa execução foi usado; aplicação e publicação ocorreram pelas operações nativas do Supabase.

## QA executado

`scripts/qa-community.sql`: PASS após endurecimento de permissões. Verificou leitura inicial, deduplicação, proibição de avaliação antes da resolução, recusa de código incorreto, avaliação privada válida, supressão de agregado pequeno, auditoria, limite e privilégios anon / authenticated / service_role. A transação foi revertida. O gerador de protocolos pode apresentar lacunas normais de sequência; não ficaram ocorrências ou avaliações dessa execução no banco.

O teste encontrou `USAGE` excedente de authenticated no schema private; não havia SELECT nas tabelas. A segunda migration removeu esse privilégio. Todos os RPCs existentes que referenciam private são SECURITY DEFINER; o fluxo de Auth permanece inalterado.

HTTP real: requisição com chave pública ao registro pendente retorna 404; campos inválidos e array retornam 400; origem não permitida retorna 403; RPC interno direto por anon retorna 401; Admin por anon retorna 401; leitura de localização privada, perfis e auditoria por anon retorna 401. Uma chave publishable válida pode ser reconhecida pelo gateway sem Bearer; a participação pública não exige login e o código privado continua obrigatório para avaliação.

## Rollback lógico

Desabilitar a interface de participação e a Edge `community-actions`; revogar EXECUTE do novo RPC de service_role se necessário. Preservar as tabelas e a auditoria para revisão. Não apagar histórico ou reverter o endurecimento do schema privado. Nenhuma migration antiga foi modificada.

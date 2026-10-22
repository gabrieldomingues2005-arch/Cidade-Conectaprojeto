# QA real — Cidade Conecta v2

Data: 22/10/2026  
Projeto Supabase: `qzpofoxxrjunyayczcfu`  
Região: `sa-east-1`

## Resultado

Fluxo real validado contra o backend novo:

- submissão anônima pela Edge Function `submit-occurrence`: PASS;
- protocolo real gerado: `CC-2026-01001`;
- ocorrência criada inicialmente como `pending`: PASS;
- tracking com token privado enquanto pendente: PASS;
- ocorrência pendente não exposta pela leitura pública REST: PASS;
- Admin sem sessão: HTTP 401, PASS;
- localização pública arredondada para aproximadamente 3 casas decimais: PASS;
- localização exata armazenada separadamente: PASS;
- tracking token e histórico inicial criados: PASS;
- após aprovação controlada, ocorrência exposta pela leitura pública REST: PASS;
- tracking público sem token após aprovação: HTTP 200, PASS;
- `anon` bloqueado em `occurrence_private_location`: HTTP 401, PASS;
- `anon` bloqueado em `users_profile`: HTTP 401, PASS;
- `anon` bloqueado em `audit_log`: HTTP 401, PASS.

## Limpeza

A ocorrência de QA foi removida após os testes.

Contagens finais:
- ocorrências: 0;
- localizações privadas: 0;
- histórico de ocorrência: 0;
- tracking tokens: 0;
- audit rows de QA: 0;
- submission rate-limit rows de QA: 0;
- tracking rate-limit rows de QA: 0.

Nenhum usuário Auth permanente foi criado nesta rodada.

## Admin

O endpoint interno foi validado ao vivo no gate de acesso anônimo (401).
O caminho autorizado com papel `triage`/`admin` deve ser testado quando o primeiro usuário interno real for criado, para evitar criar credenciais artificiais permanentes apenas para QA.

## Observações

- o teste usou o mesmo endpoint HTTP das Edge Functions usado pelo frontend;
- a leitura pública foi validada pelo Data API/REST real, não apenas por SQL;
- os workflows temporários usados no QA foram removidos após a execução;
- nenhuma alteração foi feita no projeto Raiz Carbon.

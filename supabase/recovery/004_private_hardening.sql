-- Cidade Conecta — hardening adicional do schema private
-- Aplicar DEPOIS das migrations de submissão e tracking, que criam as tabelas.

alter table private.occurrence_tracking_tokens enable row level security;
alter table private.submission_rate_limits enable row level security;
alter table private.tracking_rate_limits enable row level security;

revoke all on table private.occurrence_tracking_tokens from public, anon, authenticated;
revoke all on table private.submission_rate_limits from public, anon, authenticated;
revoke all on table private.tracking_rate_limits from public, anon, authenticated;

-- service_role continua acessando as tabelas pelo backend.
grant all on table private.occurrence_tracking_tokens to service_role;
grant all on table private.submission_rate_limits to service_role;
grant all on table private.tracking_rate_limits to service_role;

comment on table private.occurrence_tracking_tokens is 'Hashes de tokens de acompanhamento. Sem acesso direto do cliente.';
comment on table private.submission_rate_limits is 'Controle interno de abuso da Edge Function de submissão.';
comment on table private.tracking_rate_limits is 'Controle interno de abuso da Edge Function de acompanhamento.';

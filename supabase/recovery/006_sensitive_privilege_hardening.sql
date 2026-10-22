-- Cidade Conecta v2 — defesa em profundidade para tabelas sensíveis.
-- RLS já protege as linhas; estes REVOKEs removem também o privilégio de tabela do papel anon.

revoke all on table public.users_profile from anon;
revoke all on table public.occurrence_private_location from anon;
revoke all on table public.occurrence_attachments from anon;
revoke all on table public.audit_log from anon;
revoke all on table public.occurrence_contacts from anon;

-- authenticated recebe apenas SELECT nas tabelas que possuem policies próprias.
revoke insert, update, delete on table public.occurrence_private_location from authenticated;
revoke insert, update, delete on table public.occurrence_attachments from authenticated;
revoke insert, update, delete on table public.audit_log from authenticated;
revoke insert, update, delete on table public.occurrence_contacts from authenticated;

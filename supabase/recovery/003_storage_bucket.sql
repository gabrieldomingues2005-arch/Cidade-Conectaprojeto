-- Cidade Conecta — configuração de Storage para recuperação
-- Usa as tabelas gerenciadas pelo Supabase; NÃO recria schema/tabelas storage.

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
) values (
  'occurrence-attachments',
  'occurrence-attachments',
  false,
  1572864,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- O frontend atual NÃO faz upload direto ao Storage.
-- submit-occurrence usa service_role no backend e grava metadados em
-- public.occurrence_attachments. Por segurança, não concedemos INSERT/UPDATE/
-- DELETE direto em storage.objects para anon/authenticated nesta baseline.
--
-- Se no futuro houver upload direto autenticado, criar políticas específicas
-- por ocorrência/proprietário em migration separada e testar rollback/RLS.

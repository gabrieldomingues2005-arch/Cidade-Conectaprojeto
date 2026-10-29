-- Cidade Conecta v2 — modelo explícito de privilégios públicos.
-- Corrige TRUNCATE/REFERENCES/TRIGGER herdados por anon/authenticated e
-- impede que novas tabelas/funções/sequences sejam autoexpostas.

-- Zera a superfície atual dos papéis de cliente.
revoke all privileges on all tables in schema public from anon;
revoke all privileges on all tables in schema public from authenticated;
revoke all privileges on all sequences in schema public from anon;
revoke all privileges on all sequences in schema public from authenticated;

-- Catálogo e dados públicos: somente leitura, sempre sujeitos a RLS.
grant select on table
  public.municipalities,
  public.territorial_sources,
  public.administrative_regions,
  public.neighborhoods,
  public.neighborhood_regions,
  public.categories,
  public.occurrences,
  public.occurrence_history
to anon;

-- Usuário autenticado: mesma leitura pública + leitura privada controlada por RLS.
grant select on table
  public.municipalities,
  public.territorial_sources,
  public.administrative_regions,
  public.neighborhoods,
  public.neighborhood_regions,
  public.categories,
  public.occurrences,
  public.occurrence_history,
  public.users_profile,
  public.occurrence_private_location,
  public.occurrence_attachments,
  public.audit_log,
  public.occurrence_contacts
to authenticated;

-- Perfil do próprio usuário é o único UPDATE direto do cliente e continua sob RLS.
grant update on table public.users_profile to authenticated;

-- Funções em public não são APIs implícitas para clientes.
-- RPCs internos necessários ao backend possuem grants explícitos para service_role
-- nas migrations específicas.
revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon;
revoke execute on all functions in schema public from authenticated;

-- Evita reincidência em objetos futuros criados pelo owner padrão do projeto.
alter default privileges for role postgres in schema public
  revoke all on tables from anon;
alter default privileges for role postgres in schema public
  revoke all on tables from authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon;
alter default privileges for role postgres in schema public
  revoke all on sequences from authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon;
alter default privileges for role postgres in schema public
  revoke execute on functions from authenticated;

-- Reafirma os dois helpers privados necessários às policies autenticadas.
grant usage on schema private to authenticated, service_role;
grant execute on function private.current_profile_id() to authenticated, service_role;
grant execute on function private.is_staff() to authenticated, service_role;

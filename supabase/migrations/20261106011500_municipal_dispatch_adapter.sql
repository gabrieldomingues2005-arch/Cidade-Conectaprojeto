-- Cidade Conecta — adaptador municipal fail-closed.
-- Expõe ao service_role apenas leitura/atualização controlada da outbox privada.
create or replace function public.service_get_municipal_dispatch(p_id uuid)
returns table(
  id uuid,
  occurrence_id uuid,
  action text,
  adapter_key text,
  payload jsonb,
  status text,
  attempt_count integer,
  last_error text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security invoker
set search_path = pg_catalog, public, private
as $$
  select x.id,x.occurrence_id,x.action,x.adapter_key,x.payload,x.status,x.attempt_count,x.last_error,x.created_by,x.created_at,x.updated_at
  from private.municipal_integration_outbox x
  where x.id=p_id
  limit 1
$$;

create or replace function public.service_update_municipal_dispatch(
  p_id uuid,
  p_status text,
  p_last_error text default null
)
returns table(id uuid,status text,attempt_count integer,last_error text,updated_at timestamptz)
language plpgsql
security invoker
set search_path = pg_catalog, public, private
as $$
begin
  if p_status not in ('disabled','pending','sent','failed') then
    raise exception 'invalid dispatch status';
  end if;
  return query
  update private.municipal_integration_outbox x
     set status=p_status,
         attempt_count=x.attempt_count+1,
         last_error=case when p_last_error is null then null else left(p_last_error,500) end,
         updated_at=now()
   where x.id=p_id
   returning x.id,x.status,x.attempt_count,x.last_error,x.updated_at;
end;
$$;

revoke all on function public.service_get_municipal_dispatch(uuid) from public,anon,authenticated;
revoke all on function public.service_update_municipal_dispatch(uuid,text,text) from public,anon,authenticated;
grant execute on function public.service_get_municipal_dispatch(uuid) to service_role;
grant execute on function public.service_update_municipal_dispatch(uuid,text,text) to service_role;

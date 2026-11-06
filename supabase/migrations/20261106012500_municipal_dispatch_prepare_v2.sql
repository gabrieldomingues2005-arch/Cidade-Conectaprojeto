create or replace function public.service_prepare_municipal_outbox_v2(
  p_occurrence_id uuid,
  p_action text,
  p_payload jsonb,
  p_created_by uuid,
  p_adapter_key text
)
returns table(id uuid,status text,adapter_key text,created_at timestamptz)
language plpgsql
security invoker
set search_path = pg_catalog, public, private
as $$
begin
  if p_adapter_key not in ('unconfigured','official-http') then
    raise exception 'invalid adapter key';
  end if;
  return query
  insert into private.municipal_integration_outbox(occurrence_id,action,adapter_key,payload,status,created_by)
  values(p_occurrence_id,left(p_action,80),p_adapter_key,coalesce(p_payload,'{}'::jsonb),'disabled',p_created_by)
  returning municipal_integration_outbox.id,municipal_integration_outbox.status,municipal_integration_outbox.adapter_key,municipal_integration_outbox.created_at;
end;
$$;
revoke all on function public.service_prepare_municipal_outbox_v2(uuid,text,jsonb,uuid,text) from public,anon,authenticated;
grant execute on function public.service_prepare_municipal_outbox_v2(uuid,text,jsonb,uuid,text) to service_role;

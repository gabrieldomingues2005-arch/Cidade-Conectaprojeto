-- Move o acesso de acompanhamento público para uma Edge Function, eliminando execução anônima direta de SECURITY DEFINER.
create table if not exists private.tracking_rate_limits (
  fingerprint_hash text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  last_request_at timestamptz,
  updated_at timestamptz not null default now()
);

create or replace function public.consume_tracking_quota(p_fingerprint_hash text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_row private.tracking_rate_limits%rowtype;
  v_limit constant integer := 30;
  v_window constant interval := interval '5 minutes';
  v_min_interval constant interval := interval '1 second';
  v_retry integer := 0;
  v_remaining integer := 0;
begin
  if p_fingerprint_hash is null or char_length(trim(p_fingerprint_hash)) < 32 then
    raise exception 'invalid_fingerprint';
  end if;

  insert into private.tracking_rate_limits (fingerprint_hash, window_started_at, request_count, last_request_at, updated_at)
  values (p_fingerprint_hash, v_now, 0, null, v_now)
  on conflict (fingerprint_hash) do nothing;

  select * into v_row
  from private.tracking_rate_limits
  where fingerprint_hash = p_fingerprint_hash
  for update;

  if v_now - v_row.window_started_at >= v_window then
    update private.tracking_rate_limits
       set window_started_at = v_now,
           request_count = 1,
           last_request_at = v_now,
           updated_at = v_now
     where fingerprint_hash = p_fingerprint_hash;
    return jsonb_build_object('allowed', true, 'remaining', v_limit - 1, 'retry_after_seconds', 0);
  end if;

  if v_row.last_request_at is not null and v_now - v_row.last_request_at < v_min_interval then
    v_retry := greatest(1, ceil(extract(epoch from (v_min_interval - (v_now - v_row.last_request_at))))::integer);
    v_remaining := greatest(0, v_limit - v_row.request_count);
    return jsonb_build_object('allowed', false, 'remaining', v_remaining, 'retry_after_seconds', v_retry);
  end if;

  if v_row.request_count >= v_limit then
    v_retry := greatest(1, ceil(extract(epoch from ((v_row.window_started_at + v_window) - v_now)))::integer);
    return jsonb_build_object('allowed', false, 'remaining', 0, 'retry_after_seconds', v_retry);
  end if;

  update private.tracking_rate_limits
     set request_count = request_count + 1,
         last_request_at = v_now,
         updated_at = v_now
   where fingerprint_hash = p_fingerprint_hash
   returning greatest(0, v_limit - request_count) into v_remaining;

  return jsonb_build_object('allowed', true, 'remaining', v_remaining, 'retry_after_seconds', 0);
end;
$$;

revoke all on function public.track_occurrence(text,text) from public, anon, authenticated;
grant execute on function public.track_occurrence(text,text) to service_role;

revoke all on function public.consume_tracking_quota(text) from public, anon, authenticated;
grant execute on function public.consume_tracking_quota(text) to service_role;

comment on function public.track_occurrence(text,text) is 'RPC interna chamada pela Edge Function track-occurrence. Não expor diretamente a anon/authenticated.';
comment on function public.consume_tracking_quota(text) is 'Rate limiting interno da Edge Function track-occurrence.';

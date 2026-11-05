-- Additive participation. Existing occurrence, tracking, Auth and Storage contracts stay intact.
-- Logical rollback: disable community-actions and its UI. Keep participation/audit rows for review.
begin;
create table private.community_participation (
 occurrence_id uuid not null references public.occurrences(id),
 device_hash text not null check (device_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now(),
 primary key (occurrence_id,device_hash)
);
create table private.community_feedback (
 occurrence_id uuid primary key references public.occurrences(id),
 resolution text not null check (resolution in ('yes','partial','no')),
 rating smallint check (rating between 1 and 5),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table private.community_rate_limits (
 fingerprint_hash text not null check (fingerprint_hash ~ '^[a-f0-9]{64}$'),
 window_start timestamptz not null,
 attempts integer not null default 1,
 primary key (fingerprint_hash,window_start)
);
create index community_rate_limits_window_idx on private.community_rate_limits(window_start);
alter table private.community_participation enable row level security;
alter table private.community_feedback enable row level security;
alter table private.community_rate_limits enable row level security;
revoke all on private.community_participation,private.community_feedback,private.community_rate_limits from public,anon,authenticated;
grant all on private.community_participation,private.community_feedback,private.community_rate_limits to service_role;
comment on table private.community_participation is 'Anonymous community impact signals, deduplicated per device hash. No client table access; not verified unique people.';
comment on table private.community_feedback is 'Optional resolution feedback, one response per occurrence, validated by the existing private tracking key. No public individual response.';
create function public.community_participation_internal(
 p_action text,p_protocol text,p_device_hash text,p_fingerprint_hash text,
 p_resolution text default null,p_rating integer default null,p_tracking_key text default null
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_occ public.occurrences%rowtype;
 v_attempts integer;
 v_count integer;
 v_created integer;
 v_feedback_count integer;
 v_satisfaction jsonb;
 v_owner boolean := false;
begin
 if p_action not in ('read','recurrence','feedback') or p_protocol !~ '^CC-[0-9]{4}-[0-9]{5}$'
    or p_device_hash !~ '^[a-f0-9]{64}$' or p_fingerprint_hash !~ '^[a-f0-9]{64}$'
    or p_action is null or p_protocol is null or p_device_hash is null or p_fingerprint_hash is null then
  return jsonb_build_object('error','invalid_fields');
 end if;
 delete from private.community_rate_limits where window_start < now()-interval '1 day';
 insert into private.community_rate_limits(fingerprint_hash,window_start) values(p_fingerprint_hash,date_trunc('minute',now()))
 on conflict(fingerprint_hash,window_start) do update set attempts=private.community_rate_limits.attempts+1
 returning attempts into v_attempts;
 if v_attempts>30 then return jsonb_build_object('error','rate_limited','retryAfterSeconds',60); end if;
 select * into v_occ from public.occurrences where protocol=p_protocol and public_visible and moderation_status='approved';
 if not found then return jsonb_build_object('error','not_found'); end if;
 if p_tracking_key is not null and length(p_tracking_key) between 20 and 200 then
  select exists(select 1 from private.occurrence_tracking_tokens t where t.occurrence_id=v_occ.id and t.token_hash=extensions.digest(trim(p_tracking_key),'sha256')) into v_owner;
 end if;
 if p_action='recurrence' then
  insert into private.community_participation(occurrence_id,device_hash) values(v_occ.id,p_device_hash) on conflict do nothing;
  get diagnostics v_created = row_count;
  if v_created=1 then insert into public.audit_log(action,entity_type,entity_id,metadata) values('community_recurrence','occurrence',v_occ.id,'{"source":"community-actions"}'::jsonb); end if;
 elsif p_action='feedback' then
  if v_occ.status<>'Resolvida' then return jsonb_build_object('error','not_resolved'); end if;
  if not v_owner then return jsonb_build_object('error','tracking_required'); end if;
  if p_resolution is null or p_resolution not in ('yes','partial','no') or (p_rating is not null and p_rating not between 1 and 5) then return jsonb_build_object('error','invalid_feedback'); end if;
  insert into private.community_feedback(occurrence_id,resolution,rating) values(v_occ.id,p_resolution,p_rating)
   on conflict(occurrence_id) do update set resolution=excluded.resolution,rating=excluded.rating,updated_at=now();
  insert into public.audit_log(action,entity_type,entity_id,metadata) values('community_feedback','occurrence',v_occ.id,'{"source":"community-actions","private":true}'::jsonb);
 end if;
 select count(*) into v_count from private.community_participation where occurrence_id=v_occ.id;
 select count(*) into v_feedback_count from private.community_feedback f join public.occurrences o on o.id=f.occurrence_id where o.public_visible and o.moderation_status='approved' and o.status='Resolvida';
 if v_feedback_count>=5 then
  select jsonb_build_object('base',count(*),'yes',count(*) filter(where resolution='yes'),'partial',count(*) filter(where resolution='partial'),'no',count(*) filter(where resolution='no'),'ratingBase',count(rating),'meanRating',case when count(rating)>=5 then round(avg(rating),1) else null end)
   into v_satisfaction from private.community_feedback f join public.occurrences o on o.id=f.occurrence_id where o.public_visible and o.moderation_status='approved' and o.status='Resolvida';
 end if;
 return jsonb_build_object('protocol',v_occ.protocol,'recurrenceCount',v_count,'registered',exists(select 1 from private.community_participation where occurrence_id=v_occ.id and device_hash=p_device_hash),'feedbackSaved',p_action='feedback','canGiveFeedback',v_owner and v_occ.status='Resolvida','myResolution',case when v_owner then (select resolution from private.community_feedback where occurrence_id=v_occ.id) else null end,'satisfaction',v_satisfaction);
end;
$$;
revoke all on function public.community_participation_internal(text,text,text,text,text,integer,text) from public,anon,authenticated;
grant execute on function public.community_participation_internal(text,text,text,text,text,integer,text) to service_role;
commit;

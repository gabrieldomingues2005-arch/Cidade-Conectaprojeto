-- Cidade Conecta Piracicaba — camada operacional cívica v8
-- Conta cidadã opcional, notificações persistentes, editor, antes/depois,
-- outbox municipal desativado por padrão e observabilidade agregada.

create table if not exists public.citizen_preferences (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  sync_enabled boolean not null default true,
  notify_occurrences boolean not null default true,
  notify_neighborhoods boolean not null default true,
  digest_frequency text not null default 'none'
    check (digest_frequency = any (array['none','daily','weekly'])),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(display_name) <= 80)
);

create table if not exists public.citizen_occurrence_follows (
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  protocol text not null references public.occurrences(protocol) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (auth_user_id, protocol)
);

create table if not exists public.citizen_favorite_neighborhoods (
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  neighborhood_label text not null,
  created_at timestamptz not null default now(),
  primary key (auth_user_id, neighborhood_label),
  check (char_length(neighborhood_label) between 1 and 100)
);

create table if not exists public.citizen_notifications (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null,
  type text not null check (type = any (array['occurrence_update','occurrence_resolved','neighborhood_update','system'])),
  protocol text references public.occurrences(protocol) on delete cascade,
  neighborhood_label text,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (auth_user_id,event_key),
  check (char_length(event_key) <= 180),
  check (char_length(title) <= 160),
  check (char_length(body) <= 500)
);

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  body text not null default '',
  category text not null default 'cidade-conecta',
  status text not null default 'draft' check (status = any (array['draft','published','archived'])),
  featured boolean not null default false,
  cover_protocol text references public.occurrences(protocol) on delete set null,
  created_by uuid references public.users_profile(id) on delete set null,
  updated_by uuid references public.users_profile(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (char_length(slug) between 3 and 120),
  check (char_length(title) between 3 and 160),
  check (char_length(summary) <= 500),
  check (char_length(body) <= 20000),
  check (char_length(category) <= 60)
);

create table if not exists public.occurrence_resolution_media (
  protocol text primary key references public.occurrences(protocol) on delete cascade,
  storage_key text not null unique,
  mime_type text not null check (mime_type = any (array['image/jpeg','image/png','image/webp'])),
  alt_text text not null default '',
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (storage_key ~ '^CC-[0-9]{4}-[0-9]{5}/resolution/[0-9a-f-]{36}\.(jpg|png|webp)$'),
  check (char_length(alt_text) <= 180)
);

create table if not exists private.municipal_integration_outbox (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.occurrences(id) on delete cascade,
  action text not null,
  adapter_key text not null default 'unconfigured',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'disabled' check (status = any (array['disabled','pending','sent','failed'])),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text,
  created_by uuid references public.users_profile(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(action) <= 80),
  check (char_length(adapter_key) <= 80),
  check (last_error is null or char_length(last_error) <= 500)
);

create table if not exists private.ops_health_events (
  id uuid primary key default gen_random_uuid(),
  component text not null,
  status text not null check (status = any (array['ok','degraded','error'])),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (char_length(component) <= 80)
);

alter table public.citizen_preferences enable row level security;
alter table public.citizen_occurrence_follows enable row level security;
alter table public.citizen_favorite_neighborhoods enable row level security;
alter table public.citizen_notifications enable row level security;
alter table public.news_posts enable row level security;
alter table public.occurrence_resolution_media enable row level security;
alter table private.municipal_integration_outbox enable row level security;
alter table private.ops_health_events enable row level security;

revoke all on public.citizen_preferences from public,anon,authenticated;
revoke all on public.citizen_occurrence_follows from public,anon,authenticated;
revoke all on public.citizen_favorite_neighborhoods from public,anon,authenticated;
revoke all on public.citizen_notifications from public,anon,authenticated;
revoke all on public.news_posts from public,anon,authenticated;
revoke all on public.occurrence_resolution_media from public,anon,authenticated;
revoke all on private.municipal_integration_outbox from public,anon,authenticated;
revoke all on private.ops_health_events from public,anon,authenticated;

grant select,insert,update,delete on public.citizen_preferences to authenticated;
grant select,insert,delete on public.citizen_occurrence_follows to authenticated;
grant select,insert,delete on public.citizen_favorite_neighborhoods to authenticated;
grant select,delete on public.citizen_notifications to authenticated;
grant update(read_at) on public.citizen_notifications to authenticated;
grant select on public.news_posts to anon,authenticated;
grant select on public.occurrence_resolution_media to anon,authenticated;
grant all on public.citizen_preferences,public.citizen_occurrence_follows,public.citizen_favorite_neighborhoods,public.citizen_notifications,public.news_posts,public.occurrence_resolution_media to service_role;
grant all on private.municipal_integration_outbox,private.ops_health_events to service_role;

drop policy if exists citizen_preferences_owner on public.citizen_preferences;
create policy citizen_preferences_owner on public.citizen_preferences for all to authenticated
using ((select auth.uid()) is not null and auth_user_id=(select auth.uid()))
with check ((select auth.uid()) is not null and auth_user_id=(select auth.uid()));

drop policy if exists citizen_occurrence_follows_owner on public.citizen_occurrence_follows;
create policy citizen_occurrence_follows_owner on public.citizen_occurrence_follows for all to authenticated
using ((select auth.uid()) is not null and auth_user_id=(select auth.uid()))
with check ((select auth.uid()) is not null and auth_user_id=(select auth.uid()));

drop policy if exists citizen_favorite_neighborhoods_owner on public.citizen_favorite_neighborhoods;
create policy citizen_favorite_neighborhoods_owner on public.citizen_favorite_neighborhoods for all to authenticated
using ((select auth.uid()) is not null and auth_user_id=(select auth.uid()))
with check ((select auth.uid()) is not null and auth_user_id=(select auth.uid()));

drop policy if exists citizen_notifications_owner_select on public.citizen_notifications;
create policy citizen_notifications_owner_select on public.citizen_notifications for select to authenticated
using ((select auth.uid()) is not null and auth_user_id=(select auth.uid()));
drop policy if exists citizen_notifications_owner_update on public.citizen_notifications;
create policy citizen_notifications_owner_update on public.citizen_notifications for update to authenticated
using ((select auth.uid()) is not null and auth_user_id=(select auth.uid()))
with check ((select auth.uid()) is not null and auth_user_id=(select auth.uid()));
drop policy if exists citizen_notifications_owner_delete on public.citizen_notifications;
create policy citizen_notifications_owner_delete on public.citizen_notifications for delete to authenticated
using ((select auth.uid()) is not null and auth_user_id=(select auth.uid()));

drop policy if exists news_posts_public_read on public.news_posts;
create policy news_posts_public_read on public.news_posts for select to anon,authenticated
using (status='published' and published_at is not null and published_at<=now());

drop policy if exists occurrence_resolution_media_read on public.occurrence_resolution_media;
create policy occurrence_resolution_media_read on public.occurrence_resolution_media for select to anon,authenticated
using (exists (
  select 1 from public.occurrences o
  where o.protocol=occurrence_resolution_media.protocol
    and o.public_visible=true and o.moderation_status='approved' and o.status='Resolvida'
));

create or replace function private.notify_citizens_from_history()
returns trigger language plpgsql security definer
set search_path=pg_catalog,public,private as $$
declare o public.occurrences%rowtype; event_type text; event_title text; event_body text;
begin
  select * into o from public.occurrences where id=new.occurrence_id;
  if o.id is null or o.public_visible is not true or o.moderation_status<>'approved' then return new; end if;
  event_type:=case when new.status='Resolvida' then 'occurrence_resolved' else 'occurrence_update' end;
  event_title:=case when new.status='Resolvida' then 'Problema resolvido' else 'Ocorrência atualizada' end;
  event_body:=left(o.title||' · '||o.neighborhood_label||' · '||new.status,500);
  insert into public.citizen_notifications(auth_user_id,event_key,type,protocol,neighborhood_label,title,body)
  select f.auth_user_id,'history:'||new.id::text,event_type,o.protocol,o.neighborhood_label,event_title,event_body
  from public.citizen_occurrence_follows f
  join public.citizen_preferences p on p.auth_user_id=f.auth_user_id and p.notify_occurrences=true
  where f.protocol=o.protocol on conflict(auth_user_id,event_key) do nothing;
  insert into public.citizen_notifications(auth_user_id,event_key,type,protocol,neighborhood_label,title,body)
  select n.auth_user_id,'history:'||new.id::text,'neighborhood_update',o.protocol,o.neighborhood_label,'Atualização no bairro',event_body
  from public.citizen_favorite_neighborhoods n
  join public.citizen_preferences p on p.auth_user_id=n.auth_user_id and p.notify_neighborhoods=true
  where lower(n.neighborhood_label)=lower(o.neighborhood_label)
  on conflict(auth_user_id,event_key) do nothing;
  return new;
end $$;
revoke all on function private.notify_citizens_from_history() from public,anon,authenticated;
drop trigger if exists trg_notify_citizens_from_history on public.occurrence_history;
create trigger trg_notify_citizens_from_history after insert on public.occurrence_history
for each row execute function private.notify_citizens_from_history();

create or replace function private.notify_citizens_new_public_occurrence()
returns trigger language plpgsql security definer
set search_path=pg_catalog,public,private as $$
begin
  if new.public_visible=true and new.moderation_status='approved'
     and (tg_op='INSERT' or old.public_visible is distinct from new.public_visible or old.moderation_status is distinct from new.moderation_status) then
    insert into public.citizen_notifications(auth_user_id,event_key,type,protocol,neighborhood_label,title,body)
    select n.auth_user_id,'published:'||new.id::text,'neighborhood_update',new.protocol,new.neighborhood_label,'Novo registro público no bairro',left(new.title||' · '||new.neighborhood_label,500)
    from public.citizen_favorite_neighborhoods n
    join public.citizen_preferences p on p.auth_user_id=n.auth_user_id and p.notify_neighborhoods=true
    where lower(n.neighborhood_label)=lower(new.neighborhood_label)
    on conflict(auth_user_id,event_key) do nothing;
  end if; return new;
end $$;
revoke all on function private.notify_citizens_new_public_occurrence() from public,anon,authenticated;
drop trigger if exists trg_notify_citizens_new_public_occurrence on public.occurrences;
create trigger trg_notify_citizens_new_public_occurrence
after insert or update of public_visible,moderation_status on public.occurrences
for each row execute function private.notify_citizens_new_public_occurrence();

create or replace function public.service_get_municipal_outbox(p_occurrence_id uuid)
returns table(id uuid,status text,adapter_key text,action text,attempt_count integer,last_error text,created_at timestamptz,updated_at timestamptz)
language sql security invoker set search_path=pg_catalog,public,private as $$
 select x.id,x.status,x.adapter_key,x.action,x.attempt_count,x.last_error,x.created_at,x.updated_at
 from private.municipal_integration_outbox x where x.occurrence_id=p_occurrence_id order by x.created_at desc limit 5
$$;
create or replace function public.service_prepare_municipal_outbox(p_occurrence_id uuid,p_action text,p_payload jsonb,p_created_by uuid)
returns table(id uuid,status text,adapter_key text,created_at timestamptz)
language sql security invoker set search_path=pg_catalog,public,private as $$
 insert into private.municipal_integration_outbox(occurrence_id,action,adapter_key,payload,status,created_by)
 values(p_occurrence_id,left(p_action,80),'unconfigured',coalesce(p_payload,'{}'::jsonb),'disabled',p_created_by)
 returning municipal_integration_outbox.id,municipal_integration_outbox.status,municipal_integration_outbox.adapter_key,municipal_integration_outbox.created_at
$$;
create or replace function public.service_get_municipal_health()
returns table(status text,count bigint)
language sql security invoker set search_path=pg_catalog,public,private as $$
 select x.status,count(*)::bigint from private.municipal_integration_outbox x group by x.status
$$;
create or replace function public.service_record_health_event(p_component text,p_status text,p_latency_ms integer,p_metadata jsonb)
returns uuid language plpgsql security invoker set search_path=pg_catalog,public,private as $$
declare v_id uuid;
begin
 insert into private.ops_health_events(component,status,latency_ms,metadata)
 values(left(p_component,80),p_status,p_latency_ms,coalesce(p_metadata,'{}'::jsonb)) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.service_get_municipal_outbox(uuid) from public,anon,authenticated;
revoke all on function public.service_prepare_municipal_outbox(uuid,text,jsonb,uuid) from public,anon,authenticated;
revoke all on function public.service_get_municipal_health() from public,anon,authenticated;
revoke all on function public.service_record_health_event(text,text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.service_get_municipal_outbox(uuid) to service_role;
grant execute on function public.service_prepare_municipal_outbox(uuid,text,jsonb,uuid) to service_role;
grant execute on function public.service_get_municipal_health() to service_role;
grant execute on function public.service_record_health_event(text,text,integer,jsonb) to service_role;

create index if not exists idx_citizen_occurrence_follows_protocol on public.citizen_occurrence_follows(protocol);
create index if not exists idx_citizen_favorite_neighborhoods_label_lower on public.citizen_favorite_neighborhoods((lower(neighborhood_label)));
create index if not exists idx_citizen_notifications_protocol on public.citizen_notifications(protocol);
create index if not exists idx_citizen_notifications_user_created on public.citizen_notifications(auth_user_id,created_at desc);
create index if not exists idx_news_posts_cover_protocol on public.news_posts(cover_protocol);
create index if not exists idx_news_posts_created_by on public.news_posts(created_by);
create index if not exists idx_news_posts_updated_by on public.news_posts(updated_by);
create index if not exists idx_news_posts_publication on public.news_posts(status,featured desc,published_at desc);
create index if not exists idx_municipal_integration_outbox_occurrence on private.municipal_integration_outbox(occurrence_id);
create index if not exists idx_municipal_integration_outbox_created_by on private.municipal_integration_outbox(created_by);
create index if not exists idx_municipal_integration_outbox_status on private.municipal_integration_outbox(status,created_at desc);
create index if not exists idx_ops_health_events_created on private.ops_health_events(created_at desc);

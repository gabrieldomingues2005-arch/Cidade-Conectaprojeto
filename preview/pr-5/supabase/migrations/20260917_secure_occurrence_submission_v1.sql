-- Cidade Conecta — submissão segura de ocorrências e rastreamento privado.
-- Projeto alvo: yvmkgpijzewssdxgimit (Cidade Conecta)

create table if not exists public.occurrence_contacts (
  occurrence_id uuid primary key references public.occurrences(id) on delete cascade,
  name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint occurrence_contacts_name_len check (name is null or char_length(name) <= 80),
  constraint occurrence_contacts_email_len check (email is null or char_length(email) <= 160),
  constraint occurrence_contacts_phone_len check (phone is null or char_length(phone) <= 40)
);

alter table public.occurrence_contacts enable row level security;

create table if not exists private.occurrence_tracking_tokens (
  occurrence_id uuid primary key references public.occurrences(id) on delete cascade,
  token_hash bytea not null,
  created_at timestamptz not null default now()
);

create table if not exists private.submission_rate_limits (
  fingerprint_hash text primary key,
  window_started_at timestamptz not null default now(),
  submission_count integer not null default 0 check (submission_count >= 0),
  last_submission_at timestamptz,
  updated_at timestamptz not null default now()
);

create sequence if not exists public.occurrence_protocol_seq as bigint start with 1 increment by 1;

create or replace function private.normalize_name(p_value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(regexp_replace(
    translate(lower(coalesce(p_value,'')),
      'áàâãäéèêëíìîïóòôõöúùûüçñ',
      'aaaaaeeeeiiiiooooouuuucn'),
    '\s+', ' ', 'g'))
$$;

create or replace function private.issue_occurrence_protocol()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_protocol text;
begin
  loop
    v_protocol := format(
      'CC-%s-%s',
      to_char(current_date, 'YYYY'),
      lpad(nextval('public.occurrence_protocol_seq'::regclass)::text, 5, '0')
    );
    exit when not exists (select 1 from public.occurrences o where o.protocol = v_protocol);
  end loop;
  return v_protocol;
end;
$$;

create or replace function public.consume_submission_quota(p_fingerprint_hash text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_row private.submission_rate_limits%rowtype;
  v_limit constant integer := 5;
  v_window constant interval := interval '15 minutes';
  v_min_interval constant interval := interval '8 seconds';
  v_retry integer := 0;
  v_remaining integer := 0;
begin
  if p_fingerprint_hash is null or char_length(trim(p_fingerprint_hash)) < 32 then
    raise exception 'invalid_fingerprint';
  end if;

  insert into private.submission_rate_limits (fingerprint_hash, window_started_at, submission_count, last_submission_at, updated_at)
  values (p_fingerprint_hash, v_now, 0, null, v_now)
  on conflict (fingerprint_hash) do nothing;

  select * into v_row
  from private.submission_rate_limits
  where fingerprint_hash = p_fingerprint_hash
  for update;

  if v_now - v_row.window_started_at >= v_window then
    update private.submission_rate_limits
       set window_started_at = v_now,
           submission_count = 1,
           last_submission_at = v_now,
           updated_at = v_now
     where fingerprint_hash = p_fingerprint_hash;
    return jsonb_build_object('allowed', true, 'remaining', v_limit - 1, 'retry_after_seconds', 0);
  end if;

  if v_row.last_submission_at is not null and v_now - v_row.last_submission_at < v_min_interval then
    v_retry := greatest(1, ceil(extract(epoch from (v_min_interval - (v_now - v_row.last_submission_at))))::integer);
    v_remaining := greatest(0, v_limit - v_row.submission_count);
    return jsonb_build_object('allowed', false, 'remaining', v_remaining, 'retry_after_seconds', v_retry);
  end if;

  if v_row.submission_count >= v_limit then
    v_retry := greatest(1, ceil(extract(epoch from ((v_row.window_started_at + v_window) - v_now)))::integer);
    return jsonb_build_object('allowed', false, 'remaining', 0, 'retry_after_seconds', v_retry);
  end if;

  update private.submission_rate_limits
     set submission_count = submission_count + 1,
         last_submission_at = v_now,
         updated_at = v_now
   where fingerprint_hash = p_fingerprint_hash
   returning greatest(0, v_limit - submission_count) into v_remaining;

  return jsonb_build_object('allowed', true, 'remaining', v_remaining, 'retry_after_seconds', 0);
end;
$$;

create or replace function public.submit_occurrence_internal(
  p_category_slug text,
  p_title text,
  p_description text,
  p_neighborhood_label text,
  p_exact_address text default null,
  p_latitude numeric default null,
  p_longitude numeric default null,
  p_contact_name text default null,
  p_contact_email text default null,
  p_contact_phone text default null,
  p_auth_user_id uuid default null
)
returns table (
  occurrence_id uuid,
  protocol text,
  tracking_key text,
  moderation_status text
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_municipality_id uuid;
  v_category_id uuid;
  v_category_routing text;
  v_neighborhood_id uuid;
  v_region_id uuid;
  v_region_count integer := 0;
  v_territory_status text := 'unresolved';
  v_citizen_id uuid;
  v_protocol text;
  v_tracking_key text;
  v_occurrence_id uuid;
  v_public_lat numeric;
  v_public_lng numeric;
  v_title text := trim(coalesce(p_title,''));
  v_description text := trim(coalesce(p_description,''));
  v_neighborhood_label text := trim(coalesce(p_neighborhood_label,''));
  v_exact_address text := nullif(trim(coalesce(p_exact_address,'')), '');
  v_contact_name text := nullif(trim(coalesce(p_contact_name,'')), '');
  v_contact_email text := nullif(trim(coalesce(p_contact_email,'')), '');
  v_contact_phone text := nullif(trim(coalesce(p_contact_phone,'')), '');
begin
  if char_length(v_title) < 5 or char_length(v_title) > 100 then
    raise exception 'invalid_title';
  end if;
  if char_length(v_description) < 15 or char_length(v_description) > 700 then
    raise exception 'invalid_description';
  end if;
  if char_length(v_neighborhood_label) < 2 or char_length(v_neighborhood_label) > 70 then
    raise exception 'invalid_neighborhood';
  end if;
  if v_exact_address is not null and char_length(v_exact_address) > 160 then
    raise exception 'invalid_address';
  end if;
  if v_contact_name is not null and char_length(v_contact_name) > 80 then
    raise exception 'invalid_contact_name';
  end if;
  if v_contact_email is not null and (char_length(v_contact_email) > 160 or v_contact_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') then
    raise exception 'invalid_contact_email';
  end if;
  if v_contact_phone is not null and char_length(v_contact_phone) > 40 then
    raise exception 'invalid_contact_phone';
  end if;

  if (p_latitude is null) <> (p_longitude is null) then
    raise exception 'incomplete_coordinates';
  end if;
  if p_latitude is not null and (p_latitude < -90 or p_latitude > 90 or p_longitude < -180 or p_longitude > 180) then
    raise exception 'invalid_coordinates';
  end if;

  select m.id into v_municipality_id
  from public.municipalities m
  where m.ibge_code = '3538709' and m.active
  limit 1;
  if v_municipality_id is null then
    raise exception 'municipality_not_configured';
  end if;

  select c.id, c.suggested_routing
    into v_category_id, v_category_routing
  from public.categories c
  where c.slug = trim(coalesce(p_category_slug,'')) and c.active
  limit 1;
  if v_category_id is null then
    raise exception 'invalid_category';
  end if;

  select n.id into v_neighborhood_id
  from public.neighborhoods n
  where n.municipality_id = v_municipality_id
    and n.active
    and n.normalized_name = private.normalize_name(v_neighborhood_label)
  limit 1;

  if v_neighborhood_id is not null then
    select count(*)
      into v_region_count
    from public.neighborhood_regions nr
    where nr.neighborhood_id = v_neighborhood_id;

    if v_region_count = 1 then
      select nr.administrative_region_id
        into v_region_id
      from public.neighborhood_regions nr
      where nr.neighborhood_id = v_neighborhood_id
      limit 1;
      v_territory_status := 'name-match';
    elsif v_region_count > 1 then
      v_region_id := null;
      v_territory_status := 'ambiguous';
    else
      v_region_id := null;
      v_territory_status := 'unresolved';
    end if;
  end if;

  if p_auth_user_id is not null then
    select up.id into v_citizen_id
    from public.users_profile up
    where up.auth_user_id = p_auth_user_id
    limit 1;
  end if;

  if p_latitude is not null then
    v_public_lat := round(p_latitude, 3);
    v_public_lng := round(p_longitude, 3);
  end if;

  v_protocol := private.issue_occurrence_protocol();
  v_tracking_key := encode(extensions.gen_random_bytes(24), 'hex');

  insert into public.occurrences (
    protocol, municipality_id, category_id, neighborhood_id, administrative_region_id,
    title, description, neighborhood_label, public_location,
    public_latitude, public_longitude, public_point,
    status, responsible_agency, citizen_id, public_visible,
    moderation_status, territory_resolution_status
  ) values (
    v_protocol, v_municipality_id, v_category_id, v_neighborhood_id, v_region_id,
    v_title, v_description, v_neighborhood_label, null,
    v_public_lat, v_public_lng,
    case when v_public_lat is not null then extensions.st_setsrid(extensions.st_makepoint(v_public_lng, v_public_lat),4326)::extensions.geography else null end,
    'Recebida', v_category_routing, v_citizen_id, true,
    'pending', v_territory_status
  ) returning id into v_occurrence_id;

  if v_exact_address is not null or p_latitude is not null then
    insert into public.occurrence_private_location (
      occurrence_id, exact_address, exact_latitude, exact_longitude, exact_point
    ) values (
      v_occurrence_id, v_exact_address, p_latitude, p_longitude,
      case when p_latitude is not null then extensions.st_setsrid(extensions.st_makepoint(p_longitude, p_latitude),4326)::extensions.geography else null end
    );
  end if;

  if v_contact_name is not null or v_contact_email is not null or v_contact_phone is not null then
    insert into public.occurrence_contacts (occurrence_id, name, email, phone)
    values (v_occurrence_id, v_contact_name, v_contact_email, v_contact_phone);
  end if;

  insert into public.occurrence_history (occurrence_id, status, note, public_note, changed_by)
  values (v_occurrence_id, 'Recebida', 'Ocorrência recebida e aguardando triagem.', true, v_citizen_id);

  insert into private.occurrence_tracking_tokens (occurrence_id, token_hash)
  values (v_occurrence_id, extensions.digest(v_tracking_key, 'sha256'));

  insert into public.audit_log (actor_id, action, entity_type, entity_id, metadata)
  values (
    v_citizen_id,
    'occurrence.submitted',
    'occurrence',
    v_occurrence_id,
    jsonb_build_object('source','public-edge-function','moderation_status','pending')
  );

  return query select v_occurrence_id, v_protocol, v_tracking_key, 'pending'::text;
end;
$$;

create or replace function public.track_occurrence(
  p_protocol text,
  p_tracking_key text default null
)
returns table (
  protocol text,
  title text,
  description text,
  neighborhood_label text,
  public_location text,
  public_latitude numeric,
  public_longitude numeric,
  status text,
  responsible_agency text,
  moderation_status text,
  territory_resolution_status text,
  created_at timestamptz,
  updated_at timestamptz,
  resolved_at timestamptz,
  category_slug text,
  category_name text,
  history jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_occ public.occurrences%rowtype;
  v_public_access boolean := false;
  v_token_access boolean := false;
  v_owner_access boolean := false;
  v_staff_access boolean := false;
begin
  select * into v_occ
  from public.occurrences o
  where o.protocol = upper(trim(coalesce(p_protocol,'')))
  limit 1;

  if v_occ.id is null then
    return;
  end if;

  v_public_access := v_occ.public_visible and v_occ.moderation_status = 'approved';
  v_staff_access := private.is_staff();

  if p_tracking_key is not null and char_length(trim(p_tracking_key)) >= 32 then
    select exists (
      select 1 from private.occurrence_tracking_tokens t
      where t.occurrence_id = v_occ.id
        and t.token_hash = extensions.digest(trim(p_tracking_key), 'sha256')
    ) into v_token_access;
  end if;

  if auth.uid() is not null and v_occ.citizen_id is not null then
    v_owner_access := v_occ.citizen_id = private.current_profile_id();
  end if;

  if not (v_public_access or v_token_access or v_owner_access or v_staff_access) then
    return;
  end if;

  return query
  select
    v_occ.protocol,
    v_occ.title,
    v_occ.description,
    v_occ.neighborhood_label,
    v_occ.public_location,
    v_occ.public_latitude,
    v_occ.public_longitude,
    v_occ.status,
    v_occ.responsible_agency,
    v_occ.moderation_status,
    v_occ.territory_resolution_status,
    v_occ.created_at,
    v_occ.updated_at,
    v_occ.resolved_at,
    c.slug,
    c.name,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'status', h.status,
        'note', h.note,
        'created_at', h.created_at
      ) order by h.created_at asc)
      from public.occurrence_history h
      where h.occurrence_id = v_occ.id and h.public_note
    ), '[]'::jsonb)
  from public.categories c
  where c.id = v_occ.category_id;
end;
$$;

-- Trigger para updated_at da nova tabela.
drop trigger if exists occurrence_contacts_set_updated_at on public.occurrence_contacts;
create trigger occurrence_contacts_set_updated_at
before update on public.occurrence_contacts
for each row execute function private.set_updated_at();

-- RLS: contato nunca é público. Apenas proprietário autenticado ou equipe autorizada lê.
drop policy if exists occurrence_contacts_authenticated_read on public.occurrence_contacts;
create policy occurrence_contacts_authenticated_read
on public.occurrence_contacts
for select
to authenticated
using (
  private.is_staff()
  or exists (
    select 1 from public.occurrences o
    where o.id = occurrence_contacts.occurrence_id
      and o.citizen_id = private.current_profile_id()
  )
);

-- Hardening de privilégios. Escrita pública acontece somente pela Edge Function com service_role.
revoke all on table public.occurrence_contacts from anon;
revoke insert, update, delete on table public.occurrence_contacts from authenticated;
grant select on table public.occurrence_contacts to authenticated;

revoke all on function public.submit_occurrence_internal(text,text,text,text,text,numeric,numeric,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.submit_occurrence_internal(text,text,text,text,text,numeric,numeric,text,text,text,uuid) to service_role;

revoke all on function public.consume_submission_quota(text) from public, anon, authenticated;
grant execute on function public.consume_submission_quota(text) to service_role;

revoke all on function public.track_occurrence(text,text) from public;
grant execute on function public.track_occurrence(text,text) to anon, authenticated;

revoke all on function private.normalize_name(text) from public, anon, authenticated;
revoke all on function private.issue_occurrence_protocol() from public, anon, authenticated;

comment on table public.occurrence_contacts is 'Dados privados de contato vinculados a uma ocorrência. Nunca expor em consultas públicas.';
comment on function public.submit_occurrence_internal(text,text,text,text,text,numeric,numeric,text,text,text,uuid) is 'RPC interna para Edge Function do Cidade Conecta. Não conceder a anon/authenticated.';
comment on function public.track_occurrence(text,text) is 'Rastreamento seguro: ocorrências aprovadas são públicas; pendentes exigem token, proprietário autenticado ou equipe.';

-- Cidade Conecta — baseline de recuperação do backend
-- Criado em 22/10/2026 para reconstrução em um NOVO projeto Supabase.
-- NÃO executar no projeto travado yvmkgpijzewssdxgimit.
-- NÃO recria schemas internos auth/realtime/storage.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists postgis with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(),
  ibge_code text unique not null,
  name text not null,
  state_name text not null,
  state_code char(2) not null,
  center_latitude numeric(9,6),
  center_longitude numeric(9,6),
  area_km2 numeric(12,3),
  population_estimate integer,
  population_reference_year integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.territorial_sources (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  name text not null,
  source_url text not null,
  source_type text not null check (source_type in ('statistics','map','geojson','geoprocessing','other')),
  reference_date date,
  machine_readable boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.administrative_regions (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  region_number integer not null check (region_number between 1 and 99),
  name text,
  population integer,
  area_km2 numeric(12,3),
  density_hab_km2 numeric(12,2),
  source_id uuid references public.territorial_sources(id),
  boundary_geojson jsonb,
  boundary_status text not null default 'metadata-only'
    check (boundary_status in ('metadata-only','validated-vector','deprecated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipality_id, region_number)
);

create table if not exists public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  territory_kind text not null default 'urban'
    check (territory_kind in ('urban','rural','isolated_nucleus','other')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (municipality_id, name, territory_kind)
);

create table if not exists public.neighborhood_regions (
  neighborhood_id uuid not null references public.neighborhoods(id) on delete cascade,
  administrative_region_id uuid not null references public.administrative_regions(id) on delete cascade,
  relation_note text,
  primary key (neighborhood_id, administrative_region_id)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  suggested_routing text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.users_profile (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text,
  email text,
  phone text,
  role text not null default 'citizen'
    check (role in ('citizen','triage','agency','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function private.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select up.id
  from public.users_profile up
  where up.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.users_profile up
    where up.auth_user_id = auth.uid()
      and up.role in ('triage','admin')
  )
$$;

create table if not exists public.occurrences (
  id uuid primary key default gen_random_uuid(),
  protocol text unique not null,
  municipality_id uuid not null references public.municipalities(id),
  category_id uuid references public.categories(id),
  neighborhood_id uuid references public.neighborhoods(id),
  administrative_region_id uuid references public.administrative_regions(id),
  title text not null,
  description text not null,
  neighborhood_label text not null,
  public_location text,
  public_latitude numeric(9,6),
  public_longitude numeric(9,6),
  public_point extensions.geography(Point,4326),
  status text not null default 'Recebida'
    check (status in ('Recebida','Em análise','Encaminhada','Em andamento','Resolvida')),
  responsible_agency text,
  citizen_id uuid references public.users_profile(id),
  public_visible boolean not null default true,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending','approved','rejected')),
  territory_resolution_status text not null default 'unresolved'
    check (territory_resolution_status in ('unresolved','name-match','ambiguous','coordinate-match','manual-reviewed','backend-resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.occurrence_private_location (
  occurrence_id uuid primary key references public.occurrences(id) on delete cascade,
  exact_address text,
  exact_latitude numeric(9,6),
  exact_longitude numeric(9,6),
  exact_point extensions.geography(Point,4326),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.occurrence_history (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.occurrences(id) on delete cascade,
  status text not null,
  note text,
  public_note boolean not null default true,
  changed_by uuid references public.users_profile(id),
  created_at timestamptz not null default now()
);

create table if not exists public.occurrence_attachments (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.occurrences(id) on delete cascade,
  storage_key text not null unique,
  mime_type text,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  public_visible boolean not null default false,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users_profile(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

drop trigger if exists municipalities_set_updated_at on public.municipalities;
create trigger municipalities_set_updated_at before update on public.municipalities
for each row execute function private.set_updated_at();

drop trigger if exists administrative_regions_set_updated_at on public.administrative_regions;
create trigger administrative_regions_set_updated_at before update on public.administrative_regions
for each row execute function private.set_updated_at();

drop trigger if exists users_profile_set_updated_at on public.users_profile;
create trigger users_profile_set_updated_at before update on public.users_profile
for each row execute function private.set_updated_at();

drop trigger if exists occurrences_set_updated_at on public.occurrences;
create trigger occurrences_set_updated_at before update on public.occurrences
for each row execute function private.set_updated_at();

drop trigger if exists occurrence_private_location_set_updated_at on public.occurrence_private_location;
create trigger occurrence_private_location_set_updated_at before update on public.occurrence_private_location
for each row execute function private.set_updated_at();

create index if not exists idx_regions_municipality on public.administrative_regions(municipality_id, region_number);
create index if not exists idx_neighborhoods_municipality on public.neighborhoods(municipality_id);
create index if not exists idx_neighborhoods_normalized on public.neighborhoods(municipality_id, normalized_name);
create index if not exists idx_occurrences_status on public.occurrences(status);
create index if not exists idx_occurrences_municipality on public.occurrences(municipality_id);
create index if not exists idx_occurrences_region on public.occurrences(administrative_region_id);
create index if not exists idx_occurrences_neighborhood on public.occurrences(neighborhood_id);
create index if not exists idx_occurrences_category on public.occurrences(category_id);
create index if not exists idx_occurrences_created_at on public.occurrences(created_at desc);
create index if not exists idx_occurrences_public_map on public.occurrences(public_visible, moderation_status, public_latitude, public_longitude);
create index if not exists idx_occurrences_public_point on public.occurrences using gist(public_point);
create index if not exists idx_private_location_point on public.occurrence_private_location using gist(exact_point);
create index if not exists idx_history_occurrence on public.occurrence_history(occurrence_id, created_at desc);
create index if not exists idx_audit_entity on public.audit_log(entity_type, entity_id, created_at desc);

alter table public.municipalities enable row level security;
alter table public.territorial_sources enable row level security;
alter table public.administrative_regions enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.neighborhood_regions enable row level security;
alter table public.categories enable row level security;
alter table public.users_profile enable row level security;
alter table public.occurrences enable row level security;
alter table public.occurrence_private_location enable row level security;
alter table public.occurrence_history enable row level security;
alter table public.occurrence_attachments enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists municipalities_public_read on public.municipalities;
create policy municipalities_public_read on public.municipalities
for select to anon, authenticated using (active);

drop policy if exists territorial_sources_public_read on public.territorial_sources;
create policy territorial_sources_public_read on public.territorial_sources
for select to anon, authenticated using (true);

drop policy if exists regions_public_read on public.administrative_regions;
create policy regions_public_read on public.administrative_regions
for select to anon, authenticated using (boundary_status <> 'deprecated');

drop policy if exists neighborhoods_public_read on public.neighborhoods;
create policy neighborhoods_public_read on public.neighborhoods
for select to anon, authenticated using (active);

drop policy if exists neighborhood_regions_public_read on public.neighborhood_regions;
create policy neighborhood_regions_public_read on public.neighborhood_regions
for select to anon, authenticated using (true);

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
for select to anon, authenticated using (active);

drop policy if exists profile_self_read on public.users_profile;
create policy profile_self_read on public.users_profile
for select to authenticated
using (auth_user_id = (select auth.uid()) or private.is_staff());

drop policy if exists profile_self_update on public.users_profile;
create policy profile_self_update on public.users_profile
for update to authenticated
using (auth_user_id = (select auth.uid()))
with check (auth_user_id = (select auth.uid()) and role = 'citizen');

drop policy if exists occurrences_public_read on public.occurrences;
create policy occurrences_public_read on public.occurrences
for select to anon, authenticated
using (public_visible and moderation_status = 'approved');

drop policy if exists occurrences_owner_staff_read on public.occurrences;
create policy occurrences_owner_staff_read on public.occurrences
for select to authenticated
using (citizen_id = private.current_profile_id() or private.is_staff());

drop policy if exists occurrence_private_owner_staff_read on public.occurrence_private_location;
create policy occurrence_private_owner_staff_read on public.occurrence_private_location
for select to authenticated
using (
  private.is_staff()
  or exists (
    select 1 from public.occurrences o
    where o.id = occurrence_private_location.occurrence_id
      and o.citizen_id = private.current_profile_id()
  )
);

drop policy if exists history_public_read on public.occurrence_history;
create policy history_public_read on public.occurrence_history
for select to anon, authenticated
using (
  public_note
  and exists (
    select 1 from public.occurrences o
    where o.id = occurrence_history.occurrence_id
      and o.public_visible
      and o.moderation_status = 'approved'
  )
);

drop policy if exists history_owner_staff_read on public.occurrence_history;
create policy history_owner_staff_read on public.occurrence_history
for select to authenticated
using (
  private.is_staff()
  or exists (
    select 1 from public.occurrences o
    where o.id = occurrence_history.occurrence_id
      and o.citizen_id = private.current_profile_id()
  )
);

drop policy if exists attachments_owner_staff_read on public.occurrence_attachments;
create policy attachments_owner_staff_read on public.occurrence_attachments
for select to authenticated
using (
  private.is_staff()
  or exists (
    select 1 from public.occurrences o
    where o.id = occurrence_attachments.occurrence_id
      and o.citizen_id = private.current_profile_id()
  )
);

drop policy if exists audit_staff_read on public.audit_log;
create policy audit_staff_read on public.audit_log
for select to authenticated using (private.is_staff());

-- Privilégios de cliente são explícitos: primeiro zera, depois regranta o mínimo.
revoke all privileges on all tables in schema public from anon;
revoke all privileges on all tables in schema public from authenticated;
revoke all privileges on all sequences in schema public from anon;
revoke all privileges on all sequences in schema public from authenticated;

grant usage on schema public to anon, authenticated;

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
  public.audit_log
to authenticated;

grant update on table public.users_profile to authenticated;

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

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.current_profile_id() from public, anon;
revoke all on function private.is_staff() from public, anon;
grant usage on schema private to authenticated, service_role;
grant execute on function private.current_profile_id() to authenticated, service_role;
grant execute on function private.is_staff() to authenticated, service_role;

comment on schema private is 'Objetos internos do Cidade Conecta; não expor no Data API.';
comment on table public.occurrence_private_location is 'Localização exata privada; nunca retornar em endpoints públicos.';
comment on table public.audit_log is 'Trilha administrativa. Escrita somente por backend autorizado.';

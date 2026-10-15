-- Cidade Conecta — proposta de schema PostgreSQL v4.3
-- Piracicaba/SP · protótipo acadêmico independente
--
-- Este arquivo é uma proposta para a futura migração do localStorage para backend real.
-- Revisar autenticação, RLS/permissões, LGPD e regras territoriais antes de produção.

create extension if not exists pgcrypto;

-- =========================================================
-- 1. TERRITÓRIO
-- =========================================================

create table if not exists municipalities (
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

create table if not exists territorial_sources (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references municipalities(id) on delete cascade,
  name text not null,
  source_url text not null,
  source_type text not null check (source_type in ('statistics','map','geojson','geoprocessing','other')),
  reference_date date,
  machine_readable boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists administrative_regions (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references municipalities(id) on delete cascade,
  region_number integer not null,
  name text,
  population integer,
  area_km2 numeric(12,3),
  density_hab_km2 numeric(12,2),
  source_id uuid references territorial_sources(id),
  -- Reservado para uma futura camada vetorial oficial validada.
  -- Não preencher com polígonos aproximados.
  boundary_geojson jsonb,
  boundary_status text not null default 'metadata-only'
    check (boundary_status in ('metadata-only','validated-vector','deprecated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipality_id, region_number)
);

create table if not exists neighborhoods (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references municipalities(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  territory_kind text not null default 'urban'
    check (territory_kind in ('urban','rural','isolated_nucleus','other')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (municipality_id, name, territory_kind)
);

-- Relação N:N proposital: uma referência territorial pode aparecer em mais
-- de uma região no mapa-fonte (ex.: Parte do Guamium no protótipo atual).
create table if not exists neighborhood_regions (
  neighborhood_id uuid not null references neighborhoods(id) on delete cascade,
  administrative_region_id uuid not null references administrative_regions(id) on delete cascade,
  relation_note text,
  primary key (neighborhood_id, administrative_region_id)
);

-- =========================================================
-- 2. CATEGORIAS E PERFIS
-- =========================================================

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  suggested_routing text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists users_profile (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  name text,
  email text,
  phone text,
  role text not null default 'citizen'
    check (role in ('citizen','triage','agency','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 3. OCORRÊNCIAS
-- =========================================================

create table if not exists occurrences (
  id uuid primary key default gen_random_uuid(),
  protocol text unique not null,
  municipality_id uuid not null references municipalities(id),
  category_id uuid references categories(id),
  neighborhood_id uuid references neighborhoods(id),
  -- Região resolvida quando houver correspondência única/validada.
  administrative_region_id uuid references administrative_regions(id),
  title text not null,
  description text not null,
  neighborhood_label text not null,
  public_location text,
  -- Coordenada pública pode ser arredondada/anonimizada.
  public_latitude numeric(9,6),
  public_longitude numeric(9,6),
  status text not null default 'Recebida'
    check (status in ('Recebida','Em análise','Encaminhada','Em andamento','Resolvida')),
  responsible_agency text,
  citizen_id uuid references users_profile(id),
  public_visible boolean not null default true,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending','approved','rejected')),
  territory_resolution_status text not null default 'unresolved'
    check (territory_resolution_status in ('unresolved','name-match','ambiguous','coordinate-match','manual-reviewed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- Endereço e coordenadas exatas ficam separados da ocorrência pública.
-- Endpoint público nunca deve consultar/retornar esta tabela.
create table if not exists occurrence_private_location (
  occurrence_id uuid primary key references occurrences(id) on delete cascade,
  exact_address text,
  exact_latitude numeric(9,6),
  exact_longitude numeric(9,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists occurrence_history (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references occurrences(id) on delete cascade,
  status text not null,
  note text,
  public_note boolean not null default true,
  changed_by uuid references users_profile(id),
  created_at timestamptz not null default now()
);

create table if not exists occurrence_attachments (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references occurrences(id) on delete cascade,
  storage_key text not null,
  mime_type text,
  file_size_bytes bigint,
  public_visible boolean not null default false,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- Auditoria administrativa independente do histórico público.
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users_profile(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 4. ÍNDICES
-- =========================================================

create index if not exists idx_regions_municipality on administrative_regions(municipality_id, region_number);
create index if not exists idx_neighborhoods_municipality on neighborhoods(municipality_id);
create index if not exists idx_neighborhoods_normalized on neighborhoods(normalized_name);
create index if not exists idx_occurrences_status on occurrences(status);
create index if not exists idx_occurrences_municipality on occurrences(municipality_id);
create index if not exists idx_occurrences_region on occurrences(administrative_region_id);
create index if not exists idx_occurrences_neighborhood on occurrences(neighborhood_id);
create index if not exists idx_occurrences_category on occurrences(category_id);
create index if not exists idx_occurrences_created_at on occurrences(created_at desc);
create index if not exists idx_occurrences_public_map on occurrences(public_visible, moderation_status, public_latitude, public_longitude);
create index if not exists idx_history_occurrence on occurrence_history(occurrence_id, created_at desc);
create index if not exists idx_audit_entity on audit_log(entity_type, entity_id, created_at desc);

-- =========================================================
-- 5. DADOS INICIAIS
-- =========================================================

insert into municipalities (
  ibge_code,name,state_name,state_code,center_latitude,center_longitude,
  area_km2,population_estimate,population_reference_year
) values (
  '3538709','Piracicaba','São Paulo','SP',-22.725300,-47.649200,
  1377.173,440835,2025
)
on conflict (ibge_code) do update set
  name=excluded.name,
  state_name=excluded.state_name,
  state_code=excluded.state_code,
  center_latitude=excluded.center_latitude,
  center_longitude=excluded.center_longitude,
  area_km2=excluded.area_km2,
  population_estimate=excluded.population_estimate,
  population_reference_year=excluded.population_reference_year,
  updated_at=now();

insert into categories (slug,name,suggested_routing) values
('vias','Vias públicas','Obras e manutenção viária'),
('iluminacao','Iluminação','Iluminação pública'),
('residuos','Resíduos','Limpeza urbana e resíduos'),
('agua','Água/Saneamento','Saneamento / SEMAE'),
('alagamentos','Alagamentos','Drenagem urbana / Defesa Civil conforme o risco'),
('sinalizacao','Sinalização','Mobilidade e trânsito'),
('acessibilidade','Acessibilidade','Acessibilidade / manutenção urbana'),
('areas','Áreas públicas','Áreas verdes, parques e serviços urbanos'),
('outros','Outros','Triagem de atendimento / 156')
on conflict (slug) do update set
  name=excluded.name,
  suggested_routing=excluded.suggested_routing;

-- As 9 regiões e os bairros devem ser carregados por migração/seed controlado
-- a partir de data/piracicaba.json, preservando a relação N:N quando aplicável.
-- Em produção, o boundary_geojson só deve receber geometria oficial validada.

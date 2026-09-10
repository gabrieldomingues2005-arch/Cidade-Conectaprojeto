-- Cidade Conecta — proposta inicial de schema PostgreSQL
-- Revisar antes de produção.

create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists users_profile (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  name text,
  email text,
  phone text,
  role text not null default 'citizen' check (role in ('citizen','triage','agency','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists occurrences (
  id uuid primary key default gen_random_uuid(),
  protocol text unique not null,
  category_id uuid references categories(id),
  title text not null,
  description text not null,
  neighborhood text not null,
  public_location text not null,
  exact_address text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  status text not null default 'Recebida' check (status in ('Recebida','Em análise','Encaminhada','Em andamento','Resolvida')),
  responsible_agency text,
  citizen_id uuid references users_profile(id),
  public_visible boolean not null default true,
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
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
  public_visible boolean not null default false,
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_occurrences_status on occurrences(status);
create index if not exists idx_occurrences_neighborhood on occurrences(neighborhood);
create index if not exists idx_occurrences_category on occurrences(category_id);
create index if not exists idx_occurrences_created_at on occurrences(created_at desc);

insert into categories (slug,name) values
('vias','Vias públicas'),
('iluminacao','Iluminação'),
('residuos','Resíduos'),
('agua','Água/Saneamento'),
('alagamentos','Alagamentos'),
('sinalizacao','Sinalização'),
('acessibilidade','Acessibilidade'),
('areas','Áreas públicas'),
('outros','Outros')
on conflict (slug) do nothing;

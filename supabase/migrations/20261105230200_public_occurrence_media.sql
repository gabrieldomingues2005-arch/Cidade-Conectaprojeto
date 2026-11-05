-- Cidade Conecta — mídia pública moderada para ocorrências
-- O original permanece no bucket privado occurrence-attachments.
-- Apenas cópias aprovadas pelo backend administrativo vão para o bucket público.

create table if not exists public.occurrence_public_media (
  protocol text primary key
    references public.occurrences(protocol) on delete cascade,
  storage_key text not null unique,
  mime_type text not null
    check (mime_type = any (array['image/jpeg'::text,'image/png'::text,'image/webp'::text])),
  alt_text text not null default ''
    check (char_length(alt_text) <= 180),
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint occurrence_public_media_storage_key_format
    check (storage_key ~ '^CC-[0-9]{4}-[0-9]{5}/[0-9a-f-]{36}\.(jpg|png|webp)$')
);

alter table public.occurrence_public_media enable row level security;

revoke all on table public.occurrence_public_media from public, anon, authenticated;
grant select on table public.occurrence_public_media to anon, authenticated;
grant select, insert, update, delete on table public.occurrence_public_media to service_role;

drop policy if exists occurrence_public_media_read on public.occurrence_public_media;
create policy occurrence_public_media_read
on public.occurrence_public_media
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.occurrences o
    where o.protocol = occurrence_public_media.protocol
      and o.public_visible = true
      and o.moderation_status = 'approved'
  )
);

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
) values (
  'occurrence-public-media',
  'occurrence-public-media',
  true,
  1572864,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

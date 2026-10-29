-- Cidade Conecta v2 — ajustes pós-advisor
-- Índices de FKs e consolidação de policies permissivas para SELECT autenticado.

create index if not exists idx_administrative_regions_source_id
  on public.administrative_regions(source_id);
create index if not exists idx_audit_log_actor_id
  on public.audit_log(actor_id);
create index if not exists idx_neighborhood_regions_region_id
  on public.neighborhood_regions(administrative_region_id);
create index if not exists idx_occurrence_attachments_occurrence_id
  on public.occurrence_attachments(occurrence_id);
create index if not exists idx_occurrence_history_changed_by
  on public.occurrence_history(changed_by);
create index if not exists idx_occurrences_citizen_id
  on public.occurrences(citizen_id);
create index if not exists idx_territorial_sources_municipality_id
  on public.territorial_sources(municipality_id);

drop policy if exists occurrences_public_read on public.occurrences;
drop policy if exists occurrences_owner_staff_read on public.occurrences;

create policy occurrences_public_read_anon
on public.occurrences
for select
to anon
using (public_visible and moderation_status = 'approved');

create policy occurrences_authenticated_read
on public.occurrences
for select
to authenticated
using (
  (public_visible and moderation_status = 'approved')
  or citizen_id = private.current_profile_id()
  or private.is_staff()
);

drop policy if exists history_public_read on public.occurrence_history;
drop policy if exists history_owner_staff_read on public.occurrence_history;

create policy history_public_read_anon
on public.occurrence_history
for select
to anon
using (
  public_note
  and exists (
    select 1
    from public.occurrences o
    where o.id = occurrence_history.occurrence_id
      and o.public_visible
      and o.moderation_status = 'approved'
  )
);

create policy history_authenticated_read
on public.occurrence_history
for select
to authenticated
using (
  private.is_staff()
  or exists (
    select 1
    from public.occurrences o
    where o.id = occurrence_history.occurrence_id
      and (
        o.citizen_id = private.current_profile_id()
        or (occurrence_history.public_note and o.public_visible and o.moderation_status = 'approved')
      )
  )
);

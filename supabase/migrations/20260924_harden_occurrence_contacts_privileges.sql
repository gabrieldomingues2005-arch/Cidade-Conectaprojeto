-- Harden direct privileges on private contact data.
-- Authenticated users only need RLS-controlled SELECT access.
revoke all on table public.occurrence_contacts from authenticated;
grant select on table public.occurrence_contacts to authenticated;

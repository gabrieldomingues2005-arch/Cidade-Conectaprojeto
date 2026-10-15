-- Impede que um cidadão promova o próprio perfil por atualização direta.
drop policy if exists profile_self_update on public.users_profile;
create policy profile_self_update
on public.users_profile
for update
to authenticated
using (auth_user_id = (select auth.uid()))
with check (
  auth_user_id = (select auth.uid())
  and role = 'citizen'
);

-- Atribuição de papéis internos deve ocorrer somente em fluxo administrativo/service_role.
comment on policy profile_self_update on public.users_profile is 'Cidadão pode editar o próprio perfil, mas deve permanecer com role=citizen.';

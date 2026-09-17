-- Reserva CC-2026-00001..00099 para dados demonstrativos locais e evita colisão com o backend real.
do $$
begin
  if not exists (select 1 from public.occurrences) then
    perform setval('public.occurrence_protocol_seq'::regclass, 1001, false);
  end if;
end
$$;

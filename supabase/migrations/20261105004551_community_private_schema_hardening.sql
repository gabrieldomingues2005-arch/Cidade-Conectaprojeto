begin;
-- Existing private RPCs are SECURITY DEFINER. Client roles need no private schema access.
revoke usage on schema private from authenticated;
commit;

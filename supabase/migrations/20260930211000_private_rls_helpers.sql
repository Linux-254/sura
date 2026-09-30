-- RLS helper functions are implementation details, not public RPC endpoints.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

ALTER FUNCTION public.is_business_member(uuid, uuid) SET SCHEMA private;
ALTER FUNCTION public.has_profile_role(uuid, public.sura_role) SET SCHEMA private;

REVOKE ALL ON FUNCTION private.is_business_member(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_profile_role(uuid, public.sura_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_business_member(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_profile_role(uuid, public.sura_role) TO anon, authenticated, service_role;

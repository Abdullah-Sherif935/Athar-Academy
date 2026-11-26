-- ============================================================================
-- ATHAR ACADEMY — Migration 0006: Grant anon EXECUTE on non-exposed private.* RLS helpers
-- ============================================================================
-- The private schema is NOT exposed via PostgREST (/rest/v1/rpc).
-- Public SELECT policies (TO anon, authenticated) evaluate these read-only boolean
-- helpers, which return false for anon (auth.uid() IS NULL).

GRANT EXECUTE ON FUNCTION private.is_super_admin() TO anon;
GRANT EXECUTE ON FUNCTION private.is_assigned_instructor(uuid) TO anon;
GRANT EXECUTE ON FUNCTION private.is_active_student_in_course(uuid) TO anon;

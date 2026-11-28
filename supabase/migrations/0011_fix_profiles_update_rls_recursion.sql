-- ============================================================================
-- ATHAR ACADEMY — Migration 0011: Fix profiles_update_own RLS Recursion (42P17)
-- ============================================================================

CREATE OR REPLACE FUNCTION private.current_account_status()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_status
  FROM public.profiles
  WHERE id = (SELECT auth.uid());
$$;

REVOKE ALL ON FUNCTION private.current_account_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.current_account_status() TO authenticated;

ALTER POLICY "profiles_update_own"
  ON public.profiles
  WITH CHECK (
    id = (SELECT auth.uid())
    AND account_status = private.current_account_status()
  );

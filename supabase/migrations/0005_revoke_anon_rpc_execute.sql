-- ============================================================================
-- ATHAR ACADEMY — Migration 0005: Revoke anon EXECUTE on SECURITY DEFINER RPCs
-- ============================================================================

REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rpc_submit_enrollment_request(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_accept_enrollment_for_payment(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_confirm_direct_payment(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_reject_enrollment_request(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_admin_suspend_enrollment(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_admin_reactivate_enrollment(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_admin_override_enrollment(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_approve_lesson_revision(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_approve_course_proposal(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rpc_bootstrap_super_admin() FROM PUBLIC, anon;

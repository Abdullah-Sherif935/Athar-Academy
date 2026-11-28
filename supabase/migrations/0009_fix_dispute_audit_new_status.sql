-- ============================================================================
-- ATHAR ACADEMY — Migration 0009: Fix rpc_resolve_enrollment_dispute audit new_status
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rpc_resolve_enrollment_dispute(
  p_dispute_id uuid,
  p_resolution_note text,
  p_suspend_access boolean DEFAULT false,
  p_refund_confirmed boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_disp record;
BEGIN
  IF NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Super Admin authorization required';
  END IF;

  SELECT * INTO v_disp FROM public.enrollment_disputes WHERE id = p_dispute_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Dispute not found';
  END IF;

  UPDATE public.enrollment_disputes
  SET status = 'resolved',
      resolution_note = trim(COALESCE(p_resolution_note, '')),
      refund_confirmed_by_parties = COALESCE(p_refund_confirmed, false),
      resolved_by = v_uid,
      resolved_at = now()
  WHERE id = p_dispute_id;

  IF p_refund_confirmed THEN
    PERFORM public.rpc_admin_override_enrollment(
      v_disp.enrollment_request_id,
      'refunded',
      COALESCE(NULLIF(trim(p_resolution_note), ''), 'Resolved dispute: refund confirmed by parties')
    );
  ELSIF p_suspend_access THEN
    PERFORM public.rpc_admin_suspend_enrollment(
      v_disp.enrollment_request_id,
      COALESCE(NULLIF(trim(p_resolution_note), ''), 'Suspended following dispute resolution')
    );
  ELSE
    INSERT INTO public.enrollment_audit_events (
      enrollment_request_id, event_type, actor_id, actor_role, previous_status, new_status, reason
    )
    VALUES (
      v_disp.enrollment_request_id,
      'dispute_resolved',
      v_uid,
      'admin',
      'dispute_open',
      'dispute_resolved',
      trim(COALESCE(p_resolution_note, ''))
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_resolve_enrollment_dispute(uuid, text, boolean, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_resolve_enrollment_dispute(uuid, text, boolean, boolean) TO authenticated;

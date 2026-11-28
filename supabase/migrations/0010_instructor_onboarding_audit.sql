-- ============================================================================
-- ATHAR ACADEMY — Migration 0010: Real Instructor Onboarding & Admin Audit Trail
-- ============================================================================

-- 1. Track real invitation lifecycle on instructor_profiles
ALTER TABLE public.instructor_profiles
  ADD COLUMN IF NOT EXISTS invitation_status text NOT NULL DEFAULT 'active'
    CHECK (invitation_status IN ('pending', 'accepted', 'active')),
  ADD COLUMN IF NOT EXISTS invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;

-- 2. Immutable Administrative Audit Trail (Super Admin SELECT/INSERT only; ZERO UPDATE/DELETE)
CREATE TABLE IF NOT EXISTS public.admin_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_events_target ON public.admin_audit_events(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_created ON public.admin_audit_events(created_at DESC);

ALTER TABLE public.admin_audit_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_audit_events'
      AND policyname = 'admin_audit_events_super_admin_select'
  ) THEN
    CREATE POLICY "admin_audit_events_super_admin_select"
      ON public.admin_audit_events FOR SELECT
      TO authenticated
      USING (private.is_super_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_audit_events'
      AND policyname = 'admin_audit_events_super_admin_insert'
  ) THEN
    CREATE POLICY "admin_audit_events_super_admin_insert"
      ON public.admin_audit_events FOR INSERT
      TO authenticated
      WITH CHECK (private.is_super_admin() AND actor_id = (SELECT auth.uid()));
  END IF;
END $$;

-- 3. Transactional RPC: Super Admin updates instructor profile & account status + logs audit
CREATE OR REPLACE FUNCTION public.rpc_admin_update_instructor(
  p_user_id uuid,
  p_full_name_ar text DEFAULT NULL,
  p_full_name_en text DEFAULT NULL,
  p_title_ar text DEFAULT NULL,
  p_title_en text DEFAULT NULL,
  p_short_bio_ar text DEFAULT NULL,
  p_short_bio_en text DEFAULT NULL,
  p_biography_ar text DEFAULT NULL,
  p_biography_en text DEFAULT NULL,
  p_expertise jsonb DEFAULT NULL,
  p_avatar_url text DEFAULT NULL,
  p_account_status text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_initials text;
BEGIN
  IF NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Super Admin authorization required';
  END IF;

  IF p_account_status IS NOT NULL AND p_account_status NOT IN ('active', 'inactive', 'suspended', 'revoked') THEN
    RAISE EXCEPTION 'Invalid account_status value';
  END IF;

  IF p_full_name_en IS NOT NULL AND trim(p_full_name_en) <> '' THEN
    v_initials := upper(substr(regexp_replace(trim(p_full_name_en), '\s+', '', 'g'), 1, 2));
  END IF;

  UPDATE public.profiles
  SET
    full_name_ar = COALESCE(NULLIF(trim(p_full_name_ar), ''), full_name_ar),
    full_name_en = COALESCE(NULLIF(trim(p_full_name_en), ''), full_name_en),
    initials = COALESCE(NULLIF(v_initials, ''), initials),
    bio_ar = COALESCE(p_biography_ar, bio_ar),
    bio_en = COALESCE(p_biography_en, bio_en),
    avatar_url = CASE WHEN p_avatar_url IS NOT NULL THEN NULLIF(trim(p_avatar_url), '') ELSE avatar_url END,
    account_status = COALESCE(p_account_status, account_status),
    updated_at = now()
  WHERE id = p_user_id;

  UPDATE public.instructor_profiles
  SET
    title_ar = COALESCE(p_title_ar, title_ar),
    title_en = COALESCE(p_title_en, title_en),
    short_bio_ar = COALESCE(p_short_bio_ar, short_bio_ar),
    short_bio_en = COALESCE(p_short_bio_en, short_bio_en),
    biography_ar = COALESCE(p_biography_ar, biography_ar),
    biography_en = COALESCE(p_biography_en, biography_en),
    expertise = COALESCE(p_expertise, expertise),
    updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO public.admin_audit_events (actor_id, target_user_id, action_type, metadata)
  VALUES (
    v_uid,
    p_user_id,
    CASE WHEN p_account_status IS NOT NULL THEN 'instructor_status_or_profile_updated' ELSE 'instructor_profile_updated' END,
    jsonb_build_object(
      'account_status', p_account_status,
      'updated_name_en', p_full_name_en,
      'updated_title_en', p_title_en
    )
  );
END;
$$;

-- 4. Transactional RPC: Super Admin manages course_instructors (assign/unassign/lead/co/can_confirm_payments)
CREATE OR REPLACE FUNCTION public.rpc_admin_set_course_instructor(
  p_course_id uuid,
  p_instructor_id uuid,
  p_action text, -- 'assign' | 'remove' | 'set_lead' | 'set_co' | 'set_payment_permission'
  p_can_confirm_payments boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
BEGIN
  IF NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Super Admin authorization required';
  END IF;

  IF p_action = 'remove' THEN
    DELETE FROM public.course_instructors
    WHERE course_id = p_course_id AND instructor_id = p_instructor_id;
  ELSIF p_action = 'set_lead' THEN
    -- Demote any existing lead on this course first (satisfies partial unique index)
    UPDATE public.course_instructors
    SET role = 'co_instructor'
    WHERE course_id = p_course_id AND role = 'lead' AND instructor_id <> p_instructor_id;

    INSERT INTO public.course_instructors (course_id, instructor_id, role, can_confirm_payments, assigned_by)
    VALUES (p_course_id, p_instructor_id, 'lead', true, v_uid)
    ON CONFLICT (course_id, instructor_id) DO UPDATE
      SET role = 'lead', can_confirm_payments = true;
  ELSIF p_action = 'set_co' THEN
    INSERT INTO public.course_instructors (course_id, instructor_id, role, can_confirm_payments, assigned_by)
    VALUES (p_course_id, p_instructor_id, 'co_instructor', COALESCE(p_can_confirm_payments, false), v_uid)
    ON CONFLICT (course_id, instructor_id) DO UPDATE
      SET role = 'co_instructor', can_confirm_payments = COALESCE(p_can_confirm_payments, false);
  ELSIF p_action = 'set_payment_permission' THEN
    UPDATE public.course_instructors
    SET can_confirm_payments = COALESCE(p_can_confirm_payments, false)
    WHERE course_id = p_course_id AND instructor_id = p_instructor_id;
  ELSIF p_action = 'assign' THEN
    -- If course has no lead yet, make this instructor lead; otherwise co_instructor
    IF NOT EXISTS (SELECT 1 FROM public.course_instructors WHERE course_id = p_course_id AND role = 'lead') THEN
      INSERT INTO public.course_instructors (course_id, instructor_id, role, can_confirm_payments, assigned_by)
      VALUES (p_course_id, p_instructor_id, 'lead', true, v_uid)
      ON CONFLICT (course_id, instructor_id) DO NOTHING;
    ELSE
      INSERT INTO public.course_instructors (course_id, instructor_id, role, can_confirm_payments, assigned_by)
      VALUES (p_course_id, p_instructor_id, 'co_instructor', COALESCE(p_can_confirm_payments, false), v_uid)
      ON CONFLICT (course_id, instructor_id) DO NOTHING;
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid action: %', p_action;
  END IF;

  INSERT INTO public.admin_audit_events (actor_id, target_user_id, course_id, action_type, metadata)
  VALUES (
    v_uid,
    p_instructor_id,
    p_course_id,
    'course_instructor_' || p_action,
    jsonb_build_object('can_confirm_payments', p_can_confirm_payments)
  );
END;
$$;

-- 5. Transactional RPC: Instructor marks own invitation accepted after completing password setup
CREATE OR REPLACE FUNCTION public.rpc_mark_instructor_onboarding_complete()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.instructor_profiles
  SET invitation_status = 'active',
      accepted_at = COALESCE(accepted_at, now()),
      updated_at = now()
  WHERE user_id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_admin_update_instructor(uuid, text, text, text, text, text, text, text, text, jsonb, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_admin_set_course_instructor(uuid, uuid, text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_mark_instructor_onboarding_complete() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.rpc_admin_update_instructor(uuid, text, text, text, text, text, text, text, text, jsonb, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_admin_set_course_instructor(uuid, uuid, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_mark_instructor_onboarding_complete() TO authenticated;

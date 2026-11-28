-- ============================================================================
-- ATHAR ACADEMY — Migration 0012: Workflow 02 Real Course Creation & Approval
-- ============================================================================

-- 1. Add rejection_reason to courses so Super Admin rejection feedback persists
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- 2. RPC: Instructor creates a new Draft course + becomes Lead Instructor + sets Pricing atomically
CREATE OR REPLACE FUNCTION public.rpc_instructor_create_draft_course(
  p_discipline_id uuid,
  p_title_ar text,
  p_title_en text,
  p_short_desc_ar text,
  p_short_desc_en text,
  p_full_desc_ar text DEFAULT '',
  p_full_desc_en text DEFAULT '',
  p_level text DEFAULT 'beginner',
  p_language text DEFAULT 'bilingual',
  p_duration_ar text DEFAULT '6 أسابيع',
  p_duration_en text DEFAULT '6 Weeks',
  p_thumbnail_url text DEFAULT NULL,
  p_what_you_will_learn jsonb DEFAULT '[]'::jsonb,
  p_objectives jsonb DEFAULT '[]'::jsonb,
  p_requirements jsonb DEFAULT '[]'::jsonb,
  p_target_audience jsonb DEFAULT '[]'::jsonb,
  p_is_free boolean DEFAULT false,
  p_price_amount numeric DEFAULT 1500,
  p_currency text DEFAULT 'EGP',
  p_payment_methods text[] DEFAULT ARRAY['vodafone_cash', 'instapay', 'bank_transfer'],
  p_payment_instructions_ar text DEFAULT '',
  p_payment_instructions_en text DEFAULT '',
  p_enrollment_open boolean DEFAULT true
)
RETURNS TABLE(course_id uuid, slug text, code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_slug text;
  v_code text;
  v_course_id uuid;
BEGIN
  IF v_uid IS NULL OR NOT (private.is_active_instructor() OR private.is_super_admin()) THEN
    RAISE EXCEPTION 'Active Instructor authorization required to create courses';
  END IF;

  IF trim(COALESCE(p_title_ar, '')) = '' OR trim(COALESCE(p_title_en, '')) = '' THEN
    RAISE EXCEPTION 'Arabic and English course titles are required';
  END IF;

  v_slug := regexp_replace(lower(trim(p_title_en)), '[^a-z0-9]+', '-', 'g');
  v_slug := regexp_replace(v_slug, '^-|-$', '', 'g');
  IF v_slug = '' THEN v_slug := 'course'; END IF;
  v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 4);

  v_code := 'ATH-' || upper(substr(gen_random_uuid()::text, 1, 5));

  INSERT INTO public.courses (
    slug, code, discipline_id,
    title_ar, title_en,
    short_description_ar, short_description_en,
    full_description_ar, full_description_en,
    level, duration_ar, duration_en, language, thumbnail_url,
    status, is_suspended,
    what_you_will_learn, objectives, requirements, target_audience,
    created_by
  )
  VALUES (
    v_slug, v_code, p_discipline_id,
    trim(p_title_ar), trim(p_title_en),
    trim(COALESCE(p_short_desc_ar, '')), trim(COALESCE(p_short_desc_en, '')),
    COALESCE(NULLIF(trim(p_full_desc_ar), ''), trim(COALESCE(p_short_desc_ar, ''))),
    COALESCE(NULLIF(trim(p_full_desc_en), ''), trim(COALESCE(p_short_desc_en, ''))),
    COALESCE(NULLIF(p_level, ''), 'beginner'),
    COALESCE(NULLIF(trim(p_duration_ar), ''), '6 أسابيع'),
    COALESCE(NULLIF(trim(p_duration_en), ''), '6 Weeks'),
    COALESCE(NULLIF(p_language, ''), 'bilingual'),
    NULLIF(trim(COALESCE(p_thumbnail_url, '')), ''),
    'draft', false,
    COALESCE(p_what_you_will_learn, '[]'::jsonb),
    COALESCE(p_objectives, '[]'::jsonb),
    COALESCE(p_requirements, '[]'::jsonb),
    COALESCE(p_target_audience, '[]'::jsonb),
    v_uid
  )
  RETURNING id INTO v_course_id;

  INSERT INTO public.course_instructors (course_id, instructor_id, role, can_confirm_payments, assigned_by)
  VALUES (v_course_id, v_uid, 'lead', true, v_uid);

  INSERT INTO public.course_payment_settings (
    course_id, is_free, price_amount, currency,
    payment_methods, payment_instructions_ar, payment_instructions_en, enrollment_open
  )
  VALUES (
    v_course_id,
    COALESCE(p_is_free, false),
    CASE WHEN COALESCE(p_is_free, false) THEN 0 ELSE GREATEST(0, COALESCE(p_price_amount, 0)) END,
    COALESCE(NULLIF(p_currency, ''), 'EGP'),
    COALESCE(p_payment_methods, ARRAY['vodafone_cash', 'instapay', 'bank_transfer']),
    COALESCE(NULLIF(trim(p_payment_instructions_ar), ''), 'تواصل مع المدرب الرئيسي لتنسيق الدفع المباشر خارج المنصة.'),
    COALESCE(NULLIF(trim(p_payment_instructions_en), ''), 'Contact the Lead Instructor to coordinate direct payment outside the platform.'),
    COALESCE(p_enrollment_open, true)
  );

  INSERT INTO public.admin_audit_events (actor_id, target_user_id, course_id, action_type, metadata)
  VALUES (
    v_uid, v_uid, v_course_id, 'course_draft_created',
    jsonb_build_object('slug', v_slug, 'code', v_code, 'is_free', p_is_free, 'price_amount', p_price_amount, 'currency', p_currency)
  );

  RETURN QUERY SELECT v_course_id, v_slug, v_code;
END;
$$;

-- 3. RPC: Lead Instructor submits Draft/Rejected course for Super Admin approval + notifies all Super Admins
CREATE OR REPLACE FUNCTION public.rpc_instructor_submit_course_for_review(p_course_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_course record;
  v_mod_count integer;
  v_lesson_count integer;
  v_admin record;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT (private.can_confirm_payment(p_course_id) OR private.is_super_admin()) THEN
    RAISE EXCEPTION 'Only the Lead Instructor or Super Admin can submit this course for approval';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found';
  END IF;

  IF v_course.is_suspended THEN
    RAISE EXCEPTION 'Suspended courses cannot be submitted';
  END IF;

  SELECT count(*) INTO v_mod_count FROM public.course_modules WHERE course_id = p_course_id;
  SELECT count(*) INTO v_lesson_count FROM public.lessons WHERE course_id = p_course_id;

  IF v_mod_count < 1 OR v_lesson_count < 1 THEN
    RAISE EXCEPTION 'Course must contain at least 1 module and 1 lesson before submission';
  END IF;

  UPDATE public.courses
  SET status = 'pending_approval',
      rejection_reason = NULL,
      updated_at = now()
  WHERE id = p_course_id;

  FOR v_admin IN
    SELECT DISTINCT ur.user_id
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.role = 'super_admin' AND p.account_status = 'active'
  LOOP
    INSERT INTO public.notifications (user_id, kind, title_ar, title_en, body_ar, body_en, target_path)
    VALUES (
      v_admin.user_id,
      'update',
      'دورة جديدة بانتظار الاعتماد',
      'New Course Pending Approval',
      format('أرسل المدرب دورة "%s" للمراجعة والاعتماد.', v_course.title_ar),
      format('An instructor submitted "%s" for Admin review and approval.', v_course.title_en),
      '/admin/approvals'
    );
  END LOOP;

  INSERT INTO public.admin_audit_events (actor_id, target_user_id, course_id, action_type, metadata)
  VALUES (
    v_uid, v_uid, p_course_id, 'course_submitted_for_approval',
    jsonb_build_object('modules_count', v_mod_count, 'lessons_count', v_lesson_count)
  );
END;
$$;

-- 4. RPC: Super Admin approves submitted course (sets 'approved' by default, or 'published' if explicitly requested)
CREATE OR REPLACE FUNCTION public.rpc_admin_approve_course(
  p_course_id uuid,
  p_publish_immediately boolean DEFAULT false
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_course record;
  v_next_status text;
  v_lead_id uuid;
BEGIN
  IF NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Super Admin authorization required';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found';
  END IF;

  v_next_status := CASE WHEN COALESCE(p_publish_immediately, false) THEN 'published' ELSE 'approved' END;

  UPDATE public.courses
  SET status = v_next_status,
      rejection_reason = NULL,
      updated_at = now()
  WHERE id = p_course_id;

  IF v_next_status = 'published' THEN
    UPDATE public.lessons
    SET status = 'published', updated_at = now()
    WHERE course_id = p_course_id AND status IN ('draft', 'pending_approval', 'approved');
  END IF;

  SELECT instructor_id INTO v_lead_id
  FROM public.course_instructors
  WHERE course_id = p_course_id AND role = 'lead'
  LIMIT 1;

  IF v_lead_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, kind, title_ar, title_en, body_ar, body_en, target_path)
    VALUES (
      v_lead_id,
      'update',
      CASE WHEN v_next_status = 'published' THEN 'تم اعتماد ونشر دورتك' ELSE 'تم اعتماد دورتك من الإدارة' END,
      CASE WHEN v_next_status = 'published' THEN 'Your Course Is Approved & Published' ELSE 'Your Course Has Been Approved' END,
      format('اعتمد المشرف العام دورة "%s".', v_course.title_ar),
      format('Super Admin approved your course "%s".', v_course.title_en),
      format('/instructor/courses/%s', v_course.slug)
    );
  END IF;

  INSERT INTO public.admin_audit_events (actor_id, target_user_id, course_id, action_type, metadata)
  VALUES (
    v_uid, v_lead_id, p_course_id, 'course_approved',
    jsonb_build_object('new_status', v_next_status, 'publish_immediately', p_publish_immediately)
  );

  RETURN v_next_status;
END;
$$;

-- 5. RPC: Super Admin rejects submitted course with mandatory/optional reason
CREATE OR REPLACE FUNCTION public.rpc_admin_reject_course(
  p_course_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_course record;
  v_lead_id uuid;
  v_reason text := COALESCE(NULLIF(trim(COALESCE(p_reason, '')), ''), 'Please review curriculum and course details before resubmitting.');
BEGIN
  IF NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Super Admin authorization required';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found';
  END IF;

  UPDATE public.courses
  SET status = 'rejected',
      rejection_reason = v_reason,
      updated_at = now()
  WHERE id = p_course_id;

  SELECT instructor_id INTO v_lead_id
  FROM public.course_instructors
  WHERE course_id = p_course_id AND role = 'lead'
  LIMIT 1;

  IF v_lead_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, kind, title_ar, title_en, body_ar, body_en, target_path)
    VALUES (
      v_lead_id,
      'update',
      'ملاحظات إدارية حول دورتك',
      'Course Submission Needs Revision',
      format('لم يتم اعتماد دورة "%s": %s', v_course.title_ar, v_reason),
      format('Course "%s" was returned for revision: %s', v_course.title_en, v_reason),
      format('/instructor/courses/%s', v_course.slug)
    );
  END IF;

  INSERT INTO public.admin_audit_events (actor_id, target_user_id, course_id, action_type, metadata)
  VALUES (
    v_uid, v_lead_id, p_course_id, 'course_rejected',
    jsonb_build_object('reason', v_reason)
  );
END;
$$;

-- 6. Revoke PUBLIC/anon EXECUTE; grant ONLY to authenticated
REVOKE ALL ON FUNCTION public.rpc_instructor_create_draft_course(uuid, text, text, text, text, text, text, text, text, text, text, text, jsonb, jsonb, jsonb, jsonb, boolean, numeric, text, text[], text, text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_instructor_submit_course_for_review(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_admin_approve_course(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_admin_reject_course(uuid, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.rpc_instructor_create_draft_course(uuid, text, text, text, text, text, text, text, text, text, text, text, jsonb, jsonb, jsonb, jsonb, boolean, numeric, text, text[], text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_instructor_submit_course_for_review(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_admin_approve_course(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_admin_reject_course(uuid, text) TO authenticated;

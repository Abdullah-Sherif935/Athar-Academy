-- ============================================================================
-- ATHAR ACADEMY — Migration 0004: Transactional RPCs & Initial Production Seed
-- ============================================================================

-- 1. Submit Enrollment Request (snapshots price, prevents duplicates, logs audit & notification)
CREATE OR REPLACE FUNCTION public.rpc_submit_enrollment_request(
  p_course_id uuid,
  p_student_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_course record;
  v_pricing record;
  v_lead_id uuid;
  v_req_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id AND status = 'published' AND is_suspended = false;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course is not available for enrollment';
  END IF;

  IF EXISTS (SELECT 1 FROM public.course_enrollments WHERE student_id = v_uid AND course_id = p_course_id AND is_suspended = false) THEN
    RAISE EXCEPTION 'Already enrolled in this course';
  END IF;

  SELECT * INTO v_pricing FROM public.course_payment_settings WHERE course_id = p_course_id;
  IF FOUND AND v_pricing.enrollment_open = false THEN
    RAISE EXCEPTION 'Enrollment is currently closed for this course';
  END IF;

  SELECT instructor_id INTO v_lead_id
  FROM public.course_instructors
  WHERE course_id = p_course_id AND role = 'lead'
  LIMIT 1;

  INSERT INTO public.enrollment_requests (
    student_id, course_id, lead_instructor_id, status, payment_status,
    price_snapshot, currency, is_free_snapshot, student_message
  )
  VALUES (
    v_uid,
    p_course_id,
    v_lead_id,
    'pending',
    CASE WHEN COALESCE(v_pricing.is_free, false) THEN 'not_required' ELSE 'unpaid' END,
    CASE WHEN COALESCE(v_pricing.is_free, false) THEN 0 ELSE COALESCE(v_pricing.price_amount, 1500) END,
    COALESCE(v_pricing.currency, 'EGP'),
    COALESCE(v_pricing.is_free, false),
    NULLIF(trim(COALESCE(p_student_message, '')), '')
  )
  RETURNING id INTO v_req_id;

  INSERT INTO public.enrollment_audit_events (enrollment_request_id, event_type, actor_id, actor_role, new_status, reason)
  VALUES (
    v_req_id,
    'request_created',
    v_uid,
    'student',
    'pending',
    format('Price snapshot: %s %s', COALESCE(v_pricing.price_amount, 1500), COALESCE(v_pricing.currency, 'EGP'))
  );

  INSERT INTO public.notifications (user_id, kind, title_ar, title_en, body_ar, body_en, target_path)
  VALUES (
    v_uid, 'update',
    'تم إرسال طلب الالتحاق', 'Enrollment Request Submitted',
    format('تم إرسال طلبك لدورة "%s" وهو بانتظار رد المدرب.', v_course.title_ar),
    format('Your request for "%s" was submitted and is awaiting instructor review.', v_course.title_en),
    '/student/enrollment-requests'
  );

  IF v_lead_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, kind, title_ar, title_en, body_ar, body_en, target_path)
    VALUES (
      v_lead_id, 'update',
      'طلب التحاق جديد', 'New Enrollment Request',
      format('ورد طلب التحاق جديد لدورة "%s".', v_course.title_ar),
      format('A new enrollment request arrived for "%s".', v_course.title_en),
      '/instructor/enrollments'
    );
  END IF;

  RETURN v_req_id;
END;
$$;

-- 2. Accept Enrollment Request for Payment Coordination (Pending -> Awaiting Payment or Active if Free)
CREATE OR REPLACE FUNCTION public.rpc_accept_enrollment_for_payment(p_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_req record;
  v_course record;
BEGIN
  SELECT * INTO v_req FROM public.enrollment_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND OR v_req.status <> 'pending' THEN
    RAISE EXCEPTION 'Enrollment request is not pending';
  END IF;

  IF NOT (private.is_assigned_instructor(v_req.course_id) OR private.is_super_admin()) THEN
    RAISE EXCEPTION 'Unauthorized to manage this enrollment request';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = v_req.course_id;

  IF v_req.is_free_snapshot THEN
    UPDATE public.enrollment_requests
    SET status = 'active', payment_status = 'not_required', updated_at = now()
    WHERE id = p_request_id;

    INSERT INTO public.course_enrollments (student_id, course_id, enrollment_request_id, is_suspended)
    VALUES (v_req.student_id, v_req.course_id, p_request_id, false)
    ON CONFLICT (student_id, course_id) DO UPDATE SET is_suspended = false;

    INSERT INTO public.enrollment_audit_events (enrollment_request_id, event_type, actor_id, actor_role, previous_status, new_status)
    VALUES (p_request_id, 'enrollment_activated', v_uid, CASE WHEN private.is_super_admin() THEN 'admin' ELSE 'instructor' END, 'pending', 'active');
  ELSE
    UPDATE public.enrollment_requests
    SET status = 'awaiting_payment', payment_status = 'awaiting_payment', updated_at = now()
    WHERE id = p_request_id;

    INSERT INTO public.enrollment_audit_events (enrollment_request_id, event_type, actor_id, actor_role, previous_status, new_status)
    VALUES (p_request_id, 'instructor_accepted', v_uid, CASE WHEN private.is_super_admin() THEN 'admin' ELSE 'instructor' END, 'pending', 'awaiting_payment');

    INSERT INTO public.notifications (user_id, kind, title_ar, title_en, body_ar, body_en, target_path)
    VALUES (
      v_req.student_id, 'update',
      'طلبك بانتظار تنسيق الدفع', 'Awaiting Payment Coordination',
      format('قبل المدرب طلبك لدورة "%s". راجع تعليمات الدفع المباشر.', v_course.title_ar),
      format('Instructor accepted your request for "%s". Review direct payment instructions.', v_course.title_en),
      '/student/enrollment-requests'
    );
  END IF;
END;
$$;

-- 3. Confirm Direct Payment Received & Activate Access (Lead Instructor / Authorized Manager / Admin ONLY)
CREATE OR REPLACE FUNCTION public.rpc_confirm_direct_payment(
  p_request_id uuid,
  p_declaration_accepted boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_req record;
  v_course record;
BEGIN
  IF p_declaration_accepted IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Direct payment declaration must be explicitly accepted';
  END IF;

  SELECT * INTO v_req FROM public.enrollment_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND OR v_req.status NOT IN ('pending', 'awaiting_payment') THEN
    RAISE EXCEPTION 'Enrollment request cannot be confirmed in its current state';
  END IF;

  IF NOT (private.can_confirm_payment(v_req.course_id) OR private.is_super_admin()) THEN
    RAISE EXCEPTION 'Only the Lead Instructor or an authorized enrollment manager can confirm direct payment';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = v_req.course_id;

  UPDATE public.enrollment_requests
  SET
    status = 'active',
    payment_status = 'confirmed',
    payment_confirmed_by = v_uid,
    payment_confirmed_at = now(),
    payment_declaration_accepted = true,
    updated_at = now()
  WHERE id = p_request_id;

  INSERT INTO public.course_enrollments (student_id, course_id, enrollment_request_id, is_suspended)
  VALUES (v_req.student_id, v_req.course_id, p_request_id, false)
  ON CONFLICT (student_id, course_id) DO UPDATE SET is_suspended = false, enrollment_request_id = EXCLUDED.enrollment_request_id;

  INSERT INTO public.enrollment_audit_events (enrollment_request_id, event_type, actor_id, actor_role, previous_status, new_status, reason)
  VALUES
    (p_request_id, 'payment_confirmed', v_uid, CASE WHEN private.is_super_admin() THEN 'admin' ELSE 'instructor' END, v_req.status, 'payment_confirmed',
     format('Instructor declared direct payment of %s %s received', v_req.price_snapshot, v_req.currency)),
    (p_request_id, 'enrollment_activated', v_uid, CASE WHEN private.is_super_admin() THEN 'admin' ELSE 'instructor' END, 'payment_confirmed', 'active', NULL);

  INSERT INTO public.notifications (user_id, kind, title_ar, title_en, body_ar, body_en, target_path)
  VALUES (
    v_req.student_id, 'update',
    'تم تأكيد الدفع وتفعيل الدورة', 'Payment Confirmed & Enrollment Active',
    format('تم تأكيد استلام الرسوم لدورة "%s" وأصبحت متاحة في تعلّمي.', v_course.title_ar),
    format('Direct payment confirmed for "%s". Your course is now active in My Learning.', v_course.title_en),
    format('/student/courses/%s', v_course.slug)
  );
END;
$$;

-- 4. Reject Enrollment Request
CREATE OR REPLACE FUNCTION public.rpc_reject_enrollment_request(
  p_request_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_req record;
  v_course record;
BEGIN
  SELECT * INTO v_req FROM public.enrollment_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND OR v_req.status NOT IN ('pending', 'awaiting_payment') THEN
    RAISE EXCEPTION 'Enrollment request cannot be rejected in its current state';
  END IF;

  IF NOT (private.is_assigned_instructor(v_req.course_id) OR private.is_super_admin()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = v_req.course_id;

  UPDATE public.enrollment_requests
  SET status = 'rejected', review_note = NULLIF(trim(COALESCE(p_reason, '')), ''), updated_at = now()
  WHERE id = p_request_id;

  INSERT INTO public.enrollment_audit_events (enrollment_request_id, event_type, actor_id, actor_role, previous_status, new_status, reason)
  VALUES (p_request_id, 'instructor_rejected', v_uid, CASE WHEN private.is_super_admin() THEN 'admin' ELSE 'instructor' END, v_req.status, 'rejected', p_reason);

  INSERT INTO public.notifications (user_id, kind, title_ar, title_en, body_ar, body_en, target_path)
  VALUES (
    v_req.student_id, 'update',
    'تحديث حول طلب الالتحاق', 'Enrollment Request Rejected',
    format('لم يُعتمد طلبك لدورة "%s".', v_course.title_ar),
    format('Your enrollment request for "%s" was not approved.', v_course.title_en),
    '/student/enrollment-requests'
  );
END;
$$;

-- 5. Admin Suspend / Reactivate / Override Enrollment (preserves progress & original payment confirmation)
CREATE OR REPLACE FUNCTION public.rpc_admin_suspend_enrollment(
  p_request_id uuid,
  p_reason text DEFAULT 'Suspended by Super Admin'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_req record;
BEGIN
  IF NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Super Admin authorization required';
  END IF;

  SELECT * INTO v_req FROM public.enrollment_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Enrollment request not found'; END IF;

  UPDATE public.enrollment_requests SET status = 'suspended', review_note = p_reason, updated_at = now() WHERE id = p_request_id;
  UPDATE public.course_enrollments SET is_suspended = true WHERE student_id = v_req.student_id AND course_id = v_req.course_id;

  INSERT INTO public.enrollment_audit_events (enrollment_request_id, event_type, actor_id, actor_role, previous_status, new_status, reason)
  VALUES (p_request_id, 'admin_suspended', v_uid, 'admin', v_req.status, 'suspended', p_reason);
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_admin_reactivate_enrollment(
  p_request_id uuid,
  p_reason text DEFAULT 'Reactivated by Super Admin'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_req record;
BEGIN
  IF NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Super Admin authorization required';
  END IF;

  SELECT * INTO v_req FROM public.enrollment_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Enrollment request not found'; END IF;

  UPDATE public.enrollment_requests SET status = 'active', review_note = p_reason, updated_at = now() WHERE id = p_request_id;
  INSERT INTO public.course_enrollments (student_id, course_id, enrollment_request_id, is_suspended)
  VALUES (v_req.student_id, v_req.course_id, p_request_id, false)
  ON CONFLICT (student_id, course_id) DO UPDATE SET is_suspended = false;

  INSERT INTO public.enrollment_audit_events (enrollment_request_id, event_type, actor_id, actor_role, previous_status, new_status, reason)
  VALUES (p_request_id, 'admin_reactivated', v_uid, 'admin', v_req.status, 'active', p_reason);
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_admin_override_enrollment(
  p_request_id uuid,
  p_new_status text,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_req record;
BEGIN
  IF NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Super Admin authorization required';
  END IF;
  IF trim(COALESCE(p_reason, '')) = '' THEN
    RAISE EXCEPTION 'Mandatory reason required for Admin override';
  END IF;

  SELECT * INTO v_req FROM public.enrollment_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Enrollment request not found'; END IF;

  -- Preserves payment_confirmed_by and payment_confirmed_at untouched!
  UPDATE public.enrollment_requests
  SET
    status = p_new_status,
    payment_status = CASE WHEN p_new_status = 'refunded' THEN 'refunded_record' ELSE payment_status END,
    admin_override_reason = trim(p_reason),
    admin_override_at = now(),
    admin_override_by = v_uid,
    updated_at = now()
  WHERE id = p_request_id;

  IF p_new_status = 'active' THEN
    INSERT INTO public.course_enrollments (student_id, course_id, enrollment_request_id, is_suspended)
    VALUES (v_req.student_id, v_req.course_id, p_request_id, false)
    ON CONFLICT (student_id, course_id) DO UPDATE SET is_suspended = false;
  ELSIF p_new_status IN ('suspended', 'refunded', 'cancelled') THEN
    UPDATE public.course_enrollments SET is_suspended = true WHERE student_id = v_req.student_id AND course_id = v_req.course_id;
  END IF;

  INSERT INTO public.enrollment_audit_events (enrollment_request_id, event_type, actor_id, actor_role, previous_status, new_status, reason)
  VALUES (p_request_id, 'admin_override', v_uid, 'admin', v_req.status, p_new_status, trim(p_reason));
END;
$$;

-- 6. Approve Lesson Revision (atomically promotes pending revision to live published lesson)
CREATE OR REPLACE FUNCTION public.rpc_approve_lesson_revision(p_revision_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_rev record;
BEGIN
  IF NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Super Admin authorization required';
  END IF;

  SELECT * INTO v_rev FROM public.lesson_revisions WHERE id = p_revision_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Revision not found'; END IF;

  UPDATE public.lessons
  SET
    title_ar = v_rev.title_ar,
    title_en = v_rev.title_en,
    short_description_ar = v_rev.short_description_ar,
    short_description_en = v_rev.short_description_en,
    description_ar = v_rev.description_ar,
    description_en = v_rev.description_en,
    lesson_type = v_rev.lesson_type,
    video_provider = v_rev.video_provider,
    video_url = v_rev.video_url,
    video_source_id = v_rev.video_source_id,
    duration_minutes = v_rev.duration_minutes,
    materials_note_ar = v_rev.materials_note_ar,
    materials_note_en = v_rev.materials_note_en,
    is_preview = v_rev.is_preview,
    status = 'published',
    rejection_reason = NULL,
    updated_at = now()
  WHERE id = v_rev.lesson_id;

  UPDATE public.lesson_revisions
  SET status = 'approved', reviewed_by = v_uid, updated_at = now()
  WHERE id = p_revision_id;
END;
$$;

-- 7. Approve Course Proposal (creates Draft course + Lead Instructor + Payment Settings)
CREATE OR REPLACE FUNCTION public.rpc_approve_course_proposal(p_proposal_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_prop record;
  v_slug text;
  v_code text;
  v_course_id uuid;
BEGIN
  IF NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Super Admin authorization required';
  END IF;

  SELECT * INTO v_prop FROM public.course_proposals WHERE id = p_proposal_id FOR UPDATE;
  IF NOT FOUND OR v_prop.status <> 'pending_approval' THEN
    RAISE EXCEPTION 'Proposal is not pending approval';
  END IF;

  v_slug := regexp_replace(lower(v_prop.title_en), '[^a-z0-9]+', '-', 'g') || '-' || substr(gen_random_uuid()::text, 1, 4);
  v_code := 'ATH-' || upper(substr(gen_random_uuid()::text, 1, 5));

  INSERT INTO public.courses (
    slug, code, discipline_id, title_ar, title_en,
    short_description_ar, short_description_en, full_description_ar, full_description_en,
    level, duration_ar, duration_en, language, thumbnail_url, status,
    what_you_will_learn, requirements, target_audience, created_by
  )
  VALUES (
    v_slug, v_code, v_prop.discipline_id, v_prop.title_ar, v_prop.title_en,
    v_prop.short_description_ar, v_prop.short_description_en, v_prop.full_description_ar, v_prop.full_description_en,
    v_prop.level, v_prop.duration_ar, v_prop.duration_en, v_prop.language, v_prop.thumbnail_url, 'draft',
    v_prop.what_you_will_learn, v_prop.requirements, v_prop.target_audience, v_prop.proposing_instructor_id
  )
  RETURNING id INTO v_course_id;

  INSERT INTO public.course_instructors (course_id, instructor_id, role, can_confirm_payments, assigned_by)
  VALUES (v_course_id, v_prop.proposing_instructor_id, 'lead', true, v_uid);

  INSERT INTO public.course_payment_settings (course_id) VALUES (v_course_id);

  INSERT INTO public.course_modules (course_id, title_ar, title_en, sort_order)
  VALUES (v_course_id, 'الوحدة 01 — المقدمة', 'Module 01 — Introduction', 0);

  UPDATE public.course_proposals
  SET status = 'approved', approved_course_id = v_course_id, reviewed_by = v_uid, updated_at = now()
  WHERE id = p_proposal_id;

  RETURN v_course_id;
END;
$$;

-- 8. Dynamic Course Progress Calculation (Completed / Current Total * 100)
CREATE OR REPLACE FUNCTION public.rpc_calculate_course_progress(p_course_id uuid)
RETURNS TABLE(completed_count integer, total_count integer, percent integer)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH published_lessons AS (
    SELECT id FROM public.lessons WHERE course_id = p_course_id AND status = 'published'
  ),
  completed AS (
    SELECT lp.lesson_id
    FROM public.lesson_progress lp
    JOIN published_lessons pl ON pl.id = lp.lesson_id
    WHERE lp.student_id = (SELECT auth.uid()) AND lp.is_completed = true
  )
  SELECT
    (SELECT count(*)::integer FROM completed) AS completed_count,
    (SELECT count(*)::integer FROM published_lessons) AS total_count,
    CASE
      WHEN (SELECT count(*) FROM published_lessons) = 0 THEN 0
      ELSE round(((SELECT count(*) FROM completed)::numeric / (SELECT count(*) FROM published_lessons)::numeric) * 100)::integer
    END AS percent;
$$;

-- 9. Safe One-Time Super Admin Bootstrap (ONLY succeeds when zero super_admins exist!)
CREATE OR REPLACE FUNCTION public.rpc_bootstrap_super_admin()
RETURNS boolean
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

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN
    RAISE EXCEPTION 'Super Admin already initialized';
  END IF;

  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (v_uid, 'super_admin', v_uid)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

-- Restrict RPC execution to authenticated users only
REVOKE ALL ON FUNCTION public.rpc_submit_enrollment_request(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_accept_enrollment_for_payment(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_confirm_direct_payment(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_reject_enrollment_request(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_admin_suspend_enrollment(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_admin_reactivate_enrollment(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_admin_override_enrollment(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_approve_lesson_revision(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_approve_course_proposal(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_calculate_course_progress(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_bootstrap_super_admin() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.rpc_submit_enrollment_request(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_accept_enrollment_for_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_confirm_direct_payment(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_reject_enrollment_request(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_admin_suspend_enrollment(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_admin_reactivate_enrollment(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_admin_override_enrollment(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_approve_lesson_revision(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_approve_course_proposal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_calculate_course_progress(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_bootstrap_super_admin() TO authenticated;

-- ----------------------------------------------------------------------------
-- 10. Clean Initial Production Seed (NO fake students, enrollments, or reviews)
-- ----------------------------------------------------------------------------

INSERT INTO public.platform_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.disciplines (slug, name_ar, name_en, short_description_ar, short_description_en, icon_name, accent, featured)
VALUES
  ('engineering-technology', 'الهندسة والتقنية', 'Engineering & Technology',
   'مسارات هندسية وتقنية عملية تبني مهارات تصميم النظم والحلول.',
   'Practical engineering and systems pathways built for applied mastery.', 'cpu', 'navy', true),
  ('software-technology', 'البرمجة وتطوير الويب', 'Software & Web Development',
   'أساسيات وتطبيقات هندسة البرمجيات وتطوير تطبيقات الويب الحديثة.',
   'Modern software engineering and full-stack web application foundations.', 'code', 'blue', true),
  ('design-creative', 'التصميم وتجربة المستخدم', 'Design & User Experience',
   'تصميم واجهات وأنظمة تصميم متماسكة متمحورة حول الإنسان.',
   'Human-centered interfaces and scalable design systems.', 'palette', 'teal', true),
  ('business-management', 'الأعمال وإدارة المشاريع', 'Business & Project Delivery',
   'إدارة المشاريع وتخطيط المنتجات وبناء الأثر المؤسسي.',
   'Structured project delivery, operations, and strategic impact.', 'briefcase', 'orange', true),
  ('marketing-communication', 'التسويق وصناعة المحتوى', 'Marketing & Communication',
   'استراتيجيات المحتوى والحضور الرقمي الموثوق.',
   'Content strategy, digital presence, and audience trust.', 'megaphone', 'blue', false),
  ('personal-professional-growth', 'التطوير المهني والتعلّم', 'Professional Growth',
   'مهارات التعلّم العميق والتواصل المهني الفعّال.',
   'Deep learning habits, clarity, and executive communication.', 'compass', 'teal', false)
ON CONFLICT (slug) DO NOTHING;

-- Seed initial published catalog courses + payment settings + starter curriculum
DO $$
DECLARE
  v_disc_soft uuid;
  v_disc_eng uuid;
  v_disc_des uuid;
  v_c1 uuid;
  v_c2 uuid;
  v_c3 uuid;
  v_m1 uuid;
  v_m2 uuid;
  v_m3 uuid;
BEGIN
  SELECT id INTO v_disc_soft FROM public.disciplines WHERE slug = 'software-technology';
  SELECT id INTO v_disc_eng FROM public.disciplines WHERE slug = 'engineering-technology';
  SELECT id INTO v_disc_des FROM public.disciplines WHERE slug = 'design-creative';

  INSERT INTO public.courses (
    slug, code, discipline_id, title_ar, title_en,
    short_description_ar, short_description_en, full_description_ar, full_description_en,
    level, duration_ar, duration_en, accent, featured, status
  )
  VALUES (
    'foundations-modern-web-development', 'ATH-WEB-101', v_disc_soft,
    'أساسيات تطوير تطبيقات الويب الحديثة', 'Foundations of Modern Web Development',
    'ابنِ واجهات ويب متجاوبة ثنائية اللغة باستخدام HTML وCSS وTypeScript.',
    'Build responsive bilingual web applications with modern HTML, CSS, and TypeScript.',
    'دورة عملية متدرجة لتأسيس مهارات تطوير الويب الحديث وفق أفضل الممارسات المعمارية.',
    'A structured, hands-on track covering modern web architecture, responsive layouts, and TypeScript.',
    'beginner', '6 أسابيع', '6 Weeks', 'blue', true, 'published'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_c1;

  IF v_c1 IS NOT NULL THEN
    INSERT INTO public.course_payment_settings (course_id, is_free, price_amount, currency)
    VALUES (v_c1, false, 1500, 'EGP') ON CONFLICT (course_id) DO NOTHING;

    INSERT INTO public.course_modules (course_id, title_ar, title_en, sort_order)
    VALUES (v_c1, 'الوحدة 01 — معمارية الويب الحديث', 'Module 01 — Modern Web Architecture', 0)
    RETURNING id INTO v_m1;

    INSERT INTO public.lessons (course_id, module_id, title_ar, title_en, description_ar, description_en, duration_minutes, is_preview, sort_order, status)
    VALUES
      (v_c1, v_m1, 'كيف يعمل الويب الحديث', 'How the Modern Web Works',
       'نظرة تطبيقية على دورة الطلب والاستجابة وبناء الواجهات.', 'Practical walkthrough of modern web architecture and rendering.', 14, true, 0, 'published'),
      (v_c1, v_m1, 'التصميم المتجاوب والخصائص المنطقية RTL/LTR', 'Responsive Layouts & Logical CSS',
       'بناء واجهات عربية وإنجليزية متماسكة بدون تكرار.', 'Crafting bilingual RTL and LTR interfaces cleanly.', 18, false, 1, 'published');
  END IF;

  INSERT INTO public.courses (
    slug, code, discipline_id, title_ar, title_en,
    short_description_ar, short_description_en, full_description_ar, full_description_en,
    level, duration_ar, duration_en, accent, featured, status
  )
  VALUES (
    'systems-engineering-fundamentals', 'ATH-ENG-201', v_disc_eng,
    'مبادئ هندسة النظم وحل المشكلات التقنية', 'Systems Engineering & Technical Problem Solving',
    'منهجية عملية لتحليل المتطلبات وتصميم الأنظمة الهندسية المتكاملة.',
    'A disciplined methodology for requirements analysis and integrated systems design.',
    'تعلّم كيفية تفكيك المشكلات الهندسية المعقدة وتوثيق المتطلبات والتحقق من الجودة.',
    'Learn how to decompose complex engineering challenges, specify requirements, and verify system reliability.',
    'intermediate', '8 أسابيع', '8 Weeks', 'navy', true, 'published'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_c2;

  IF v_c2 IS NOT NULL THEN
    INSERT INTO public.course_payment_settings (course_id, is_free, price_amount, currency)
    VALUES (v_c2, false, 1500, 'EGP') ON CONFLICT (course_id) DO NOTHING;

    INSERT INTO public.course_modules (course_id, title_ar, title_en, sort_order)
    VALUES (v_c2, 'الوحدة 01 — مدخل إلى هندسة النظم', 'Module 01 — Systems Thinking Foundations', 0)
    RETURNING id INTO v_m2;

    INSERT INTO public.lessons (course_id, module_id, title_ar, title_en, description_ar, description_en, duration_minutes, is_preview, sort_order, status)
    VALUES
      (v_c2, v_m2, 'دورة حياة النظام الهندسي', 'System Lifecycle Fundamentals',
       'مراحل التخطيط والتصميم والتحقق والتشغيل.', 'Lifecycle stages from concept to verification and operations.', 16, true, 0, 'published');
  END IF;

  INSERT INTO public.courses (
    slug, code, discipline_id, title_ar, title_en,
    short_description_ar, short_description_en, full_description_ar, full_description_en,
    level, duration_ar, duration_en, accent, featured, status
  )
  VALUES (
    'human-centered-design-systems', 'ATH-DES-102', v_disc_des,
    'أنظمة التصميم وتجربة المستخدم المتمحورة حول الإنسان', 'Human-Centered UX & Cohesive Design Systems',
    'صمّم أنظمة مكونات متسقة تدعم إمكانية الوصول والوضع الداكن.',
    'Design consistent component systems supporting accessibility and dark mode.',
    'من الرموز التصميمية إلى مكتبات المكونات الجاهزة للإنتاج.',
    'From design tokens to production-ready multilingual component libraries.',
    'beginner', '5 أسابيع', '5 Weeks', 'teal', true, 'published'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_c3;

  IF v_c3 IS NOT NULL THEN
    INSERT INTO public.course_payment_settings (course_id, is_free, price_amount, currency)
    VALUES (v_c3, false, 1200, 'EGP') ON CONFLICT (course_id) DO NOTHING;

    INSERT INTO public.course_modules (course_id, title_ar, title_en, sort_order)
    VALUES (v_c3, 'الوحدة 01 — أسس الرموز التصميمية', 'Module 01 — Design Tokens & Accessibility', 0)
    RETURNING id INTO v_m3;

    INSERT INTO public.lessons (course_id, module_id, title_ar, title_en, description_ar, description_en, duration_minutes, is_preview, sort_order, status)
    VALUES
      (v_c3, v_m3, 'الألوان الدلالية وتباين القراءة', 'Semantic Color & WCAG Contrast',
       'بناء لوحة ألوان واضحة للوضع الفاتح والداكن.', 'Building accessible color systems across light and dark themes.', 15, true, 0, 'published');
  END IF;
END $$;

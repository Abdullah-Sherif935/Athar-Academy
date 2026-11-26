-- ============================================================================
-- ATHAR ACADEMY — Migration 0003: RLS Security Helpers, Policies & Storage
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Non-Recursive Security Helper Functions (private schema)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION private.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role = 'super_admin'
      AND p.account_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION private.is_active_instructor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role = 'instructor'
      AND p.account_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION private.is_assigned_instructor(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.course_instructors ci
    JOIN public.profiles p ON p.id = ci.instructor_id
    WHERE ci.course_id = p_course_id
      AND ci.instructor_id = (SELECT auth.uid())
      AND p.account_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION private.can_confirm_payment(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.course_instructors ci
    JOIN public.profiles p ON p.id = ci.instructor_id
    WHERE ci.course_id = p_course_id
      AND ci.instructor_id = (SELECT auth.uid())
      AND p.account_status = 'active'
      AND (ci.role = 'lead' OR ci.can_confirm_payments = true)
  );
$$;

CREATE OR REPLACE FUNCTION private.is_active_student_in_course(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.course_enrollments ce
    JOIN public.profiles p ON p.id = ce.student_id
    WHERE ce.course_id = p_course_id
      AND ce.student_id = (SELECT auth.uid())
      AND ce.is_suspended = false
      AND p.account_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION private.is_conversation_participant(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = p_conversation_id
      AND cp.user_id = (SELECT auth.uid())
  );
$$;

REVOKE ALL ON FUNCTION private.is_super_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_active_instructor() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_assigned_instructor(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_confirm_payment(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_active_student_in_course(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_conversation_participant(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION private.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_active_instructor() TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_assigned_instructor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_confirm_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_active_student_in_course(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_conversation_participant(uuid) TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. Enable RLS on EVERY Table in public
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. Identity & Access Management Policies
-- ----------------------------------------------------------------------------

CREATE POLICY "profiles_select_own_or_admin_or_public_instructor"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (
    id = (SELECT auth.uid())
    OR private.is_super_admin()
    OR EXISTS (SELECT 1 FROM public.instructor_profiles ip WHERE ip.user_id = profiles.id)
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (
    id = (SELECT auth.uid())
    AND account_status = (SELECT p.account_status FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
  );

CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

-- User roles: users can read ONLY their own roles; ONLY super_admin can insert/update/delete roles
CREATE POLICY "user_roles_select_own_or_admin"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR private.is_super_admin());

CREATE POLICY "user_roles_admin_manage"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

-- Instructor profiles: publicly readable for active instructors, editable by own instructor or admin
CREATE POLICY "instructor_profiles_public_select"
  ON public.instructor_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "instructor_profiles_update_own"
  ON public.instructor_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()) AND private.is_active_instructor())
  WITH CHECK (user_id = (SELECT auth.uid()) AND private.is_active_instructor());

CREATE POLICY "instructor_profiles_admin_manage"
  ON public.instructor_profiles FOR ALL
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

-- Student profiles: strictly private to own student or admin
CREATE POLICY "student_profiles_own_or_admin"
  ON public.student_profiles FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR private.is_super_admin());

CREATE POLICY "student_profiles_update_own"
  ON public.student_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Platform settings: readable by everyone (branding/defaults), writable ONLY by super_admin
CREATE POLICY "platform_settings_public_select"
  ON public.platform_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "platform_settings_admin_update"
  ON public.platform_settings FOR ALL
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

-- ----------------------------------------------------------------------------
-- 4. Academic Structure Policies
-- ----------------------------------------------------------------------------

CREATE POLICY "disciplines_public_select"
  ON public.disciplines FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR private.is_super_admin());

CREATE POLICY "disciplines_admin_manage"
  ON public.disciplines FOR ALL
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

CREATE POLICY "courses_select_published_or_authorized"
  ON public.courses FOR SELECT
  TO anon, authenticated
  USING (
    (status = 'published' AND is_suspended = false)
    OR private.is_super_admin()
    OR private.is_assigned_instructor(id)
    OR private.is_active_student_in_course(id)
  );

CREATE POLICY "courses_instructor_update_assigned"
  ON public.courses FOR UPDATE
  TO authenticated
  USING (private.is_assigned_instructor(id) AND is_suspended = false)
  WITH CHECK (private.is_assigned_instructor(id) AND is_suspended = false);

CREATE POLICY "courses_admin_manage"
  ON public.courses FOR ALL
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

CREATE POLICY "course_instructors_select_public"
  ON public.course_instructors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "course_instructors_admin_manage"
  ON public.course_instructors FOR ALL
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

CREATE POLICY "course_proposals_instructor_own"
  ON public.course_proposals FOR SELECT
  TO authenticated
  USING (proposing_instructor_id = (SELECT auth.uid()) OR private.is_super_admin());

CREATE POLICY "course_proposals_instructor_insert"
  ON public.course_proposals FOR INSERT
  TO authenticated
  WITH CHECK (proposing_instructor_id = (SELECT auth.uid()) AND private.is_active_instructor());

CREATE POLICY "course_proposals_instructor_update_own"
  ON public.course_proposals FOR UPDATE
  TO authenticated
  USING (proposing_instructor_id = (SELECT auth.uid()) AND status IN ('draft', 'rejected'))
  WITH CHECK (proposing_instructor_id = (SELECT auth.uid()) AND status IN ('draft', 'pending_approval'));

CREATE POLICY "course_proposals_admin_manage"
  ON public.course_proposals FOR ALL
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

CREATE POLICY "course_modules_select"
  ON public.course_modules FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_modules.course_id AND c.status = 'published' AND c.is_suspended = false)
    OR private.is_super_admin()
    OR private.is_assigned_instructor(course_id)
    OR private.is_active_student_in_course(course_id)
  );

CREATE POLICY "course_modules_instructor_manage"
  ON public.course_modules FOR ALL
  TO authenticated
  USING (private.is_assigned_instructor(course_id) OR private.is_super_admin())
  WITH CHECK (private.is_assigned_instructor(course_id) OR private.is_super_admin());

-- Lessons: public visitors can see ONLY published preview lessons; enrolled students see published lessons; instructors/admin see all
CREATE POLICY "lessons_select"
  ON public.lessons FOR SELECT
  TO anon, authenticated
  USING (
    private.is_super_admin()
    OR private.is_assigned_instructor(course_id)
    OR (status = 'published' AND private.is_active_student_in_course(course_id))
    OR (status = 'published' AND is_preview = true)
  );

CREATE POLICY "lessons_instructor_manage"
  ON public.lessons FOR ALL
  TO authenticated
  USING (private.is_assigned_instructor(course_id) OR private.is_super_admin())
  WITH CHECK (private.is_assigned_instructor(course_id) OR private.is_super_admin());

CREATE POLICY "lesson_revisions_select"
  ON public.lesson_revisions FOR SELECT
  TO authenticated
  USING (private.is_super_admin() OR private.is_assigned_instructor(course_id));

CREATE POLICY "lesson_revisions_instructor_manage"
  ON public.lesson_revisions FOR ALL
  TO authenticated
  USING (private.is_assigned_instructor(course_id) OR private.is_super_admin())
  WITH CHECK (private.is_assigned_instructor(course_id) OR private.is_super_admin());

CREATE POLICY "lesson_resources_select"
  ON public.lesson_resources FOR SELECT
  TO authenticated
  USING (
    private.is_super_admin()
    OR private.is_assigned_instructor(course_id)
    OR private.is_active_student_in_course(course_id)
  );

CREATE POLICY "lesson_resources_instructor_manage"
  ON public.lesson_resources FOR ALL
  TO authenticated
  USING (private.is_assigned_instructor(course_id) OR private.is_super_admin())
  WITH CHECK (private.is_assigned_instructor(course_id) OR private.is_super_admin());

-- ----------------------------------------------------------------------------
-- 5. Enrollment, Payment Settings, Disputes & Immutable Audit Log Policies
-- ----------------------------------------------------------------------------

CREATE POLICY "course_payment_settings_public_select"
  ON public.course_payment_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "course_payment_settings_lead_or_admin"
  ON public.course_payment_settings FOR ALL
  TO authenticated
  USING (private.can_confirm_payment(course_id) OR private.is_super_admin())
  WITH CHECK (private.can_confirm_payment(course_id) OR private.is_super_admin());

CREATE POLICY "enrollment_requests_select_scoped"
  ON public.enrollment_requests FOR SELECT
  TO authenticated
  USING (
    student_id = (SELECT auth.uid())
    OR private.is_super_admin()
    OR private.is_assigned_instructor(course_id)
  );

-- Direct student INSERT/UPDATE blocked in favor of transactional RPCs; super_admin retains emergency control
CREATE POLICY "enrollment_requests_admin_manage"
  ON public.enrollment_requests FOR ALL
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

CREATE POLICY "course_enrollments_select_scoped"
  ON public.course_enrollments FOR SELECT
  TO authenticated
  USING (
    student_id = (SELECT auth.uid())
    OR private.is_super_admin()
    OR private.is_assigned_instructor(course_id)
  );

CREATE POLICY "course_enrollments_admin_manage"
  ON public.course_enrollments FOR ALL
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

-- Immutable Audit Log: SELECT only for scoped parties; ZERO UPDATE/DELETE policies!
CREATE POLICY "enrollment_audit_select_scoped"
  ON public.enrollment_audit_events FOR SELECT
  TO authenticated
  USING (
    private.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.enrollment_requests er
      WHERE er.id = enrollment_audit_events.enrollment_request_id
        AND (er.student_id = (SELECT auth.uid()) OR private.is_assigned_instructor(er.course_id))
    )
  );

CREATE POLICY "enrollment_disputes_select_scoped"
  ON public.enrollment_disputes FOR SELECT
  TO authenticated
  USING (
    student_id = (SELECT auth.uid())
    OR private.is_super_admin()
    OR private.is_assigned_instructor(course_id)
  );

CREATE POLICY "enrollment_disputes_student_insert"
  ON public.enrollment_disputes FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.enrollment_requests er
      WHERE er.id = enrollment_disputes.enrollment_request_id
        AND er.student_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "enrollment_disputes_admin_update"
  ON public.enrollment_disputes FOR UPDATE
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

-- ----------------------------------------------------------------------------
-- 6. Learning Progress & Certificates Policies
-- ----------------------------------------------------------------------------

CREATE POLICY "lesson_progress_student_own"
  ON public.lesson_progress FOR ALL
  TO authenticated
  USING (student_id = (SELECT auth.uid()) AND private.is_active_student_in_course(course_id))
  WITH CHECK (student_id = (SELECT auth.uid()) AND private.is_active_student_in_course(course_id));

CREATE POLICY "lesson_progress_instructor_admin_select"
  ON public.lesson_progress FOR SELECT
  TO authenticated
  USING (private.is_super_admin() OR private.is_assigned_instructor(course_id));

CREATE POLICY "certificates_select_scoped"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (
    student_id = (SELECT auth.uid())
    OR private.is_super_admin()
    OR private.is_assigned_instructor(course_id)
  );

CREATE POLICY "certificates_admin_manage"
  ON public.certificates FOR ALL
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

-- ----------------------------------------------------------------------------
-- 7. Community, Messaging, Announcements, Notifications & Reviews Policies
-- ----------------------------------------------------------------------------

CREATE POLICY "community_posts_select_private_course"
  ON public.course_community_posts FOR SELECT
  TO authenticated
  USING (
    private.is_super_admin()
    OR private.is_assigned_instructor(course_id)
    OR (is_hidden = false AND private.is_active_student_in_course(course_id))
  );

CREATE POLICY "community_posts_insert_member"
  ON public.course_community_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND (private.is_active_student_in_course(course_id) OR private.is_assigned_instructor(course_id))
  );

CREATE POLICY "community_posts_moderate"
  ON public.course_community_posts FOR UPDATE
  TO authenticated
  USING (author_id = (SELECT auth.uid()) OR private.is_assigned_instructor(course_id) OR private.is_super_admin())
  WITH CHECK (author_id = (SELECT auth.uid()) OR private.is_assigned_instructor(course_id) OR private.is_super_admin());

CREATE POLICY "community_posts_delete"
  ON public.course_community_posts FOR DELETE
  TO authenticated
  USING (author_id = (SELECT auth.uid()) OR private.is_assigned_instructor(course_id) OR private.is_super_admin());

CREATE POLICY "community_comments_select"
  ON public.community_comments FOR SELECT
  TO authenticated
  USING (
    private.is_super_admin()
    OR private.is_assigned_instructor(course_id)
    OR (is_hidden = false AND private.is_active_student_in_course(course_id))
  );

CREATE POLICY "community_comments_insert"
  ON public.community_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND (private.is_active_student_in_course(course_id) OR private.is_assigned_instructor(course_id))
  );

CREATE POLICY "community_attachments_select"
  ON public.community_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_community_posts p
      WHERE p.id = community_attachments.post_id
        AND (private.is_super_admin() OR private.is_assigned_instructor(p.course_id) OR private.is_active_student_in_course(p.course_id))
    )
  );

CREATE POLICY "community_moderation_actions_select"
  ON public.community_moderation_actions FOR SELECT
  TO authenticated
  USING (private.is_super_admin() OR (course_id IS NOT NULL AND private.is_assigned_instructor(course_id)));

CREATE POLICY "conversations_participant_select"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (private.is_conversation_participant(id) OR private.is_super_admin());

CREATE POLICY "conversation_participants_own"
  ON public.conversation_participants FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR private.is_conversation_participant(conversation_id) OR private.is_super_admin());

CREATE POLICY "messages_participant_select"
  ON public.messages FOR SELECT
  TO authenticated
  USING (private.is_conversation_participant(conversation_id) OR private.is_super_admin());

CREATE POLICY "messages_participant_insert"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = (SELECT auth.uid()) AND private.is_conversation_participant(conversation_id));

CREATE POLICY "message_attachments_participant_select"
  ON public.message_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_attachments.message_id
        AND (private.is_conversation_participant(m.conversation_id) OR private.is_super_admin())
    )
  );

CREATE POLICY "announcements_select"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (
    private.is_super_admin()
    OR private.is_assigned_instructor(course_id)
    OR (status = 'published' AND private.is_active_student_in_course(course_id))
  );

CREATE POLICY "announcements_instructor_manage"
  ON public.announcements FOR ALL
  TO authenticated
  USING (private.is_assigned_instructor(course_id) OR private.is_super_admin())
  WITH CHECK (private.is_assigned_instructor(course_id) OR private.is_super_admin());

CREATE POLICY "notifications_own_select"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR private.is_super_admin());

CREATE POLICY "notifications_own_update"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "notification_preferences_own"
  ON public.notification_preferences FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "email_event_logs_admin_only"
  ON public.email_event_logs FOR SELECT
  TO authenticated
  USING (private.is_super_admin());

CREATE POLICY "course_reviews_select"
  ON public.course_reviews FOR SELECT
  TO anon, authenticated
  USING (
    status = 'approved'
    OR student_id = (SELECT auth.uid())
    OR private.is_super_admin()
    OR private.is_assigned_instructor(course_id)
  );

CREATE POLICY "course_reviews_student_insert"
  ON public.course_reviews FOR INSERT
  TO authenticated
  WITH CHECK (student_id = (SELECT auth.uid()) AND private.is_active_student_in_course(course_id));

CREATE POLICY "course_reviews_admin_manage"
  ON public.course_reviews FOR ALL
  TO authenticated
  USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

CREATE POLICY "instructor_responses_select"
  ON public.instructor_responses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "instructor_responses_manage"
  ON public.instructor_responses FOR ALL
  TO authenticated
  USING (
    private.is_super_admin()
    OR (
      instructor_id = (SELECT auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.course_reviews r
        WHERE r.id = instructor_responses.review_id
          AND private.is_assigned_instructor(r.course_id)
      )
    )
  )
  WITH CHECK (instructor_id = (SELECT auth.uid()) OR private.is_super_admin());

CREATE POLICY "analytics_events_admin_select"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (private.is_super_admin() OR (course_id IS NOT NULL AND private.is_assigned_instructor(course_id)));

-- ----------------------------------------------------------------------------
-- 8. Private Supabase Storage Buckets & Policies
-- ----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'course-resources',
    'course-resources',
    false,
    26214400,
    ARRAY[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/png',
      'image/jpeg'
    ]
  ),
  (
    'community-attachments',
    'community-attachments',
    false,
    10485760,
    ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- Storage paths follow: <course_id>/<filename>
CREATE POLICY "course_resources_storage_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'course-resources'
    AND (
      private.is_super_admin()
      OR private.is_assigned_instructor((storage.foldername(name))[1]::uuid)
      OR private.is_active_student_in_course((storage.foldername(name))[1]::uuid)
    )
  );

CREATE POLICY "course_resources_storage_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'course-resources'
    AND (
      private.is_super_admin()
      OR private.is_assigned_instructor((storage.foldername(name))[1]::uuid)
    )
  );

CREATE POLICY "course_resources_storage_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'course-resources'
    AND (
      private.is_super_admin()
      OR private.is_assigned_instructor((storage.foldername(name))[1]::uuid)
    )
  );

CREATE POLICY "course_resources_storage_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'course-resources'
    AND (
      private.is_super_admin()
      OR private.is_assigned_instructor((storage.foldername(name))[1]::uuid)
    )
  );

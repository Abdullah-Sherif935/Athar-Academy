-- ============================================================================
-- ATHAR ACADEMY — Migration 0007: Phase 04B RLS Hardening, Storage & RPCs
-- ============================================================================

-- 1. Tighten instructor_responses WITH CHECK so unrelated instructors cannot reply
ALTER POLICY "instructor_responses_manage"
  ON public.instructor_responses
  WITH CHECK (
    private.is_super_admin()
    OR (
      instructor_id = (SELECT auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.course_reviews r
        WHERE r.id = instructor_responses.review_id
          AND private.is_assigned_instructor(r.course_id)
      )
    )
  );

-- 2. Missing RLS policies for community_attachments, community_moderation_actions,
--    conversation_participants (unread_count reset), and analytics_events (insert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'community_attachments'
      AND policyname = 'community_attachments_insert_member'
  ) THEN
    CREATE POLICY "community_attachments_insert_member"
      ON public.community_attachments FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.course_community_posts p
          WHERE p.id = community_attachments.post_id
            AND (
              p.author_id = (SELECT auth.uid())
              OR private.is_super_admin()
              OR private.is_assigned_instructor(p.course_id)
            )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'community_attachments'
      AND policyname = 'community_attachments_delete_scoped'
  ) THEN
    CREATE POLICY "community_attachments_delete_scoped"
      ON public.community_attachments FOR DELETE
      TO authenticated
      USING (
        private.is_super_admin()
        OR EXISTS (
          SELECT 1 FROM public.course_community_posts p
          WHERE p.id = community_attachments.post_id
            AND (p.author_id = (SELECT auth.uid()) OR private.is_assigned_instructor(p.course_id))
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'community_moderation_actions'
      AND policyname = 'community_moderation_actions_insert_scoped'
  ) THEN
    CREATE POLICY "community_moderation_actions_insert_scoped"
      ON public.community_moderation_actions FOR INSERT
      TO authenticated
      WITH CHECK (
        moderator_id = (SELECT auth.uid())
        AND (
          private.is_super_admin()
          OR (course_id IS NOT NULL AND private.is_assigned_instructor(course_id))
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'conversation_participants'
      AND policyname = 'conversation_participants_update_own'
  ) THEN
    CREATE POLICY "conversation_participants_update_own"
      ON public.conversation_participants FOR UPDATE
      TO authenticated
      USING (user_id = (SELECT auth.uid()))
      WITH CHECK (user_id = (SELECT auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'analytics_events'
      AND policyname = 'analytics_events_authenticated_insert'
  ) THEN
    CREATE POLICY "analytics_events_authenticated_insert"
      ON public.analytics_events FOR INSERT
      TO authenticated
      WITH CHECK (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- 3. Private Storage RLS policies for community-attachments bucket (<course_id>/<filename>)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'community_attachments_storage_select'
  ) THEN
    CREATE POLICY "community_attachments_storage_select"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'community-attachments'
        AND (
          private.is_super_admin()
          OR private.is_assigned_instructor((storage.foldername(name))[1]::uuid)
          OR private.is_active_student_in_course((storage.foldername(name))[1]::uuid)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'community_attachments_storage_insert'
  ) THEN
    CREATE POLICY "community_attachments_storage_insert"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'community-attachments'
        AND (
          private.is_super_admin()
          OR private.is_assigned_instructor((storage.foldername(name))[1]::uuid)
          OR private.is_active_student_in_course((storage.foldername(name))[1]::uuid)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'community_attachments_storage_delete'
  ) THEN
    CREATE POLICY "community_attachments_storage_delete"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'community-attachments'
        AND (
          owner = (SELECT auth.uid())
          OR private.is_super_admin()
          OR private.is_assigned_instructor((storage.foldername(name))[1]::uuid)
        )
      );
  END IF;
END $$;

-- 4. Transactional RPC: Cancel Enrollment Request (Student / Assigned Instructor / Super Admin)
CREATE OR REPLACE FUNCTION public.rpc_cancel_enrollment_request(
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
  v_actor_role text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_req FROM public.enrollment_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND OR v_req.status NOT IN ('pending', 'awaiting_payment') THEN
    RAISE EXCEPTION 'Enrollment request cannot be cancelled in its current state';
  END IF;

  IF private.is_super_admin() THEN
    v_actor_role := 'admin';
  ELSIF private.is_assigned_instructor(v_req.course_id) THEN
    v_actor_role := 'instructor';
  ELSIF v_req.student_id = v_uid THEN
    v_actor_role := 'student';
  ELSE
    RAISE EXCEPTION 'Unauthorized to cancel this enrollment request';
  END IF;

  UPDATE public.enrollment_requests
  SET status = 'cancelled',
      review_note = COALESCE(NULLIF(trim(COALESCE(p_reason, '')), ''), review_note),
      updated_at = now()
  WHERE id = p_request_id;

  INSERT INTO public.enrollment_audit_events (
    enrollment_request_id, event_type, actor_id, actor_role, previous_status, new_status, reason
  )
  VALUES (
    p_request_id,
    CASE WHEN v_actor_role = 'student' THEN 'student_cancelled' ELSE 'admin_override' END,
    v_uid,
    v_actor_role,
    v_req.status,
    'cancelled',
    NULLIF(trim(COALESCE(p_reason, '')), '')
  );
END;
$$;

-- 5. Transactional RPC: Create or Get Authorized Direct Conversation
CREATE OR REPLACE FUNCTION public.rpc_create_or_get_conversation(
  p_course_id uuid,
  p_other_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_conv_id uuid;
  v_caller_is_student boolean;
  v_caller_is_instructor boolean;
  v_other_is_student boolean;
  v_other_is_instructor boolean;
BEGIN
  IF v_uid IS NULL OR p_other_user_id IS NULL OR v_uid = p_other_user_id THEN
    RAISE EXCEPTION 'Invalid conversation participants';
  END IF;

  v_caller_is_student := private.is_active_student_in_course(p_course_id);
  v_caller_is_instructor := private.is_assigned_instructor(p_course_id);

  SELECT EXISTS (
    SELECT 1 FROM public.course_enrollments ce
    WHERE ce.course_id = p_course_id AND ce.student_id = p_other_user_id AND ce.is_suspended = false
  ) INTO v_other_is_student;

  SELECT EXISTS (
    SELECT 1 FROM public.course_instructors ci
    WHERE ci.course_id = p_course_id AND ci.instructor_id = p_other_user_id
  ) INTO v_other_is_instructor;

  IF NOT (
    private.is_super_admin()
    OR (v_caller_is_student AND v_other_is_instructor)
    OR (v_caller_is_instructor AND v_other_is_student)
  ) THEN
    RAISE EXCEPTION 'Unauthorized to start a conversation for this course';
  END IF;

  SELECT c.id INTO v_conv_id
  FROM public.conversations c
  JOIN public.conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = v_uid
  JOIN public.conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = p_other_user_id
  WHERE c.course_id = p_course_id
  LIMIT 1;

  IF v_conv_id IS NOT NULL THEN
    RETURN v_conv_id;
  END IF;

  INSERT INTO public.conversations (course_id)
  VALUES (p_course_id)
  RETURNING id INTO v_conv_id;

  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (v_conv_id, v_uid), (v_conv_id, p_other_user_id);

  RETURN v_conv_id;
END;
$$;

-- 6. Transactional RPC: Reject Lesson Revision (Super Admin only; preserves live published lesson)
CREATE OR REPLACE FUNCTION public.rpc_reject_lesson_revision(
  p_revision_id uuid,
  p_reason text DEFAULT NULL
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

  UPDATE public.lesson_revisions
  SET status = 'rejected',
      rejection_reason = NULLIF(trim(COALESCE(p_reason, '')), ''),
      reviewed_by = v_uid,
      updated_at = now()
  WHERE id = p_revision_id;
END;
$$;

-- 7. Transactional RPC: Reject Course Proposal (Super Admin only)
CREATE OR REPLACE FUNCTION public.rpc_reject_course_proposal(
  p_proposal_id uuid,
  p_reason text DEFAULT NULL
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

  UPDATE public.course_proposals
  SET status = 'rejected',
      rejection_reason = NULLIF(trim(COALESCE(p_reason, '')), ''),
      reviewed_by = v_uid,
      updated_at = now()
  WHERE id = p_proposal_id;
END;
$$;

-- 8. Transactional RPC: Resolve Enrollment Dispute (Super Admin only)
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
      enrollment_request_id, event_type, actor_id, actor_role, reason
    )
    VALUES (
      v_disp.enrollment_request_id,
      'dispute_resolved',
      v_uid,
      'admin',
      trim(COALESCE(p_resolution_note, ''))
    );
  END IF;
END;
$$;

-- 9. Transactional RPC: Upsert Student Lesson Progress, Playback Position & Notes
CREATE OR REPLACE FUNCTION public.rpc_upsert_lesson_progress(
  p_course_id uuid,
  p_lesson_id uuid,
  p_is_completed boolean DEFAULT NULL,
  p_playback_seconds integer DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_pct integer;
BEGIN
  IF v_uid IS NULL OR NOT private.is_active_student_in_course(p_course_id) THEN
    RAISE EXCEPTION 'Active course enrollment required';
  END IF;

  INSERT INTO public.lesson_progress (
    student_id, course_id, lesson_id, is_completed, completed_at, playback_position_seconds, notes, last_accessed_at
  )
  VALUES (
    v_uid,
    p_course_id,
    p_lesson_id,
    COALESCE(p_is_completed, false),
    CASE WHEN COALESCE(p_is_completed, false) THEN now() ELSE NULL END,
    GREATEST(0, COALESCE(p_playback_seconds, 0)),
    COALESCE(p_notes, ''),
    now()
  )
  ON CONFLICT (student_id, lesson_id) DO UPDATE SET
    is_completed = COALESCE(p_is_completed, public.lesson_progress.is_completed),
    completed_at = CASE
      WHEN p_is_completed IS TRUE THEN COALESCE(public.lesson_progress.completed_at, now())
      WHEN p_is_completed IS FALSE THEN NULL
      ELSE public.lesson_progress.completed_at
    END,
    playback_position_seconds = CASE
      WHEN p_playback_seconds IS NOT NULL THEN GREATEST(0, p_playback_seconds)
      ELSE public.lesson_progress.playback_position_seconds
    END,
    notes = COALESCE(p_notes, public.lesson_progress.notes),
    last_accessed_at = now();

  SELECT public.rpc_calculate_course_progress(p_course_id) INTO v_pct;
  RETURN v_pct;
END;
$$;

-- 10. Revoke PUBLIC and anon EXECUTE on all new SECURITY DEFINER RPCs; grant ONLY to authenticated
REVOKE ALL ON FUNCTION public.rpc_cancel_enrollment_request(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_create_or_get_conversation(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_reject_lesson_revision(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_reject_course_proposal(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_resolve_enrollment_dispute(uuid, text, boolean, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_upsert_lesson_progress(uuid, uuid, boolean, integer, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.rpc_cancel_enrollment_request(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_create_or_get_conversation(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_reject_lesson_revision(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_reject_course_proposal(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_resolve_enrollment_dispute(uuid, text, boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_upsert_lesson_progress(uuid, uuid, boolean, integer, text) TO authenticated;

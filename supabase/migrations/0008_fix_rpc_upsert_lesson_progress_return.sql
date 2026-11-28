-- ============================================================================
-- ATHAR ACADEMY — Migration 0008: Fix rpc_upsert_lesson_progress percent read
-- ============================================================================

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
  v_pct integer := 0;
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

  SELECT percent INTO v_pct FROM public.rpc_calculate_course_progress(p_course_id);
  RETURN COALESCE(v_pct, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_upsert_lesson_progress(uuid, uuid, boolean, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_upsert_lesson_progress(uuid, uuid, boolean, integer, text) TO authenticated;

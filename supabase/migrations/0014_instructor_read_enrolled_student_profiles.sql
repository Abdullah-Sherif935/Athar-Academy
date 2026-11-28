-- ============================================================================
-- ATHAR ACADEMY — Migration 0014
-- Allow assigned instructors to view profiles of students who have an
-- enrollment request or enrollment in one of the instructor's assigned courses.
-- Strictly scoped: instructors still cannot read unrelated students,
-- and students still cannot read other students' profiles.
-- ============================================================================

DROP POLICY IF EXISTS profiles_instructor_enrolled_students ON public.profiles;
CREATE POLICY profiles_instructor_enrolled_students
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.enrollment_requests er
      WHERE er.student_id = profiles.id
        AND private.is_assigned_instructor(er.course_id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.course_enrollments ce
      WHERE ce.student_id = profiles.id
        AND private.is_assigned_instructor(ce.course_id)
    )
  );

-- ============================================================================
-- ATHAR ACADEMY — Migration 0001: Identity, Access Management & Academic Schema
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Private schema for internal security helpers (not exposed via Data API)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, anon;

-- ----------------------------------------------------------------------------
-- 1. Identity & Access Management
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name_ar text NOT NULL DEFAULT '',
  full_name_en text NOT NULL DEFAULT '',
  initials text NOT NULL DEFAULT 'AA',
  avatar_url text,
  bio_ar text NOT NULL DEFAULT '',
  bio_en text NOT NULL DEFAULT '',
  account_status text NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'inactive', 'suspended', 'revoked')),
  preferred_language text NOT NULL DEFAULT 'ar' CHECK (preferred_language IN ('ar', 'en')),
  preferred_theme text NOT NULL DEFAULT 'system' CHECK (preferred_theme IN ('system', 'light', 'dark')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin', 'instructor', 'student')),
  granted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

CREATE TABLE IF NOT EXISTS public.instructor_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  short_bio_ar text NOT NULL DEFAULT '',
  short_bio_en text NOT NULL DEFAULT '',
  biography_ar text NOT NULL DEFAULT '',
  biography_en text NOT NULL DEFAULT '',
  expertise jsonb NOT NULL DEFAULT '[]'::jsonb,
  experience jsonb NOT NULL DEFAULT '[]'::jsonb,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  accent text NOT NULL DEFAULT 'teal' CHECK (accent IN ('blue', 'teal', 'orange', 'navy')),
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  interests jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  platform_name_ar text NOT NULL DEFAULT 'أكاديمية أثر',
  platform_name_en text NOT NULL DEFAULT 'ATHAR ACADEMY',
  tagline_ar text NOT NULL DEFAULT 'تعلّم · تطوّر · اصنع أثرًا',
  tagline_en text NOT NULL DEFAULT 'LEARN · GROW · MAKE AN IMPACT',
  default_language text NOT NULL DEFAULT 'ar' CHECK (default_language IN ('ar', 'en')),
  default_theme text NOT NULL DEFAULT 'system' CHECK (default_theme IN ('system', 'light', 'dark')),
  allow_public_registration boolean NOT NULL DEFAULT true,
  require_enrollment_approval boolean NOT NULL DEFAULT true,
  require_lesson_approval boolean NOT NULL DEFAULT false,
  require_review_moderation boolean NOT NULL DEFAULT true,
  notification_events jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Automatic profile + default student role initialization on auth.users signup
-- Never trusts user_metadata for role elevation: every public signup gets 'student' ONLY.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_initials text;
BEGIN
  v_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''), split_part(NEW.email, '@', 1));
  v_initials := upper(substr(regexp_replace(v_name, '\s+', '', 'g'), 1, 2));
  IF v_initials = '' THEN v_initials := 'AA'; END IF;

  INSERT INTO public.profiles (id, email, full_name_ar, full_name_en, initials)
  VALUES (NEW.id, NEW.email, v_name, v_name, v_initials)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.student_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ----------------------------------------------------------------------------
-- 2. Academic Structure
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.disciplines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  short_description_ar text NOT NULL DEFAULT '',
  short_description_en text NOT NULL DEFAULT '',
  overview_ar text NOT NULL DEFAULT '',
  overview_en text NOT NULL DEFAULT '',
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  icon_name text NOT NULL DEFAULT 'compass',
  accent text NOT NULL DEFAULT 'blue' CHECK (accent IN ('blue', 'teal', 'orange', 'navy')),
  featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  discipline_id uuid NOT NULL REFERENCES public.disciplines(id) ON DELETE RESTRICT,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  short_description_ar text NOT NULL DEFAULT '',
  short_description_en text NOT NULL DEFAULT '',
  full_description_ar text NOT NULL DEFAULT '',
  full_description_en text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_ar text NOT NULL DEFAULT '',
  duration_en text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'bilingual' CHECK (language IN ('ar', 'en', 'bilingual')),
  thumbnail_url text,
  accent text NOT NULL DEFAULT 'blue' CHECK (accent IN ('blue', 'teal', 'orange', 'navy')),
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'published', 'archived')),
  is_suspended boolean NOT NULL DEFAULT false,
  what_you_will_learn jsonb NOT NULL DEFAULT '[]'::jsonb,
  objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  target_audience jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_discipline_id ON public.courses(discipline_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);

CREATE TABLE IF NOT EXISTS public.course_instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'co_instructor' CHECK (role IN ('lead', 'co_instructor')),
  can_confirm_payments boolean NOT NULL DEFAULT false,
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, instructor_id)
);

-- Guarantee at most ONE Lead Instructor per course
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_instructors_single_lead
  ON public.course_instructors(course_id)
  WHERE role = 'lead';
CREATE INDEX IF NOT EXISTS idx_course_instructors_instructor_id ON public.course_instructors(instructor_id);

CREATE TABLE IF NOT EXISTS public.course_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposing_instructor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  discipline_id uuid NOT NULL REFERENCES public.disciplines(id) ON DELETE RESTRICT,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  short_description_ar text NOT NULL DEFAULT '',
  short_description_en text NOT NULL DEFAULT '',
  full_description_ar text NOT NULL DEFAULT '',
  full_description_en text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  language text NOT NULL DEFAULT 'bilingual' CHECK (language IN ('ar', 'en', 'bilingual')),
  thumbnail_url text,
  duration_ar text NOT NULL DEFAULT '',
  duration_en text NOT NULL DEFAULT '',
  suggested_price text NOT NULL DEFAULT '',
  enrollment_notes text NOT NULL DEFAULT '',
  what_you_will_learn jsonb NOT NULL DEFAULT '[]'::jsonb,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  target_audience jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
  rejection_reason text,
  approved_course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_proposals_instructor ON public.course_proposals(proposing_instructor_id);
CREATE INDEX IF NOT EXISTS idx_course_proposals_status ON public.course_proposals(status);

CREATE TABLE IF NOT EXISTS public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id, sort_order);

CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  short_description_ar text NOT NULL DEFAULT '',
  short_description_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  lesson_type text NOT NULL DEFAULT 'video' CHECK (lesson_type IN ('video', 'reading', 'practice', 'mixed')),
  video_provider text NOT NULL DEFAULT 'youtube_unlisted'
    CHECK (video_provider IN ('youtube_unlisted', 'cloudflare_stream', 'vimeo', 'custom_hls')),
  video_url text,
  video_source_id text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 15 CHECK (duration_minutes >= 1),
  materials_note_ar text NOT NULL DEFAULT '',
  materials_note_en text NOT NULL DEFAULT '',
  is_preview boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'rejected')),
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON public.lessons(status);

-- Preserves published lesson content while draft/pending revisions are edited & reviewed
CREATE TABLE IF NOT EXISTS public.lesson_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  submitted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  short_description_ar text NOT NULL DEFAULT '',
  short_description_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  lesson_type text NOT NULL DEFAULT 'video' CHECK (lesson_type IN ('video', 'reading', 'practice', 'mixed')),
  video_provider text NOT NULL DEFAULT 'youtube_unlisted'
    CHECK (video_provider IN ('youtube_unlisted', 'cloudflare_stream', 'vimeo', 'custom_hls')),
  video_url text,
  video_source_id text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 15 CHECK (duration_minutes >= 1),
  materials_note_ar text NOT NULL DEFAULT '',
  materials_note_en text NOT NULL DEFAULT '',
  is_preview boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_revisions_lesson_id ON public.lesson_revisions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_revisions_status ON public.lesson_revisions(status);

CREATE TABLE IF NOT EXISTS public.lesson_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  resource_type text NOT NULL DEFAULT 'pdf'
    CHECK (resource_type IN ('pdf', 'document', 'presentation', 'spreadsheet', 'link')),
  storage_path text,
  external_url text,
  file_name text,
  file_size_bytes bigint,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson_id ON public.lesson_resources(lesson_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_course_id ON public.lesson_resources(course_id);

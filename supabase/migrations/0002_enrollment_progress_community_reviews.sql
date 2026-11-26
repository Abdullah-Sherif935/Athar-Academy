-- ============================================================================
-- ATHAR ACADEMY — Migration 0002: Enrollments, Progress, Community & Reviews
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3. Enrollment & Direct Payment Management
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.course_payment_settings (
  course_id uuid PRIMARY KEY REFERENCES public.courses(id) ON DELETE CASCADE,
  is_free boolean NOT NULL DEFAULT false,
  price_amount numeric(10, 2) NOT NULL DEFAULT 1500 CHECK (price_amount >= 0),
  currency text NOT NULL DEFAULT 'EGP' CHECK (currency IN ('EGP', 'USD', 'SAR')),
  payment_methods text[] NOT NULL DEFAULT ARRAY['vodafone_cash', 'instapay', 'bank_transfer'],
  payment_instructions_ar text NOT NULL DEFAULT 'تواصل مع المدرب الرئيسي لتنسيق الدفع المباشر خارج المنصة. أكاديمية أثر لا تحصّل المدفوعات.',
  payment_instructions_en text NOT NULL DEFAULT 'Contact the Lead Instructor to coordinate direct payment outside the platform. ATHAR ACADEMY does not collect payments.',
  enrollment_open boolean NOT NULL DEFAULT true,
  max_capacity integer CHECK (max_capacity IS NULL OR max_capacity > 0),
  enrollment_start_date date,
  enrollment_end_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enrollment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lead_instructor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending', 'awaiting_payment', 'payment_confirmed', 'active',
      'rejected', 'cancelled', 'suspended', 'refunded'
    )),
  payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('not_required', 'unpaid', 'awaiting_payment', 'confirmed', 'refunded_record')),
  price_snapshot numeric(10, 2) NOT NULL DEFAULT 0 CHECK (price_snapshot >= 0),
  currency text NOT NULL DEFAULT 'EGP' CHECK (currency IN ('EGP', 'USD', 'SAR')),
  is_free_snapshot boolean NOT NULL DEFAULT false,
  student_message text,
  review_note text,
  payment_confirmed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  payment_confirmed_at timestamptz,
  payment_declaration_accepted boolean NOT NULL DEFAULT false,
  admin_override_reason text,
  admin_override_at timestamptz,
  admin_override_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate active / pending / awaiting_payment requests per (student_id, course_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollment_requests_no_active_duplicate
  ON public.enrollment_requests(student_id, course_id)
  WHERE status IN ('pending', 'awaiting_payment', 'payment_confirmed', 'active');

CREATE INDEX IF NOT EXISTS idx_enrollment_requests_student ON public.enrollment_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_course ON public.enrollment_requests(course_id, status);

CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_request_id uuid REFERENCES public.enrollment_requests(id) ON DELETE SET NULL,
  is_suspended boolean NOT NULL DEFAULT false,
  activated_at timestamptz NOT NULL DEFAULT now(),
  last_accessed_lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  last_accessed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON public.course_enrollments(course_id);

-- Immutable Audit Log (no UPDATE or DELETE policies)
CREATE TABLE IF NOT EXISTS public.enrollment_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_request_id uuid NOT NULL REFERENCES public.enrollment_requests(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'request_created', 'instructor_accepted', 'instructor_rejected',
    'payment_confirmed', 'enrollment_activated', 'admin_suspended',
    'admin_reactivated', 'enrollment_cancelled', 'admin_override',
    'dispute_submitted', 'dispute_resolved'
  )),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role text NOT NULL CHECK (actor_role IN ('student', 'instructor', 'admin', 'system')),
  previous_status text,
  new_status text NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enrollment_audit_request ON public.enrollment_audit_events(enrollment_request_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.enrollment_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_request_id uuid NOT NULL REFERENCES public.enrollment_requests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('access_not_granted', 'instructor_no_response', 'course_mismatch', 'other')),
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved')),
  resolution_note text,
  refund_confirmed_by_parties boolean NOT NULL DEFAULT false,
  resolved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enrollment_disputes_course ON public.enrollment_disputes(course_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollment_disputes_student ON public.enrollment_disputes(student_id);

-- ----------------------------------------------------------------------------
-- 4. Learning Progress & Certificates
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed boolean NOT NULL DEFAULT false,
  playback_position_seconds integer NOT NULL DEFAULT 0 CHECK (playback_position_seconds >= 0),
  notes text NOT NULL DEFAULT '',
  completed_at timestamptz,
  last_accessed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_student_course ON public.lesson_progress(student_id, course_id);

CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_code text NOT NULL UNIQUE,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

-- ----------------------------------------------------------------------------
-- 5. Community, Messaging, Announcements & Notifications
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.course_community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  is_announcement boolean NOT NULL DEFAULT false,
  is_hidden boolean NOT NULL DEFAULT false,
  is_reported boolean NOT NULL DEFAULT false,
  likes_count integer NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_course ON public.course_community_posts(course_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.course_community_posts(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post ON public.community_comments(post_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.community_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.course_community_posts(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  file_size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.course_community_posts(id) ON DELETE SET NULL,
  moderator_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unread_count integer NOT NULL DEFAULT 0 CHECK (unread_count >= 0),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON public.conversation_participants(user_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_announcements_course ON public.announcements(course_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'update' CHECK (kind IN ('lesson', 'announcement', 'reply', 'message', 'update')),
  title_ar text NOT NULL,
  title_en text NOT NULL,
  body_ar text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  target_path text NOT NULL DEFAULT '/',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  new_lessons boolean NOT NULL DEFAULT true,
  instructor_announcements boolean NOT NULL DEFAULT true,
  community_replies boolean NOT NULL DEFAULT true,
  direct_messages boolean NOT NULL DEFAULT true,
  weekly_summary boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_event_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  event_key text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'queued_no_provider' CHECK (status IN ('queued_no_provider', 'sent', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. Reviews & Analytics
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.course_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
  moderation_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_course_reviews_course ON public.course_reviews(course_id, status);

CREATE TABLE IF NOT EXISTS public.instructor_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL UNIQUE REFERENCES public.course_reviews(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  event_name text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_course ON public.analytics_events(course_id, created_at DESC);

# ATHAR ACADEMY — Phased Implementation Roadmap

This roadmap breaks the build of **ATHAR ACADEMY** into **9 incremental, testable phases**. Each phase produces a working, verifiable milestone and avoids big-bang rewrites.

---

## Pre-Phase Checklist (Before Phase 01 Starts)

- [ ] Confirm brand logo assets (`public/brand/` 5 files from brand-assets ZIP, or approve temporary use of existing PNGs during Phase 01).
- [ ] Install Git on the workstation and initialize version control.
- [ ] Confirm target Supabase project (existing or new free-tier project) and transactional email provider (e.g., Resend free tier).

---

## Phase 01: Project Foundation, Brand System, i18n (RTL/LTR) & Theme Engine

### Objectives
Establish a clean, production-grade React + TypeScript + Vite foundation with centralized brand configuration, design tokens, Arabic/English localization, RTL/LTR switching, and Light/Dark/System theming.

### Tasks
1. Initialize Git repository with `.gitignore` and scaffold Vite + React + TypeScript project.
2. Mirror `Skills/ATHAR_ACADEMY_SKILL.md` to `.agent/skills/athar-academy-brand-system/SKILL.md` for standard agent discovery.
3. Organize brand assets in `public/brand/` and create centralized `src/config/brand.ts` (brand name, taglines, logo asset paths).
4. Implement centralized CSS design tokens (`src/styles/tokens.css`) matching `ATHAR_ACADEMY_SKILL.md` (light, dark, semantic colors) and load **Inter** (EN) and **Cairo** (AR) fonts.
5. Build the centralized Theme Engine (`light` | `dark` | `system`, default `system`, zero-FOUC inline script in `index.html`, instant switching without reload).
6. Build the centralized i18n & Direction Manager (`ar`/`rtl`, `en`/`ltr`, persistent storage, translation dictionaries, logical CSS utilities).
7. Build reusable accessible UI primitives (`Button`, `Card`, `Input`, `Badge`, `Modal`, `Alert`, `EmptyState`, `Skeleton`, `BrandLogo`, `LanguageSwitcher`, `ThemeSwitcher`) and the responsive Navigation + Footer shell.
8. Add `.env.example` and runtime environment validation (`src/config/env.ts`).

### Dependencies
- Pre-Phase Checklist items (especially logo asset confirmation).

### Expected Deliverables
- Working Vite + React + TypeScript app with layout shell, language switcher, theme switcher, and component showcase / foundation routes.
- `src/config/brand.ts`, `src/styles/tokens.css`, `src/i18n/`, `src/components/ui/`, `.env.example`.

### Testing Requirements
- Verify TypeScript compilation (`tsc --noEmit`) and production build (`vite build`).
- Visual & responsive verification at mobile (375px), tablet (768px), and desktop (1280px+) in all 4 combinations: EN/Light, EN/Dark, AR-RTL/Light, AR-RTL/Dark.
- Confirm zero horizontal overflow, proper font rendering (Inter vs Cairo), keyboard focus rings, and zero FOUC on hard reload.

### Completion Criteria
- All brand checklist items in `ATHAR_ACADEMY_SKILL.md` §11 pass on the foundation shell.

---

## Phase 02: Database Schema, Supabase Integration, Auth & RBAC

### Objectives
Provision the core Supabase PostgreSQL schema, strict Row Level Security (RLS) policies, authentication flows, and role-based routing.

### Tasks
1. Configure Supabase client (`src/lib/supabaseClient.ts`) using publishable anon key only.
2. Write and apply initial SQL migrations: `profiles`, `categories`, `courses`, `course_instructors`, `lessons`, `lesson_resources`, `enrollments`, `audit_logs`.
3. Create `handle_new_user()` trigger (always defaults to `student`) and role-protection trigger preventing self-escalation.
4. Implement indexed RLS helper functions (`is_super_admin()`, `is_course_instructor()`, `is_enrolled_student()`) and RLS policies for all Phase 02 tables.
5. Deploy `admin-manage-user-role` Edge Function for trusted role assignment by Super Admin.
6. Build Authentication UI (Login, Register, Forgot Password, Reset Password, Profile Settings syncing `locale` and `theme` to `profiles`).
7. Implement role-aware route guards (`PublicRoute`, `ProtectedRoute`, `RoleRoute`) and dashboard layout shells for Student, Instructor, and Super Admin.

### Dependencies
- Phase 01 completed; Supabase project provisioned.

### Expected Deliverables
- SQL migrations in `supabase/migrations/`.
- Auth pages and profile preference sync.
- Verified RBAC route guards and `admin-manage-user-role` Edge Function.

### Testing Requirements
- Automated/SQL RLS verification tests proving:
  - Visitors cannot read protected lessons/enrollments.
  - Students cannot escalate their own role via PostgREST `UPDATE`.
  - Instructors cannot access unassigned courses.
- End-to-end auth flow test (register → login → persist locale/theme → password reset).

### Completion Criteria
- All 4 roles authenticate and route cleanly; RLS blocks unauthorized reads/writes at the database layer.

---

## Phase 03: Public Website, Course Catalog & Instructor Profiles

### Objectives
Deliver the public-facing ATHAR ACADEMY storefront where visitors and students explore disciplines, courses, and instructors.

### Tasks
1. Build bilingual Landing Page (Hero with tagline, featured disciplines/categories, featured courses, platform value proposition, CTA).
2. Build Course Catalog page with category filtering, search, sorting, and pagination.
3. Build Course Details page (bilingual description, curriculum outline showing locked/preview lessons, instructor cards, published ratings/reviews, student count, enrollment status/CTA).
4. Build public Instructor Profile page (bilingual bio, avatar, assigned published courses).
5. Configure Supabase Storage `public-assets` bucket for course thumbnails and avatars.

### Dependencies
- Phase 02 completed.

### Expected Deliverables
- Complete public browsing experience in Arabic (RTL) and English (LTR), Light & Dark themes.

### Testing Requirements
- Verify visitor access works without login while protected lesson video IDs and private resources remain inaccessible in API responses.
- Verify empty states, loading skeletons, and bilingual fallback behavior when one language translation is missing.

### Completion Criteria
- Visitors can browse all published courses and instructor profiles seamlessly across desktop and mobile.

---

## Phase 04: Manual Enrollment & Super Admin Approval System

### Objectives
Implement the end-to-end manual enrollment request and Super Admin approval lifecycle with backend-enforced course access.

### Tasks
1. Build Student enrollment request flow on Course Details (`Request Enrollment`, optional student note, status display: `Pending Approval`, `Enrolled`, `Rejected`).
2. Build Super Admin Enrollment Queue (filter by status/course, approve, reject with reason, activate/deactivate enrollment, audit log entry).
3. Build Super Admin Course & Instructor Management (CRUD for categories & courses, assign/unassign multiple instructors per course, user directory).
4. Build Student Dashboard ("My Courses" showing approved courses with progress, plus "Pending Requests").

### Dependencies
- Phase 03 completed.

### Expected Deliverables
- Functional enrollment request → Super Admin approval → Student course unlock workflow.
- Super Admin management screens for categories, courses, instructors, and enrollments.

### Testing Requirements
- Verify a student with `pending` or `rejected` enrollment receives 0 rows when querying `lessons` via Supabase API.
- Verify approving an enrollment immediately unlocks access; revoking (`is_active = false`) immediately revokes access.

### Completion Criteria
- Course access is strictly controlled by backend enrollment approval state.

---

## Phase 05: Provider-Independent Video Player, Classroom & Progress Tracking

### Objectives
Build the learning classroom with a swappable video player architecture, progress persistence, downloadable resources, and sequential lesson unlocking.

### Tasks
1. Add SQL migrations and RLS for `lesson_progress` and private `lesson-resources` Storage bucket + signed URL Edge Function (`issue-signed-asset-url`).
2. Build Instructor Course & Lesson Manager (add/edit/delete lessons, reorder lessons, configure `video_provider` and `video_source_id`, attach/remove downloadable resources).
3. Implement `VideoPlayer` abstraction and `YouTubeUnlistedAdapter` (using YouTube IFrame Player API with throttled progress saving).
4. Build Student Classroom page (lesson sidebar, video player, resume from last watched position, mark complete, teal progress bar with percentage, downloadable resources list).
5. Implement sequential lesson unlocking (enforced in backend RLS/RPC and reflected with clear locked state in UI).

### Dependencies
- Phase 04 completed.

### Expected Deliverables
- Instructor lesson & resource management UI.
- Student Classroom with YouTube Unlisted playback, progress tracking, sequential unlocking, and signed resource downloads.

### Testing Requirements
- Verify playback position persists across page reloads and devices.
- Verify sequential lock prevents jumping ahead via direct URL or API query when enabled on a course.
- Verify signed resource URLs cannot be generated by non-enrolled users.

### Completion Criteria
- Instructors can publish structured lessons and resources; approved students can watch, download, and complete courses with accurate progress percentages.

---

## Phase 06: Course Communities & Direct Messaging (Supabase Realtime)

### Objectives
Enable private per-course learning communities and private Student ↔ Instructor direct messaging with Realtime updates.

### Tasks
1. Add SQL migrations & RLS for `community_messages`, `community_attachments`, `dm_conversations`, `dm_messages`, and private `community-attachments` bucket.
2. Build Course Community module: group discussion feed, instructor announcements, threaded replies, pinned messages, image/file attachments, and instructor/admin moderation (pin, delete/hide).
3. Build Direct Messaging module: conversation list, 1-on-1 chat scoped to enrolled course + assigned instructor, read status, and Realtime message delivery.
4. Integrate Supabase Realtime subscriptions with clean reconnect and cleanup handling.

### Dependencies
- Phase 04 completed (can run in parallel with or right after Phase 05).

### Expected Deliverables
- Private per-course community tab inside Classroom & Instructor Dashboard.
- Private Direct Messaging inbox for Students and Instructors (with Super Admin moderation view).

### Testing Requirements
- Security test: Student A in Course 1 cannot read or subscribe to Course 2 community or Student B's DM thread.
- Realtime test: Messages appear live in both Arabic (RTL) and English (LTR) chat layouts without page reload.

### Completion Criteria
- Enrolled students and assigned instructors communicate reliably in real time within strict backend privacy boundaries.

---

## Phase 07: Asynchronous Email Queue & Notification System

### Objectives
Implement reliable, role-scoped transactional and educational emails plus in-app notifications.

### Tasks
1. Add SQL migrations for `notifications`, `email_queue`, and `email_delivery_logs`.
2. Build bilingual, light-first, high-contrast HTML email templates (registration, enrollment approved/rejected, new lesson published, instructor announcement, community/DM alert, password recovery).
3. Deploy `enqueue-course-announcement` Edge Function (validating Super Admin or assigned Instructor scope) and `process-email-queue` Edge Function (batching, retries with backoff, provider API call, delivery logging).
4. Schedule `process-email-queue` via `pg_cron` (or Supabase scheduled invocation) and add DB triggers for automated transactional events.
5. Build In-App Notification Center (bell icon, unread badge, mark-as-read) and Super Admin Email Queue & Delivery Logs monitor.

### Dependencies
- Phases 04–06 completed; transactional email provider API key configured in Supabase secrets.

### Expected Deliverables
- Automated transactional email pipeline with retry/failure handling and audit logs.
- Instructor course announcement composer & Super Admin platform-wide announcement composer.

### Testing Requirements
- Verify instructors cannot send emails to students outside their assigned courses.
- Verify failed email deliveries retry with backoff and record error details in `email_delivery_logs`.
- Verify emails render cleanly in light/dark email clients in both Arabic (RTL) and English (LTR).

### Completion Criteria
- All required transactional and announcement emails send asynchronously with zero frontend direct email calls.

---

## Phase 08: Reviews, Feedback & Role-Specific Analytics

### Objectives
Complete the feedback loop and provide actionable learning and platform analytics.

### Tasks
1. Add SQL migrations & RLS for `course_reviews` (restricted to approved students).
2. Build Student review submission & editing UI on enrolled courses; display ratings on Course Catalog and Course Details.
3. Build Instructor Course Analytics (enrolled count, average progress, lesson drop-off/completion breakdown, student progress table).
4. Build Super Admin Platform Analytics (total students/instructors/courses, enrollment funnel, active learners, review moderation, platform settings).

### Dependencies
- Phases 05 & 07 completed.

### Expected Deliverables
- Course rating & review system with moderation.
- Instructor and Super Admin analytics dashboards.

### Testing Requirements
- Verify un-enrolled students cannot submit reviews.
- Verify analytics tables and charts remain readable on mobile screens and in both Light/Dark themes and RTL/LTR.

### Completion Criteria
- Reviews and analytics operate accurately with proper role scoping.

---

## Phase 09: Hardening, Accessibility Audit, Performance & Production Deployment

### Objectives
Verify end-to-end security, WCAG 2.2 AA accessibility, performance, and launch to production.

### Tasks
1. Conduct full Supabase RLS security audit (via Supabase advisors and automated role-matrix test suite).
2. Perform WCAG 2.2 AA accessibility audit (keyboard navigation, ARIA labels, contrast ratios in Light & Dark modes, touch targets ≥ 44×44 px, reduced-motion support).
3. Optimize bundle size (route-based code splitting, lazy-loaded dashboards and video player).
4. Configure production deployment (Vercel / Cloudflare Pages), custom domain, production environment variables, and Supabase backup/migration workflow.
5. Finalize operational runbook (creating initial Super Admin, adding instructors, monitoring email queue, migrating video providers).

### Dependencies
- Phases 01–08 completed.

### Expected Deliverables
- Production deployment, security & accessibility sign-off report, and operational runbook.

### Testing Requirements
- Full end-to-end regression across all 4 roles, 2 languages, and 3 theme modes.
- Lighthouse audit (Performance, Accessibility, Best Practices, SEO).

### Completion Criteria
- Platform is live, secure, bilingual, accessible, and ready for real instructors and students.

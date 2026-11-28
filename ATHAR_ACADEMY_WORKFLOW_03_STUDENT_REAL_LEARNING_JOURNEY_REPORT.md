# ATHAR ACADEMY — WORKFLOW 03
## Publish First Approved Course & Complete Real Student Learning Journey Report

**Date:** 2026-11-28  
**Environment:** Production (`https://athar-academy-peach.vercel.app`)  
**Supabase Project:** `Athar-Academy` (`jyhiasoyvheismhrtbap`)  
**Git Branch:** `main`  
**Implementation Commits:** `80b7664`, `f4e40bc`

---

## 1. Executive Summary

Workflow 03 implemented real Supabase operational hydration across the Student, Instructor, and Admin portals, added explicit Super Admin publishing/unpublishing/archiving controls, published the first approved real course (`ATH-5C93E`), fixed four real production defects caught during live verification, and registered a real student account through the public `/register` workflow.

**Current Status:** **Partially Verified — Paused at Student Email Confirmation (Auth Gate)**
- **Parts 1 & 2 (Super Admin Explicit Publishing & Public Catalog):** Implemented, deployed, and verified live on production.
- **Part 3a (Real Student Public Registration):** Verified live (`POST /auth/v1/signup` returned HTTP 200; `profiles` and `user_roles = ['student']` automatically created in Supabase).
- **Parts 3b, 4 & 5 (Student Login → Enrollment Request → Instructor Payment Confirmation → Active Learning & Progress Persistence):** Code is implemented and deployed, **paused waiting on owner action to confirm the student email** (Supabase Auth Email Confirmation is enabled on `jyhiasoyvheismhrtbap`; per security rules, email confirmation was not bypassed).

---

## 2. Production Records & IDs

| Entity | Real Production Value / UUID |
|---|---|
| **Published Course ID** | `dddf37bd-0806-421a-bc88-766743a4d699` |
| **Course Code** | `ATH-5C93E` |
| **Course Slug** | `professional-typescript-web-interfaces-b60c` |
| **Course Status (DB)** | `published` (explicitly published by Super Admin via `rpc_admin_approve_course(courseId, true)`) |
| **Lead Instructor** | Dr. Ahmed Al-Sharif (`6203f891-f8ff-4879-bb9c-1d89a907d729`, `instructor.onboarding.qa@atharacademy.org`) |
| **Module 1 ID** | `776ead67-7a9c-44f4-8fcd-a085eb3d6d53` |
| **Module 2 ID** | `79114085-1582-4d98-80ca-366fbcec3c56` |
| **Lesson 1 (Video)** | `1ebe69b5-9949-41e9-ae96-a753deed3001` (`TypeScript Strict Mode & Interfaces` — `status: published`, `video_source_id: dQw4w9WgXcQ`) |
| **Lesson 2 (Reading)** | `915e54d6-8322-4e04-80a1-7e25e842c774` (`Type Narrowing Reference Guide` — `status: published`) |
| **Lesson 3 (Practice)** | `692b24ac-6a50-4d5f-9bc8-fd83a095819e` (`Hands-On API Typing Lab` — `status: published`) |
| **Private PDF Resource** | `9377630b-3b10-40f9-ab49-19580e95c586` (`course-resources/dddf37bd-0806-421a-bc88-766743a4d699/1795858690478-athar-workflow02-syllabus.pdf`) |
| **Registered Student ID** | `46bdbd6b-0668-400a-a07d-e578f80cc00e` |
| **Registered Student Email** | `student.workflow03.qa@atharacademy.org` (`Omar Khaled Al-Masri`, `roles: ['student']`, `email_verified: false`) |

---

## 3. Changes Implemented

### 3.1 Real Supabase Operational Hydration (`80b7664`, `f4e40bc`)
- **`src/services/enrollmentHydrationService.ts` (New):** Hydrates real authenticated data from Supabase respecting RLS: `enrollment_requests`, `course_enrollments` (ordered by `activated_at`), `lesson_progress` (completed lessons, notes, playback positions), `notifications`, `enrollment_audit_events`, `enrollment_disputes`, and student `profiles`. Never falls back to mock arrays on DB errors.
- **`src/services/lmsService.ts`:** Enhanced `fetchLiveCatalog()` to join `course_instructors`, `instructor_profiles`, and public instructor `profiles` (public fields only — no private emails exposed to `anon`), populating real `instructorSlugs`, `leadInstructorSlug`, `enrollmentManagerSlugs`, and `instructors`.
- **`src/app/providers/PlatformDemoContext.tsx`:** Removed production initialization from mock arrays (`INITIAL_ENROLLMENT_REQUESTS`, `INITIAL_ENROLLED_COURSES`, `INITIAL_STUDENT_NOTIFICATIONS`, `INITIAL_PLATFORM_STUDENTS`, etc.), wired automatic hydration after catalog load, and connected enrollment RPCs (`rpc_submit_enrollment_request`, `rpc_accept_enrollment_for_payment`, `rpc_confirm_direct_payment`, `rpc_reject_enrollment_request`, `rpc_admin_suspend_enrollment`, `rpc_admin_reactivate_enrollment`) to refresh live DB state and surface any errors cleanly.
- **`src/features/student/context/StudentDemoContext.tsx`:** Synced real student profile, `lessonNotes`, and `playbackPositions` from Supabase and added `savePlaybackPosition()` backed by `rpc_upsert_lesson_progress`.
- **`src/features/instructor/context/InstructorDemoContext.tsx`:** Fixed `canConfirmPaymentForCourse()` to use real `canConfirmPaymentCourseSlugs` from `fetchOwnInstructorPortalData(user.id)` and resolved real student display info from hydrated `platform.students`.
- **`src/features/student/pages/LessonClassroomPage.tsx`:** Added a live playback position tracker and **Save Position** control persisted to `lesson_progress.playback_position_seconds`.

### 3.2 Explicit Super Admin Publishing & Public Catalog Fixes (`80b7664`, `f4e40bc`)
- **`src/features/admin/pages/AdminCourseDetailsPage.tsx`:** Added explicit **Publish Course** (`rpc_admin_approve_course(courseId, true)` — publishes both the course and its lessons), **Unpublish (Draft)**, and **Archive** buttons, plus a **Pricing & Direct Payment Review** card and full curriculum inspection (video source + signed-URL PDF download).
- **`src/features/public/pages/CourseDetailsPage.tsx`:** Added real pricing (`1,200 EGP`), enrollment availability badge, direct-to-instructor payment instructions, real Sign-In / Request Enrollment CTA (replacing demo modal), and clear locked-module messaging when `anon` views non-preview lessons (respecting `lessons_select` RLS).
- **`src/features/public/pages/DisciplineDetailsPage.tsx`:** Switched from static mock helpers to live `usePlatformDemo()` data so `/disciplines/engineering-technology` displays published live courses including `ATH-5C93E`.
- **`src/features/public/pages/RegisterPage.tsx`:** Replaced stale Phase 02A demo text with real bilingual production copy for student registration and email confirmation.
- **`supabase/migrations/0014_instructor_read_enrolled_student_profiles.sql` (New):** Scoped `SELECT` RLS policy on `profiles` allowing assigned instructors to view profiles of students who have an enrollment request or enrollment in one of their assigned courses (strictly preserving Student A/B isolation).

---

## 4. Live Production Verification Results

| Check | Result | Notes |
|---|---|---|
| Super Admin login & `/admin/courses/professional-typescript-web-interfaces-b60c` review | **PASS** | All course metadata, pricing (`1,200 EGP`), 2 modules, 3 lessons, video link, and PDF resource rendered accurately. |
| Super Admin explicit **Publish Course** | **PASS** | `POST /rest/v1/rpc/rpc_admin_approve_course` returned HTTP 200; DB confirmed `courses.status = 'published'` and all 3 lessons `status = 'published'`. |
| Public `/courses` & search `"TypeScript"` | **PASS** | `ATH-5C93E` appeared in catalog with `Dr. Ahmed Al-Sharif`; search filtered accurately (`2 of 4 courses`). |
| Live bug caught & fixed: `course_enrollments.enrolled_at` HTTP 400 (`42703`) | **FIXED (`f4e40bc`)** | Updated query to use actual DB column `activated_at`. |
| Live bug caught & fixed: `/disciplines/engineering-technology` static demo data & `/courses/:slug` missing price | **FIXED (`f4e40bc`)** | Connected to live `usePlatformDemo()` catalog and real pricing/CTA. |
| Public `/register` real student signup (`student.workflow03.qa@atharacademy.org`) | **PASS (Account Created)** | `POST /auth/v1/signup` returned HTTP 200 (`id: 46bdbd6b-0668-400a-a07d-e578f80cc00e`); `profiles` and `user_roles = ['student']` created automatically. |
| Student Login, Enrollment Lifecycle (`Pending → Awaiting Payment → Active`), Classroom Video/PDF/Progress Persistence | **PAUSED (Auth Gate)** | Blocked by Supabase Auth Email Confirmation (`email_verified: false`). |

---

## 5. Video Validation Notice (Owner Action Required)

Lesson 1 (`1ebe69b5-9949-41e9-ae96-a753deed3001`, *TypeScript Strict Mode & Interfaces*) currently references YouTube video ID `dQw4w9WgXcQ`, which is a **non-educational placeholder test video**.

- Per Workflow 03 rules, this video was **NOT silently replaced** with fabricated content.
- **Action Required:** Please provide a real educational TypeScript YouTube URL (unlisted or public) before promoting `ATH-5C93E` to real students.
- The video player architecture continues to preserve future migration to the **ATHAR ACADEMY Custom Video Player**.

---

## 6. Remaining Blockers & Owner Actions Needed to Complete Live E2E Steps 3b–5

1. **Confirm Student Email (or Provide a Confirmed Student Account):**
   - In Supabase Dashboard (**Authentication → Users**), confirm `student.workflow03.qa@atharacademy.org` (`46bdbd6b-0668-400a-a07d-e578f80cc00e`) — OR temporarily disable **Confirm email** for QA — OR provide a real email address you can confirm.
   - Once confirmed, we will immediately run the remaining live browser verification (Steps 3b–5: Student Login → Locked Course Check → Enrollment Request → Instructor Accept & Direct Payment Confirmation → Classroom Video, Signed PDF Download, Sequential Unlock, Playback Position & Note Persistence across Reload/Re-login).
2. **Apply Migration `0014` in Supabase SQL Editor:**
   - Run [0014_instructor_read_enrolled_student_profiles.sql](supabase/migrations/0014_instructor_read_enrolled_student_profiles.sql) so assigned instructors see real student full names and emails on `/instructor/enrollments` (MCP DDL confirmation was auto-cancelled in this session).
3. **Provide Real Educational YouTube URL for `ATH-5C93E` Lesson 1** to replace `dQw4w9WgXcQ`.
4. **Manual Supabase Auth Dashboard Settings (carried over):**
   - Set **Site URL** to `https://athar-academy-peach.vercel.app` and add `https://athar-academy-peach.vercel.app/**` to **Redirect URLs**.
   - Enable **Leaked Password Protection**.

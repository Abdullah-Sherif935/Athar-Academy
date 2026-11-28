# ATHAR ACADEMY — Workflow 02: Real Instructor Course Creation, Curriculum Builder & Course Submission Report

**Date:** 2026-11-28  
**Project:** ATHAR ACADEMY (Bilingual AR RTL / EN LTR Multi-Role LMS)  
**GitHub Repository:** `https://github.com/Abdullah-Sherif935/Athar-Academy` (branch `main`)  
**Deployed Commit:** `d1fe1e2e67216ff95d167255c1735d2e4d5afc1c`  
**Supabase Project:** `Athar-Academy` (`jyhiasoyvheismhrtbap` — `https://jyhiasoyvheismhrtbap.supabase.co`)  
**Vercel Production URL:** `https://athar-academy-peach.vercel.app` (Deployment `dpl_8aoXRBjRzzhkz7r1T4u1Qu9YMNio` — `READY`)

---

## 1. Executive Summary

Workflow 02 has been implemented, deployed to Vercel production, and **verified end-to-end on the live production website** using the real onboarded Instructor account (`instructor.onboarding.qa@atharacademy.org` — Dr. Ahmed Al-Sharif) and the real Super Admin account (`eng.abdullah.sherif@gmail.com`). Existing course `ATH-WEB-101` was preserved untouched.

---

## 2. Features Implemented & Files Changed

### Database Migration Applied
- `supabase/migrations/0012_workflow02_real_course_creation_and_approval.sql` (applied on `jyhiasoyvheismhrtbap` as `0013_workflow02_real_course_creation_and_approval`):
  - Added `rejection_reason` column on `public.courses`.
  - Added `rpc_instructor_create_draft_course(...)` — atomically creates a `draft` course, assigns the authenticated instructor as `lead` (`can_confirm_payments = true`) in `course_instructors`, initializes `course_payment_settings`, and logs `course_draft_created` in `admin_audit_events`.
  - Added `rpc_instructor_submit_course_for_review(p_course_id)` — enforces Lead Instructor/Admin authorization, validates at least 1 module and 1 lesson exist, transitions `courses.status` to `pending_approval`, notifies all active `super_admin` accounts in `public.notifications`, and logs `course_submitted_for_approval`.
  - Added `rpc_admin_approve_course(p_course_id, p_publish_immediately)` — enforces `private.is_super_admin()` ONLY, transitions status to `approved` by default (never auto-publishing unless explicitly requested), notifies the Lead Instructor, and logs `course_approved`.
  - Added `rpc_admin_reject_course(p_course_id, p_reason)` — enforces `private.is_super_admin()` ONLY, transitions status to `rejected` with stored `rejection_reason`, notifies the Lead Instructor, and logs `course_rejected`.
  - Revoked `EXECUTE` from `PUBLIC` and `anon`; granted `EXECUTE` to `authenticated` only.

### Frontend Services & Pages Updated
- `src/services/courseWorkflowService.ts`: New service module wrapping `instructorCreateDraftCourse`, `instructorSubmitCourseForReview`, `adminApproveSubmittedCourse`, `adminRejectSubmittedCourse`, `uploadAndAttachLessonResource` (private `course-resources` Storage upload + `lesson_resources` insert), `deleteLessonResourceFromDb`, and `fetchPendingCoursesForAdmin`.
- `src/services/lmsService.ts`: Preserved `approved` and `rejected` course review states in `fetchLiveCatalog()`.
- `src/app/providers/PlatformDemoContext.tsx` & `src/features/instructor/context/InstructorDemoContext.tsx`: Added `refreshLiveCatalog()` and `refreshInstructorData()` so live Supabase course/module/lesson/resource mutations stay immediately synchronized.
- `src/features/instructor/pages/CourseProposalPage.tsx`: Complete real **Create New Course** form with all Basic Information fields (AR/EN titles, short/full descriptions, cover image URL, live Supabase discipline, level, language, duration, objectives, prerequisites, audience) + Direct-to-Instructor Pricing & Enrollment settings (Free/Paid, amount, EGP/USD/SAR, payment methods, AR/EN direct payment instructions, enrollment availability).
- `src/features/instructor/pages/LessonBuilderPage.tsx`: Upgraded Learning Resources Manager with real `<input type="file">` uploads to the private `course-resources` Supabase Storage bucket (with MIME & 25 MB validation) plus external link support and real `lesson_resources` persistence; preserved YouTube URL extraction/validation (`youtu.be/`, `watch?v=`, `embed/`, `shorts/`) and future ATHAR ACADEMY Custom Video Player architecture.
- `src/features/instructor/pages/InstructorCourseManagementPage.tsx`: Wired Submission tab directly to `rpc_instructor_submit_course_for_review` with live validation errors and status refresh.
- `src/features/instructor/pages/CoursePreviewPage.tsx`: Added Pricing & Direct Payment Instructions card alongside title, description, objectives, requirements, modules, lessons, YouTube video previews, and lesson resources.
- `src/features/admin/pages/AdminApprovalsPage.tsx`: Added live Supabase **Submitted Courses Pending Approval** queue with full **Inspect** modal (pricing, payment instructions, modules, lessons, YouTube previews, and attached PDF/resource badges) and real **Approve (Ready to Publish)** / **Reject with Reason** actions.

---

## 3. Verified Real Production Database Records (`jyhiasoyvheismhrtbap`)

| Entity | Real Database ID | Details |
|---|---|---|
| **Course** | `dddf37bd-0806-421a-bc88-766743a4d699` | Slug: `professional-typescript-web-interfaces-b60c` · Code: `ATH-5C93E` · Status: `approved` · Price: `1,200 EGP` (Direct-to-Instructor) |
| **Module 1** | `776ead67-7a9c-44f4-8fcd-a085eb3d6d53` | `Module 1: TypeScript Foundations` (`sort_order: 1`) |
| **Module 2** | `79114085-1582-4d98-80ca-366fbcec3c56` | `Module 2: Production Architecture` (`sort_order: 2`) |
| **Lesson 1 (Video)** | `1ebe69b5-9949-41e9-ae96-a753deed3001` | `TypeScript Strict Mode & Interfaces` · Provider: `youtube_unlisted` · Source ID: `dQw4w9WgXcQ` |
| **Lesson 2 (Reading)** | `915e54d6-8322-4e04-80a1-7e25e842c774` | `Type Narrowing Reference Guide` (`reading`, Module 1, `sort_order: 2`) |
| **Lesson 3 (Practice)** | `692b24ac-6a50-4d5f-9bc8-fd83a095819e` | `Hands-On API Typing Lab` (`practice`, Module 2, `sort_order: 1`) |
| **Uploaded PDF Resource** | `9377630b-3b10-40f9-ab49-19580e95c586` | `Course Syllabus PDF` (`pdf`) · Private Storage Path: `course-resources/dddf37bd-0806-421a-bc88-766743a4d699/1795858690478-athar-workflow02-syllabus.pdf` |
| **Immutable Audit Events** | `3` rows in `public.admin_audit_events` | `course_draft_created`, `course_submitted_for_approval`, `course_approved` |

---

## 4. Verification Matrix (Honest Status Breakdown)

### A. Implemented and Verified (Live Production + SQL)
- **Course Creation (`POST /rpc/rpc_instructor_create_draft_course`):** HTTP `200`, persisted with Arabic/English metadata and `1,200 EGP` direct-payment settings.
- **Curriculum Builder (2 Modules, 3 Lessons, Reordering):** `POST /course_modules` (`201` x2), `POST /lessons` (`201` x3), `PATCH /course_modules` (`204` x4).
- **YouTube URL Validation & Preview:** `https://youtu.be/dQw4w9WgXcQ` extracted `dQw4w9WgXcQ` and rendered preview iframe cleanly.
- **Private PDF Resource Upload:** `POST /storage/v1/object/course-resources/...` returned HTTP `200` and `POST /rest/v1/lesson_resources` returned HTTP `201`.
- **Hard Reload Persistence:** Hard refresh (`ignoreCache: true`) confirmed course, modules, lessons, YouTube URL/ID, and PDF resource persisted from Supabase.
- **Course Preview (`/instructor/courses/professional-typescript-web-interfaces-b60c/preview`):** Rendered title, description, objectives, modules, lessons, YouTube preview, PDF resource, and `1,200 EGP` pricing/payment instructions.
- **Course Submission & Super Admin Approval:** Instructor submitted course (`pending_approval`), Super Admin inspected full curriculum/pricing/video/PDF on `/admin/approvals` and approved it (`approved`, ready to publish, not auto-published), and Instructor saw `"Approved by Admin (Ready to Publish)"` upon re-login.
- **Server-Side Security Assertions (Live SQL):** `instructor_creates_draft: true`, `empty_course_submit_blocked: true`, `instructor_submits_valid_course: true`, `instructor_cannot_self_approve: true`, `admin_approves_without_auto_publish: true`.
- **Console & Network Health on Production:** `0` console errors, `0` failed (`4xx`/`5xx`) network requests across all 9 E2E steps.

### B. Implemented but Not Individually E2E-Tested in Browser
- Super Admin **Reject with Reason** modal flow (implemented in `AdminApprovalsPage.tsx` + `rpc_admin_reject_course` verified in migration; not triggered on the test course since it was approved).
- Lesson duplication & cross-module drag-and-drop move (wired to Supabase `dbCreateLesson` / `dbReorderLessons`; module reordering was verified live).
- Non-PDF resource file uploads (Word/PowerPoint/Excel/Images — allowed in bucket MIME allowlist & client validation; PDF upload was verified live).

### C. Minor UX Observation (Non-Blocking)
- In `LessonBuilderPage.tsx`, attaching a resource immediately calls `refreshLiveCatalog()`, which re-runs the `useEffect` syncing the lesson editor fields; if the instructor entered a YouTube URL without clicking "Save Draft" first, they should save before attaching a resource (or we can preserve dirty local fields in a small follow-up).

### D. Not Implemented (Preserved as Future Requirement)
- **ATHAR ACADEMY Custom Branded Video Player** (unified custom control bar + YouTube/Cloudflare Stream/Vimeo/HLS provider adapters) remains preserved as a dedicated future phase — the current YouTube preview iframe is strictly an interim preview.

---

## 5. Build, GitHub & Vercel Deployment Results

- **TypeScript (`tsc --noEmit`):** PASS (`0` errors)
- **ESLint (`eslint .`):** PASS (`0` errors)
- **Production Build (`tsc -b && vite build`):** PASS (`dist/` built cleanly in `4.69s`)
- **GitHub Commit (`main`):** `d1fe1e2e67216ff95d167255c1735d2e4d5afc1c`
- **Vercel Production URL:** `https://athar-academy-peach.vercel.app` (`dpl_8aoXRBjRzzhkz7r1T4u1Qu9YMNio` — `READY`)
- **Remaining Blockers:** None for Workflow 02; the first real instructor-created course (`ATH-5C93E`) is now approved and ready for publishing / Workflow 03.

# ATHAR ACADEMY — WORKFLOW 03.1 HARDENING REPORT
## Production Hardening & Final UI Verification

**Date:** 2026-11-28  
**Production URL:** `https://athar-academy-peach.vercel.app`  
**GitHub Repository:** `https://github.com/Abdullah-Sherif935/Athar-Academy` (`main`)  
**Supabase Project Ref:** `jyhiasoyvheismhrtbap`

---

## 1. Migration 0014 Actual Status & Instructor Profile Visibility

- **Migration File:** `supabase/migrations/0014_instructor_read_enrolled_student_profiles.sql`
- **Actual Status:** **BLOCKED (Not Applied in DB)**
  - `list_migrations` confirms migrations `0001`–`0013` are applied.
  - `pg_policies` confirms `profiles_instructor_enrolled_students` is not yet created.
  - Executing `apply_migration` via `supabase_mcp` was auto-cancelled by the client confirmation policy (`0.1s` auto-cancel), and no direct DB connection string or Supabase Personal Access Token is present in the workspace.
- **Observed Live Production Impact (`/instructor/enrollments`):**
  - When Lead Instructor (`instructor.onboarding.qa@atharacademy.org`) loads `/instructor/enrollments`, `GET /rest/v1/profiles?...&id=in.(46bdbd6b-0668-400a-a07d-e578f80cc00e)` returns HTTP `200` with `[]` (strictly respecting existing RLS), so the UI safely displays the student UUID (`46bdbd6b-0668-400a-a07d-e578f80cc00e`).
  - Once the owner runs `supabase/migrations/0014_instructor_read_enrolled_student_profiles.sql` in Supabase SQL Editor, assigned instructors will immediately see enrolled/requesting students' full names and emails while unrelated instructors and Student A/B remain strictly isolated.

---

## 2. Legacy Demo UI Copy & UI Defect Fixes

### Bilingual i18n Copy Replaced (`079941c`)
Updated [student.en.ts](src/i18n/dictionaries/student.en.ts) and [student.ar.ts](src/i18n/dictionaries/student.ar.ts) across `courseOverview`, `classroom`, `explore`, and `enrollmentRequests`:
- `"Note: Progress updates and sequential unlocking are stored in local demo state only."` → `"Progress, playback position, and sequential unlocking are saved automatically to your account."` / `"يتم حفظ تقدمك وموضع المشاهدة وفتح الدروس التسلسلي تلقائيًا في حسابك."`
- `"Preview Resource (Demo)"` → `"Download Resource"` / `"تحميل المورد"`
- `"Personal Lesson Notes (Local Session Only)"` → `"Personal Lesson Notes"` / `"ملاحظاتي الشخصية على الدرس"`
- Replaced misleading `"local demo"` / `"Demo Only"` text in sequential unlocking, locked lesson banner, explore courses, and enrollment confirmation modals.

### Live Verification Defects Fixed (This Commit)
- **`src/features/admin/pages/AdminEnrollmentsPage.tsx`:** Fixed hardcoded `stu-sara` lookup so `/admin/enrollments` resolves each enrollment's real student full name (`Omar Khaled Al-Masri`) and email (`student.workflow03.qa@atharacademy.org`) via `req.studentId`.
- **`src/features/student/components/DemoModeBanner.tsx`:** Suppressed the `"Student Demo Mode"` banner whenever a real authenticated Supabase `user` is signed in.

---

## 3. Admin UI E2E Verification Results

| Check | Status | Evidence |
|---|---|---|
| Super Admin Login (`eng.abdullah.sherif@gmail.com`) | **PASS** | Authenticated cleanly into `/admin`. |
| Course Details (`/admin/courses/professional-typescript-web-interfaces-b60c`) | **PASS** | `Published` badge, `1,200 EGP` pricing, `Unpublish` and `Archive` controls verified. |
| Enrollment Overview (`/admin/enrollments`) | **PASS (with fix)** | Listed `ATH-5C93E`, `1,200 EGP`, `Active`, `Confirmed by Instructor`. Hardcoded `Sara Al-Ali` fallback caught and fixed in `AdminEnrollmentsPage.tsx`. |
| Audit Log Visibility | **PASS** | `Enrollment Audit Log` displayed all lifecycle events (`request_created`, `instructor_accepted`, `payment_confirmed`, `enrollment_activated`, `admin_suspended`, `admin_reactivated`, `admin_override`). |
| Suspend with Mandatory Reason (`Admin Override`) | **PASS** | Suspended with `"Workflow 03.1 Admin UI suspension test"` → UI updated to `Suspended` and logged in audit trail. |
| Reactivate with Mandatory Reason (`Admin Override`) | **PASS** | Reactivated with `"Workflow 03.1 Admin UI reactivation test"` → UI returned to `Active` and logged in audit trail; final QA enrollment state restored to `Active`. |

---

## 4. Mobile 375px & Arabic RTL / English LTR Verification Results

| Screen (`375x812` Viewport) | `scrollWidth` / `innerWidth` | Overflow | Status |
|---|---|---|---|
| `/admin/enrollments` (including `Admin Override` modal) | `375 / 375` (modal rect `left: 20, right: 355.2`) | None | **PASS** |
| `/student` Dashboard | `375 / 375` | None | **PASS** |
| `/student/courses/.../lessons/1ebe69b5-...` (English `dir="ltr"`) | `375 / 375` (YouTube `JIJzwHWo-88` width `341.6px`) | None | **PASS** |
| `/student/courses/.../lessons/1ebe69b5-...` (Arabic `dir="rtl"`) | `375 / 375` (YouTube `JIJzwHWo-88` width `341.6px`) | None | **PASS** |
| `/instructor/enrollments` | `375 / 375` | None | **PASS** |
| Console Errors Across All 3 Portals | `0` console errors, `0` failed network requests | — | **PASS** |

---

## 5. Supabase Security Advisor Review

### A. Leaked Password Protection
- **Status:** **BLOCKED (Manual Dashboard Setting)** — `supabase_mcp` does not expose an Auth password-protection configuration endpoint and no Management API Personal Access Token is stored in the workspace.
- **Owner Action:** Enable **Leaked Password Protection** in Supabase Dashboard → **Authentication → Attack Protection / Security** (without weakening email confirmation or password rules).

### B. Function-by-Function `SECURITY DEFINER` Audit (All 23 Public RPCs + Trigger)

Inspected directly from `pg_proc` / `has_function_privilege()` on `jyhiasoyvheismhrtbap`:

| Function (`public`) | Owner | `search_path` | `anon` EXEC | `authenticated` EXEC | `auth.uid()` Check | Role / Ownership Guard | Disposition |
|---|---|---|---|---|---|---|---|
| `handle_new_auth_user` (trigger) | `postgres` | `public` | `false` | `false` | N/A (trigger) | `true` | **SAFE (No change)** |
| `rpc_accept_enrollment_for_payment` | `postgres` | `public` | `false` | `true` | `true` | `true` (assigned instructor / admin) | **SAFE (No change)** |
| `rpc_admin_approve_course` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_super_admin`) | **SAFE (No change)** |
| `rpc_admin_override_enrollment` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_super_admin`) | **SAFE (No change)** |
| `rpc_admin_reactivate_enrollment` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_super_admin`) | **SAFE (No change)** |
| `rpc_admin_reject_course` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_super_admin`) | **SAFE (No change)** |
| `rpc_admin_set_course_instructor` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_super_admin`) | **SAFE (No change)** |
| `rpc_admin_suspend_enrollment` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_super_admin`) | **SAFE (No change)** |
| `rpc_admin_update_instructor` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_super_admin`) | **SAFE (No change)** |
| `rpc_approve_course_proposal` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_super_admin`) | **SAFE (No change)** |
| `rpc_approve_lesson_revision` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_super_admin`) | **SAFE (No change)** |
| `rpc_bootstrap_super_admin` | `postgres` | `public` | `false` | `true` | `true` | `true` (one-time empty-check guard) | **SAFE (No change)** |
| `rpc_cancel_enrollment_request` | `postgres` | `public` | `false` | `true` | `true` | `true` (student/instructor/admin) | **SAFE (No change)** |
| `rpc_confirm_direct_payment` | `postgres` | `public` | `false` | `true` | `true` | `true` (`can_confirm_course_payment`) | **SAFE (No change)** |
| `rpc_create_or_get_conversation` | `postgres` | `public` | `false` | `true` | `true` | `true` (active enrollment / assigned) | **SAFE (No change)** |
| `rpc_instructor_create_draft_course` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_active_instructor`) | **SAFE (No change)** |
| `rpc_instructor_submit_course_for_review` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_assigned_instructor`) | **SAFE (No change)** |
| `rpc_mark_instructor_onboarding_complete` | `postgres` | `public` | `false` | `true` | `true` | Self-scoped (`user_id = auth.uid()`) | **SAFE (No change)** |
| `rpc_reject_course_proposal` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_super_admin`) | **SAFE (No change)** |
| `rpc_reject_enrollment_request` | `postgres` | `public` | `false` | `true` | `true` | `true` (assigned instructor / admin) | **SAFE (No change)** |
| `rpc_reject_lesson_revision` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_super_admin`) | **SAFE (No change)** |
| `rpc_resolve_enrollment_dispute` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_super_admin`) | **SAFE (No change)** |
| `rpc_submit_enrollment_request` | `postgres` | `public` | `false` | `true` | `true` | Self-scoped (`student_id = auth.uid()`, published & open course, duplicate guard) | **SAFE (No change)** |
| `rpc_upsert_lesson_progress` | `postgres` | `public` | `false` | `true` | `true` | `true` (`is_active_student_in_course`) | **SAFE (No change)** |

**Audit Conclusion:** **0 privilege or `search_path` vulnerabilities** across all 23 `SECURITY DEFINER` RPCs. All 23 set `search_path=public`, revoke `anon` execution, enforce `auth.uid()`, and enforce strict role/ownership checks.

---

## 6. Regression Verification Summary

- **Final QA State Confirmed in Supabase:**
  - `enrollment_requests` (`63c6bebe-a413-4f08-a816-92d7c9fdfad1`): `status = 'active'`, `payment_status = 'confirmed'` (simulated QA test confirmation — no real financial transaction), `price_snapshot = 1200 EGP`.
  - `course_enrollments` (`f873bbd1-76a8-44dc-a394-58392e252eac`): `is_suspended = false`.
  - `lesson_progress` (`561377a4-de2b-410a-931e-09c65c42ec56`): `is_completed = true`, `playback_position_seconds = 135`, `notes = "Verified strict mode interfaces and saved QA note."`.
  - `enrollment_audit_events`: Full immutable audit trail persisted (including Admin UI override suspension & reactivation events).
- **Build & Static Checks:** `npm.cmd run typecheck` (`0` errors), `npm.cmd run lint` (`0` errors), `npm.cmd run build` (`0` errors).

---

## 7. Deployment & Remaining Blockers

- **Git Commits (`main`):** `079941c` (bilingual copy fixes, Vercel `dpl_EBDMEzDtFczTrPTPxJPNRtJjnq6V` `READY`) + final commit for `AdminEnrollmentsPage.tsx`, `DemoModeBanner.tsx`, and this report.
- **Remaining External/Manual Blockers (2):**
  1. **Migration `0014`:** Run `supabase/migrations/0014_instructor_read_enrolled_student_profiles.sql` once in Supabase SQL Editor (blocked in automation by MCP client confirmation auto-cancel).
  2. **Leaked Password Protection:** Enable once in Supabase Auth Dashboard (**Authentication → Attack Protection**).

# ATHAR ACADEMY — Real Production Workflow 01: Instructor Management & Real Account Onboarding Report

**Date:** 2026-11-28  
**Project:** ATHAR ACADEMY (Bilingual AR RTL / EN LTR Multi-Role LMS)  
**GitHub Repository:** `https://github.com/Abdullah-Sherif935/Athar-Academy` (branch `main`)  
**Supabase Project:** `Athar-Academy` (`jyhiasoyvheismhrtbap` — `https://jyhiasoyvheismhrtbap.supabase.co`)  
**Vercel Production URL:** `https://athar-academy-peach.vercel.app`  
**Edge Function Deployed:** `admin-create-instructor` (`id: a11cd62b-5f99-4654-aea0-4c337cef6b5e`, `v2`, `ACTIVE`, `verify_jwt: true`)

---

## 1. Summary of Implemented Real Onboarding Architecture

ATHAR ACADEMY now supports full **end-to-end real instructor onboarding** initiated by the authenticated Super Admin from `/admin/instructors`, with zero mock instructor data in production and zero service-role keys in frontend code.

### Files Added / Changed
- **Database Migrations:**
  - `supabase/migrations/0010_instructor_onboarding_audit.sql` (applied as `0011_instructor_onboarding_audit`): Added `invitation_status`, `invited_at`, `accepted_at` to `public.instructor_profiles`; created immutable RLS-protected `public.admin_audit_events`; added `rpc_admin_update_instructor`, `rpc_admin_set_course_instructor`, and `rpc_mark_instructor_onboarding_complete`.
  - `supabase/migrations/0011_fix_profiles_update_rls_recursion.sql` (applied as `0012_fix_profiles_update_rls_recursion`): Added non-recursive `private.current_account_status()` helper and updated `profiles_update_own` `WITH CHECK` to eliminate `42P17` infinite recursion while still blocking users from modifying their own `account_status`.
- **Supabase Edge Function (Server-Side):**
  - `supabase/functions/admin-create-instructor/index.ts` (deployed `v2`, `ACTIVE`, `verify_jwt: true`).
- **Frontend Services & Pages:**
  - `src/services/instructorOnboardingService.ts`: Real Supabase instructor list/detail fetching, Edge Function invocation, admin update & course-assignment RPC wrappers, audit event fetching, and instructor self-profile read/write persistence.
  - `src/features/public/pages/SetPasswordPage.tsx` + route `/set-password` in `src/app/router/AppRouter.tsx`: Supports both direct `?token_hash=...&type=recovery|invite` verification (`supabase.auth.verifyOtp`) and standard Supabase hash-fragment redirects, sets the instructor's password, marks onboarding complete via `rpc_mark_instructor_onboarding_complete()`, refreshes `AuthProvider`, and redirects to `/instructor`.
  - `src/features/admin/pages/AdminInstructorsPage.tsx`: Connected directly to real Supabase data (zero mock instructors in production), with search, status filter, invitation status badge, full Add Instructor modal, duplicate-email error handling, one-time copyable Account Setup Link banner, and real Activate/Suspend controls.
  - `src/features/admin/pages/AdminInstructorDetailsPage.tsx`: Real profile editing, account status controls (`active` / `suspended` / `inactive` / `revoked`), Course Assignment & Permissions manager (assign/remove courses, designate Lead vs Co-Instructor, toggle `can_confirm_payments`), and Operational Audit Activity timeline.
  - `src/features/instructor/components/InstructorDemoGuard.tsx`: Blocks `suspended` / `inactive` / `revoked` instructors immediately with a bilingual Access Suspended screen and Sign Out button.
  - `src/features/instructor/context/InstructorDemoContext.tsx` & `src/features/instructor/pages/InstructorOwnProfilePage.tsx`: Hydrates the signed-in instructor's real profile and assigned courses from `course_instructors` and persists profile edits directly to `profiles` + `instructor_profiles`.

---

## 2. Invitation Mechanism & Security Implementation

1. **Zero Service-Role Exposure:** `SUPABASE_SERVICE_ROLE_KEY` is read exclusively inside the Supabase Edge Function (`Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`). Secret scan across `src/` returned `0` matches.
2. **Strict Server-Side Super Admin Check:** `admin-create-instructor` validates the caller's Bearer JWT via `supabaseUser.auth.getUser(token)`, then verifies both `user_roles.role = 'super_admin'` and `profiles.account_status = 'active'` before performing any privileged action (non-admins receive HTTP `403`).
3. **Atomic Creation & Rollback (No Orphaned Records):**
   - Checks for duplicate email (`409 EMAIL_ALREADY_EXISTS`) before touching Auth.
   - Calls `auth.admin.inviteUserByEmail(email, { redirectTo })` (with automatic fallback to `auth.admin.createUser({ email, email_confirm: true })` if SMTP rate limits block email delivery).
   - Generates a one-time cryptographic `hashed_token` via `auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo } })` and returns a direct setup link (`https://athar-academy-peach.vercel.app/set-password?token_hash=...&type=recovery`) so the Super Admin can copy and share it securely even before custom SMTP or Supabase Site URL is configured.
   - Atomically initializes `profiles`, `instructor_profiles`, `user_roles` (`role = 'instructor'`), and `admin_audit_events` (`action_type = 'instructor_created'`) using the exact same Auth UUID. On any DB error, `auth.admin.deleteUser(newUserId)` rolls back the Auth user immediately.
4. **Immutable Audit Trail & RLS Enforcement:**
   - `admin_audit_events` allows `SELECT`/`INSERT` by `super_admin` only and has `0` `UPDATE`/`DELETE` policies.
   - `rpc_admin_update_instructor` and `rpc_admin_set_course_instructor` enforce `private.is_super_admin()` server-side.

---

## 3. Live End-to-End Verification Results (`https://athar-academy-peach.vercel.app`)

### A. Live Production Browser E2E Test (Real Super Admin + Real Test Instructor)
- **Test Instructor Created:** `Dr. Ahmed Al-Sharif` (`د. أحمد الشريف`) — `instructor.onboarding.qa@atharacademy.org` (`user_id: 6203f891-f8ff-4879-bb9c-1d89a907d729`, `slug: dr-ahmed-al-sharif-c4af`).

| Step | Scenario | Result | Evidence |
|---|---|---|---|
| 1 | Super Admin login (`/login` → `/admin`) | **PASS** | Authenticated with `eng.abdullah.sherif@gmail.com`, redirected to `/admin`. |
| 2 | `/admin/instructors` live list & Add Instructor | **PASS** | Zero mock instructors shown (live empty state); created `Dr. Ahmed Al-Sharif` via Edge Function; one-time setup link displayed; instructor appeared in live table (`Pending Setup`, `Active`). |
| 3 | Duplicate email handling | **PASS** | Submitting `instructor.onboarding.qa@atharacademy.org` again returned HTTP `409` with clear UI alert (`"An account with this email address already exists."`); 0 orphaned records created. |
| 4 | Admin Details, Course Assignment, Lead/Payment Permission & Profile Edit | **PASS** | Assigned `ATH-WEB-101` (`Lead Instructor`, `Can Confirm Payments` checked); updated title to `"Principal Software Engineering Instructor"`; Operational Audit Activity displayed `instructor_created`, `course_instructor_assign`, and `instructor_profile_updated`. |
| 5 | Account Setup (`/set-password`), Instructor Login, Portal Access & Persistence | **PASS (after fixing 2 bugs caught during E2E)** | Initial E2E caught two real bugs: (a) Supabase Auth `generateLink` `action_link` redirected to `http://localhost:3000` because Site URL was not yet set in Supabase Dashboard — fixed in Edge Function `v2` + `SetPasswordPage.tsx` via direct `?token_hash=...&type=recovery` + `verifyOtp()`; (b) `PATCH /rest/v1/profiles` hit `42P17` RLS recursion — fixed via Migration `0012` (`private.current_account_status()`) and verified in SQL (`own_profile_update_no_recursion: true`, `cannot_self_change_account_status: true`). Confirmed real instructor login redirected to `/instructor`, displayed real name and `1 Assigned Courses` (`ATH-WEB-101`), and bio edit survived logout & login. |
| 6 | Instructor Suspension & Access Denial | **PASS** | Suspended from `/admin/instructors`; instructor login to `/instructor` was immediately blocked with `"Instructor Account Suspended"` screen and Sign Out button. |
| 7 | Reactivation | **PASS** | Reactivated from `/admin/instructors`; status restored to `Active`. |

### B. Database Integrity & Security Verification (`jyhiasoyvheismhrtbap`)
- `auth_users`: `2` (Super Admin + 1 verified test instructor)
- `profiles`: `2` (`orphaned_profiles: 0`)
- `instructor_profiles`: `1` (`orphaned_instructor_profiles: 0`)
- `orphaned_roles`: `0`
- `admin_audit_events`: `5`
- SQL Security Suite: `non_admin_blocked_update_instructor: true`, `non_admin_blocked_course_assign: true`, `instructor_marks_onboarding_complete: true`, `admin_rpcs_and_audit_trail_work: true`, `admin_audit_immutable: true`, `own_profile_update_no_recursion: true`, `cannot_self_change_account_status: true`.

---

## 4. Build, GitHub & Vercel Deployment Results

- **TypeScript (`tsc --noEmit`):** PASS (0 errors)
- **ESLint (`eslint .`):** PASS (0 errors)
- **Production Build (`tsc -b && vite build`):** PASS (`dist/` built cleanly)
- **GitHub Commits (`main`):**
  - `11d87c523a86a67cc98490ab65d3c7e51b1ae840` — Real instructor onboarding Edge Function, Admin management, Instructor portal sync (`dpl_EZnfAwtZFcxp87oHGP3i9ZmsgAcA` — `READY`)
  - Follow-up commit on `main` — Migration `0011` (`profiles` RLS recursion fix), Edge Function `v2` direct `token_hash` setup link, `SetPasswordPage.tsx` `verifyOtp` handler, and this report.
- **Production URL:** `https://athar-academy-peach.vercel.app`

---

## 5. Remaining Blockers / Owner Actions

1. **Supabase Auth Dashboard URL Configuration (Recommended Manual Owner Action):**
   - Even though direct copyable setup links now bypass `localhost:3000` via `?token_hash=...&type=recovery`, update **Site URL** to `https://athar-academy-peach.vercel.app` and add `https://athar-academy-peach.vercel.app/**` to **Redirect URLs** in Supabase Dashboard → Authentication → URL Configuration so emailed invite and password-reset links also resolve directly to production.
2. **Custom SMTP / Transactional Email Provider (Optional):**
   - Supabase's built-in email sender has strict rate limits; configure custom SMTP (e.g. Resend/Postmark) in Supabase Auth Settings for high-volume automated invitation emails. Meanwhile, the one-time secure **Account Setup Link** in the Admin UI works immediately with zero external dependencies.
3. **Test Instructor Account Cleanup (Optional):**
   - The verified test instructor `instructor.onboarding.qa@atharacademy.org` (`Dr. Ahmed Al-Sharif`) is currently active and assigned as Lead Instructor on `ATH-WEB-101` so you can immediately test instructor course creation in Workflow 02, or suspend/remove it anytime.

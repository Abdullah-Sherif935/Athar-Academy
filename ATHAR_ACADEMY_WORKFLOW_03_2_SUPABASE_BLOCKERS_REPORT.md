# ATHAR ACADEMY — WORKFLOW 03.2 SUPABASE BLOCKERS REPORT
## Resolution Audit for Remaining Supabase Production Blockers

**Date:** 2026-11-28  
**Production URL:** `https://athar-academy-peach.vercel.app`  
**GitHub Repository:** `https://github.com/Abdullah-Sherif935/Athar-Academy` (`main`)  
**Supabase Project Ref:** `jyhiasoyvheismhrtbap`

---

## 1. Authorized Execution Paths Inspected

Before attempting any mutation, every supported authorized route in the workspace was audited (no secrets read or printed):

| Route | Availability | Exact Observation |
|---|---|---|
| `supabase_mcp` (`apply_migration`) | **BLOCKED (Client Policy)** | Invoked cleanly as a standalone call; client auto-cancelled confirmation after `0.1 s` (`"The client cancelled this confirmation 0.1 s after it was sent. Nothing was run."`). |
| `supabase_mcp` (Auth Config / Management API) | **UNAVAILABLE** | `supabase_mcp` exposes no tool to modify Supabase Auth settings or enable Leaked Password Protection. |
| Local Supabase CLI (`npx supabase`) | **UNAUTHENTICATED** | `npx supabase projects list` returned `AccessTokenRequiredError` (`SUPABASE_ACCESS_TOKEN` not set, no `supabase login` session). |
| Direct Database Connection (`SUPABASE_DB_URL` / `DATABASE_URL`) | **UNAVAILABLE** | Environment variables not present (`False`). |
| Plugin CLI Accounts (`list_plugin_accounts`) | **UNAVAILABLE** | `No installed plugins declare account sign-ins.` |

Per security rules, confirmation safeguards were NOT bypassed and no credentials were requested or fabricated.

---

## 2. Migration 0014 Status & Verification

- **File Inspected:** `supabase/migrations/0014_instructor_read_enrolled_student_profiles.sql`
- **Pre-Execution Audit:**
  - Exact SQL adds a single `FOR SELECT TO authenticated` RLS policy (`profiles_instructor_enrolled_students`) on `public.profiles` scoped strictly to students who have an `enrollment_requests` or `course_enrollments` row in a course where `private.is_assigned_instructor(course_id)` is true.
  - Existing policies verified in `pg_policies`: `profiles_admin_all` (`ALL`), `profiles_select_own_or_admin_or_public_instructor` (`SELECT`), `profiles_update_own` (`UPDATE`). Zero policy conflicts.
- **Execution Result:** **BLOCKED**
  - `apply_migration` was cancelled by the MCP client confirmation policy (`0.1 s` auto-cancel).
  - `pg_policies` confirms `profiles_instructor_enrolled_students` is **NOT** present in the database; migrations `0001`–`0013` remain applied cleanly.
- **Instructor Profile Visibility Behavior (Current State):** **NOT TESTED (Post-Migration)** / Confirmed pre-migration RLS intact — Lead Instructor receives `[]` from `profiles` and safely falls back to displaying student UUID `46bdbd6b-0668-400a-a07d-e578f80cc00e` on `/instructor/enrollments`.

---

## 3. Leaked Password Protection Status

- **Actual Configuration State (Verified via `get_advisors(type="security")`):** **BLOCKED (Disabled — `WARN`)**
  - Advisor finding: `auth_leaked_password_protection` (`Leaked Password Protection Disabled`).
- **Reason:** No authorized API/MCP/CLI interface exists in this environment to modify Supabase Auth Attack Protection settings without a Supabase Personal Access Token (`SUPABASE_ACCESS_TOKEN`) or manual Dashboard access.
- **Security Preserved:** Email confirmation remains enabled in production; password policies and unrelated Auth settings were not altered.

---

## 4. Security & Deployment Regression Status

| Check | Status | Evidence |
|---|---|---|
| Existing `public.profiles` RLS policies intact | **PASS** | `pg_policies` verified all 3 existing policies (`profiles_admin_all`, `profiles_select_own_or_admin_or_public_instructor`, `profiles_update_own`) untouched. |
| Production Enrollment & Progress State (`ATH-5C93E`) | **PASS** | `enrollment_requests` `active` / `confirmed`, `course_enrollments.is_suspended = false`, `lesson_progress` (`is_completed: true`, `135s`, saved note), `10` immutable audit events intact. |
| Latest Frontend Deployment (`d6fbc42`) | **PASS** | No unnecessary frontend changes made in Workflow 03.2; `d6fbc42` (real student name fix in `AdminEnrollmentsPage.tsx` + `DemoModeBanner.tsx` hide for auth users) deployed to `https://athar-academy-peach.vercel.app`. |
| Migration 0014 Applied & Verified Live | **BLOCKED** | Blocked by MCP client confirmation auto-cancel and unauthenticated local Supabase CLI. |
| Leaked Password Protection Enabled & Verified | **BLOCKED** | Blocked by absence of Auth config MCP tool and Management API token. |

---

## 5. Exact Manual Dependencies Required from Project Owner

1. **Apply Migration 0014 (15 seconds):**
   - Open **Supabase Dashboard → Project `jyhiasoyvheismhrtbap` → SQL Editor**, paste the contents of `supabase/migrations/0014_instructor_read_enrolled_student_profiles.sql`, and click **Run** (or enable confirmation prompts for `supabase_mcp` `apply_migration` / run `npx supabase login` locally).
2. **Enable Leaked Password Protection (10 seconds):**
   - Open **Supabase Dashboard → Project `jyhiasoyvheismhrtbap` → Authentication → Attack Protection / Security** and toggle **Leaked Password Protection** ON.

# ATHAR ACADEMY — Project Audit Report

**Phase:** 00 — Project Understanding, Architecture Audit & Foundation Planning  
**Audit Date:** 2026-11-25  
**Workspace Root:** `e:\Eng Abdullah\Antigravity\Athar Academy`

---

## 1. Executive Summary

This workspace is currently a **greenfield repository** containing only the authoritative brand & UI design skill document and two high-resolution raster logo files. **No application source code, package configuration, database schema, authentication logic, or deployment configuration exists yet.**

Before Phase 01 implementation begins, several foundational gaps and environment issues must be addressed—most notably:
1. Missing vector/dark/stacked logo assets in `public/brand/` (only two PNG files exist in `logo and prand/`).
2. The brand skill file is located at `Skills/ATHAR_ACADEMY_SKILL.md` rather than the expected `.agent/skills/athar-academy-brand-system/SKILL.md`.
3. Local developer environment constraints: Git is not installed in PATH, no `.git` repository is initialized, and Windows PowerShell execution policy blocks `npm.ps1`.

---

## 2. Current Project Structure

Full directory inventory of the workspace (verified recursively; no hidden files or `.git` directory found):

```text
Athar Academy/
├── logo and prand/
│   ├── Athar Academy Icon Logo.png              (1254 × 1254 px, 1.88 MB)
│   └── Athar Academy_ Learn, Grow, Impact.png   (2172 × 724 px, 1.21 MB)
└── Skills/
    └── ATHAR_ACADEMY_SKILL.md                   (381 lines, 15.1 KB)
```

### Expected Paths Verified as Missing
| Expected Path | Status | Notes |
|---|---|---|
| `.agent/skills/athar-academy-brand-system/SKILL.md` | **Missing** | Present instead at `Skills/ATHAR_ACADEMY_SKILL.md` |
| `public/brand/athar-academy-logo.svg` | **Missing** | Only raster PNG exists (`logo and prand/Athar Academy_ Learn, Grow, Impact.png`) |
| `public/brand/athar-academy-stacked.svg` | **Missing** | Not present in workspace |
| `public/brand/athar-academy-dark.svg` | **Missing** | Not present in workspace (no dark-background horizontal variant) |
| `public/brand/athar-academy-icon.svg` | **Missing** | Only raster PNG exists (`logo and prand/Athar Academy Icon Logo.png`) |
| `public/brand/athar-academy-icon-512.png` | **Missing** | Not present (1254×1254 PNG exists; 512×512 asset not yet supplied) |
| `package.json`, `vite.config.*`, `tsconfig.json` | **Missing** | Frontend project not yet scaffolded |
| `src/` | **Missing** | No frontend routes, components, or styles |
| `supabase/` | **Missing** | No migrations, Edge Functions, or local Supabase config |
| `.env.example` / `.env.local` | **Missing** | No environment variable structure defined |
| `.git/` | **Missing** | Version control not initialized |
| Deployment config (`vercel.json`, etc.) | **Missing** | No hosting or CI/CD configuration |

---

## 3. Existing Technologies & Local Toolchain Versions

Because no `package.json` exists, there are currently **no installed npm packages or frontend/backend frameworks** in the repository.

Local machine toolchain inspection:

| Tool | Status | Detected Version / Details |
|---|---|---|
| Node.js | Installed | `v26.13.1` |
| npm | Installed (PS1 blocked) | Bundled with Node `v26.13.1`, but `npm.ps1` is blocked by PowerShell Execution Policy (`npm.cmd` required unless policy is updated) |
| pnpm | Not Installed | `NOT_INSTALLED` |
| Git | Not Installed | `NOT_INSTALLED` (not found in `PATH`) |
| Supabase CLI | Not Installed | `NOT_INSTALLED` (Supabase MCP server is available in the agent environment; `npx supabase` can also be used once npm works) |

---

## 4. Existing Functionality

| Area | Current State |
|---|---|
| Brand & UI Design Specification | **Complete.** `Skills/ATHAR_ACADEMY_SKILL.md` defines brand positioning, Arabic/English taglines, complete light/dark/semantic HEX palette, Inter & Cairo typography, RTL/LTR rules, theme behavior (Light/Dark/System), component styling, WCAG 2.2 AA accessibility rules, and CSS token starter. |
| Visual Brand Assets | **Partial.** Two raster PNGs exist in `logo and prand/`: a 2172×724 horizontal light-surface logo and a 1254×1254 dark-navy rounded-square app icon. |
| Application Code (Frontend & Backend) | **None.** 0% implemented. |

---

## 5. Missing Functionality (Relative to Product Vision)

Every core platform module must be built from scratch:

1. **Project Foundation & Tooling:** Vite + React + TypeScript scaffold, linting/formatting, centralized brand config, CSS design token system, i18n (Arabic RTL / English LTR), and Light/Dark/System theme engine.
2. **Database Schema & Security (Supabase PostgreSQL + RLS):** Profiles, role management (Super Admin, Instructor, Student), categories, courses (bilingual fields), course-instructor assignments, lessons, lesson resources, manual enrollment requests & approvals, lesson progress, reviews, communities, messages, direct messages, email queue & logs, and audit logs.
3. **Authentication & Role-Based Access Control:** Registration, login, password recovery, email verification, session persistence, profile preferences (`locale`, `theme`), and backend-enforced RBAC with trusted admin role assignment.
4. **Public Website & Course Discovery:** Landing page, browsable course catalog with categories/search/filters, course details page (curriculum preview, instructor bios, ratings, enrollment CTA), and instructor profile pages.
5. **Manual Enrollment & Approval Workflow:** Student enrollment request submission, Super Admin approval/rejection queue, enrollment activation/deactivation, and strict backend RLS gating of course content.
6. **Provider-Independent Video Player & Learning Progress:** Reusable player abstraction (`VideoProviderAdapter`), initial YouTube Unlisted adapter via YouTube IFrame Player API, playback position tracking, lesson completion, total course progress calculation, and sequential lesson unlocking.
7. **Role-Specific Dashboards:**
   - **Student Dashboard:** Enrolled courses, pending requests, continue learning, progress tracking, certificates/milestones, reviews, and private messages.
   - **Instructor Dashboard:** Assigned courses only, lesson CRUD & drag/order management, resource uploads, enrolled student progress & analytics, course community moderation, and scoped announcements/emails.
   - **Super Admin Dashboard:** Users & profiles, instructor provisioning & course assignments, all courses/categories, enrollment approval queue, platform analytics, review moderation, community moderation, email queue monitoring, and platform settings.
8. **Course Communities & Direct Messaging (Supabase Realtime):** Per-course private community (group messages, instructor announcements, threaded replies, pinned messages, file/image attachments, moderation) and private 1-on-1 messaging between enrolled students and their course instructors.
9. **Asynchronous Email & Notification System:** Database-backed email queue, Supabase Edge Function worker with retries and delivery logs, transactional triggers (registration, enrollment approval, new lesson, announcements, community/DM notifications, password recovery), and strict role-scoped bulk sending.
10. **Deployment & CI/CD:** Hosting configuration, environment variable schema, migration workflow, and production security checks.

---

## 6. Technical Problems & Risks

| Severity | Issue / Risk | Impact | Recommended Resolution |
|---|---|---|---|
| **High** | **Missing SVG, Dark, and Stacked Brand Assets** | `SKILL.md` forbids redrawing logos in CSS, replacing them with text, or recreating them from screenshots. Without `athar-academy-dark.svg`, dark mode navigation/headers will lack a proper horizontal dark-surface logo. | Request the original brand-assets ZIP containing the 5 expected files (`athar-academy-logo.svg`, `athar-academy-stacked.svg`, `athar-academy-dark.svg`, `athar-academy-icon.svg`, `athar-academy-icon-512.png`) and place them in `public/brand/`. If unavailable immediately, confirm whether temporary use of the two existing PNGs is approved for Phase 01 scaffolding. |
| **High** | **No Version Control (Git not installed / no `.git`)** | High risk of accidental data loss and inability to track incremental phases, roll back changes, or deploy via Git-integrated CI/CD. | Install Git and initialize a local repository with a proper `.gitignore` before Phase 01 begins. |
| **Medium** | **Brand Skill Path Mismatch** | Prompts and tooling expect `.agent/skills/athar-academy-brand-system/SKILL.md`, while the file currently lives at `Skills/ATHAR_ACADEMY_SKILL.md`. | Copy/mirror `Skills/ATHAR_ACADEMY_SKILL.md` to `.agent/skills/athar-academy-brand-system/SKILL.md` in Phase 01 (keeping the original intact unless asked to move it). |
| **Medium** | **PowerShell Execution Policy Blocks `npm.ps1`** | Running `npm` directly in PowerShell fails with `UnauthorizedAccess`. | Use `npm.cmd` in scripts/commands or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` on the developer machine. |
| **Medium** | **Node.js `v26.13.1` (Non-LTS)** | Cutting-edge Node versions occasionally break native addons or older CLI tools. | Verify Vite, TypeScript, and Supabase CLI compatibility during Phase 01; switch to Node 22/24 LTS if native dependency issues arise. |
| **Medium** | **YouTube Unlisted Video Protection Limitation** | YouTube Unlisted links can be shared outside the platform; they do not provide DRM or signed URL security. | Explicitly design the `VideoProvider` abstraction and `lessons` schema (`video_provider`, `video_external_id`, `video_metadata`) so migrating to Cloudflare Stream or Vimeo with signed playback URLs requires zero schema or UI rewrites. |
| **Low** | **Asset Directory Naming (`logo and prand`)** | Typo and spaces in directory/filenames can cause fragile imports or broken URLs. | Keep original folder untouched for archival safety; place normalized production assets under `public/brand/` with exact lowercase hyphenated filenames. |

---

## 7. Existing Integrations

- **Supabase:** No project linked or configured in the workspace yet (no `.env`, no `supabase/config.toml`, no client SDK). Note that the `supabase_mcp` server is available in the agent environment for future database/migration operations once a Supabase project is selected or created.
- **Email Provider:** Not configured yet.
- **Video Provider (YouTube):** Not integrated yet.
- **Hosting / Deployment:** Not configured yet.

---

## 8. Recommended Next Steps

1. **Resolve Pre-Implementation Blockers (User Input Needed):**
   - Provide the brand-assets ZIP (or confirm whether we should temporarily place the two existing PNGs into `public/brand/` until the 5 SVG/PNG files are ready).
   - Confirm the target Supabase project (existing project or create a new free-tier Supabase project) and preferred free/affordable email provider (e.g., Resend free tier).
   - Install Git on the workstation (or confirm if Phase 01 should proceed while Git is set up).
2. **Proceed to Phase 01 — Foundation, Tooling, Brand System, i18n & Theme Engine:**
   - Initialize the React + TypeScript + Vite workspace, centralized brand/i18n/theme systems, core accessible UI primitives, and layout shell—verified in both Arabic (RTL) and English (LTR) across Light, Dark, and System themes before building backend features.

# ATHAR ACADEMY — Brand Implementation Plan

**Authoritative Reference:** `Skills/ATHAR_ACADEMY_SKILL.md` (to be mirrored at `.agent/skills/athar-academy-brand-system/SKILL.md` in Phase 01)  
**Brand Promise:** Learning should create a lasting, positive impact.  
**Taglines:** `LEARN · GROW · MAKE AN IMPACT` (EN) | `تعلّم · تطوّر · اصنع أثرًا` (AR)

---

## 1. Centralized Brand Architecture

Per `ATHAR_ACADEMY_SKILL.md` §1, the brand name, logo paths, and brand-specific copy must stay centralized so future brand updates never require rewriting components.

### Centralized Configuration (`src/config/brand.ts`)
- Stores `brandName`, bilingual taglines, support email, social links, and semantic logo asset paths.
- Use the two existing approved PNG assets directly from their current project folder via Vite ES module imports (so Vite bundles them reliably into production builds without creating duplicate logo folders or moving/renaming the originals):
  - `logos.primary`: imported from `logo and prand/Athar Academy_ Learn, Grow, Impact.png`
  - `logos.icon`: imported from `logo and prand/Athar Academy Icon Logo.png`
- Until separate dark/stacked variants are supplied, use the existing horizontal PNG on light surfaces and the existing icon PNG where a compact brand mark is needed. Do not invent or simulate unavailable logo variants.
- A single `<BrandLogo variant="horizontal" | "stacked" | "icon" surface="auto" | "light" | "dark" />` component should select only assets that actually exist, enforce `object-fit: contain`, preserve aspect ratio, apply clear-space padding, and output localized `alt` text (`ATHAR ACADEMY logo` / `شعار أكاديمية أثر`).
- Keep asset paths centralized so filenames or folders can be changed later in one place.

### Current Brand Assets & Follow-up
The project already contains these two raster PNG files in the existing `logo and prand/` folder:
- `logo and prand/Athar Academy_ Learn, Grow, Impact.png` (2172 × 724 px — horizontal primary logo on a light background)
- `logo and prand/Athar Academy Icon Logo.png` (1254 × 1254 px — dark-navy rounded-square app icon)

**Phase 01 Action:** Use these existing files in place. Do not create another logo folder, duplicate the files, or treat the current assets as missing. The five-file SVG/PNG package previously listed is an optional future enhancement for dedicated stacked, dark-surface, and vector variants—not a blocker for starting Phase 01. Never redraw the logo in CSS or replace it with plain text.

---

## 2. Design Tokens, Typography & Theme Engine

### Color Tokens (`src/styles/tokens.css`)
All colors come exclusively from CSS custom properties—no raw HEX values scattered in components:
- **Core Brand:** `--brand-navy: #142B4A`, `--brand-blue: #2563EB`, `--brand-teal: #16B8A6`, `--brand-orange: #F59E0B`, `--neutral-gray: #64748B`.
- **Light Mode:** Background `#F5F7FA`, Surface `#FFFFFF`, Subtle `#F1F5F9`, Text Primary `#142B4A`, Text Secondary `#64748B`, Border `#E2E8F0`, Disabled `#CBD5E1`.
- **Dark Mode (`[data-theme="dark"]`):** Background `#0B1220`, Surface `#111C2E`, Elevated `#17263D`, Subtle `#1E293B`, Text Primary `#F8FAFC`, Text Secondary `#CBD5E1`, Border `#334155`, Disabled `#64748B`.
- **Semantic Status:** Success (`#15803D` / `#4ADE80`), Warning (`#B45309` / `#FBBF24`), Error (`#B91C1C` / `#F87171`), Info (`#1D4ED8` / `#60A5FA`).
- **Usage Discipline:** Blue for primary actions/links; Navy for hierarchy/anchors; Teal for progress/completion; Orange strictly for small highlights/achievements (never primary buttons or body text); no default gradients on cards, buttons, or backgrounds; always pair color with icon or text for status.

### Bilingual Typography (`src/styles/typography.css`)
- **English (`html[lang="en"]`):** `Inter` (weights 400, 500, 600, 700, 800), body line-height `1.5–1.7`.
- **Arabic (`html[lang="ar"]`):** `Cairo` (weights 400, 500, 600, 700, 800), fallback `"Noto Sans Arabic", Tahoma, Arial, sans-serif`, body line-height `1.7–1.9`, zero cramped letter-spacing.
- Self-hosted via `@fontsource/inter` and `@fontsource/cairo` (or optimized WOFF2 subsets) for fast, reliable offline/online loading with `font-display: swap`.

### Theme & Direction Switching
- **Theme:** Supports `light`, `dark`, and `system` (initial default: `system`). Inline script in `index.html` applies `data-theme` before first paint to prevent flash of wrong theme. Persisted in `localStorage` and synced to `profiles.theme`.
- **Bilingual RTL/LTR:** Sets `document.documentElement.lang` (`ar` | `en`) and `dir` (`rtl` | `ltr`). Uses logical CSS properties (`margin-inline-start`, `padding-inline-end`, `text-align: start`) everywhere. Mirrors directional UI (sidebars, breadcrumbs, pagination, arrows) while keeping universal icons (play, search, settings, close) unmirrored. Uses `dir="auto"` / isolated inline direction for emails, URLs, and course codes.

---

## 3. Brand Application Across Every Surface

### A. Public Website (Landing, Catalog, Instructor Profiles)
- **Navigation Bar:** Surface white (light) / `#111C2E` (dark) with subtle border, `<BrandLogo />` using the existing primary logo (on light surfaces or inside a crisp light pill container on dark surfaces when horizontal legibility is needed) or the existing app icon, clear links, visible Language Switcher (`العربية` / `EN`), Theme Switcher (Sun/Moon/Monitor), and primary Blue CTA.
- **Hero Section:** Open, calm educational tone with Navy headline (light) / Near-white (dark), brand tagline (`LEARN · GROW · MAKE AN IMPACT` / `تعلّم · تطوّر · اصنع أثرًا`), clean spacing, and zero heavy gradients.
- **Footer:** Anchored in brand Navy (`#142B4A`). Until a dedicated dark-surface logo variant exists, use the existing icon asset or a verified legible treatment of the existing primary PNG; do not reference a nonexistent `athar-academy-dark.svg`.

### B. Authentication Pages (Login, Register, Password Recovery)
- Centered card (`#FFFFFF` light / `#111C2E` dark, `12–16px` radius, crisp border) on calm app background (`#F5F7FA` / `#0B1220`).
- Uses the existing primary logo or app icon, whichever fits the available space, centered above the form with generous clear space. Dedicated stacked/dark variants are future assets, not current dependencies.
- Top-corner Language & Theme controls so users can switch before signing in.
- Accessible inputs with persistent top labels (never placeholder-only), brand Blue focus ring, and inline semantic Error messages with icons.

### C. Course Pages (Catalog Cards, Course Details, Lesson Player)
- **Course Cards:** Prominent 16:9 thumbnail, category pill, bilingual title, instructor name, rating (with subtle Orange star highlight), student count, and semantic enrollment badge (`Pending`, `Approved`, `Enrolled`).
- **Course Details:** Structured curriculum list with clear locked/unlocked icons, instructor bio card, and prominent Blue primary CTA (`Request Enrollment` or `Continue Learning`).
- **Lesson Player (Classroom):** Distraction-free layout comfortable for long study sessions—especially in Dark mode (`#0B1220` / `#111C2E`). Teal (`#16B8A6`) progress bars paired with explicit numerical percentages (`65%`). Lesson sidebar mirrors cleanly between LTR (left) and RTL (right).

### D. Student Dashboard
- Consistent shared app shell with collapsible sidebar, top bar with language/theme/notifications, and `<BrandLogo />`.
- Highlights active courses with Teal progress indicators, "Continue Watching" quick card, pending enrollment status pills (semantic Warning amber), and subtle Orange achievement highlights when a course reaches 100%.

### E. Instructor Dashboard
- Uses the exact same visual language, tokens, and component primitives as the Student Dashboard—differing only in information architecture.
- Displays only assigned courses, clean drag/reorder lesson list, resource upload dropzone with clear validation states, student progress tables (responsive card/horizontal-scroll fallback on mobile), and scoped announcement composer.

### F. Super Admin Dashboard
- Coherent executive control surface using Navy hierarchy, crisp borders, and restrained tables—never generic corporate clutter.
- Enrollment Approval Queue uses distinct semantic badges + icons (`Pending` Warning, `Approved` Success, `Rejected` Error) and confirmation dialogs for destructive or role-changing actions.

### G. Course Community & Direct Messages
- Clean, readable discussion cards and message bubbles adhering strictly to RTL/LTR alignment (`justify-self: end` for sender, `start` for others using logical properties).
- Instructor announcements subtly accented with Navy/Blue badge and pin indicator; file/image attachments preview cleanly in both Light and Dark themes.
- Moderation actions (pin, delete) clearly distinguished and gated by role.

### H. Transactional & Educational Emails
- **Light-First High-Contrast Design** (per `SKILL.md` §6, since email clients vary widely in dark-mode behavior):
  - Outer background: `#F5F7FA`; Email container: `#FFFFFF` with `#E2E8F0` border.
  - Header: Clean light header featuring the existing primary PNG logo (`Athar Academy_ Learn, Grow, Impact.png`) or a Navy banner with the existing app icon (`Athar Academy Icon Logo.png`) hosted reliably for email clients.
  - Primary CTA button: Brand Blue (`#2563EB`) with white bold text.
  - Typography: Inter / system sans-serif for English (`dir="ltr"`), Cairo / Tahoma / Arial for Arabic (`dir="rtl"`), matched automatically to the recipient's `profiles.locale`.
  - Footer: Tagline, unsubscribe/notification preference link, and clear sender attribution.

---

## 4. Accessibility & Quality Gate (WCAG 2.2 AA)

Every page and component must pass before completion:
- Contrast ratio ≥ 4.5:1 for normal text and ≥ 3:1 for large text/UI components in both Light and Dark themes.
- Full keyboard navigation with visible brand Blue focus indicators.
- Minimum 44 × 44 px touch targets on mobile controls.
- `prefers-reduced-motion` respected on all transitions.
- Verified in Arabic (RTL) and English (LTR) at 375px, 768px, and 1280px+ with zero horizontal overflow.

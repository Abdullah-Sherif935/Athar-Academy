---
name: athar-academy-brand-system
description: Brand, UI, typography, color, bilingual, RTL/LTR, and light/dark-mode rules for ATHAR ACADEMY. Use this skill whenever designing, implementing, or modifying the ATHAR ACADEMY website, dashboards, emails, or app UI.
---

# ATHAR ACADEMY — Brand & UI Design Skill

## 1. Purpose and brand positioning

ATHAR ACADEMY is a multi-disciplinary learning platform connecting learners, instructors, and educational content across different fields. It is not limited to engineering or technology.

Brand promise: learning should create a lasting, positive impact.

Primary tagline:
**LEARN · GROW · MAKE AN IMPACT**

Arabic brand line:
**تعلّم · تطوّر · اصنع أثرًا**

Brand personality:
- Professional and trustworthy
- Modern and technology-aware
- Welcoming and human
- Clear, accessible, and encouraging
- Premium without feeling corporate or intimidating

Do not make the visual identity look like a school for children, a gaming product, or a generic corporate dashboard.

The name ATHAR ACADEMY is the current working brand. Keep the brand name, logo paths, and brand-specific copy centralized so they can be changed later without rewriting the application.

## 2. Logo usage

Use the supplied logo assets as-is. Do not redraw the logo with CSS, replace it with typed text, recolor it arbitrarily, distort it, or crop important parts.

Expected asset files:
- `athar-academy-logo.svg` — primary horizontal logo for navigation bars, footers, and general use.
- `athar-academy-stacked.svg` — stacked logo for centered or narrow spaces.
- `athar-academy-dark.svg` — logo variant for dark backgrounds.
- `athar-academy-icon.svg` — scalable icon source.
- `athar-academy-icon-512.png` — 512 × 512 app icon.

If these assets are not present in the repository, ask for or locate the supplied brand-assets ZIP. Do not recreate them from a screenshot.

Logo rules:
- Preserve the original aspect ratio.
- Use `object-fit: contain`.
- Provide meaningful alt text: `ATHAR ACADEMY logo`.
- Use the icon-only asset for favicon/app-icon contexts.
- Use the light-background logo on light surfaces and the dark-background version on dark surfaces.
- Keep clear space around the logo approximately equal to the height of the letter A in the emblem.
- Do not place the logo over busy images or low-contrast backgrounds.

## 3. Brand color palette

### Core brand colors

| Token | Hex | Intended use |
|---|---|---|
| `brand.navy` | `#142B4A` | Primary brand anchor, headings, dark surfaces, footer |
| `brand.blue` | `#2563EB` | Primary actions, links, active navigation, focus accents |
| `brand.teal` | `#16B8A6` | Progress, positive learning states, secondary accent |
| `brand.orange` | `#F59E0B` | Small highlights, emphasis, achievement details |
| `neutral.gray` | `#64748B` | Secondary text and muted icons |

### Supporting light-theme neutrals

| Token | Hex | Intended use |
|---|---|---|
| `light.background` | `#F5F7FA` | Main app background |
| `light.surface` | `#FFFFFF` | Cards, dialogs, navigation surfaces |
| `light.surface.subtle` | `#F1F5F9` | Subtle panels, table headers, input backgrounds |
| `light.text.primary` | `#142B4A` | Main text |
| `light.text.secondary` | `#64748B` | Secondary text |
| `light.border` | `#E2E8F0` | Borders and dividers |
| `light.disabled` | `#CBD5E1` | Disabled controls |

### Supporting dark-theme neutrals

| Token | Hex | Intended use |
|---|---|---|
| `dark.background` | `#0B1220` | Main page background |
| `dark.surface` | `#111C2E` | Cards and navigation surfaces |
| `dark.surface.elevated` | `#17263D` | Dialogs, popovers, elevated panels |
| `dark.surface.subtle` | `#1E293B` | Input backgrounds and subtle panels |
| `dark.text.primary` | `#F8FAFC` | Main text |
| `dark.text.secondary` | `#CBD5E1` | Secondary text |
| `dark.border` | `#334155` | Borders and dividers |
| `dark.disabled` | `#64748B` | Disabled controls |

### Semantic colors

Use semantic colors consistently and do not substitute them with brand orange or teal.

| Meaning | Light | Dark |
|---|---|---|
| Success | `#15803D` | `#4ADE80` |
| Warning | `#B45309` | `#FBBF24` |
| Error | `#B91C1C` | `#F87171` |
| Info | `#1D4ED8` | `#60A5FA` |

Color rules:
- Blue is the main action color.
- Navy establishes trust and hierarchy.
- Teal is a supporting accent, especially for learning progress and successful completion.
- Orange is a sparing highlight; never use it for large blocks of body text.
- Do not use gradients as the default for buttons, cards, or page backgrounds.
- Maintain WCAG AA contrast where practical, especially for text and controls.
- Never communicate status through color alone; include text or an icon.

## 4. Typography

Use a clear bilingual font system:

### English
- Primary: **Inter**
- Fallback: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

### Arabic
- Primary: **Cairo**
- Fallback: `"Noto Sans Arabic", Tahoma, Arial, sans-serif`

Load fonts efficiently using local assets or a trusted font provider. Use appropriate font weights rather than simulating bold.

Recommended weights:
- 400 Regular — body text
- 500 Medium — labels and navigation
- 600 SemiBold — card titles and section headings
- 700 Bold — page titles and important emphasis
- 800 ExtraBold — limited use for hero headlines and brand display

Suggested type scale:
- Display: 48–56 px desktop; 34–40 px mobile
- H1: 36–40 px desktop; 28–32 px mobile
- H2: 28–32 px desktop; 24–26 px mobile
- H3: 20–24 px
- Body: 16 px
- Secondary/body small: 14 px
- Caption: 12–13 px
- Buttons: 14–16 px, weight 600

Typography rules:
- Use comfortable line-height: 1.5–1.7 for body text.
- Arabic paragraphs should generally use line-height around 1.7–1.9.
- Avoid overly tight letter spacing in Arabic.
- Use modest letter spacing for uppercase English labels only.
- Do not use Inter for Arabic text if Cairo or Noto Sans Arabic is available.
- Avoid mixing multiple font families within the same language block.

## 5. Bilingual behavior: Arabic and English

The platform must support Arabic and English across the complete experience, not only the landing page.

Language behavior:
- Provide a visible language switcher in the main navigation and account settings.
- Supported locales: `ar` and `en`.
- Default locale may be selected based on the user's first visit or browser preference, but the user must be able to change it.
- Persist the user's selected language in their profile and local session.
- All interface strings must come from translation dictionaries; do not hardcode user-facing text in components.
- Course titles, descriptions, instructor biographies, announcements, emails, and system messages should support Arabic and English content fields.
- If a translation is unavailable, show the available language clearly rather than rendering broken or mixed text.

### Direction and layout

Arabic:
- Set document language to `ar`.
- Set page direction to `rtl`.
- Align reading content to the right.
- Mirror directional UI patterns where appropriate: side navigation, breadcrumbs, back/forward arrows, pagination direction, and horizontal progression.
- Keep universal icons such as play, search, settings, and close visually consistent; do not mirror them unnecessarily.
- Ensure forms, labels, validation messages, dropdowns, and chat bubbles follow RTL behavior.

English:
- Set document language to `en`.
- Set page direction to `ltr`.
- Align reading content to the left.
- Use normal LTR navigation and progression.

Implementation expectations:
- Use logical CSS properties such as `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, and `text-align: start`.
- Avoid hardcoded `left` and `right` for layout unless the design specifically requires physical positioning.
- Use `dir="rtl"` or `dir="ltr"` at the document/app root and allow components to inherit direction.
- Test both languages at mobile, tablet, and desktop widths.
- Ensure mixed Arabic/English values (emails, URLs, course codes, numbers) render correctly using appropriate `dir="auto"` or isolated inline direction.

## 6. Light and dark themes

Provide three theme settings:
1. Light
2. Dark
3. System (follow operating-system preference)

Default behavior:
- Use System as the initial preference for a first-time visitor.
- Persist the user's explicit theme choice.
- Switching theme must not reload the entire page.
- Avoid flashes of the wrong theme during initial render.

### Light theme visual direction

The light theme should feel open, calm, clean, and educational:
- Main background: `#F5F7FA`
- Cards and content surfaces: white
- Primary text: deep navy
- Secondary text: slate gray
- Borders: soft gray
- Blue for primary actions and active states
- Teal for progress and success
- Orange for small highlights only

Use subtle shadows sparingly. Prefer clear spacing and borders over heavy card shadows. Keep course thumbnails visually prominent while maintaining a clean content layout.

### Dark theme visual direction

The dark theme should feel premium, focused, and comfortable for long study sessions:
- Main background: `#0B1220`
- Cards: `#111C2E`
- Elevated panels: `#17263D`
- Primary text: near-white
- Secondary text: light slate
- Borders: muted slate
- Blue and teal accents should remain visible but not glow excessively.
- Orange remains a small highlight.

Do not simply invert all colors. Re-evaluate contrast, borders, shadows, images, video controls, charts, and status colors for dark mode. Avoid pure black backgrounds and avoid large neon glows.

### Theme interaction

- Place a theme control in the profile/settings menu.
- Use a clear Sun / Moon / Monitor icon or equivalent labels.
- Keep theme selection consistent across public pages, student dashboard, instructor dashboard, admin dashboard, community, and forms.
- Emails should use a robust light-first design with a high-contrast layout because email clients vary in dark-mode support.

## 7. UI component styling

### Buttons
- Primary: brand blue background, white text.
- Secondary: transparent or subtle neutral surface with navy/primary text.
- Tertiary: text-only action.
- Destructive: semantic error color.
- Use consistent heights, radius, focus rings, hover, active, loading, and disabled states.
- Avoid orange as the primary button color.

### Cards
- Light: white surface, subtle border, restrained shadow.
- Dark: dark surface with muted border.
- Use consistent corner radius (12–16 px).
- Course cards should include thumbnail, title, category, instructor, rating, student count, and relevant enrollment state.

### Inputs
- Clear labels above fields.
- Visible focus state using brand blue.
- Error text below the field with an icon and explicit wording.
- Support RTL and LTR alignment.
- Do not rely on placeholders as the only labels.

### Navigation
- Use navy/white contrast in the brand system.
- Clearly distinguish active navigation.
- Support responsive mobile navigation.
- Mirror the navigation layout in RTL while keeping the logo and language switcher legible.

### Progress and status
- Use teal for learning progress and completion.
- Show numerical progress alongside progress bars.
- Use semantic status colors for pending, approved, rejected, and error states.

## 8. Product experience and visual consistency

The same brand system must apply to:
- Public landing page
- Course catalog and course details
- Authentication and onboarding
- Student dashboard
- Instructor dashboard
- Super Admin dashboard
- Lesson player
- Course community and direct messages
- Reviews and feedback
- Email templates
- Notifications
- Empty states, error states, loading states, and confirmation dialogs

Role-specific dashboards may differ in information architecture, but must look like one coherent product.

## 9. Accessibility and responsive design

- Aim for WCAG 2.2 AA.
- Ensure keyboard navigation and visible focus indicators.
- Use semantic HTML and accessible labels.
- Do not use color alone to convey information.
- Respect reduced-motion preferences.
- Provide adequate touch targets on mobile (ideally 44 × 44 px or larger).
- Avoid horizontal overflow in Arabic and English.
- Test long Arabic labels, long English course titles, and mixed-direction content.
- Ensure charts and tables remain usable on narrow screens.

## 10. Design tokens starter

Use CSS custom properties or the project's token system. Keep tokens centralized and avoid scattering raw hex values throughout components.

```css
:root {
  color-scheme: light;
  --brand-navy: #142B4A;
  --brand-blue: #2563EB;
  --brand-teal: #16B8A6;
  --brand-orange: #F59E0B;

  --bg: #F5F7FA;
  --surface: #FFFFFF;
  --surface-subtle: #F1F5F9;
  --text-primary: #142B4A;
  --text-secondary: #64748B;
  --border: #E2E8F0;

  --success: #15803D;
  --warning: #B45309;
  --error: #B91C1C;
  --info: #1D4ED8;

  --font-en: "Inter", system-ui, sans-serif;
  --font-ar: "Cairo", "Noto Sans Arabic", Tahoma, sans-serif;
}

[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0B1220;
  --surface: #111C2E;
  --surface-subtle: #1E293B;
  --text-primary: #F8FAFC;
  --text-secondary: #CBD5E1;
  --border: #334155;

  --success: #4ADE80;
  --warning: #FBBF24;
  --error: #F87171;
  --info: #60A5FA;
}

html[lang="ar"] {
  font-family: var(--font-ar);
}

html[lang="en"] {
  font-family: var(--font-en);
}
```

This is a starter token set. Extend it consistently for hover, active, focus, disabled, overlays, and component-specific states.

## 11. Implementation checklist

Before considering any page complete, verify:

- [ ] Correct logo variant is used.
- [ ] Brand colors come from centralized tokens.
- [ ] Inter is used for English and Cairo for Arabic.
- [ ] Arabic switches the page to RTL.
- [ ] English switches the page to LTR.
- [ ] Language selection persists.
- [ ] Light, dark, and system themes work.
- [ ] Theme selection persists without page reload.
- [ ] All controls have hover, focus, active, disabled, and loading states as relevant.
- [ ] Mobile, tablet, and desktop layouts are tested.
- [ ] No text or icon becomes unreadable in either theme.
- [ ] Course, instructor, student, and admin experiences remain visually consistent.
- [ ] No user-facing text is hardcoded outside the translation system.

## 12. Instructions to AI coding agents

When working on ATHAR ACADEMY:
1. Read this skill before changing UI or styling.
2. Inspect the existing project structure and reuse its current stack and conventions.
3. Do not replace working application architecture just to apply the brand.
4. Implement design tokens centrally.
5. Implement localization and directionality centrally, not with per-page hacks.
6. Implement theme selection centrally and apply it to every route and dashboard.
7. Use the provided logo assets; do not invent alternate marks.
8. Keep components reusable and accessible.
9. Do not introduce paid services or dependencies without explaining the need.
10. After changes, test representative Arabic/RTL and English/LTR pages in both light and dark themes.

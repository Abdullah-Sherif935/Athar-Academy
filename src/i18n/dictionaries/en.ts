export const en = {
  brand: {
    name: 'ATHAR ACADEMY',
    tagline: 'LEARN · GROW · MAKE AN IMPACT',
    alt: 'ATHAR ACADEMY logo',
  },
  a11y: {
    skipToContent: 'Skip to main content',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    closeModal: 'Close dialog',
    primaryNav: 'Primary navigation',
    themeSelection: 'Theme selection',
    languageSwitch: 'Switch language',
  },
  nav: {
    home: 'Home',
    about: 'About',
    disciplines: 'Disciplines',
    courses: 'Sample Courses',
    foundation: 'Design System',
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  language: {
    switchLabel: 'العربية',
    currentName: 'English',
  },
  hero: {
    badge: 'Foundation Phase · Bilingual Learning Platform',
    title: 'Learn with clarity, grow with purpose, and make a lasting impact',
    subtitle:
      'ATHAR ACADEMY is a multi-disciplinary learning platform connecting learners, instructors, and course communities in a cohesive Arabic and English experience built for focus and scale.',
    primaryCta: 'Explore Sample Disciplines',
    secondaryCta: 'Preview UI Foundation',
    pillars: {
      bilingual: 'Native Arabic (RTL) & English (LTR) support',
      community: 'Dedicated learning communities per course',
      guided: 'Clear progress tracking comfortable for long study sessions',
    },
  },
  intro: {
    eyebrow: 'Platform Vision',
    title: 'Designed for focused learning across disciplines',
    description:
      'ATHAR ACADEMY is not limited to a single field. It provides a structured environment where instructors guide dedicated course communities and learners enjoy a calm, trustworthy experience on any device.',
    cards: {
      multidisciplinary: {
        title: 'Multi-Disciplinary',
        body: 'A flexible structure supporting technology, business, design, languages, and professional skills.',
      },
      instructorLed: {
        title: 'Instructor-Guided',
        body: 'Each course is managed by assigned instructors with structured lessons, resources, and a private community.',
      },
      accessible: {
        title: 'Accessible & Calm',
        body: 'Built toward WCAG 2.2 AA standards with light and dark themes crafted for comfortable study.',
      },
    },
  },
  disciplines: {
    eyebrow: 'Sample Disciplines',
    sampleBadge: 'Sample Preview Content',
    title: 'Learning disciplines in preparation',
    description:
      'The categories below are static placeholders illustrating the platform structure. Real categories will load from the database in upcoming phases.',
    items: {
      tech: {
        title: 'Technology & Engineering',
        description: 'Sample track covering modern software, systems, and data skills.',
      },
      business: {
        title: 'Business & Leadership',
        description: 'Sample track covering management, strategy, and operations.',
      },
      design: {
        title: 'Design & Creativity',
        description: 'Sample track covering visual systems, UX, and digital craft.',
      },
      languages: {
        title: 'Languages & Communication',
        description: 'Sample track covering practical languages and workplace communication.',
      },
    },
  },
  courses: {
    eyebrow: 'Sample Cards',
    sampleBadge: 'Sample Data — Not Live Courses',
    title: 'Preview of upcoming course cards',
    description:
      'These cards are static visual placeholders used to verify brand consistency, RTL/LTR layout, and theming. No fabricated instructors, ratings, or enrollment counts are shown.',
    statusLabel: 'Sample Preview',
    progressLabel: 'Sample progress indicator',
    actionPreview: 'Open Preview Modal',
    items: {
      one: {
        category: 'Sample Track · Technology',
        title: 'Sample Course: Foundations of Digital Product Building',
        summary: 'Placeholder summary demonstrating course card hierarchy, spacing, and teal progress tokens.',
      },
      two: {
        category: 'Sample Track · Business',
        title: 'Sample Course: Analytical Thinking & Project Delivery',
        summary: 'Placeholder summary validating Inter typography and clear visual contrast across light and dark modes.',
      },
      three: {
        category: 'Sample Track · Design',
        title: 'Sample Course: Human-Centered Design Principles',
        summary: 'Placeholder summary verifying responsive card grids and semantic badges across breakpoints.',
      },
    },
  },
  foundation: {
    eyebrow: 'Phase 01 Foundation',
    title: 'Core UI system preview',
    description:
      'Reusable, accessible primitives powered by centralized brand tokens, logical CSS properties, and keyboard-first interactions.',
    alertInfoTitle: 'Clean Foundation Scope',
    alertInfoBody:
      'Authentication, enrollments, and database tables will be introduced in upcoming roadmap phases.',
    alertSuccessTitle: 'Brand, Theme & Bilingual Engine Active',
    alertSuccessBody: 'Language and theme preferences persist locally without reloading the page.',
    emptyTitle: 'No published courses yet',
    emptyDescription: 'Live database-backed courses will appear here once Phase 03 connects the catalog.',
    skeletonLabel: 'Sample loading state (Skeleton)',
    modalTrigger: 'Open Modal Preview',
    modalTitle: 'Accessible Dialog & Form Primitives',
    modalDescription:
      'Verifies Escape-key dismissal, labeled inputs, validation states, and mixed-direction content in both RTL and LTR.',
    sampleInputLabel: 'Sample email (mixed-direction check)',
    sampleInputPlaceholder: 'name@example.com',
    sampleInputHelper: 'Demonstrates isolated LTR values inside bilingual forms.',
    sampleTextareaLabel: 'Sample note',
    sampleTextareaPlaceholder: 'Type a short message in Arabic or English...',
    sampleSubmit: 'Test Validation',
    sampleCancel: 'Close',
    sampleValidationError: 'Please enter a valid value to preview the error state.',
    sampleValidationSuccess: 'Form validation preview succeeded (local UI state only — nothing sent).',
  },
  footer: {
    description:
      'A multi-disciplinary learning platform dedicated to clear, trustworthy, and impactful education in Arabic and English.',
    linksTitle: 'Quick Links',
    contactTitle: 'Brand & Contact',
    copyright: '© {year} ATHAR ACADEMY. All rights reserved.',
    phaseNote: 'Phase 01 · Foundation & Brand System',
  },
} as const;

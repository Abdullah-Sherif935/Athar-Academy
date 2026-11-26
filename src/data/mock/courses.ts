import type { Course } from './types';

export const MOCK_COURSES: Course[] = [
  {
    slug: 'foundations-modern-web-development',
    code: 'DEMO-DEV-101',
    title: {
      ar: 'أساسيات تطوير تطبيقات الويب الحديثة',
      en: 'Foundations of Modern Web Development',
    },
    shortDescription: {
      ar: 'مدخل عملي ومنظم لبناء واجهات ويب متجاوبة وقابلة للصيانة باستخدام HTML وCSS وTypeScript.',
      en: 'A structured, hands-on introduction to responsive, maintainable web apps using HTML, CSS, and TypeScript.',
    },
    fullDescription: {
      ar: 'دورة نموذجية توضح تجربة العرض الكاملة لدورة برمجية في أكاديمية أثر. تبدأ من فهم بنية الويب ومعايير الوصول وتصل إلى بناء واجهات منظمة قابلة للتوسع مع دعم العربية والإنجليزية.',
      en: 'A sample course demonstrating the full curriculum experience on ATHAR ACADEMY. It guides learners from semantic web foundations and accessibility through modular, bilingual front-end architecture.',
    },
    disciplineSlug: 'programming-software',
    instructorSlugs: ['dr-tariq-al-mansour'],
    level: 'beginner',
    duration: { ar: '6 أسابيع · 18 درسًا (نموذجي)', en: '6 Weeks · 18 Lessons (Sample)' },
    accent: 'blue',
    featured: true,
    priceLabel: { ar: 'تسجيل بموافقة الإدارة (نموذجي)', en: 'Manual Approval Demo' },
    whatYouWillLearn: [
      { ar: 'بناء صفحات ويب دلالية متوافقة مع معايير الوصول', en: 'Build semantic, accessible web pages' },
      { ar: 'تنظيم التصميم المتجاوب باستخدام خصائص CSS المنطقية', en: 'Structure responsive layouts with logical CSS properties' },
      { ar: 'أساسيات TypeScript وتنظيم مكونات React القابلة لإعادة الاستخدام', en: 'TypeScript fundamentals and reusable React components' },
      { ar: 'تجهيز التطبيق لدعم اللغتين العربية والإنجليزية والوضع الداكن', en: 'Prepare apps for bilingual RTL/LTR and light/dark themes' },
    ],
    objectives: [
      { ar: 'إتقان هيكلة مشروع واجهة أمامية نظيف وقابل للتطوير', en: 'Master structuring a clean, maintainable front-end project' },
      { ar: 'تطبيق مبادئ فصل البيانات عن واجهة العرض', en: 'Apply clean separation between data and UI components' },
    ],
    requirements: [
      { ar: 'معرفة أساسية باستخدام الحاسوب والمتصفح', en: 'Basic computer and web browser familiarity' },
      { ar: 'لا يشترط خبرة برمجية مسبقة', en: 'No prior programming experience required' },
    ],
    targetAudience: [
      { ar: 'المبتدئون الراغبون في دخول مجال تطوير الويب', en: 'Beginners entering modern web development' },
      { ar: 'الطلاب والمهتمون ببناء منتجات رقمية عملية', en: 'Students and builders creating practical digital products' },
    ],
    curriculum: [
      {
        id: 'm1',
        title: { ar: 'الوحدة 1: أسس الويب والهيكلة الدلالية', en: 'Module 1: Semantic Web Foundations' },
        lessons: [
          { id: 'l1', title: { ar: 'كيف يعمل الويب الحديث', en: 'How the Modern Web Works' }, durationMinutes: 14, isPreview: true },
          { id: 'l2', title: { ar: 'كتابة HTML دلالي ومتاح للجميع', en: 'Writing Accessible Semantic HTML' }, durationMinutes: 22 },
          { id: 'l3', title: { ar: 'نظام التصميم والمتغيرات في CSS', en: 'Design Tokens & CSS Custom Properties' }, durationMinutes: 26 },
        ],
      },
      {
        id: 'm2',
        title: { ar: 'الوحدة 2: التخطيط المتجاوب ودعم RTL/LTR', en: 'Module 2: Responsive & Bilingual Layouts' },
        lessons: [
          { id: 'l4', title: { ar: 'الخصائص المنطقية في CSS', en: 'Logical CSS Properties in Practice' }, durationMinutes: 20 },
          { id: 'l5', title: { ar: 'بناء شبكات مرنة لمختلف الشاشات', en: 'Responsive Grids Across Breakpoints' }, durationMinutes: 24 },
        ],
      },
    ],
    resources: [
      { id: 'r1', title: { ar: 'دليل مرجعي للخصائص المنطقية في CSS (نموذج)', en: 'Logical CSS Quick Reference Guide (Sample)' }, type: 'pdf' },
      { id: 'r2', title: { ar: 'قائمة فحص جودة الواجهة (نموذج)', en: 'UI Accessibility Checklist (Sample)' }, type: 'worksheet' },
    ],
  },
  {
    slug: 'systems-engineering-fundamentals',
    code: 'DEMO-ENG-201',
    title: {
      ar: 'مبادئ هندسة النظم وتحليل المشكلات التقنية',
      en: 'Systems Engineering & Technical Problem Solving',
    },
    shortDescription: {
      ar: 'منهجية عملية لتحليل المتطلبات، وتصميم المعماريات، وتقليل المخاطر في المشاريع الهندسية.',
      en: 'A practical framework for requirements analysis, architecture design, and risk reduction in engineering projects.',
    },
    fullDescription: {
      ar: 'دورة نموذجية ضمن مسار الهندسة والتقنية تستعرض كيفية تفكيك المشكلات الهندسية المركبة إلى مكونات واضحة قابلة للاختبار والتنفيذ المرحلي.',
      en: 'A sample Engineering & Technology course exploring how to break complex technical problems into testable, incremental subsystems.',
    },
    disciplineSlug: 'engineering-technology',
    instructorSlugs: ['dr-tariq-al-mansour'],
    level: 'intermediate',
    duration: { ar: '5 أسابيع · 15 درسًا (نموذجي)', en: '5 Weeks · 15 Lessons (Sample)' },
    accent: 'navy',
    featured: true,
    whatYouWillLearn: [
      { ar: 'توثيق المتطلبات الوظيفية وغير الوظيفية بدقة', en: 'Document functional and non-functional requirements clearly' },
      { ar: 'رسم حدود الأنظمة وتحديد نقاط الفشل المحتملة', en: 'Map system boundaries and anticipate failure modes' },
      { ar: 'بناء خطة تحقق واختبار لكل مرحلة تنفيذية', en: 'Design verification plans for every engineering milestone' },
    ],
    objectives: [
      { ar: 'تحويل الأفكار التقنية إلى وثائق معمارية قابلة للتنفيذ', en: 'Translate technical goals into actionable architecture specs' },
    ],
    requirements: [
      { ar: 'خلفية هندسية أو تقنية عامة', en: 'General engineering or technical background' },
    ],
    targetAudience: [
      { ar: 'طلاب الهندسة والمهندسون حديثو التخرج', en: 'Engineering students and early-career engineers' },
      { ar: 'قادة الفرق التقنية ومحللو النظم', en: 'Technical leads and systems analysts' },
    ],
    curriculum: [
      {
        id: 'm1',
        title: { ar: 'الوحدة 1: التفكير المنظومي وتحليل المتطلبات', en: 'Module 1: Systems Thinking & Requirements' },
        lessons: [
          { id: 'l1', title: { ar: 'مقدمة في هندسة النظم', en: 'Introduction to Systems Engineering' }, durationMinutes: 18, isPreview: true },
          { id: 'l2', title: { ar: 'تحديد النطاق والقيود الفنية', en: 'Defining Scope and Technical Constraints' }, durationMinutes: 25 },
        ],
      },
      {
        id: 'm2',
        title: { ar: 'الوحدة 2: المعمارية والتحقق من الجودة', en: 'Module 2: Architecture & Verification' },
        lessons: [
          { id: 'l3', title: { ar: 'تصميم الواجهات بين المكونات', en: 'Designing Component Interfaces' }, durationMinutes: 23 },
          { id: 'l4', title: { ar: 'إدارة المخاطر واختبارات القبول', en: 'Risk Management & Acceptance Testing' }, durationMinutes: 21 },
        ],
      },
    ],
    resources: [
      { id: 'r1', title: { ar: 'قالب وثيقة المعمارية الفنية (نموذج)', en: 'Architecture Spec Template (Sample)' }, type: 'template' },
    ],
  },
  {
    slug: 'human-centered-design-systems',
    code: 'DEMO-DES-102',
    title: {
      ar: 'تصميم التجارب وبناء أنظمة التصميم المتماسكة',
      en: 'Human-Centered UX & Cohesive Design Systems',
    },
    shortDescription: {
      ar: 'تعلم تصميم واجهات واضحة وموثوقة باستخدام متغيرات الألوان والخطوط وتجربة ثنائية اللغة.',
      en: 'Learn to craft calm, trustworthy interfaces with centralized design tokens, typography, and bilingual UX.',
    },
    fullDescription: {
      ar: 'دورة نموذجية في التصميم والفنون الإبداعية تركز على تحويل الهوية البصرية إلى نظام تصميم عملي متسق عبر الويب والأجهزة المحمولة.',
      en: 'A sample Design & Creative Arts course focused on turning brand identity into a consistent, accessible cross-device design system.',
    },
    disciplineSlug: 'design-creative-arts',
    instructorSlugs: ['nadia-hassan'],
    level: 'beginner',
    duration: { ar: '4 أسابيع · 12 درسًا (نموذجي)', en: '4 Weeks · 12 Lessons (Sample)' },
    accent: 'teal',
    featured: true,
    whatYouWillLearn: [
      { ar: 'فهم مبادئ التباين البصري وإمكانية الوصول WCAG', en: 'Apply visual contrast and WCAG accessibility standards' },
      { ar: 'تصميم أنماط العرض الفاتح والداكن دون إجهاد بصري', en: 'Design comfortable light and dark modes' },
      { ar: 'بناء مكتبة مكونات متسقة للغتين العربية والإنجليزية', en: 'Build consistent component patterns for Arabic and English' },
    ],
    objectives: [
      { ar: 'القدرة على تصميم نظام واجهة متكامل قابل للتسليم للمطورين', en: 'Deliver a developer-ready design system specification' },
    ],
    requirements: [
      { ar: 'اهتمام بالتصميم الرقمي؛ لا تشترط خبرة متقدمة', en: 'Interest in digital design; no advanced experience required' },
    ],
    targetAudience: [
      { ar: 'مصممو الواجهات وتجربة المستخدم المبتدئون', en: 'Aspiring UI and UX designers' },
      { ar: 'مطورو الواجهات الراغبون في تحسين الحس البصري', en: 'Front-end developers strengthening visual craft' },
    ],
    curriculum: [
      {
        id: 'm1',
        title: { ar: 'الوحدة 1: أسس الهوية والألوان والخطوط', en: 'Module 1: Brand Tokens, Color & Typography' },
        lessons: [
          { id: 'l1', title: { ar: 'بناء لوحة ألوان دلالية متوازنة', en: 'Building a Semantic Color Palette' }, durationMinutes: 16, isPreview: true },
          { id: 'l2', title: { ar: 'اختيار الخطوط العربية والإنجليزية', en: 'Pairing Arabic & English Typefaces' }, durationMinutes: 19 },
        ],
      },
      {
        id: 'm2',
        title: { ar: 'الوحدة 2: المكونات والاتجاهية (RTL/LTR)', en: 'Module 2: Components & Directionality' },
        lessons: [
          { id: 'l3', title: { ar: 'تصميم البطاقات والنماذج الواضحة', en: 'Designing Clear Cards & Forms' }, durationMinutes: 24 },
        ],
      },
    ],
    resources: [
      { id: 'r1', title: { ar: 'دليل فحص التباين اللوني (نموذج)', en: 'Color Contrast Audit Sheet (Sample)' }, type: 'guide' },
    ],
  },
  {
    slug: 'practical-project-delivery-strategy',
    code: 'DEMO-BUS-204',
    title: {
      ar: 'التخطيط الاستراتيجي وإدارة المشاريع التطبيقية',
      en: 'Strategic Planning & Practical Project Delivery',
    },
    shortDescription: {
      ar: 'أدوات عملية لوضع خطط التنفيذ، وتوزيع المهام، وقياس التقدم في بيئات العمل الحديثة.',
      en: 'Practical frameworks for execution roadmaps, scope control, and progress tracking in modern teams.',
    },
    fullDescription: {
      ar: 'دورة نموذجية في مسار الأعمال وريادة الأعمال تساعد القادة ورواد الأعمال على تحويل الأهداف الكبرى إلى مراحل واضحة وقابلة للقياس.',
      en: 'A sample Business & Entrepreneurship course helping founders and managers break ambitious goals into measurable phases.',
    },
    disciplineSlug: 'business-entrepreneurship',
    instructorSlugs: ['karim-el-sayed'],
    level: 'intermediate',
    duration: { ar: '5 أسابيع · 14 درسًا (نموذجي)', en: '5 Weeks · 14 Lessons (Sample)' },
    accent: 'orange',
    featured: true,
    whatYouWillLearn: [
      { ar: 'صياغة خارطة طريق مرحلية بمعايير إنجاز واضحة', en: 'Draft phased roadmaps with clear completion criteria' },
      { ar: 'إدارة المخاطر وتحديد الأولويات بواقعية', en: 'Manage risks and prioritize work realistically' },
      { ar: 'إعداد تقارير متابعة مختصرة ومؤثرة لأصحاب القرار', en: 'Write concise, high-signal status reports' },
    ],
    objectives: [
      { ar: 'بناء خطة تنفيذ متكاملة لمشروع حقيقي أو مبادرة جديدة', en: 'Build an end-to-end delivery plan for a real initiative' },
    ],
    requirements: [
      { ar: 'الرغبة في إدارة المشاريع أو الفرق؛ مناسب لمختلف التخصصات', en: 'Open to learners from any background interested in project delivery' },
    ],
    targetAudience: [
      { ar: 'رواد الأعمال ومديرو المشاريع', en: 'Founders and project managers' },
      { ar: 'المتخصصون الراغبون في تنظيم عمل فرقهم', en: 'Professionals coordinating cross-functional teams' },
    ],
    curriculum: [
      {
        id: 'm1',
        title: { ar: 'الوحدة 1: تحديد النطاق وخارطة الطريق', en: 'Module 1: Scope & Phased Roadmaps' },
        lessons: [
          { id: 'l1', title: { ar: 'لماذا تفشل المشاريع وكيف نضبط النطاق', en: 'Preventing Scope Creep' }, durationMinutes: 17, isPreview: true },
          { id: 'l2', title: { ar: 'تقسيم العمل إلى مراحل قابلة للاختبار', en: 'Structuring Testable Milestones' }, durationMinutes: 22 },
        ],
      },
    ],
    resources: [
      { id: 'r1', title: { ar: 'قالب خطة مشروع مرحلية (نموذج)', en: 'Phased Project Plan Template (Sample)' }, type: 'template' },
    ],
  },
  {
    slug: 'robotics-control-prototyping',
    code: 'DEMO-ROB-210',
    title: {
      ar: 'مقدمة في الروبوتات والأنظمة المدمجة العملية',
      en: 'Introduction to Practical Robotics & Embedded Control',
    },
    shortDescription: {
      ar: 'فهم الحساسات، والمتحكمات الدقيقة، وحلقات التحكم الأساسية لبناء نماذج أتمتة موثوقة.',
      en: 'Understand sensors, microcontrollers, and core control loops to build reliable automation prototypes.',
    },
    fullDescription: {
      ar: 'دورة نموذجية ضمن مسار الروبوتات والأتمتة تجمع بين المفاهيم الأساسية والتجارب المحاكاة لتهيئة المتعلمين لمشاريع الأتمتة الحديثة.',
      en: 'A sample Robotics & Automation course combining core theory with structured prototyping exercises for modern automation.',
    },
    disciplineSlug: 'robotics-automation',
    instructorSlugs: ['dr-tariq-al-mansour'],
    level: 'intermediate',
    duration: { ar: '6 أسابيع · 16 درسًا (نموذجي)', en: '6 Weeks · 16 Lessons (Sample)' },
    accent: 'teal',
    whatYouWillLearn: [
      { ar: 'قراءة بيانات الحساسات وتصفية الإشارات الأساسية', en: 'Read sensor inputs and filter basic signals' },
      { ar: 'تصميم منطق التحكم الآلي الآمن', en: 'Design safe automated control logic' },
    ],
    objectives: [
      { ar: 'بناء نموذج أولي متكامل لنظام أتمتة مصغر', en: 'Design a complete mini-automation prototype architecture' },
    ],
    requirements: [
      { ar: 'معرفة مبدئية بالبرمجة أو الإلكترونيات', en: 'Introductory programming or electronics familiarity' },
    ],
    targetAudience: [
      { ar: 'طلاب الهندسة والميكاترونكس والهواة التقنيون', en: 'Engineering students and technical makers' },
    ],
    curriculum: [
      {
        id: 'm1',
        title: { ar: 'الوحدة 1: مكونات الأنظمة الروبوتية', en: 'Module 1: Anatomy of Robotic Systems' },
        lessons: [
          { id: 'l1', title: { ar: 'الحساسات والمشغلات والمتحكمات', en: 'Sensors, Actuators & Controllers' }, durationMinutes: 20, isPreview: true },
        ],
      },
    ],
    resources: [
      { id: 'r1', title: { ar: 'مخطط مرجعي لنظام تحكم نموذجي', en: 'Sample Control Loop Diagram' }, type: 'pdf' },
    ],
  },
  {
    slug: 'brand-content-digital-strategy',
    code: 'DEMO-MKT-105',
    title: {
      ar: 'استراتيجية المحتوى وبناء الحضور الرقمي الموثوق',
      en: 'Content Strategy & Trustworthy Digital Presence',
    },
    shortDescription: {
      ar: 'تخطيط المحتوى التعليمي والتسويقي وصياغة رسائل واضحة تبني ثقة الجمهور على المدى الطويل.',
      en: 'Plan educational and brand content with clear messaging that builds lasting audience trust.',
    },
    fullDescription: {
      ar: 'دورة نموذجية في التسويق والإعلام الرقمي توضح كيفية الموازنة بين الهوية البصرية والرسالة التحريرية للوصول إلى الجمهور المناسب.',
      en: 'A sample Marketing & Digital Media course bridging brand voice, visual consistency, and measurable content planning.',
    },
    disciplineSlug: 'marketing-digital-media',
    instructorSlugs: ['nadia-hassan', 'karim-el-sayed'],
    level: 'beginner',
    duration: { ar: '4 أسابيع · 11 درسًا (نموذجي)', en: '4 Weeks · 11 Lessons (Sample)' },
    accent: 'orange',
    whatYouWillLearn: [
      { ar: 'تحديد نبرة الخطاب والرسالة المحورية للعلامة التجارية', en: 'Define brand voice and core positioning' },
      { ar: 'بناء تقويم محتوى منظم وقابل للتنفيذ', en: 'Build an actionable editorial content calendar' },
    ],
    objectives: [
      { ar: 'إعداد خطة محتوى متكاملة لمشروع أو منصة معرفية', en: 'Prepare a cohesive content plan for a brand or learning initiative' },
    ],
    requirements: [
      { ar: 'لا يشترط خبرة تسويقية سابقة', en: 'No prior marketing experience required' },
    ],
    targetAudience: [
      { ar: 'صناع المحتوى وفرق التسويق ورواد الأعمال', en: 'Content creators, marketers, and founders' },
    ],
    curriculum: [
      {
        id: 'm1',
        title: { ar: 'الوحدة 1: التموضع وبناء الرسالة', en: 'Module 1: Positioning & Messaging' },
        lessons: [
          { id: 'l1', title: { ar: 'فهم الجمهور وصياغة القيمة', en: 'Understanding Audience Needs' }, durationMinutes: 15, isPreview: true },
        ],
      },
    ],
    resources: [
      { id: 'r1', title: { ar: 'ورقة عمل تخطيط المحتوى (نموذج)', en: 'Content Planning Worksheet (Sample)' }, type: 'worksheet' },
    ],
  },
  {
    slug: 'deep-learning-habits-communication',
    code: 'DEMO-PER-101',
    title: {
      ar: 'مهارات التعلم العميق والتواصل المهني الفعّال',
      en: 'Deep Learning Habits & Clear Professional Communication',
    },
    shortDescription: {
      ar: 'تنظيم وقت الدراسة، وتلخيص المعرفة، وتقديم الأفكار بوضوح وثقة في بيئات العمل والتعلم.',
      en: 'Organize study habits, synthesize knowledge, and communicate ideas clearly in study and work settings.',
    },
    fullDescription: {
      ar: 'دورة نموذجية ضمن مسار التطوير الشخصي والمهني تهدف إلى تزويد المتعلمين في مختلف المجالات بأدوات عملية للاستمرارية والإنجاز.',
      en: 'A sample Personal Development course equipping learners in every discipline with practical study and communication tools.',
    },
    disciplineSlug: 'personal-development',
    instructorSlugs: ['karim-el-sayed', 'dr-salma-youssef'],
    level: 'beginner',
    duration: { ar: '3 أسابيع · 9 دروس (نموذجي)', en: '3 Weeks · 9 Lessons (Sample)' },
    accent: 'blue',
    whatYouWillLearn: [
      { ar: 'بناء جدول تعلم أسبوعي واقعي ومستدام', en: 'Build a realistic, sustainable weekly study system' },
      { ar: 'صياغة العروض والرسائل المهنية بإيجاز ووضوح', en: 'Structure concise presentations and written updates' },
    ],
    objectives: [
      { ar: 'رفع كفاءة الاستيعاب والالتزام بالخطط التعليمية', en: 'Improve retention and consistency across learning goals' },
    ],
    requirements: [
      { ar: 'مناسبة لجميع المتعلمين في كل المراحل', en: 'Open to learners at every stage' },
    ],
    targetAudience: [
      { ar: 'الطلاب والخريجون والمهنيون في جميع التخصصات', en: 'Students, graduates, and professionals in any field' },
    ],
    curriculum: [
      {
        id: 'm1',
        title: { ar: 'الوحدة 1: نظام التعلم المستدام', en: 'Module 1: Sustainable Learning Systems' },
        lessons: [
          { id: 'l1', title: { ar: 'الانتقال من التصفح إلى التعلم النشط', en: 'Moving from Passive Reading to Active Recall' }, durationMinutes: 14, isPreview: true },
        ],
      },
    ],
    resources: [
      { id: 'r1', title: { ar: 'نموذج خطة أسبوعية للتعلم', en: 'Weekly Study Plan Template (Sample)' }, type: 'template' },
    ],
  },
  {
    slug: 'modern-instructional-design-foundations',
    code: 'DEMO-EDU-301',
    title: {
      ar: 'تصميم التجارب التعليمية والمناهج الرقمية الحديثة',
      en: 'Modern Instructional Design & Digital Curriculum',
    },
    shortDescription: {
      ar: 'كيف يصمم المدربون والمعلمون دورات متدرجة بمخرجات تعلم واضحة وتقييمات فعّالة.',
      en: 'How educators and instructors craft structured courses with clear outcomes and effective assessments.',
    },
    fullDescription: {
      ar: 'دورة نموذجية متقدمة في العلوم والتعليم تستعرض مبادئ التصميم التعليمي وبناء مجتمعات تعلم نشطة داخل المنصات الرقمية.',
      en: 'An advanced sample Science & Education course examining instructional architecture and active online learning communities.',
    },
    disciplineSlug: 'science-education',
    instructorSlugs: ['dr-salma-youssef'],
    level: 'advanced',
    duration: { ar: '6 أسابيع · 15 درسًا (نموذجي)', en: '6 Weeks · 15 Lessons (Sample)' },
    accent: 'navy',
    whatYouWillLearn: [
      { ar: 'مواءمة أهداف التعلم مع الدروس والمشاريع التطبيقية', en: 'Align learning objectives with lessons and exercises' },
      { ar: 'تفعيل النقاشات ومجتمعات الدورات لدعم المتعلمين', en: 'Facilitate constructive course communities' },
    ],
    objectives: [
      { ar: 'تصميم مخطط دورة رقمية كاملة جاهزة للتدريس', en: 'Produce a complete digital course blueprint' },
    ],
    requirements: [
      { ar: 'خبرة مبدئية في التدريس أو التدريب أو إعداد المحتوى', en: 'Prior teaching, mentoring, or content creation experience' },
    ],
    targetAudience: [
      { ar: 'المدربون والمعلمون ومصممو البرامج التعليمية', en: 'Instructors, educators, and program designers' },
    ],
    curriculum: [
      {
        id: 'm1',
        title: { ar: 'الوحدة 1: هندسة مخرجات التعلم', en: 'Module 1: Designing Learning Outcomes' },
        lessons: [
          { id: 'l1', title: { ar: 'بناء خريطة منهج متدرجة', en: 'Building a Progressive Curriculum Map' }, durationMinutes: 21, isPreview: true },
        ],
      },
    ],
    resources: [
      { id: 'r1', title: { ar: 'دليل تصميم مخطط الدورة (نموذج)', en: 'Course Blueprint Guide (Sample)' }, type: 'guide' },
    ],
  },
];

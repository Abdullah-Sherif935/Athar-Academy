import type { Discipline } from './types';

export const MOCK_DISCIPLINES: Discipline[] = [
  {
    slug: 'engineering-technology',
    name: { ar: 'الهندسة والتقنية', en: 'Engineering & Technology' },
    shortDescription: {
      ar: 'مفاهيم هندسية تطبيقية وأنظمة تقنية حديثة لبناء حلول عملية موثوقة.',
      en: 'Applied engineering concepts and modern technical systems for reliable real-world solutions.',
    },
    overview: {
      ar: 'يجمع هذا المسار التجريبي بين الأسس الهندسية والتفكير المنظومي لإعداد المتعلمين لفهم الأنظمة المعقدة وتصميم حلول تقنية قابلة للتوسع.',
      en: 'This sample discipline blends core engineering fundamentals with systems thinking to help learners design scalable technical solutions.',
    },
    highlights: [
      { ar: 'تصميم الأنظمة وتحليل المتطلبات الفنية', en: 'Systems design and technical requirements analysis' },
      { ar: 'منهجيات الاختبار وضمان الجودة الهندسية', en: 'Testing methodologies and engineering quality assurance' },
      { ar: 'تطبيقات عملية على مشاريع واقعية', en: 'Hands-on exercises modeled on realistic scenarios' },
    ],
    iconName: 'cpu',
    accent: 'navy',
    featured: true,
  },
  {
    slug: 'programming-software',
    name: { ar: 'البرمجة وتطوير البرمجيات', en: 'Programming & Software Development' },
    shortDescription: {
      ar: 'تطوير تطبيقات الويب وهندسة البرمجيات بأساليب حديثة ومنظمة.',
      en: 'Web application development and software engineering using structured modern practices.',
    },
    overview: {
      ar: 'مسار نموذجي يغطي أساسيات البرمجة وبناء الواجهات الحديثة وهيكلة المشاريع القابلة للصيانة باستخدام أدوات الصناعة المعاصرة.',
      en: 'A sample track covering programming fundamentals, modern front-end architecture, and maintainable software engineering practices.',
    },
    highlights: [
      { ar: 'بناء واجهات مستخدم متجاوبة ومتاحة للجميع', en: 'Building responsive and accessible user interfaces' },
      { ar: 'كتابة شيفرة برمجية منظمة وقابلة للاختبار', en: 'Writing clean, modular, and testable code' },
      { ar: 'مراجعة المشاريع والتطوير التدريجي', en: 'Iterative project refinement and code review habits' },
    ],
    iconName: 'code',
    accent: 'blue',
    featured: true,
  },
  {
    slug: 'robotics-automation',
    name: { ar: 'الروبوتات والأتمتة', en: 'Robotics & Automation' },
    shortDescription: {
      ar: 'مبادئ التحكم الآلي والأنظمة المدمجة وأتمتة العمليات الذكية.',
      en: 'Control fundamentals, embedded systems, and intelligent process automation.',
    },
    overview: {
      ar: 'يقدم هذا المسار النموذجي مدخلًا منهجيًا إلى عالم الروبوتات والحساسات والمتحكمات الدقيقة مع تركيز على السلامة والتكامل العملي.',
      en: 'This sample discipline introduces robotics, sensors, and embedded controllers with a focus on practical integration and reliability.',
    },
    highlights: [
      { ar: 'فهم الحساسات والمشغلات وأنظمة التحكم', en: 'Understanding sensors, actuators, and control loops' },
      { ar: 'نمذجة الأنظمة المدمجة خطوة بخطوة', en: 'Step-by-step embedded system prototyping' },
      { ar: 'أتمتة المهام وتحسين الكفاءة التشغيلية', en: 'Workflow automation and operational reliability' },
    ],
    iconName: 'bot',
    accent: 'teal',
    featured: false,
  },
  {
    slug: 'business-entrepreneurship',
    name: { ar: 'الأعمال وريادة الأعمال', en: 'Business & Entrepreneurship' },
    shortDescription: {
      ar: 'التخطيط الاستراتيجي، إدارة المشاريع، وبناء نماذج أعمال مستدامة.',
      en: 'Strategic planning, project delivery, and building sustainable business models.',
    },
    overview: {
      ar: 'يركز هذا المسار النموذجي على أدوات اتخاذ القرار، وإدارة المشاريع الحديثة، وتحويل الأفكار إلى مبادرات ومنتجات ذات قيمة واضحة.',
      en: 'This sample discipline focuses on structured decision-making, modern project delivery, and turning ideas into sustainable ventures.',
    },
    highlights: [
      { ar: 'تحليل السوق وتصميم نماذج العمل', en: 'Market analysis and business model design' },
      { ar: 'تخطيط المشاريع وإدارة الأولويات والمخاطر', en: 'Project planning, prioritization, and risk management' },
      { ar: 'مهارات القيادة والتواصل مع أصحاب المصلحة', en: 'Leadership and stakeholder communication' },
    ],
    iconName: 'briefcase',
    accent: 'orange',
    featured: true,
  },
  {
    slug: 'design-creative-arts',
    name: { ar: 'التصميم والفنون الإبداعية', en: 'Design & Creative Arts' },
    shortDescription: {
      ar: 'تصميم تجربة المستخدم، أنظمة الهوية البصرية، والتواصل البصري المؤثر.',
      en: 'User experience design, visual identity systems, and clear visual communication.',
    },
    overview: {
      ar: 'مسار نموذجي يعرّف المتعلمين بأسس التصميم المتمحور حول الإنسان، وبناء أنظمة تصميم متماسكة تراعي الوضوح وإمكانية الوصول.',
      en: 'A sample track introducing human-centered design, cohesive design systems, and accessible visual communication.',
    },
    highlights: [
      { ar: 'بناء أنظمة تصميم وهويات بصرية متسقة', en: 'Building cohesive design systems and brand identities' },
      { ar: 'تصميم واجهات ثنائية اللغة (RTL وLTR)', en: 'Designing bilingual (RTL & LTR) interfaces' },
      { ar: 'اختبار قابلية الاستخدام والتحسين المستمر', en: 'Usability testing and iterative refinement' },
    ],
    iconName: 'palette',
    accent: 'teal',
    featured: true,
  },
  {
    slug: 'marketing-digital-media',
    name: { ar: 'التسويق والإعلام الرقمي', en: 'Marketing & Digital Media' },
    shortDescription: {
      ar: 'استراتيجيات المحتوى، بناء العلامة التجارية، وقياس أثر الحملات الرقمية.',
      en: 'Content strategy, brand storytelling, and measurable digital campaigns.',
    },
    overview: {
      ar: 'يوضح هذا المسار النموذجي كيفية بناء حضور رقمي موثوق عبر محتوى تعليمي وإعلامي منظم بعيدًا عن الأساليب العشوائية.',
      en: 'This sample track explores building trustworthy digital presence through structured content strategy and clear messaging.',
    },
    highlights: [
      { ar: 'صياغة رسائل العلامة التجارية بوضوح', en: 'Crafting clear, trustworthy brand messaging' },
      { ar: 'تخطيط المحتوى الرقمي متعدد القنوات', en: 'Multi-channel digital content planning' },
      { ar: 'قراءة مؤشرات الأداء وتحسين النتائج', en: 'Evaluating campaign metrics and learning loops' },
    ],
    iconName: 'megaphone',
    accent: 'orange',
    featured: false,
  },
  {
    slug: 'personal-development',
    name: { ar: 'التطوير الشخصي والمهني', en: 'Personal Development' },
    shortDescription: {
      ar: 'مهارات التعلم الفعّال، التفكير النقدي، والتواصل المهني الواضح.',
      en: 'Effective learning habits, critical thinking, and clear professional communication.',
    },
    overview: {
      ar: 'مسار نموذجي يدعم المتعلمين في جميع التخصصات عبر تطوير مهارات إدارة الوقت والتعلم الذاتي والعرض والتواصل الفعّال.',
      en: 'A sample discipline supporting learners across all fields with time management, self-directed study, and communication skills.',
    },
    highlights: [
      { ar: 'بناء عادات تعلم عميق ومستدام', en: 'Building deep, sustainable learning habits' },
      { ar: 'التفكير التحليلي وحل المشكلات', en: 'Analytical thinking and structured problem solving' },
      { ar: 'العرض والتقديم والتواصل الكتابي المهني', en: 'Professional presentations and clear writing' },
    ],
    iconName: 'compass',
    accent: 'blue',
    featured: false,
  },
  {
    slug: 'science-education',
    name: { ar: 'العلوم والتعليم', en: 'Science & Education' },
    shortDescription: {
      ar: 'تصميم التجارب التعليمية، منهجيات البحث العلمي، وتبسيط المعرفة.',
      en: 'Instructional design, scientific inquiry methods, and clear knowledge transfer.',
    },
    overview: {
      ar: 'مسار نموذجي مخصص للباحثين والمعلمين وكل من يسعى لتصميم محتوى تعليمي منظم يصنع أثرًا ملموسًا لدى المتعلمين.',
      en: 'A sample discipline for educators and lifelong learners focused on structured instructional design and scientific thinking.',
    },
    highlights: [
      { ar: 'تصميم المناهج وتحديد مخرجات التعلم', en: 'Curriculum design and clear learning outcomes' },
      { ar: 'أساليب التقييم البنائي وتقديم التغذية الراجعة', en: 'Formative assessment and constructive feedback' },
      { ar: 'توظيف التقنية في تحسين جودة التعليم', en: 'Applying technology thoughtfully in education' },
    ],
    iconName: 'flask',
    accent: 'navy',
    featured: false,
  },
];

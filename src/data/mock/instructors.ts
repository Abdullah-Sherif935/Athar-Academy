import type { Instructor } from './types';

export const MOCK_INSTRUCTORS: Instructor[] = [
  {
    slug: 'dr-tariq-al-mansour',
    name: { ar: 'د. طارق المنصور (نموذج)', en: 'Dr. Tariq Al-Mansour (Demo)' },
    title: {
      ar: 'مدرب هندسة النظم وتطوير البرمجيات',
      en: 'Systems Engineering & Software Architecture Instructor',
    },
    initials: 'TM',
    accent: 'navy',
    shortBio: {
      ar: 'ملف تعريفي نموذجي لمدرب متخصص في هندسة البرمجيات وبناء الأنظمة التقنية القابلة للتوسع.',
      en: 'Sample instructor profile focused on software engineering and scalable technical systems.',
    },
    biography: {
      ar: 'هذا ملف تعريفي تجريبي يوضح كيفية عرض سيرة المدرب وخبراته ومساراته داخل أكاديمية أثر. يركز هذا النموذج على تبسيط مفاهيم هندسة النظم وتطوير الويب من خلال مشاريع عملية منظمة.',
      en: 'This is a demonstration instructor profile showing how instructor biographies, focus areas, and courses appear on ATHAR ACADEMY. The sample profile emphasizes clear systems engineering and structured project-based learning.',
    },
    expertise: [
      { ar: 'هندسة البرمجيات الحديثة', en: 'Modern Software Architecture' },
      { ar: 'تطوير واجهات الويب التفاعلية', en: 'Interactive Web Development' },
      { ar: 'الأنظمة المدمجة والأتمتة', en: 'Embedded Systems & Automation' },
    ],
    experience: [
      {
        role: { ar: 'قائد تقني ومصمم نظم (بيانات نموذجية)', en: 'Technical Lead & Systems Architect (Sample)' },
        organization: { ar: 'مؤسسة حلول تقنية نموذجية', en: 'Sample Technology Solutions Group' },
        period: { ar: '2020 — الحالي', en: '2020 — Present' },
      },
      {
        role: { ar: 'محاضر ومشرف مشاريع تطبيقية (بيانات نموذجية)', en: 'Applied Engineering Mentor (Sample)' },
        organization: { ar: 'مركز تدريب هندسي نموذجي', en: 'Sample Engineering Learning Center' },
        period: { ar: '2016 — 2020', en: '2016 — 2020' },
      },
    ],
    disciplineSlugs: ['engineering-technology', 'programming-software', 'robotics-automation'],
    socialLinks: {
      website: 'https://atharacademy.example/instructors/demo-tariq',
    },
    featured: true,
  },
  {
    slug: 'nadia-hassan',
    name: { ar: 'نادية حسن (نموذج)', en: 'Nadia Hassan (Demo)' },
    title: {
      ar: 'مدربة تصميم التجارب والهوية البصرية',
      en: 'UX & Visual Design Systems Instructor',
    },
    initials: 'NH',
    accent: 'teal',
    shortBio: {
      ar: 'ملف تعريفي نموذجي لمدربة متخصصة في تصميم المنتجات الرقمية وأنظمة الهوية وإتاحة الوصول.',
      en: 'Sample instructor profile specializing in digital product design, brand systems, and accessibility.',
    },
    biography: {
      ar: 'هذا ملف تعريفي تجريبي يستعرض كيفية تقديم مدربي التصميم والإبداع في أكاديمية أثر، مع التركيز على بناء أنظمة تصميم ثنائية اللغة ومراعاة سهولة الاستخدام في كل تفصيل.',
      en: 'This demonstration profile illustrates how design and creative instructors are presented on ATHAR ACADEMY, emphasizing bilingual design systems and thoughtful usability.',
    },
    expertise: [
      { ar: 'تصميم تجربة المستخدم (UX)', en: 'User Experience (UX) Design' },
      { ar: 'أنظمة التصميم ثنائية اللغة', en: 'Bilingual Design Systems' },
      { ar: 'إمكانية الوصول الرقمي', en: 'Digital Accessibility (WCAG)' },
    ],
    experience: [
      {
        role: { ar: 'مصممة منتجات رئيسية (بيانات نموذجية)', en: 'Lead Product Designer (Sample)' },
        organization: { ar: 'استوديو تصميم رقمي نموذجي', en: 'Sample Digital Design Studio' },
        period: { ar: '2019 — الحالي', en: '2019 — Present' },
      },
      {
        role: { ar: 'مدربة تصميم بصري (بيانات نموذجية)', en: 'Visual Design Instructor (Sample)' },
        organization: { ar: 'مبادرة تعليم إبداعي نموذجية', en: 'Sample Creative Education Initiative' },
        period: { ar: '2017 — 2019', en: '2017 — 2019' },
      },
    ],
    disciplineSlugs: ['design-creative-arts', 'marketing-digital-media'],
    socialLinks: {
      website: 'https://atharacademy.example/instructors/demo-nadia',
    },
    featured: true,
  },
  {
    slug: 'karim-el-sayed',
    name: { ar: 'كريم السيد (نموذج)', en: 'Karim El-Sayed (Demo)' },
    title: {
      ar: 'مدرب استراتيجية الأعمال وإدارة المشاريع',
      en: 'Business Strategy & Project Delivery Instructor',
    },
    initials: 'KE',
    accent: 'orange',
    shortBio: {
      ar: 'ملف تعريفي نموذجي لمدرب في إدارة المشاريع وريادة الأعمال والتواصل القيادي.',
      en: 'Sample instructor profile focused on project delivery, entrepreneurship, and leadership communication.',
    },
    biography: {
      ar: 'ملف تجريبي يوضح عرض مدربي الأعمال والإدارة على منصة أكاديمية أثر. يركز المحتوى النموذجي على التفكير التحليلي، وتخطيط المشاريع، ومهارات العمل الجماعي الفعّال.',
      en: 'A sample profile demonstrating how business and leadership instructors appear on ATHAR ACADEMY, centered on analytical thinking, project planning, and practical team execution.',
    },
    expertise: [
      { ar: 'إدارة المشاريع والتنفيذ', en: 'Project Planning & Delivery' },
      { ar: 'نماذج الأعمال وريادة الأعمال', en: 'Business Models & Ventures' },
      { ar: 'التواصل المهني والقيادة', en: 'Professional Communication & Leadership' },
    ],
    experience: [
      {
        role: { ar: 'مستشار إدارة مشاريع (بيانات نموذجية)', en: 'Project Delivery Advisor (Sample)' },
        organization: { ar: 'مجموعة استشارات أعمال نموذجية', en: 'Sample Business Advisory Group' },
        period: { ar: '2018 — الحالي', en: '2018 — Present' },
      },
    ],
    disciplineSlugs: ['business-entrepreneurship', 'personal-development', 'marketing-digital-media'],
    featured: true,
  },
  {
    slug: 'dr-salma-youssef',
    name: { ar: 'د. سلمى يوسف (نموذج)', en: 'Dr. Salma Youssef (Demo)' },
    title: {
      ar: 'مدربة التصميم التعليمي ومناهج البحث',
      en: 'Instructional Design & Research Methods Instructor',
    },
    initials: 'SY',
    accent: 'blue',
    shortBio: {
      ar: 'ملف تعريفي نموذجي لمدربة متخصصة في تصميم المناهج التعليمية والتعلم الفعّال.',
      en: 'Sample instructor profile specializing in instructional design and evidence-based learning.',
    },
    biography: {
      ar: 'ملف تعريفي تجريبي يمثل تخصص العلوم والتعليم في أكاديمية أثر، ويبرز دور التصميم التعليمي المدروس في رفع جودة الفهم والاستيعاب لدى المتعلمين.',
      en: 'A demonstration profile representing the Science & Education discipline on ATHAR ACADEMY, highlighting structured instructional design and evidence-based pedagogy.',
    },
    expertise: [
      { ar: 'التصميم التعليمي والمناهج', en: 'Instructional & Curriculum Design' },
      { ar: 'مناهج البحث والتفكير العلمي', en: 'Research & Scientific Methods' },
      { ar: 'استراتيجيات التعلم الذاتي', en: 'Self-Directed Learning Strategies' },
    ],
    experience: [
      {
        role: { ar: 'أخصائية تطوير مناهج (بيانات نموذجية)', en: 'Curriculum Specialist (Sample)' },
        organization: { ar: 'معهد تطوير تعليمي نموذجي', en: 'Sample Educational Research Institute' },
        period: { ar: '2019 — الحالي', en: '2019 — Present' },
      },
    ],
    disciplineSlugs: ['science-education', 'personal-development'],
    featured: true,
  },
];

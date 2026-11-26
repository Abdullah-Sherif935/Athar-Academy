import type { CommunityPostItem } from './types';

export const INITIAL_COMMUNITY_POSTS: CommunityPostItem[] = [
  {
    id: 'post-web-1',
    courseSlug: 'foundations-modern-web-development',
    authorName: { ar: 'د. طارق المنصور (نموذج)', en: 'Dr. Tariq Al-Mansour (Demo)' },
    authorRole: 'instructor',
    initials: 'TM',
    isPinned: true,
    isAnnouncement: true,
    title: {
      ar: 'مرحبًا بكم في مجتمع دورة تطوير الويب الحديثة',
      en: 'Welcome to the Modern Web Development Community',
    },
    content: {
      ar: 'هذا إعلان تجريبي مثبت. شاركوا أسئلتكم حول الدروس والتطبيقات العملية هنا، وسنراجعها معًا أسبوعيًا.',
      en: 'This is a pinned demo announcement. Share your questions on lessons and practical exercises here for weekly review.',
    },
    timeLabel: { ar: 'منذ يومين', en: '2 days ago' },
    likes: 6,
    likedByMe: false,
    replies: [
      {
        id: 'rep-web-1',
        authorName: { ar: 'سارة العلي (طالب تجريبي)', en: 'Sara Al-Ali (Demo Student)' },
        authorRole: 'student',
        initials: 'SA',
        content: {
          ar: 'شكرًا جزيلًا د. طارق، التنظيم واضح جدًا وسهل المتابعة.',
          en: 'Thank you Dr. Tariq! The module structure is super clear and easy to follow.',
        },
        timeLabel: { ar: 'منذ يوم', en: '1 day ago' },
      },
    ],
  },
  {
    id: 'post-web-2',
    courseSlug: 'foundations-modern-web-development',
    authorName: { ar: 'متعلم نموذجي', en: 'Sample Peer Learner' },
    authorRole: 'student',
    initials: 'PL',
    content: {
      ar: 'هل الأفضل استخدام margin-inline-start بدل margin-left في كل المكونات لدعم RTL تلقائيًا؟',
      en: 'Is it best to use margin-inline-start instead of margin-left across all components for automatic RTL?',
    },
    timeLabel: { ar: 'منذ 5 ساعات', en: '5 hours ago' },
    likes: 3,
    likedByMe: true,
    replies: [
      {
        id: 'rep-web-2',
        authorName: { ar: 'د. طارق المنصور (نموذج)', en: 'Dr. Tariq Al-Mansour (Demo)' },
        authorRole: 'instructor',
        initials: 'TM',
        content: {
          ar: 'نعم بالضبط! الخصائص المنطقية تجعل الواجهة تنعكس تلقائيًا بين العربية والإنجليزية بدون قواعد مكررة.',
          en: 'Yes, exactly! Logical CSS properties mirror layouts automatically between Arabic and English without duplicate overrides.',
        },
        timeLabel: { ar: 'منذ 4 ساعات', en: '4 hours ago' },
      },
    ],
  },
  {
    id: 'post-des-1',
    courseSlug: 'human-centered-design-systems',
    authorName: { ar: 'نادية حسن (نموذج)', en: 'Nadia Hassan (Demo)' },
    authorRole: 'instructor',
    initials: 'NH',
    isPinned: true,
    isAnnouncement: true,
    title: {
      ar: 'ملاحظات مهمة حول التباين في الوضع الداكن',
      en: 'Key Notes on Dark Mode Contrast',
    },
    content: {
      ar: 'تجنبوا استخدام الأسود الخالص #000000 كخلفية رئيسية؛ درجات الكحلي الداكن مثل #0B1220 أريح بكثير للعين أثناء الدراسة.',
      en: 'Avoid pure black #000000 for main backgrounds; deep navy surfaces like #0B1220 reduce eye strain during study.',
    },
    timeLabel: { ar: 'منذ يوم', en: '1 day ago' },
    likes: 4,
    likedByMe: false,
    replies: [],
  },
  {
    id: 'post-bus-1',
    courseSlug: 'practical-project-delivery-strategy',
    authorName: { ar: 'كريم السيد (نموذج)', en: 'Karim El-Sayed (Demo)' },
    authorRole: 'instructor',
    initials: 'KE',
    isPinned: true,
    isAnnouncement: true,
    title: {
      ar: 'قالب خطة المشروع المرحلية جاهز للتحميل',
      en: 'Phased Project Plan Template Ready',
    },
    content: {
      ar: 'يمكنكم معاينة القالب النموذجي داخل قسم الموارد وتطبيقه على فكرة مشروعكم الخاص.',
      en: 'You can preview the sample template in the resources tab and try applying it to your own project idea.',
    },
    timeLabel: { ar: 'منذ 3 أيام', en: '3 days ago' },
    likes: 2,
    likedByMe: false,
    replies: [],
  },
];

import type { ModerationPostItem } from './types';

export const INITIAL_INSTRUCTOR_COMMUNITY_POSTS: ModerationPostItem[] = [
  {
    id: 'ipost-1',
    courseSlug: 'foundations-modern-web-development',
    authorName: { ar: 'د. طارق المنصور (نموذج)', en: 'Dr. Tariq Al-Mansour (Demo)' },
    authorRole: 'instructor',
    initials: 'TM',
    title: {
      ar: 'مرحبًا بكم في مجتمع دورة تطوير الويب الحديثة',
      en: 'Welcome to the Modern Web Development Community',
    },
    content: {
      ar: 'شاركونا أسئلتكم وتطبيقاتكم العملية على دروس الأسبوع الأول هنا.',
      en: 'Share your questions and practical exercises from Week 1 lessons here.',
    },
    timeLabel: { ar: 'منذ يومين', en: '2 days ago' },
    isPinned: true,
    isHidden: false,
    isAnnouncement: true,
    replies: [
      {
        id: 'irep-1',
        authorName: { ar: 'سارة العلي (طالب تجريبي)', en: 'Sara Al-Ali (Demo Student)' },
        authorRole: 'student',
        initials: 'SA',
        content: {
          ar: 'شكرًا دكتور، الدروس منظمة جدًا وواضحة.',
          en: 'Thank you doctor! The lessons are very clear and well structured.',
        },
        timeLabel: { ar: 'منذ يوم', en: '1 day ago' },
      },
    ],
  },
  {
    id: 'ipost-2',
    courseSlug: 'foundations-modern-web-development',
    authorName: { ar: 'عمر خالد (طالب تجريبي)', en: 'Omar Khaled (Demo Student)' },
    authorRole: 'student',
    initials: 'OK',
    content: {
      ar: 'هل نستخدم خصائص CSS المنطقية في كل البطاقات لدعم RTL وLTR معًا؟',
      en: 'Should we use logical CSS properties in every card to support RTL and LTR cleanly?',
    },
    timeLabel: { ar: 'منذ 5 ساعات', en: '5 hours ago' },
    isPinned: false,
    isHidden: false,
    isAnnouncement: false,
    replies: [],
  },
  {
    id: 'ipost-3',
    courseSlug: 'systems-engineering-fundamentals',
    authorName: { ar: 'لينا سامي (طالب تجريبي)', en: 'Lina Sami (Demo Student)' },
    authorRole: 'student',
    initials: 'LS',
    content: {
      ar: 'ما الفرق العملي بين المتطلبات الوظيفية وغير الوظيفية عند توثيق مشروع؟',
      en: 'What is the practical difference between functional and non-functional requirements when documenting a project?',
    },
    timeLabel: { ar: 'منذ 8 ساعات', en: '8 hours ago' },
    isPinned: false,
    isHidden: false,
    isAnnouncement: false,
    replies: [],
  },
];

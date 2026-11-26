import type { InstructorAnnouncementRecord } from './types';

export const INITIAL_INSTRUCTOR_ANNOUNCEMENTS: InstructorAnnouncementRecord[] = [
  {
    id: 'ann-1',
    courseSlug: 'foundations-modern-web-development',
    title: {
      ar: 'إرشادات الأسبوع الثاني: الخصائص المنطقية في CSS',
      en: 'Week 2 Guidance: Logical CSS Properties',
    },
    body: {
      ar: 'يرجى مراجعة درس الخصائص المنطقية وتطبيق التمرين المرفق قبل جلسة النقاش الأسبوعية (إعلان تجريبي).',
      en: 'Please review the Logical CSS lesson and practice the attached worksheet ahead of our weekly Q&A (demo announcement).',
    },
    status: 'published',
    createdAt: { ar: 'منذ يومين (نموذجي)', en: '2 days ago (Demo)' },
  },
  {
    id: 'ann-2',
    courseSlug: 'systems-engineering-fundamentals',
    title: {
      ar: 'مسودة إعلان: تحديث قالب وثيقة المعمارية',
      en: 'Draft Announcement: Updated Architecture Spec Template',
    },
    body: {
      ar: 'مسودة تجريبية لإعلان حول تحديث قالب توثيق المتطلبات في الوحدة الثانية.',
      en: 'Demo draft announcement regarding the updated Module 2 requirements template.',
    },
    status: 'draft',
    createdAt: { ar: 'أمس (مسودة)', en: 'Yesterday (Draft)' },
  },
];

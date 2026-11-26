import type { EnrolledCourseRecord } from './types';

export const INITIAL_ENROLLED_COURSES: EnrolledCourseRecord[] = [
  {
    courseSlug: 'foundations-modern-web-development',
    completedLessonIds: ['l1', 'l2'],
    lastAccessedLabel: { ar: 'منذ ساعتين (نموذجي)', en: '2 hours ago (Demo)' },
    lastLessonId: 'l3',
    upcomingActivity: {
      title: { ar: 'استكمال درس: نظام التصميم والمتغيرات في CSS', en: 'Continue: Design Tokens & CSS Custom Properties' },
      dueLabel: { ar: 'مقترح اليوم', en: 'Suggested today' },
    },
  },
  {
    courseSlug: 'human-centered-design-systems',
    completedLessonIds: ['l1'],
    lastAccessedLabel: { ar: 'أمس (نموذجي)', en: 'Yesterday (Demo)' },
    lastLessonId: 'l2',
    upcomingActivity: {
      title: { ar: 'استكمال درس: اختيار الخطوط العربية والإنجليزية', en: 'Continue: Pairing Arabic & English Typefaces' },
      dueLabel: { ar: 'هذا الأسبوع', en: 'This week' },
    },
  },
  {
    courseSlug: 'practical-project-delivery-strategy',
    completedLessonIds: ['l1', 'l2'],
    lastAccessedLabel: { ar: 'منذ 3 أيام (نموذجي)', en: '3 days ago (Demo)' },
    lastLessonId: 'l2',
  },
  {
    courseSlug: 'deep-learning-habits-communication',
    completedLessonIds: [],
    lastAccessedLabel: { ar: 'ملتحق حديثًا (نموذجي)', en: 'Recently enrolled (Demo)' },
    lastLessonId: 'l1',
    upcomingActivity: {
      title: { ar: 'ابدأ الدرس الأول: الانتقال إلى التعلم النشط', en: 'Start Lesson 1: Active Recall' },
      dueLabel: { ar: 'الخطوة التالية', en: 'Up next' },
    },
  },
];

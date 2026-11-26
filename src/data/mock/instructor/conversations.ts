import type { InstructorConversationItem } from './types';

export const INITIAL_INSTRUCTOR_CONVERSATIONS: InstructorConversationItem[] = [
  {
    id: 'inst-conv-sara',
    studentId: 'stu-sara',
    courseSlug: 'foundations-modern-web-development',
    unreadCount: 1,
    messages: [
      {
        id: 'im1',
        sender: 'student',
        content: {
          ar: 'مرحبًا د. طارق، هل تنصح ببدء التمرين العملي بعد الدرس الثالث مباشرة؟',
          en: 'Hello Dr. Tariq, do you recommend starting the hands-on lab right after Lesson 3?',
        },
        timeLabel: { ar: 'اليوم · 11:20 ص', en: 'Today · 11:20 AM' },
      },
    ],
  },
  {
    id: 'inst-conv-omar',
    studentId: 'stu-omar',
    courseSlug: 'systems-engineering-fundamentals',
    unreadCount: 0,
    messages: [
      {
        id: 'im2',
        sender: 'student',
        content: {
          ar: 'شكرًا دكتور على ملاحظاتك حول مخطط الحدود الفنية في الوحدة الثانية.',
          en: 'Thank you doctor for your feedback on the Module 2 system boundary diagram.',
        },
        timeLabel: { ar: 'أمس · 03:40 م', en: 'Yesterday · 3:40 PM' },
      },
      {
        id: 'im3',
        sender: 'instructor',
        content: {
          ar: 'أحسنت يا عمر، تقسيم المكونات كان واضحًا جدًا ومرتبًا.',
          en: 'Great work Omar—your component boundaries were clear and well reasoned.',
        },
        timeLabel: { ar: 'أمس · 04:05 م', en: 'Yesterday · 4:05 PM' },
      },
    ],
  },
  {
    id: 'inst-conv-lina',
    studentId: 'stu-lina',
    courseSlug: 'systems-engineering-fundamentals',
    unreadCount: 1,
    messages: [
      {
        id: 'im4',
        sender: 'student',
        content: {
          ar: 'هل يمكن مراجعة مثال لاختبارات القبول قبل إنهاء الوحدة الثانية؟',
          en: 'Could we review an example of acceptance test criteria before wrapping up Module 2?',
        },
        timeLabel: { ar: 'اليوم · 09:15 ص', en: 'Today · 9:15 AM' },
      },
    ],
  },
];

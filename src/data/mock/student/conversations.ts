import type { ConversationItem } from './types';

export const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-tariq-web',
    instructorSlug: 'dr-tariq-al-mansour',
    courseSlug: 'foundations-modern-web-development',
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        sender: 'student',
        content: {
          ar: 'مرحبًا د. طارق، هل هناك تمرين إضافي مقترح بعد الوحدة الأولى؟',
          en: 'Hello Dr. Tariq, is there an extra exercise recommended after Module 1?',
        },
        timeLabel: { ar: 'أمس · 04:15 م', en: 'Yesterday · 4:15 PM' },
      },
      {
        id: 'm2',
        sender: 'instructor',
        content: {
          ar: 'أهلًا سارة! جرّبي بناء بطاقة دورة باستخدام متغيرات CSS فقط ثم اختبريها في الوضعين الفاتح والداكن.',
          en: 'Hi Sara! Try building a course card using CSS custom properties only, then test it in both light and dark modes.',
        },
        timeLabel: { ar: 'أمس · 05:02 م', en: 'Yesterday · 5:02 PM' },
      },
    ],
  },
  {
    id: 'conv-nadia-design',
    instructorSlug: 'nadia-hassan',
    courseSlug: 'human-centered-design-systems',
    unreadCount: 1,
    messages: [
      {
        id: 'm3',
        sender: 'student',
        content: {
          ar: 'أستاذة نادية، كيف نختار وزن خط مناسب للعناوين العربية في خط Cairo؟',
          en: 'Hi Nadia, what font weight works best for Arabic headings with Cairo?',
        },
        timeLabel: { ar: 'اليوم · 10:10 ص', en: 'Today · 10:10 AM' },
      },
      {
        id: 'm4',
        sender: 'instructor',
        content: {
          ar: 'وزن 700 للعنوان الرئيسي و600 للعناوين الفرعية مع ارتفاع سطر مريح حول 1.45–1.5 يعطي نتيجة متوازنة جدًا.',
          en: 'Weight 700 for display/H1 and 600 for subheadings with a comfortable 1.45–1.5 line-height gives a very balanced result.',
        },
        timeLabel: { ar: 'اليوم · 10:42 ص', en: 'Today · 10:42 AM' },
      },
    ],
  },
  {
    id: 'conv-karim-business',
    instructorSlug: 'karim-el-sayed',
    courseSlug: 'practical-project-delivery-strategy',
    unreadCount: 0,
    messages: [
      {
        id: 'm5',
        sender: 'instructor',
        content: {
          ar: 'مبارك إتمام جميع الدروس النموذجية في دورة التخطيط الاستراتيجي! يمكنك معاينة نموذج الشهادة من قسم الشهادات.',
          en: 'Congrats on completing all sample lessons in Strategic Planning! You can preview the demo certificate in Certificates.',
        },
        timeLabel: { ar: 'منذ 3 أيام', en: '3 days ago' },
      },
    ],
  },
];

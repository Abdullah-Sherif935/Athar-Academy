import type { StudentNotification } from './types';

export const INITIAL_STUDENT_NOTIFICATIONS: StudentNotification[] = [
  {
    id: 'notif-1',
    kind: 'announcement',
    title: {
      ar: 'إعلان مدرب جديد في دورة تطوير الويب',
      en: 'New instructor announcement in Web Development',
    },
    body: {
      ar: 'نشر د. طارق المنصور (نموذج) إرشادات الأسبوع الثاني حول الخصائص المنطقية في CSS.',
      en: 'Dr. Tariq Al-Mansour (Demo) posted Week 2 guidance on Logical CSS properties.',
    },
    timeLabel: { ar: 'منذ ساعة', en: '1 hour ago' },
    isRead: false,
    targetPath: '/student/community/foundations-modern-web-development',
  },
  {
    id: 'notif-2',
    kind: 'message',
    title: {
      ar: 'رسالة جديدة من نادية حسن (نموذج)',
      en: 'New message from Nadia Hassan (Demo)',
    },
    body: {
      ar: 'أرسلت لك ردًا حول مراجعة تباين الألوان في الوضع الداكن.',
      en: 'Sent a reply regarding your dark-mode contrast review question.',
    },
    timeLabel: { ar: 'منذ 3 ساعات', en: '3 hours ago' },
    isRead: false,
    targetPath: '/student/messages/conv-nadia-design',
  },
  {
    id: 'notif-3',
    kind: 'lesson',
    title: {
      ar: 'الدرس التالي جاهز للمتابعة',
      en: 'Next lesson is ready to continue',
    },
    body: {
      ar: 'يمكنك متابعة درس "نظام التصميم والمتغيرات في CSS" الآن.',
      en: 'You can continue "Design Tokens & CSS Custom Properties" now.',
    },
    timeLabel: { ar: 'أمس', en: 'Yesterday' },
    isRead: false,
    targetPath: '/student/courses/foundations-modern-web-development/lessons/l3',
  },
  {
    id: 'notif-4',
    kind: 'reply',
    title: {
      ar: 'رد جديد على مشاركتك في مجتمع التصميم',
      en: 'New reply on your Design community post',
    },
    body: {
      ar: 'علّقت المدربة على سؤالك حول توازن الخط العربي Cairo في العناوين.',
      en: 'The instructor replied to your question about Cairo font weights in headings.',
    },
    timeLabel: { ar: 'منذ يومين', en: '2 days ago' },
    isRead: true,
    targetPath: '/student/community/human-centered-design-systems',
  },
  {
    id: 'notif-5',
    kind: 'update',
    title: {
      ar: 'معاينة شهادة إتمام متاحة (نموذجي)',
      en: 'Demo certificate preview available',
    },
    body: {
      ar: 'تم إكمال جميع دروس دورة التخطيط الاستراتيجي النموذجية — يمكنك معاينة نموذج الشهادة.',
      en: 'All sample lessons in Strategic Planning are complete — preview your demo certificate.',
    },
    timeLabel: { ar: 'منذ 3 أيام', en: '3 days ago' },
    isRead: true,
    targetPath: '/student/certificates',
  },
];

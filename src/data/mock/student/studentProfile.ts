import type { DemoStudentProfile, StudentNotificationPreferences } from './types';

export const INITIAL_STUDENT_PROFILE: DemoStudentProfile = {
  fullName: {
    ar: 'سارة العلي (طالب تجريبي)',
    en: 'Sara Al-Ali (Demo Student)',
  },
  email: 'sara.demo@atharacademy.example',
  initials: 'SA',
  bio: {
    ar: 'ملف طالب تجريبي في أكاديمية أثر. مهتمة بتطوير الويب وتصميم التجارب الرقمية وإدارة المشاريع العملية.',
    en: 'Demo learner profile on ATHAR ACADEMY. Exploring modern web development, UX design systems, and practical project delivery.',
  },
  interests: [
    { ar: 'تطوير الويب', en: 'Web Development' },
    { ar: 'تصميم تجربة المستخدم', en: 'UX Design' },
    { ar: 'إدارة المشاريع', en: 'Project Delivery' },
    { ar: 'التعلم المستدام', en: 'Deep Learning Habits' },
  ],
  memberSince: {
    ar: 'نوفمبر 2026 (بيانات تجريبية)',
    en: 'November 2026 (Demo Data)',
  },
};

export const INITIAL_NOTIFICATION_PREFS: StudentNotificationPreferences = {
  newLessons: true,
  instructorAnnouncements: true,
  communityReplies: true,
  directMessages: true,
  weeklySummary: false,
};

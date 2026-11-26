import type { AssignedStudentRecord } from './types';

export const INITIAL_ASSIGNED_STUDENTS: AssignedStudentRecord[] = [
  {
    id: 'stu-sara',
    fullName: { ar: 'سارة العلي (طالب تجريبي)', en: 'Sara Al-Ali (Demo Student)' },
    initials: 'SA',
    email: 'sara.demo@atharacademy.example',
    conversationId: 'inst-conv-sara',
    enrollments: [
      {
        courseSlug: 'foundations-modern-web-development',
        completedLessons: 2,
        totalLessons: 5,
        percent: 40,
        status: 'active',
        lastActivity: { ar: 'منذ ساعتين', en: '2 hours ago' },
      },
    ],
  },
  {
    id: 'stu-omar',
    fullName: { ar: 'عمر خالد (طالب تجريبي)', en: 'Omar Khaled (Demo Student)' },
    initials: 'OK',
    email: 'omar.demo@atharacademy.example',
    conversationId: 'inst-conv-omar',
    enrollments: [
      {
        courseSlug: 'foundations-modern-web-development',
        completedLessons: 5,
        totalLessons: 5,
        percent: 100,
        status: 'completed',
        lastActivity: { ar: 'أمس', en: 'Yesterday' },
      },
      {
        courseSlug: 'systems-engineering-fundamentals',
        completedLessons: 3,
        totalLessons: 4,
        percent: 75,
        status: 'active',
        lastActivity: { ar: 'منذ 4 ساعات', en: '4 hours ago' },
      },
    ],
  },
  {
    id: 'stu-lina',
    fullName: { ar: 'لينا سامي (طالب تجريبي)', en: 'Lina Sami (Demo Student)' },
    initials: 'LS',
    email: 'lina.demo@atharacademy.example',
    conversationId: 'inst-conv-lina',
    enrollments: [
      {
        courseSlug: 'systems-engineering-fundamentals',
        completedLessons: 2,
        totalLessons: 4,
        percent: 50,
        status: 'active',
        lastActivity: { ar: 'منذ يومين', en: '2 days ago' },
      },
    ],
  },
  {
    id: 'stu-youssef',
    fullName: { ar: 'يوسف حسن (طالب تجريبي)', en: 'Youssef Hassan (Demo Student)' },
    initials: 'YH',
    email: 'youssef.demo@atharacademy.example',
    enrollments: [
      {
        courseSlug: 'foundations-modern-web-development',
        completedLessons: 1,
        totalLessons: 5,
        percent: 20,
        status: 'active',
        lastActivity: { ar: 'منذ 3 أيام', en: '3 days ago' },
      },
    ],
  },
];

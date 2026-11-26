import { MOCK_COURSES, MOCK_DISCIPLINES, MOCK_INSTRUCTORS } from '../index';
import type {
  ApprovalHistoryItem,
  EnrollmentAuditEvent,
  ModerationLogEntry,
  NotificationEventConfig,
  PlatformActivityItem,
  PlatformCommunityPost,
  PlatformCourse,
  PlatformDiscipline,
  PlatformInstructor,
  PlatformReview,
  PlatformSettingsState,
  PlatformStudent,
} from './types';

export const INITIAL_PLATFORM_DISCIPLINES: PlatformDiscipline[] = MOCK_DISCIPLINES.map((d) => ({
  ...d,
  isActive: true,
}));

export const INITIAL_PLATFORM_INSTRUCTORS: PlatformInstructor[] = MOCK_INSTRUCTORS.map((i, idx) => ({
  ...i,
  email: `${i.slug.replace(/[^a-z]/g, '').slice(0, 10)}@atharacademy.example`,
  status: 'active',
  joinedDate: {
    ar: `أكتوبر 2026 (مدرب #${idx + 1})`,
    en: `Oct 2026 (Instructor #${idx + 1})`,
  },
}));

export const INITIAL_PLATFORM_COURSES: PlatformCourse[] = MOCK_COURSES.map((course) => {
  const isRobotics = course.slug === 'robotics-control-prototyping';
  const modules = course.curriculum.map((mod, modIdx) => {
    const lessons = mod.lessons.map((lesson, lessonIdx) => ({
      id: lesson.id,
      title: lesson.title,
      description: {
        ar: `وصف تجريبي للدرس "${lesson.title.ar}" ضمن وحدة ${mod.title.ar}.`,
        en: `Demo lesson description for "${lesson.title.en}" inside ${mod.title.en}.`,
      },
      durationMinutes: lesson.durationMinutes,
      videoProvider: 'youtube_unlisted' as const,
      videoSourceId: `demo-video-${course.code.toLowerCase()}-${lesson.id}`,
      materialsNote: {
        ar: 'ملخص الدرس وأمثلة تطبيقية (محتوى محلي تجريبي).',
        en: 'Lesson summary and practical takeaways (local demo placeholder).',
      },
      resources: modIdx === 0 && lessonIdx === 0 ? course.resources : [],
      isPreview: Boolean(lesson.isPreview),
      status: isRobotics ? ('draft' as const) : ('published' as const),
    }));

    if (
      (course.slug === 'foundations-modern-web-development' ||
        course.slug === 'systems-engineering-fundamentals') &&
      modIdx === course.curriculum.length - 1
    ) {
      lessons.push({
        id: `${course.slug.slice(0, 6)}-draft`,
        title: {
          ar: 'مسودة درس: تطبيق عملي ومراجعة شاملة',
          en: 'Draft Lesson: Practical Lab & Comprehensive Review',
        },
        description: {
          ar: 'مسودة درس تجريبية قيد الإعداد ويمكن إرسالها لموافقة الإدارة أو نشرها محليًا.',
          en: 'Sample draft lesson in preparation—can be submitted for approval or published locally.',
        },
        durationMinutes: 25,
        videoProvider: 'youtube_unlisted' as const,
        videoSourceId: `demo-draft-${course.code.toLowerCase()}`,
        materialsNote: {
          ar: 'ورقة تمرين قيد المراجعة (مسودة).',
          en: 'Exercise sheet under review (draft).',
        },
        resources: [],
        isPreview: false,
        status: 'draft' as const,
      });
    }

    return { id: mod.id, title: mod.title, lessons };
  });

  return {
    slug: course.slug,
    code: course.code,
    title: course.title,
    shortDescription: course.shortDescription,
    fullDescription: course.fullDescription,
    disciplineSlug: course.disciplineSlug,
    instructorSlugs: [...course.instructorSlugs],
    leadInstructorSlug: course.instructorSlugs[0],
    enrollmentManagerSlugs: [],
    pricing: {
      isFree: false,
      priceAmount: course.slug === 'foundations-modern-web-development' ? 1500 : 1200,
      currency: 'EGP',
      paymentMethods: ['vodafone_cash', 'instapay', 'bank_transfer'],
      paymentInstructions: {
        ar: 'تواصل مع المدرب عبر الرسائل داخل المنصة لتنسيق التحويل المباشر (فودافون كاش أو إنستاباي). أكاديمية أثر لا تحصّل المدفوعات.',
        en: 'Contact the instructor via platform messages to coordinate direct payment (Vodafone Cash or InstaPay). ATHAR ACADEMY does not collect payments.',
      },
      enrollmentOpen: true,
    },
    level: course.level,
    duration: course.duration,
    accent: course.accent,
    featured: course.featured,
    priceLabel: course.priceLabel,
    status: isRobotics ? 'draft' : 'published',
    pendingApproval: isRobotics,
    lastUpdated: isRobotics
      ? { ar: 'منذ 5 أيام (قيد المراجعة)', en: '5 days ago (Pending Review)' }
      : { ar: 'منذ يومين (نموذجي)', en: '2 days ago (Demo)' },
    whatYouWillLearn: course.whatYouWillLearn,
    objectives: course.objectives,
    requirements: course.requirements,
    targetAudience: course.targetAudience,
    modules,
    resources: course.resources,
  };
});

export const INITIAL_PLATFORM_STUDENTS: PlatformStudent[] = [
  {
    id: 'stu-sara',
    fullName: { ar: 'سارة العلي (طالب تجريبي)', en: 'Sara Al-Ali (Demo Student)' },
    initials: 'SA',
    email: 'sara.demo@atharacademy.example',
    status: 'active',
    registeredAt: { ar: '12 نوفمبر 2026', en: 'Nov 12, 2026' },
    lastActivity: { ar: 'منذ ساعتين', en: '2 hours ago' },
    enrolledCourseSlugs: [
      'foundations-modern-web-development',
      'human-centered-design-systems',
      'practical-project-delivery-strategy',
      'deep-learning-habits-communication',
    ],
    avgProgress: 45,
  },
  {
    id: 'stu-omar',
    fullName: { ar: 'عمر خالد (طالب تجريبي)', en: 'Omar Khaled (Demo Student)' },
    initials: 'OK',
    email: 'omar.demo@atharacademy.example',
    status: 'active',
    registeredAt: { ar: '05 نوفمبر 2026', en: 'Nov 5, 2026' },
    lastActivity: { ar: 'منذ 4 ساعات', en: '4 hours ago' },
    enrolledCourseSlugs: [
      'foundations-modern-web-development',
      'systems-engineering-fundamentals',
    ],
    avgProgress: 88,
  },
  {
    id: 'stu-lina',
    fullName: { ar: 'لينا سامي (طالب تجريبي)', en: 'Lina Sami (Demo Student)' },
    initials: 'LS',
    email: 'lina.demo@atharacademy.example',
    status: 'active',
    registeredAt: { ar: '15 نوفمبر 2026', en: 'Nov 15, 2026' },
    lastActivity: { ar: 'منذ يومين', en: '2 days ago' },
    enrolledCourseSlugs: ['systems-engineering-fundamentals'],
    avgProgress: 50,
  },
  {
    id: 'stu-youssef',
    fullName: { ar: 'يوسف حسن (طالب تجريبي)', en: 'Youssef Hassan (Demo Student)' },
    initials: 'YH',
    email: 'youssef.demo@atharacademy.example',
    status: 'inactive',
    registeredAt: { ar: '01 نوفمبر 2026', en: 'Nov 1, 2026' },
    lastActivity: { ar: 'منذ أسبوع', en: '1 week ago' },
    enrolledCourseSlugs: ['foundations-modern-web-development'],
    avgProgress: 20,
  },
  {
    id: 'stu-mona',
    fullName: { ar: 'منى طارق (طالب تجريبي)', en: 'Mona Tariq (Demo Student)' },
    initials: 'MT',
    email: 'mona.demo@atharacademy.example',
    status: 'suspended',
    registeredAt: { ar: '20 أكتوبر 2026', en: 'Oct 20, 2026' },
    lastActivity: { ar: 'منذ أسبوعين', en: '2 weeks ago' },
    enrolledCourseSlugs: ['human-centered-design-systems'],
    avgProgress: 33,
  },
];

export const INITIAL_PLATFORM_REVIEWS: PlatformReview[] = [
  {
    id: 'rev-1',
    studentId: 'stu-omar',
    courseSlug: 'foundations-modern-web-development',
    rating: 5,
    comment: {
      ar: 'مراجعة تجريبية: تسلسل الدروس والخصائص المنطقية في CSS كان واضحًا وعمليًا جدًا.',
      en: 'Demo review: The lesson sequence and logical CSS walkthroughs were very clear and practical.',
    },
    createdAt: { ar: '24 نوفمبر 2026', en: 'Nov 24, 2026' },
    status: 'approved',
  },
  {
    id: 'rev-2',
    studentId: 'stu-sara',
    courseSlug: 'practical-project-delivery-strategy',
    rating: 5,
    comment: {
      ar: 'مراجعة تجريبية: قوالب التخطيط المرحلي ساعدتني في تنظيم مشروعي بشكل ممتاز.',
      en: 'Demo review: The phased roadmap templates helped me structure my project cleanly.',
    },
    createdAt: { ar: '25 نوفمبر 2026', en: 'Nov 25, 2026' },
    status: 'pending',
  },
  {
    id: 'rev-3',
    studentId: 'stu-lina',
    courseSlug: 'systems-engineering-fundamentals',
    rating: 4,
    comment: {
      ar: 'مراجعة تجريبية: محتوى هندسي متماسك وأتمنى إضافة المزيد من الأمثلة التطبيقية.',
      en: 'Demo review: Solid engineering fundamentals; would love even more applied case studies.',
    },
    createdAt: { ar: '23 نوفمبر 2026', en: 'Nov 23, 2026' },
    status: 'pending',
  },
];

export const INITIAL_APPROVAL_HISTORY: ApprovalHistoryItem[] = [
  {
    id: 'aph-1',
    itemType: 'course',
    title: {
      ar: 'أساسيات تطوير تطبيقات الويب الحديثة',
      en: 'Foundations of Modern Web Development',
    },
    courseSlug: 'foundations-modern-web-development',
    decision: 'approved',
    decidedAt: { ar: '18 نوفمبر 2026', en: 'Nov 18, 2026' },
  },
];

export const INITIAL_ADMIN_COMMUNITY_POSTS: PlatformCommunityPost[] = [
  {
    id: 'ac-1',
    courseSlug: 'foundations-modern-web-development',
    authorName: { ar: 'د. طارق المنصور (نموذج)', en: 'Dr. Tariq Al-Mansour (Demo)' },
    authorRole: 'instructor',
    initials: 'TM',
    title: { ar: 'إرشادات الأسبوع الأول', en: 'Week 1 Guidelines' },
    content: {
      ar: 'مرحبًا بكم في مجتمع الدورة! شاركوا أسئلتكم التطبيقية هنا.',
      en: 'Welcome to the course community! Share your practical questions here.',
    },
    timeLabel: { ar: 'منذ يومين', en: '2 days ago' },
    isHidden: false,
    isReported: false,
    repliesCount: 2,
  },
  {
    id: 'ac-2',
    courseSlug: 'human-centered-design-systems',
    authorName: { ar: 'منى طارق (طالب تجريبي)', en: 'Mona Tariq (Demo Student)' },
    authorRole: 'student',
    initials: 'MT',
    content: {
      ar: 'منشور مُبلّغ عنه للمعاينة فقط: رابط خارجي غير مرتبط بمحتوى الدورة.',
      en: 'Sample reported post for moderation preview: unrelated external promotional link.',
    },
    timeLabel: { ar: 'منذ 6 ساعات', en: '6 hours ago' },
    isHidden: false,
    isReported: true,
    repliesCount: 0,
  },
  {
    id: 'ac-3',
    courseSlug: 'systems-engineering-fundamentals',
    authorName: { ar: 'لينا سامي (طالب تجريبي)', en: 'Lina Sami (Demo Student)' },
    authorRole: 'student',
    initials: 'LS',
    content: {
      ar: 'ما أفضل أسلوب لتوثيق المتطلبات غير الوظيفية؟',
      en: 'What is the best approach for documenting non-functional requirements?',
    },
    timeLabel: { ar: 'منذ 8 ساعات', en: '8 hours ago' },
    isHidden: false,
    isReported: false,
    repliesCount: 1,
  },
];

export const INITIAL_MODERATION_LOG: ModerationLogEntry[] = [
  {
    id: 'ml-1',
    action: { ar: 'مراجعة بلاغ مجتمعي', en: 'Reviewed community report' },
    target: { ar: 'مجتمع أنظمة التصميم', en: 'Design Systems Community' },
    timestamp: { ar: 'منذ 5 ساعات', en: '5 hours ago' },
  },
];

export const INITIAL_NOTIFICATION_EVENTS: NotificationEventConfig[] = [
  {
    key: 'student_registered',
    label: { ar: 'تسجيل طالب جديد', en: 'New Student Registration' },
    enabled: true,
    subject: { ar: 'مرحبًا بك في أكاديمية أثر', en: 'Welcome to ATHAR ACADEMY' },
    templateBody: {
      ar: 'مرحبًا {{student_name}}، يسعدنا انضمامك إلى أكاديمية أثر.',
      en: 'Hello {{student_name}}, welcome to ATHAR ACADEMY.',
    },
  },
  {
    key: 'enrollment_received',
    label: { ar: 'استلام طلب التحاق', en: 'Enrollment Request Received' },
    enabled: true,
    subject: { ar: 'تم استلام طلب التحاقك بالدورة', en: 'Enrollment Request Received' },
    templateBody: {
      ar: 'تم استلام طلب التحاقك بدورة {{course_title}} وهو قيد المراجعة.',
      en: 'We received your enrollment request for {{course_title}} and it is pending review.',
    },
  },
  {
    key: 'enrollment_approved',
    label: { ar: 'اعتماد طلب التحاق', en: 'Enrollment Approved' },
    enabled: true,
    subject: { ar: 'تمت الموافقة على التحاقك بالدورة', en: 'Your Enrollment Was Approved' },
    templateBody: {
      ar: 'مبارك! أصبحت دورة {{course_title}} متاحة الآن في صفحة تعلّمي.',
      en: 'Good news! {{course_title}} is now unlocked in My Learning.',
    },
  },
  {
    key: 'enrollment_rejected',
    label: { ar: 'رفض طلب التحاق', en: 'Enrollment Rejected' },
    enabled: true,
    subject: { ar: 'تحديث حول طلب الالتحاق بالدورة', en: 'Update on Your Enrollment Request' },
    templateBody: {
      ar: 'نعتذر، لم يتم اعتماد طلب التحاقك بدورة {{course_title}} حاليًا.',
      en: 'Unfortunately your enrollment request for {{course_title}} was not approved at this time.',
    },
  },
  {
    key: 'lesson_published',
    label: { ar: 'نشر درس جديد', en: 'New Lesson Published' },
    enabled: true,
    subject: { ar: 'درس جديد متاح في دورتك', en: 'A New Lesson Is Available' },
    templateBody: {
      ar: 'تم نشر درس جديد "{{lesson_title}}" في دورة {{course_title}}.',
      en: 'A new lesson "{{lesson_title}}" is now live in {{course_title}}.',
    },
  },
  {
    key: 'course_announcement',
    label: { ar: 'إعلان دورة من المدرب', en: 'Course Announcement' },
    enabled: true,
    subject: { ar: 'إعلان جديد في {{course_title}}', en: 'New Announcement in {{course_title}}' },
    templateBody: {
      ar: 'نشر المدرب إعلانًا جديدًا لطلاب {{course_title}}.',
      en: 'Your instructor posted a new announcement for {{course_title}}.',
    },
  },
  {
    key: 'community_announcement',
    label: { ar: 'إعلان مجتمع الدورة', en: 'Community Announcement' },
    enabled: false,
    subject: { ar: 'تحديث جديد في مجتمع الدورة', en: 'New Community Update' },
    templateBody: {
      ar: 'هناك منشور مثبّت جديد في مجتمع دورة {{course_title}}.',
      en: 'There is a new pinned post in {{course_title}} community.',
    },
  },
  {
    key: 'private_message',
    label: { ar: 'رسالة خاصة جديدة', en: 'New Private Message' },
    enabled: true,
    subject: { ar: 'لديك رسالة جديدة في أكاديمية أثر', en: 'New Private Message on ATHAR ACADEMY' },
    templateBody: {
      ar: 'أرسل لك {{sender_name}} رسالة جديدة داخل المنصة.',
      en: '{{sender_name}} sent you a new message on ATHAR ACADEMY.',
    },
  },
  {
    key: 'password_reset',
    label: { ar: 'استعادة كلمة المرور', en: 'Password Reset' },
    enabled: true,
    subject: { ar: 'رابط إعادة تعيين كلمة المرور', en: 'Reset Your Password' },
    templateBody: {
      ar: 'اضغط على الرابط لإعادة تعيين كلمة المرور الخاصة بحسابك.',
      en: 'Use the secure link to reset your ATHAR ACADEMY password.',
    },
  },
];

export const INITIAL_PLATFORM_SETTINGS: PlatformSettingsState = {
  platformNameEn: 'ATHAR ACADEMY',
  platformNameAr: 'أكاديمية أثر',
  taglineEn: 'LEARN · GROW · MAKE AN IMPACT',
  taglineAr: 'تعلّم · تطوّر · اصنع أثرًا',
  defaultLanguage: 'ar',
  defaultTheme: 'system',
  allowPublicRegistration: true,
  requireEnrollmentApproval: true,
  requireLessonApproval: false,
  requireReviewModeration: true,
};

export const INITIAL_ACTIVITY_TIMELINE: PlatformActivityItem[] = [
  {
    id: 'act-1',
    kind: 'enrollment',
    message: {
      ar: 'قدّمت سارة العلي طلب التحاق بدورة "مبادئ هندسة النظم"',
      en: 'Sara Al-Ali submitted an enrollment request for Systems Engineering',
    },
    timeLabel: { ar: 'منذ ساعتين', en: '2 hours ago' },
  },
  {
    id: 'act-2',
    kind: 'review',
    message: {
      ar: 'أضافت سارة العلي مراجعة جديدة بانتظار المراجعة الإدارية',
      en: 'Sara Al-Ali submitted a new course review pending moderation',
    },
    timeLabel: { ar: 'منذ 4 ساعات', en: '4 hours ago' },
  },
  {
    id: 'act-3',
    kind: 'course',
    message: {
      ar: 'دورة "مقدمة في الروبوتات والأتمتة" بانتظار موافقة النشر',
      en: 'Course "Introduction to Practical Robotics" is pending publication approval',
    },
    timeLabel: { ar: 'أمس', en: 'Yesterday' },
  },
  {
    id: 'act-4',
    kind: 'registration',
    message: {
      ar: 'سجّلت لينا سامي حسابًا جديدًا في المنصة (بيانات نموذجية)',
      en: 'Lina Sami registered a new learner account (sample data)',
    },
    timeLabel: { ar: 'منذ يومين', en: '2 days ago' },
  },
];

export const ADMIN_GROWTH_SERIES = [
  { id: 'w1', label: { ar: 'أسبوع 1', en: 'Wk 1' }, registrations: 12, enrollments: 18 },
  { id: 'w2', label: { ar: 'أسبوع 2', en: 'Wk 2' }, registrations: 19, enrollments: 26 },
  { id: 'w3', label: { ar: 'أسبوع 3', en: 'Wk 3' }, registrations: 25, enrollments: 34 },
  { id: 'w4', label: { ar: 'أسبوع 4', en: 'Wk 4' }, registrations: 31, enrollments: 42 },
  { id: 'w5', label: { ar: 'أسبوع 5', en: 'Wk 5' }, registrations: 38, enrollments: 51 },
  { id: 'w6', label: { ar: 'أسبوع 6', en: 'Wk 6' }, registrations: 46, enrollments: 63 },
];

export const INITIAL_ENROLLMENT_AUDIT_LOG: EnrollmentAuditEvent[] = [
  {
    id: 'aud-1',
    enrollmentId: 'req-demo-dev-101',
    eventType: 'payment_confirmed',
    actorId: 'dr-tariq-al-mansour',
    actorRole: 'instructor',
    timestamp: { ar: '19 نوفمبر 2026', en: 'Nov 19, 2026' },
    previousStatus: 'awaiting_payment',
    newStatus: 'active',
    reason: 'Direct payment of 1500 EGP declared received by Lead Instructor.',
  },
  {
    id: 'aud-2',
    enrollmentId: 'req-demo-eng-201',
    eventType: 'request_created',
    actorId: 'stu-sara',
    actorRole: 'student',
    timestamp: { ar: '25 نوفمبر 2026', en: 'Nov 25, 2026' },
    newStatus: 'pending',
    reason: 'Price snapshot: 1500 EGP',
  },
];

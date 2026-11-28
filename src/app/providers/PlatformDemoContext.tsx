import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  dbCreateCourse,
  dbCreateDiscipline,
  dbCreateLesson,
  dbCreateLessonRevision,
  dbCreateModule,
  dbDeleteCommunityPost,
  dbDeleteCourseReview,
  dbDeleteDiscipline,
  dbDeleteLesson,
  dbDeleteModule,
  dbMarkAllNotificationsRead,
  dbMarkNotificationRead,
  dbModerateCommunityPost,
  dbModerateCourseReview,
  dbReorderLessons,
  dbReorderModules,
  dbUpdateCourse,
  dbUpdateCoursePricing,
  dbUpdateDiscipline,
  dbUpdateLesson,
  dbUpdateModule,
  dbUpdatePlatformSettings,
  fetchLiveCatalog,
  isUuid,
  rpcAcceptEnrollment,
  rpcAdminOverrideEnrollment,
  rpcAdminReactivateEnrollment,
  rpcAdminSuspendEnrollment,
  rpcCancelEnrollment,
  rpcConfirmDirectPayment,
  rpcRejectEnrollment,
  rpcResolveDispute,
  rpcSubmitEnrollment,
  submitDisputeToDb,
} from '../../services/lmsService';
import { useAuth } from './AuthProvider';
import {
  INITIAL_ACTIVITY_TIMELINE,
  INITIAL_ADMIN_COMMUNITY_POSTS,
  INITIAL_APPROVAL_HISTORY,
  INITIAL_ENROLLMENT_AUDIT_LOG,
  INITIAL_MODERATION_LOG,
  INITIAL_NOTIFICATION_EVENTS,
  INITIAL_PLATFORM_COURSES,
  INITIAL_PLATFORM_DISCIPLINES,
  INITIAL_PLATFORM_INSTRUCTORS,
  INITIAL_PLATFORM_REVIEWS,
  INITIAL_PLATFORM_SETTINGS,
  INITIAL_PLATFORM_STUDENTS,
  type AdminCourseStatus,
  type ApprovalHistoryItem,
  type CourseLanguage,
  type CoursePricingConfig,
  type CourseProposal,
  type DisputeCategory,
  type EnrollmentAuditEvent,
  type EnrollmentAuditEventType,
  type EnrollmentDispute,
  type InstructorAccountStatus,
  type LessonResourceItem,
  type LessonRevisionDraft,
  type LessonType,
  type ModerationLogEntry,
  type NotificationEventConfig,
  type PlatformActivityItem,
  type PlatformCommunityPost,
  type PlatformCourse,
  type PlatformDiscipline,
  type PlatformInstructor,
  type PlatformLesson,
  type PlatformModule,
  type PlatformReview,
  type PlatformSettingsState,
  type PlatformStudent,
  type ReviewStatus,
  type StudentAccountStatus,
} from '../../data/mock/admin';
import {
  INITIAL_ENROLLED_COURSES,
  INITIAL_ENROLLMENT_REQUESTS,
  INITIAL_STUDENT_NOTIFICATIONS,
  type CourseAvailabilityState,
  type EnrolledCourseRecord,
  type EnrollmentRequestRecord,
  type EnrollmentRequestStatus,
  type StudentNotification,
} from '../../data/mock/student';
import type { BilingualText, CourseLevel } from '../../data/mock/types';

const ADMIN_DEMO_KEY = 'athar-admin-demo-active';

function readInitialAdminActive(): boolean {
  try {
    return window.localStorage.getItem(ADMIN_DEMO_KEY) === 'true';
  } catch {
    return false;
  }
}

export interface PlatformDemoContextValue {
  getCourseDbId: (courseSlug: string) => string | undefined;
  getDisciplineDbId: (disciplineSlug: string) => string | undefined;
  isAdminDemoActive: boolean;
  enterAdminDemo: () => void;
  exitAdminDemo: () => void;
  resetAllPlatformDemo: () => void;

  disciplines: PlatformDiscipline[];
  createDiscipline: (input: { nameAr: string; nameEn: string; descAr: string; descEn: string }) => void;
  updateDiscipline: (slug: string, patch: Partial<PlatformDiscipline>) => void;
  deleteDiscipline: (slug: string) => { ok: boolean; reason?: 'has_courses' };

  instructors: PlatformInstructor[];
  inviteInstructor: (input: { nameAr: string; nameEn: string; titleAr: string; titleEn: string; email: string }) => void;
  updateInstructor: (slug: string, patch: Partial<PlatformInstructor>) => void;
  setInstructorStatus: (slug: string, status: InstructorAccountStatus) => void;

  courses: PlatformCourse[];
  createCourse: (input: {
    code: string;
    titleAr: string;
    titleEn: string;
    shortDescAr: string;
    shortDescEn: string;
    disciplineSlug: string;
    instructorSlugs: string[];
    level: CourseLevel;
    durationAr: string;
    durationEn: string;
    status: AdminCourseStatus;
  }) => PlatformCourse;
  updateCourse: (slug: string, patch: Partial<PlatformCourse>) => void;
  setCourseSuspended: (courseSlug: string, suspended: boolean) => void;
  submitCourseForReview: (courseSlug: string) => void;
  setCourseInstructors: (courseSlug: string, instructorSlugs: string[]) => void;
  setCourseLeadAndManagers: (
    courseSlug: string,
    leadInstructorSlug: string,
    enrollmentManagerSlugs: string[],
  ) => void;
  updateCoursePricing: (courseSlug: string, pricing: CoursePricingConfig) => void;
  canInstructorConfirmPayment: (courseSlug: string, instructorSlug: string) => boolean;
  addCourseModule: (courseSlug: string, title: string, description?: string) => void;
  updateCourseModule: (courseSlug: string, moduleId: string, patch: Partial<PlatformModule>) => void;
  deleteCourseModule: (courseSlug: string, moduleId: string) => void;
  reorderCourseModules: (courseSlug: string, fromIndex: number, toIndex: number) => void;
  addCourseLesson: (
    courseSlug: string,
    moduleId: string,
    title: string,
    lessonType?: LessonType,
  ) => void;
  updateCourseLesson: (courseSlug: string, lessonId: string, patch: Partial<PlatformLesson>) => void;
  deleteCourseLesson: (courseSlug: string, moduleId: string, lessonId: string) => void;
  duplicateCourseLesson: (courseSlug: string, moduleId: string, lessonId: string) => void;
  reorderCourseLessons: (
    courseSlug: string,
    moduleId: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  moveLessonToModule: (
    courseSlug: string,
    fromModuleId: string,
    toModuleId: string,
    lessonId: string,
  ) => void;
  moveCourseLesson: (
    courseSlug: string,
    moduleId: string,
    lessonId: string,
    direction: 'up' | 'down',
  ) => void;
  saveLessonChanges: (
    courseSlug: string,
    lessonId: string,
    payload: {
      title: BilingualText;
      shortDescription: BilingualText;
      description: BilingualText;
      durationMinutes: number;
      lessonType: LessonType;
      videoProvider: PlatformLesson['videoProvider'];
      videoUrl?: string;
      videoSourceId: string;
      materialsNote: BilingualText;
      lessonResources: LessonResourceItem[];
      isPreview: boolean;
    },
    mode: 'save_draft' | 'publish_or_submit',
  ) => { status: 'draft' | 'pending_approval' | 'published'; isRevision: boolean };

  // Course Proposals (Instructor Workflow B)
  courseProposals: CourseProposal[];
  createCourseProposal: (input: {
    proposingInstructorSlug: string;
    title: BilingualText;
    shortDescription: BilingualText;
    fullDescription: BilingualText;
    disciplineSlug: string;
    level: CourseLevel;
    thumbnailUrl?: string;
    whatYouWillLearn: BilingualText[];
    requirements: BilingualText[];
    targetAudience: BilingualText[];
    duration: BilingualText;
    suggestedPrice: BilingualText;
    enrollmentNotes: BilingualText;
    language: CourseLanguage;
    submitImmediately?: boolean;
  }) => CourseProposal;
  updateCourseProposal: (proposalId: string, patch: Partial<CourseProposal>) => void;
  submitCourseProposal: (proposalId: string) => void;
  approveCourseProposal: (proposalId: string) => PlatformCourse | null;
  rejectCourseProposal: (proposalId: string, reason?: string) => void;

  students: PlatformStudent[];
  setStudentStatus: (studentId: string, status: StudentAccountStatus) => void;

  // Shared Student Enrollment State (Single Source of Truth with Student Portal)
  studentEnrolledCourses: EnrolledCourseRecord[];
  setStudentEnrolledCourses: React.Dispatch<React.SetStateAction<EnrolledCourseRecord[]>>;
  enrollmentRequests: EnrollmentRequestRecord[];
  enrollmentAuditLog: EnrollmentAuditEvent[];
  enrollmentDisputes: EnrollmentDispute[];
  studentNotifications: StudentNotification[];
  markStudentNotificationRead: (id: string) => void;
  markAllStudentNotificationsRead: () => void;
  getCourseAvailabilityForDemoStudent: (courseSlug: string) => CourseAvailabilityState;
  submitDemoStudentEnrollmentRequest: (
    courseSlug: string,
    studentMessage?: string,
  ) => {
    ok: boolean;
    reason?: 'enrolled' | 'pending' | 'closed';
  };
  acceptEnrollmentForPayment: (requestId: string, actorInstructorSlug: string) => { ok: boolean };
  confirmDirectPaymentAndActivate: (
    requestId: string,
    actorInstructorSlug: string,
  ) => { ok: boolean; reason?: 'unauthorized' | 'invalid_state' };
  approveEnrollmentRequest: (requestId: string) => void;
  rejectEnrollmentRequest: (
    requestId: string,
    reason?: string,
    actorRole?: 'instructor' | 'admin',
    actorId?: string,
  ) => void;
  cancelEnrollmentRequest: (
    requestId: string,
    actorRole: 'student' | 'instructor' | 'admin',
    actorId: string,
    reason?: string,
  ) => void;
  suspendEnrollment: (requestId: string, reason?: string) => void;
  reactivateEnrollment: (requestId: string, reason?: string) => void;
  adminOverrideEnrollmentStatus: (
    requestId: string,
    newStatus: EnrollmentRequestStatus,
    reason: string,
  ) => void;
  submitEnrollmentDispute: (
    enrollmentId: string,
    category: DisputeCategory,
    description: string,
  ) => void;
  resolveEnrollmentDispute: (
    disputeId: string,
    resolutionNote: string,
    options?: { suspendAccess?: boolean; refundConfirmedByParties?: boolean },
  ) => void;

  // Approvals (Courses & Lessons)
  approvalHistory: ApprovalHistoryItem[];
  approveCourseSubmission: (courseSlug: string) => void;
  rejectCourseSubmission: (courseSlug: string, reason?: string) => void;
  approveLessonSubmission: (courseSlug: string, lessonId: string) => void;
  rejectLessonSubmission: (courseSlug: string, lessonId: string, reason?: string) => void;

  // Reviews
  reviews: PlatformReview[];
  moderateReview: (reviewId: string, status: ReviewStatus, note?: string) => void;
  removeReview: (reviewId: string) => void;

  // Community Moderation
  communityPosts: PlatformCommunityPost[];
  moderationLog: ModerationLogEntry[];
  toggleHideCommunityPost: (postId: string) => void;
  removeCommunityPost: (postId: string) => void;

  // Notifications & Settings
  notificationEvents: NotificationEventConfig[];
  updateNotificationEvent: (key: string, patch: Partial<NotificationEventConfig>) => void;
  settings: PlatformSettingsState;
  updateSettings: (patch: Partial<PlatformSettingsState>) => void;

  activityTimeline: PlatformActivityItem[];
}

const PlatformDemoContext = createContext<PlatformDemoContextValue | null>(null);

export function PlatformDemoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const courseIdBySlugRef = useRef<Record<string, string>>({});
  const disciplineIdBySlugRef = useRef<Record<string, string>>({});
  const getCourseDbId = useCallback((slug: string) => courseIdBySlugRef.current[slug], []);
  const getDisciplineDbId = useCallback((slug: string) => disciplineIdBySlugRef.current[slug], []);
  const [isAdminDemoActive, setIsAdminDemoActive] = useState<boolean>(readInitialAdminActive);
  const [disciplines, setDisciplines] = useState<PlatformDiscipline[]>(
    INITIAL_PLATFORM_DISCIPLINES,
  );
  const [instructors, setInstructors] = useState<PlatformInstructor[]>(
    INITIAL_PLATFORM_INSTRUCTORS,
  );
  const [courses, setCourses] = useState<PlatformCourse[]>(INITIAL_PLATFORM_COURSES);

  // Hydrate live catalog from Supabase PostgreSQL (preserves local fallback if offline/dev)
  useEffect(() => {
    let active = true;
    void fetchLiveCatalog().then((snapshot) => {
      if (!active || !snapshot) return;
      courseIdBySlugRef.current = snapshot.courseIdBySlug;
      disciplineIdBySlugRef.current = snapshot.disciplineIdBySlug;
      if (snapshot.disciplines.length > 0) {
        setDisciplines(snapshot.disciplines);
      }
      if (snapshot.courses.length > 0) {
        // Merge live DB courses with any dev-only local catalog items when in DEV mode
        if (import.meta.env.DEV) {
          const liveSlugs = new Set(snapshot.courses.map((c) => c.slug));
          setCourses([
            ...snapshot.courses,
            ...INITIAL_PLATFORM_COURSES.filter((c) => !liveSlugs.has(c.slug)),
          ]);
        } else {
          setCourses(snapshot.courses);
        }
      }
    });
    return () => {
      active = false;
    };
  }, [user?.id]);
  const [courseProposals, setCourseProposals] = useState<CourseProposal[]>([]);
  const [students, setStudents] = useState<PlatformStudent[]>(INITIAL_PLATFORM_STUDENTS);
  const [studentEnrolledCourses, setStudentEnrolledCourses] =
    useState<EnrolledCourseRecord[]>(INITIAL_ENROLLED_COURSES);
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequestRecord[]>(
    INITIAL_ENROLLMENT_REQUESTS,
  );
  const [enrollmentAuditLog, setEnrollmentAuditLog] = useState<EnrollmentAuditEvent[]>(
    INITIAL_ENROLLMENT_AUDIT_LOG,
  );
  const [enrollmentDisputes, setEnrollmentDisputes] = useState<EnrollmentDispute[]>([]);
  const [studentNotifications, setStudentNotifications] = useState<StudentNotification[]>(
    INITIAL_STUDENT_NOTIFICATIONS,
  );
  const [approvalHistory, setApprovalHistory] =
    useState<ApprovalHistoryItem[]>(INITIAL_APPROVAL_HISTORY);
  const [reviews, setReviews] = useState<PlatformReview[]>(INITIAL_PLATFORM_REVIEWS);
  const [communityPosts, setCommunityPosts] =
    useState<PlatformCommunityPost[]>(INITIAL_ADMIN_COMMUNITY_POSTS);
  const [moderationLog, setModerationLog] =
    useState<ModerationLogEntry[]>(INITIAL_MODERATION_LOG);
  const [notificationEvents, setNotificationEvents] = useState<NotificationEventConfig[]>(
    INITIAL_NOTIFICATION_EVENTS,
  );
  const [settings, setSettings] = useState<PlatformSettingsState>(INITIAL_PLATFORM_SETTINGS);
  const [activityTimeline, setActivityTimeline] =
    useState<PlatformActivityItem[]>(INITIAL_ACTIVITY_TIMELINE);

  const pushActivity = useCallback(
    (kind: PlatformActivityItem['kind'], ar: string, en: string) => {
      setActivityTimeline((prev) => [
        {
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          kind,
          message: { ar, en },
          timeLabel: { ar: 'الآن (تجريبي)', en: 'Just now (Demo)' },
        },
        ...prev,
      ]);
    },
    [],
  );

  const enterAdminDemo = useCallback(() => {
    setIsAdminDemoActive(true);
    try {
      window.localStorage.setItem(ADMIN_DEMO_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  const exitAdminDemo = useCallback(() => {
    setIsAdminDemoActive(false);
    try {
      window.localStorage.removeItem(ADMIN_DEMO_KEY);
    } catch {
      // ignore
    }
  }, []);

  const resetAllPlatformDemo = useCallback(() => {
    setDisciplines(INITIAL_PLATFORM_DISCIPLINES);
    setInstructors(INITIAL_PLATFORM_INSTRUCTORS);
    setCourses(INITIAL_PLATFORM_COURSES);
    setCourseProposals([]);
    setStudents(INITIAL_PLATFORM_STUDENTS);
    setStudentEnrolledCourses(INITIAL_ENROLLED_COURSES);
    setEnrollmentRequests(INITIAL_ENROLLMENT_REQUESTS);
    setEnrollmentAuditLog(INITIAL_ENROLLMENT_AUDIT_LOG);
    setEnrollmentDisputes([]);
    setStudentNotifications(INITIAL_STUDENT_NOTIFICATIONS);
    setApprovalHistory(INITIAL_APPROVAL_HISTORY);
    setReviews(INITIAL_PLATFORM_REVIEWS);
    setCommunityPosts(INITIAL_ADMIN_COMMUNITY_POSTS);
    setModerationLog(INITIAL_MODERATION_LOG);
    setNotificationEvents(INITIAL_NOTIFICATION_EVENTS);
    setSettings(INITIAL_PLATFORM_SETTINGS);
    setActivityTimeline(INITIAL_ACTIVITY_TIMELINE);
  }, []);

  // Disciplines
  const createDiscipline = useCallback(
    (input: { nameAr: string; nameEn: string; descAr: string; descEn: string }) => {
      const slug =
        input.nameEn
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `discipline-${Date.now()}`;
      const newDisc: PlatformDiscipline = {
        slug,
        name: { ar: input.nameAr.trim(), en: input.nameEn.trim() },
        shortDescription: { ar: input.descAr.trim(), en: input.descEn.trim() },
        overview: { ar: input.descAr.trim(), en: input.descEn.trim() },
        highlights: [],
        iconName: 'compass',
        accent: 'blue',
        isActive: true,
      };
      setDisciplines((prev) => [newDisc, ...prev]);
      if (user) {
        void dbCreateDiscipline({
          slug,
          nameAr: input.nameAr.trim(),
          nameEn: input.nameEn.trim(),
          descAr: input.descAr.trim(),
          descEn: input.descEn.trim(),
        }).then(({ data }) => {
          if (data?.id) {
            disciplineIdBySlugRef.current[slug] = data.id;
          }
        });
      }
    },
    [user],
  );

  const updateDiscipline = useCallback(
    (slug: string, patch: Partial<PlatformDiscipline>) => {
      setDisciplines((prev) => prev.map((d) => (d.slug === slug ? { ...d, ...patch } : d)));
      const dbId = disciplineIdBySlugRef.current[slug];
      if (user && dbId) {
        void dbUpdateDiscipline(dbId, {
          ...(patch.name ? { name_ar: patch.name.ar, name_en: patch.name.en } : {}),
          ...(patch.shortDescription
            ? {
                short_description_ar: patch.shortDescription.ar,
                short_description_en: patch.shortDescription.en,
              }
            : {}),
          ...(patch.isActive !== undefined ? { is_active: patch.isActive } : {}),
          ...(patch.featured !== undefined ? { featured: patch.featured } : {}),
        });
      }
    },
    [user],
  );

  const deleteDiscipline = useCallback(
    (slug: string): { ok: boolean; reason?: 'has_courses' } => {
      if (courses.some((c) => c.disciplineSlug === slug)) {
        return { ok: false, reason: 'has_courses' };
      }
      setDisciplines((prev) => prev.filter((d) => d.slug !== slug));
      const dbId = disciplineIdBySlugRef.current[slug];
      if (user && dbId) {
        void dbDeleteDiscipline(dbId);
      }
      return { ok: true };
    },
    [courses, user],
  );

  // Instructors
  const inviteInstructor = useCallback(
    (input: { nameAr: string; nameEn: string; titleAr: string; titleEn: string; email: string }) => {
      const slug =
        input.nameEn
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `inst-${Date.now()}`;
      const initials = input.nameEn
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const newInst: PlatformInstructor = {
        slug,
        name: { ar: input.nameAr.trim(), en: input.nameEn.trim() },
        title: { ar: input.titleAr.trim(), en: input.titleEn.trim() },
        initials: initials || 'IN',
        email: input.email.trim(),
        accent: 'teal',
        shortBio: { ar: input.titleAr.trim(), en: input.titleEn.trim() },
        biography: { ar: input.titleAr.trim(), en: input.titleEn.trim() },
        expertise: [],
        experience: [],
        disciplineSlugs: [],
        status: 'active',
        joinedDate: { ar: 'الآن (دعوة تجريبية)', en: 'Just now (Demo Invite)' },
      };
      setInstructors((prev) => [newInst, ...prev]);
      pushActivity(
        'instructor',
        `تمت دعوة المدرب التجريبي ${newInst.name.ar}`,
        `Invited demo instructor ${newInst.name.en}`,
      );
    },
    [pushActivity],
  );

  const updateInstructor = useCallback((slug: string, patch: Partial<PlatformInstructor>) => {
    setInstructors((prev) => prev.map((i) => (i.slug === slug ? { ...i, ...patch } : i)));
  }, []);

  const setInstructorStatus = useCallback((slug: string, status: InstructorAccountStatus) => {
    setInstructors((prev) => prev.map((i) => (i.slug === slug ? { ...i, status } : i)));
  }, []);

  // Courses
  const createCourse = useCallback(
    (input: {
      code: string;
      titleAr: string;
      titleEn: string;
      shortDescAr: string;
      shortDescEn: string;
      disciplineSlug: string;
      instructorSlugs: string[];
      level: CourseLevel;
      durationAr: string;
      durationEn: string;
      status: AdminCourseStatus;
    }): PlatformCourse => {
      const slug =
        input.titleEn
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `course-${Date.now()}`;

      const newCourse: PlatformCourse = {
        slug,
        code: input.code.trim().toUpperCase() || `DEMO-${Date.now().toString().slice(-3)}`,
        title: { ar: input.titleAr.trim(), en: input.titleEn.trim() },
        shortDescription: { ar: input.shortDescAr.trim(), en: input.shortDescEn.trim() },
        fullDescription: { ar: input.shortDescAr.trim(), en: input.shortDescEn.trim() },
        disciplineSlug: input.disciplineSlug,
        instructorSlugs: input.instructorSlugs.length > 0 ? input.instructorSlugs : ['dr-tariq-al-mansour'],
        leadInstructorSlug: input.instructorSlugs[0] ?? 'dr-tariq-al-mansour',
        enrollmentManagerSlugs: [],
        pricing: {
          isFree: false,
          priceAmount: 1500,
          currency: 'EGP',
          paymentMethods: ['vodafone_cash', 'instapay', 'bank_transfer'],
          paymentInstructions: {
            ar: 'تواصل مع المدرب الرئيسي لتنسيق الدفع المباشر خارج المنصة.',
            en: 'Contact the Lead Instructor to coordinate direct payment outside the platform.',
          },
          enrollmentOpen: true,
        },
        level: input.level,
        duration: { ar: input.durationAr.trim(), en: input.durationEn.trim() },
        accent: 'blue',
        featured: true,
        status: input.status,
        pendingApproval: false,
        lastUpdated: { ar: 'الآن (أُنشئت بواسطة الإدارة)', en: 'Just now (Created by Admin)' },
        whatYouWillLearn: [
          { ar: 'مخرجات تعلم نموذجية للدورة الجديدة', en: 'Sample learning outcomes for this course' },
        ],
        objectives: [
          { ar: 'هدف تعليمي نموذجي', en: 'Sample course objective' },
        ],
        requirements: [{ ar: 'لا توجد متطلبات مسبقة', en: 'No prerequisites required' }],
        targetAudience: [{ ar: 'المتعلمون المهتمون بهذا المسار', en: 'Learners interested in this track' }],
        modules: [
          {
            id: `mod-${Date.now()}`,
            title: { ar: 'الوحدة 1: المقدمة', en: 'Module 1: Introduction' },
            lessons: [
              {
                id: 'l1',
                title: { ar: 'الدرس الافتتاحي', en: 'Welcome & Course Overview' },
                description: { ar: 'مقدمة تعريفية بالدورة.', en: 'Introductory overview lesson.' },
                durationMinutes: 12,
                videoProvider: 'youtube_unlisted',
                videoSourceId: `demo-${slug}-l1`,
                materialsNote: { ar: '', en: '' },
                resources: [],
                isPreview: true,
                status: 'published',
              },
            ],
          },
        ],
        resources: [],
      };

      setCourses((prev) => [newCourse, ...prev]);
      const discId = disciplineIdBySlugRef.current[input.disciplineSlug];
      if (user && discId) {
        void dbCreateCourse({
          slug,
          code: newCourse.code,
          disciplineId: discId,
          titleAr: newCourse.title.ar,
          titleEn: newCourse.title.en,
          shortDescAr: newCourse.shortDescription.ar,
          shortDescEn: newCourse.shortDescription.en,
          level: input.level,
          durationAr: newCourse.duration.ar,
          durationEn: newCourse.duration.en,
          status: input.status,
          createdBy: user.id,
        }).then(({ data }) => {
          if (data?.id) {
            courseIdBySlugRef.current[slug] = data.id;
          }
        });
      }
      pushActivity(
        'course',
        `أنشأت الإدارة دورة جديدة: ${newCourse.title.ar}`,
        `Admin created a new course: ${newCourse.title.en}`,
      );
      return newCourse;
    },
    [pushActivity, user],
  );

  const updateCourse = useCallback(
    (slug: string, patch: Partial<PlatformCourse>) => {
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === slug
            ? {
              ...c,
              ...patch,
              lastUpdated: { ar: 'الآن (محدّث)', en: 'Just now (Updated)' },
            }
            : c,
        ),
      );
      const courseDbId = courseIdBySlugRef.current[slug];
      if (user && courseDbId) {
        const dbPatch: Record<string, unknown> = {};
        if (patch.title) {
          dbPatch.title_ar = patch.title.ar;
          dbPatch.title_en = patch.title.en;
        }
        if (patch.shortDescription) {
          dbPatch.short_description_ar = patch.shortDescription.ar;
          dbPatch.short_description_en = patch.shortDescription.en;
        }
        if (patch.fullDescription) {
          dbPatch.full_description_ar = patch.fullDescription.ar;
          dbPatch.full_description_en = patch.fullDescription.en;
        }
        if (patch.status) dbPatch.status = patch.status;
        if (patch.level) dbPatch.level = patch.level;
        if (patch.featured !== undefined) dbPatch.featured = patch.featured;
        if (Object.keys(dbPatch).length > 0) {
          void dbUpdateCourse(courseDbId, dbPatch);
        }
      }
    },
    [user],
  );

  const setCourseSuspended = useCallback(
    (courseSlug: string, suspended: boolean) => {
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug
            ? {
              ...c,
              suspended,
              status: suspended && c.status === 'published' ? 'draft' : c.status,
              lastUpdated: { ar: 'الآن (حالة التعليق)', en: 'Just now (Suspension updated)' },
            }
            : c,
        ),
      );
      const courseDbId = courseIdBySlugRef.current[courseSlug];
      if (user && courseDbId) {
        void dbUpdateCourse(courseDbId, { is_suspended: suspended });
      }
      pushActivity(
        'course',
        suspended ? `تم تعليق دورة ${courseSlug} إداريًا` : `تم رفع التعليق عن دورة ${courseSlug}`,
        suspended ? `Admin suspended course ${courseSlug}` : `Admin lifted suspension on ${courseSlug}`,
      );
    },
    [pushActivity, user],
  );

  const submitCourseForReview = useCallback(
    (courseSlug: string) => {
      const target = courses.find((c) => c.slug === courseSlug);
      if (!target || target.suspended) return;
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug
            ? {
              ...c,
              pendingApproval: true,
              lastUpdated: { ar: 'الآن (مُرسل للمراجعة)', en: 'Just now (Submitted for review)' },
            }
            : c,
        ),
      );
      pushActivity(
        'course',
        `أرسل المدرب دورة "${target.title.ar}" للمراجعة الإدارية`,
        `Instructor submitted course "${target.title.en}" for Admin review`,
      );
    },
    [courses, pushActivity],
  );

  const setCourseInstructors = useCallback(
    (courseSlug: string, instructorSlugs: string[]) => {
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug
            ? {
              ...c,
              instructorSlugs,
              lastUpdated: { ar: 'الآن (تحديث المدربين)', en: 'Just now (Assignments updated)' },
            }
            : c,
        ),
      );
      pushActivity(
        'instructor',
        `تم تحديث تعيينات المدربين لدورة ${courseSlug}`,
        `Updated instructor assignments for ${courseSlug}`,
      );
    },
    [pushActivity],
  );

  const addCourseModule = useCallback(
    (courseSlug: string, title: string, description?: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const descTrim = description?.trim() ?? '';
      const tempId = `mod-demo-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
      const course = courses.find((c) => c.slug === courseSlug);
      const nextSort = (course?.modules.length ?? 0) + 1;
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug
            ? {
              ...c,
              lastUpdated: { ar: 'الآن (تحديث المنهج)', en: 'Just now (Curriculum updated)' },
              modules: [
                ...c.modules,
                {
                  id: tempId,
                  title: { ar: trimmed, en: trimmed },
                  description: descTrim ? { ar: descTrim, en: descTrim } : undefined,
                  lessons: [],
                },
              ],
            }
            : c,
        ),
      );
      const courseDbId = courseIdBySlugRef.current[courseSlug];
      if (user && courseDbId) {
        void dbCreateModule(courseDbId, trimmed, trimmed, nextSort, descTrim, descTrim).then(
          ({ data }) => {
            if (!data?.id) return;
            setCourses((prev) =>
              prev.map((c) =>
                c.slug === courseSlug
                  ? {
                    ...c,
                    modules: c.modules.map((m) => (m.id === tempId ? { ...m, id: data.id } : m)),
                  }
                  : c,
              ),
            );
          },
        );
      }
    },
    [courses, user],
  );

  const updateCourseModule = useCallback(
    (courseSlug: string, moduleId: string, patch: Partial<PlatformModule>) => {
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug
            ? {
              ...c,
              lastUpdated: { ar: 'الآن (تحديث الوحدة)', en: 'Just now (Module updated)' },
              modules: c.modules.map((m) => (m.id === moduleId ? { ...m, ...patch } : m)),
            }
            : c,
        ),
      );
      if (user && isUuid(moduleId)) {
        void dbUpdateModule(moduleId, {
          ...(patch.title ? { title_ar: patch.title.ar, title_en: patch.title.en } : {}),
          ...(patch.description
            ? { description_ar: patch.description.ar, description_en: patch.description.en }
            : {}),
        });
      }
    },
    [user],
  );

  const deleteCourseModule = useCallback(
    (courseSlug: string, moduleId: string) => {
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug
            ? {
              ...c,
              lastUpdated: { ar: 'الآن (حذف وحدة)', en: 'Just now (Module removed)' },
              modules: c.modules.filter((m) => m.id !== moduleId),
            }
            : c,
        ),
      );
      if (user && isUuid(moduleId)) {
        void dbDeleteModule(moduleId);
      }
    },
    [user],
  );

  const reorderCourseModules = useCallback(
    (courseSlug: string, fromIndex: number, toIndex: number) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.slug !== courseSlug) return c;
          if (
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= c.modules.length ||
            toIndex >= c.modules.length ||
            fromIndex === toIndex
          ) {
            return c;
          }
          const next = [...c.modules];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, moved);
          if (user) {
            void dbReorderModules(next.map((m) => m.id));
          }
          return {
            ...c,
            lastUpdated: { ar: 'الآن (إعادة ترتيب الوحدات)', en: 'Just now (Modules reordered)' },
            modules: next,
          };
        }),
      );
    },
    [user],
  );

  const addCourseLesson = useCallback(
    (courseSlug: string, moduleId: string, title: string, lessonType: LessonType = 'video') => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const tempId = `les-demo-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
      const targetMod = courses
        .find((c) => c.slug === courseSlug)
        ?.modules.find((m) => m.id === moduleId);
      const nextSort = (targetMod?.lessons.length ?? 0) + 1;
      const newLesson: PlatformLesson = {
        id: tempId,
        title: { ar: trimmed, en: trimmed },
        shortDescription: { ar: '', en: '' },
        description: {
          ar: 'مسودة درس جديدة أُنشئت في بوابة المدرب.',
          en: 'New draft lesson created in the Instructor Portal.',
        },
        durationMinutes: 15,
        lessonType,
        videoProvider: 'youtube_unlisted',
        videoUrl: '',
        videoSourceId: `demo-placeholder-${Date.now().toString().slice(-4)}`,
        materialsNote: { ar: '', en: '' },
        resources: [],
        lessonResources: [],
        isPreview: false,
        status: 'draft',
      };
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug
            ? {
              ...c,
              lastUpdated: { ar: 'الآن (إضافة درس)', en: 'Just now (Lesson added)' },
              modules: c.modules.map((m) =>
                m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m,
              ),
            }
            : c,
        ),
      );
      const courseDbId = courseIdBySlugRef.current[courseSlug];
      if (user && courseDbId && isUuid(moduleId)) {
        void dbCreateLesson({
          courseId: courseDbId,
          moduleId,
          titleAr: trimmed,
          titleEn: trimmed,
          lessonType,
          sortOrder: nextSort,
          status: 'draft',
        }).then(({ data }) => {
          if (!data?.id) return;
          setCourses((prev) =>
            prev.map((c) =>
              c.slug === courseSlug
                ? {
                  ...c,
                  modules: c.modules.map((m) =>
                    m.id === moduleId
                      ? {
                        ...m,
                        lessons: m.lessons.map((l) =>
                          l.id === tempId ? { ...l, id: data.id } : l,
                        ),
                      }
                      : m,
                  ),
                }
                : c,
            ),
          );
        });
      }
    },
    [courses, user],
  );

  const deleteCourseLesson = useCallback(
    (courseSlug: string, moduleId: string, lessonId: string) => {
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug
            ? {
              ...c,
              lastUpdated: { ar: 'الآن (حذف درس)', en: 'Just now (Lesson deleted)' },
              modules: c.modules.map((m) =>
                m.id === moduleId
                  ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
                  : m,
              ),
            }
            : c,
        ),
      );
      if (user && isUuid(lessonId)) {
        void dbDeleteLesson(lessonId);
      }
    },
    [user],
  );

  const duplicateCourseLesson = useCallback(
    (courseSlug: string, moduleId: string, lessonId: string) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.slug !== courseSlug) return c;
          return {
            ...c,
            lastUpdated: { ar: 'الآن (تكرار درس)', en: 'Just now (Lesson duplicated)' },
            modules: c.modules.map((m) => {
              if (m.id !== moduleId) return m;
              const idx = m.lessons.findIndex((l) => l.id === lessonId);
              if (idx < 0) return m;
              const orig = m.lessons[idx];
              const copy: PlatformLesson = {
                ...orig,
                id: `les-copy-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                title: {
                  ar: `${orig.title.ar} (نسخة)`,
                  en: `${orig.title.en} (Copy)`,
                },
                status: 'draft',
                pendingRevision: undefined,
                rejectionReason: undefined,
              };
              const next = [...m.lessons];
              next.splice(idx + 1, 0, copy);
              return { ...m, lessons: next };
            }),
          };
        }),
      );
    },
    [],
  );

  const reorderCourseLessons = useCallback(
    (courseSlug: string, moduleId: string, fromIndex: number, toIndex: number) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.slug !== courseSlug) return c;
          return {
            ...c,
            lastUpdated: { ar: 'الآن (إعادة ترتيب الدروس)', en: 'Just now (Lessons reordered)' },
            modules: c.modules.map((m) => {
              if (m.id !== moduleId) return m;
              if (
                fromIndex < 0 ||
                toIndex < 0 ||
                fromIndex >= m.lessons.length ||
                toIndex >= m.lessons.length ||
                fromIndex === toIndex
              ) {
                return m;
              }
              const next = [...m.lessons];
              const [moved] = next.splice(fromIndex, 1);
              next.splice(toIndex, 0, moved);
              if (user && isUuid(moduleId)) {
                void dbReorderLessons(
                  moduleId,
                  next.map((l) => l.id),
                );
              }
              return { ...m, lessons: next };
            }),
          };
        }),
      );
    },
    [user],
  );

  const moveLessonToModule = useCallback(
    (courseSlug: string, fromModuleId: string, toModuleId: string, lessonId: string) => {
      if (fromModuleId === toModuleId) return;
      setCourses((prev) =>
        prev.map((c) => {
          if (c.slug !== courseSlug) return c;
          const fromMod = c.modules.find((m) => m.id === fromModuleId);
          const moving = fromMod?.lessons.find((l) => l.id === lessonId);
          if (!moving) return c;
          return {
            ...c,
            lastUpdated: { ar: 'الآن (نقل درس)', en: 'Just now (Lesson moved)' },
            modules: c.modules.map((m) => {
              if (m.id === fromModuleId) {
                return { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) };
              }
              if (m.id === toModuleId) {
                const updated = [...m.lessons, moving];
                if (user && isUuid(toModuleId)) {
                  void dbReorderLessons(
                    toModuleId,
                    updated.map((l) => l.id),
                  );
                }
                return { ...m, lessons: updated };
              }
              return m;
            }),
          };
        }),
      );
    },
    [user],
  );

  const saveLessonChanges = useCallback(
    (
      courseSlug: string,
      lessonId: string,
      payload: {
        title: BilingualText;
        shortDescription: BilingualText;
        description: BilingualText;
        durationMinutes: number;
        lessonType: LessonType;
        videoProvider: PlatformLesson['videoProvider'];
        videoUrl?: string;
        videoSourceId: string;
        materialsNote: BilingualText;
        lessonResources: LessonResourceItem[];
        isPreview: boolean;
      },
      mode: 'save_draft' | 'publish_or_submit',
    ): { status: 'draft' | 'pending_approval' | 'published'; isRevision: boolean } => {
      const course = courses.find((c) => c.slug === courseSlug);
      const existing = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
      const isAlreadyPublished = existing?.status === 'published';

      // Published Content Preservation:
      // Editing an already-published lesson stores changes in pendingRevision so live student content stays intact!
      if (isAlreadyPublished) {
        if (mode === 'publish_or_submit' && !settings.requireLessonApproval) {
          // Direct publish permitted when Admin lesson approval is OFF
          setCourses((prev) =>
            prev.map((c) =>
              c.slug === courseSlug
                ? {
                  ...c,
                  lastUpdated: { ar: 'الآن (تحديث درس منشور)', en: 'Just now (Published lesson updated)' },
                  modules: c.modules.map((m) => ({
                    ...m,
                    lessons: m.lessons.map((l) =>
                      l.id === lessonId
                        ? { ...l, ...payload, status: 'published', pendingRevision: undefined }
                        : l,
                    ),
                  })),
                }
                : c,
            ),
          );
          return { status: 'published', isRevision: false };
        }

        const revStatus = mode === 'publish_or_submit' ? 'pending_approval' : 'draft';
        const revision: LessonRevisionDraft = {
          ...payload,
          status: revStatus,
          rejectionReason: undefined,
          updatedAt: { ar: 'الآن (مراجعة مسودة)', en: 'Just now (Draft revision)' },
        };

        setCourses((prev) =>
          prev.map((c) =>
            c.slug === courseSlug
              ? {
                ...c,
                lastUpdated: { ar: 'الآن (نسخة معدّلة قيد المراجعة)', en: 'Just now (Revision saved)' },
                modules: c.modules.map((m) => ({
                  ...m,
                  lessons: m.lessons.map((l) =>
                    l.id === lessonId ? { ...l, pendingRevision: revision } : l,
                  ),
                })),
              }
              : c,
          ),
        );

        if (revStatus === 'pending_approval') {
          pushActivity(
            'lesson',
            `أُرسلت نسخة محدثة للدرس "${payload.title.ar}" للموافقة الإدارية`,
            `Submitted updated revision of "${payload.title.en}" for Admin approval`,
          );
        }
        const courseDbId = courseIdBySlugRef.current[courseSlug];
        if (user && courseDbId && isUuid(lessonId)) {
          void dbCreateLessonRevision({
            lessonId,
            courseId: courseDbId,
            submittedBy: user.id,
            titleAr: payload.title.ar,
            titleEn: payload.title.en,
            shortDescAr: payload.shortDescription.ar,
            shortDescEn: payload.shortDescription.en,
            descAr: payload.description.ar,
            descEn: payload.description.en,
            lessonType: payload.lessonType,
            videoProvider: payload.videoProvider,
            videoUrl: payload.videoUrl,
            videoSourceId: payload.videoSourceId,
            durationMinutes: payload.durationMinutes,
            materialsNoteAr: payload.materialsNote.ar,
            materialsNoteEn: payload.materialsNote.en,
            isPreview: payload.isPreview,
            status: revStatus,
          });
        }
        return { status: revStatus, isRevision: true };
      }

      // Unpublished lesson (draft / pending_approval / rejected)
      const nextStatus: 'draft' | 'pending_approval' | 'published' =
        mode === 'save_draft'
          ? 'draft'
          : settings.requireLessonApproval
            ? 'pending_approval'
            : 'published';

      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug
            ? {
              ...c,
              lastUpdated: { ar: 'الآن (تحديث درس)', en: 'Just now (Lesson updated)' },
              modules: c.modules.map((m) => ({
                ...m,
                lessons: m.lessons.map((l) =>
                  l.id === lessonId
                    ? {
                      ...l,
                      ...payload,
                      status: nextStatus,
                      rejectionReason: undefined,
                    }
                    : l,
                ),
              })),
            }
            : c,
        ),
      );

      if (nextStatus === 'pending_approval') {
        pushActivity(
          'lesson',
          `أُرسل الدرس "${payload.title.ar}" للموافقة الإدارية`,
          `Lesson "${payload.title.en}" submitted for Admin approval`,
        );
      } else if (nextStatus === 'published') {
        pushActivity(
          'lesson',
          `تم نشر الدرس "${payload.title.ar}"`,
          `Lesson "${payload.title.en}" was published`,
        );
      }
      if (user && isUuid(lessonId)) {
        void dbUpdateLesson(lessonId, {
          title_ar: payload.title.ar,
          title_en: payload.title.en,
          short_description_ar: payload.shortDescription.ar,
          short_description_en: payload.shortDescription.en,
          description_ar: payload.description.ar,
          description_en: payload.description.en,
          duration_minutes: payload.durationMinutes,
          lesson_type: payload.lessonType,
          video_provider: payload.videoProvider,
          video_url: payload.videoUrl ?? null,
          video_source_id: payload.videoSourceId,
          materials_note_ar: payload.materialsNote.ar,
          materials_note_en: payload.materialsNote.en,
          is_preview: payload.isPreview,
          status: nextStatus,
        });
      }
      return { status: nextStatus, isRevision: false };
    },
    [courses, pushActivity, settings.requireLessonApproval, user],
  );

  // Course Proposals (Workflow B)
  const createCourseProposal = useCallback(
    (input: {
      proposingInstructorSlug: string;
      title: BilingualText;
      shortDescription: BilingualText;
      fullDescription: BilingualText;
      disciplineSlug: string;
      level: CourseLevel;
      thumbnailUrl?: string;
      whatYouWillLearn: BilingualText[];
      requirements: BilingualText[];
      targetAudience: BilingualText[];
      duration: BilingualText;
      suggestedPrice: BilingualText;
      enrollmentNotes: BilingualText;
      language: CourseLanguage;
      submitImmediately?: boolean;
    }): CourseProposal => {
      const status = input.submitImmediately ? 'pending_approval' : 'draft';
      const proposal: CourseProposal = {
        id: `prop-${Date.now()}`,
        proposingInstructorSlug: input.proposingInstructorSlug,
        title: input.title,
        shortDescription: input.shortDescription,
        fullDescription: input.fullDescription,
        disciplineSlug: input.disciplineSlug,
        level: input.level,
        thumbnailUrl: input.thumbnailUrl,
        whatYouWillLearn: input.whatYouWillLearn,
        requirements: input.requirements,
        targetAudience: input.targetAudience,
        duration: input.duration,
        suggestedPrice: input.suggestedPrice,
        enrollmentNotes: input.enrollmentNotes,
        language: input.language,
        status,
        createdAt: { ar: 'الآن', en: 'Just now' },
        updatedAt: { ar: 'الآن', en: 'Just now' },
      };
      setCourseProposals((prev) => [proposal, ...prev]);
      if (status === 'pending_approval') {
        pushActivity(
          'course',
          `قدّم المدرب مقترح دورة جديد: "${proposal.title.ar}"`,
          `Instructor submitted a new course proposal: "${proposal.title.en}"`,
        );
      }
      return proposal;
    },
    [pushActivity],
  );

  const updateCourseProposal = useCallback(
    (proposalId: string, patch: Partial<CourseProposal>) => {
      setCourseProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? { ...p, ...patch, updatedAt: { ar: 'الآن (معدّل)', en: 'Just now (Revised)' } }
            : p,
        ),
      );
    },
    [],
  );

  const submitCourseProposal = useCallback(
    (proposalId: string) => {
      const target = courseProposals.find((p) => p.id === proposalId);
      setCourseProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? {
              ...p,
              status: 'pending_approval',
              rejectionReason: undefined,
              updatedAt: { ar: 'الآن (مُعاد إرساله)', en: 'Just now (Resubmitted)' },
            }
            : p,
        ),
      );
      if (target) {
        pushActivity(
          'course',
          `أُعيد إرسال مقترح دورة "${target.title.ar}" للموافقة الإدارية`,
          `Resubmitted course proposal "${target.title.en}" for Admin approval`,
        );
      }
    },
    [courseProposals, pushActivity],
  );

  const approveCourseProposal = useCallback(
    (proposalId: string): PlatformCourse | null => {
      const proposal = courseProposals.find((p) => p.id === proposalId);
      if (!proposal) return null;

      const baseSlug =
        proposal.title.en
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `course-${Date.now()}`;
      const uniqueSlug = courses.some((c) => c.slug === baseSlug)
        ? `${baseSlug}-${Date.now().toString().slice(-3)}`
        : baseSlug;

      const newCourse: PlatformCourse = {
        slug: uniqueSlug,
        code: `PROP-${Date.now().toString().slice(-3)}`,
        title: proposal.title,
        shortDescription: proposal.shortDescription,
        fullDescription: proposal.fullDescription,
        disciplineSlug: proposal.disciplineSlug,
        instructorSlugs: [proposal.proposingInstructorSlug],
        leadInstructorSlug: proposal.proposingInstructorSlug,
        enrollmentManagerSlugs: [],
        pricing: {
          isFree: false,
          priceAmount: 1500,
          currency: 'EGP',
          paymentMethods: ['vodafone_cash', 'instapay'],
          paymentInstructions: {
            ar: 'تواصل مع المدرب لتنسيق الدفع المباشر.',
            en: 'Contact the instructor to coordinate direct payment.',
          },
          enrollmentOpen: true,
        },
        level: proposal.level,
        duration: proposal.duration,
        language: proposal.language,
        thumbnailUrl: proposal.thumbnailUrl,
        priceLabel: proposal.suggestedPrice,
        accent: 'teal',
        featured: false,
        status: 'draft', // Do NOT auto-publish publicly until Admin explicitly publishes
        pendingApproval: false,
        suspended: false,
        lastUpdated: { ar: 'الآن (تم اعتماد المقترح)', en: 'Just now (Proposal Approved)' },
        whatYouWillLearn:
          proposal.whatYouWillLearn.length > 0
            ? proposal.whatYouWillLearn
            : [{ ar: 'مخرجات تعلم الدورة', en: 'Course learning outcomes' }],
        objectives:
          proposal.whatYouWillLearn.length > 0
            ? proposal.whatYouWillLearn
            : [{ ar: 'أهداف الدورة', en: 'Course objectives' }],
        requirements:
          proposal.requirements.length > 0
            ? proposal.requirements
            : [{ ar: 'لا توجد متطلبات مسبقة', en: 'No prerequisites' }],
        targetAudience:
          proposal.targetAudience.length > 0
            ? proposal.targetAudience
            : [{ ar: 'المتعلمون المهتمون بهذا المسار', en: 'Learners interested in this track' }],
        modules: [
          {
            id: `mod-init-${Date.now()}`,
            title: { ar: 'الوحدة 01 — المقدمة', en: 'Module 01 — Introduction' },
            description: { ar: 'وحدة تمهيدية للدورة', en: 'Introductory module for this course' },
            lessons: [],
          },
        ],
        resources: [],
      };

      setCourses((prev) => [newCourse, ...prev]);
      setCourseProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? {
              ...p,
              status: 'approved',
              rejectionReason: undefined,
              approvedCourseSlug: uniqueSlug,
              updatedAt: { ar: 'الآن (معتمد)', en: 'Just now (Approved)' },
            }
            : p,
        ),
      );
      setApprovalHistory((prev) => [
        {
          id: `aph-${Date.now()}`,
          itemType: 'course',
          title: proposal.title,
          courseSlug: uniqueSlug,
          decision: 'approved',
          decidedAt: { ar: 'الآن', en: 'Just now' },
        },
        ...prev,
      ]);
      pushActivity(
        'course',
        `اعتمدت الإدارة مقترح دورة "${proposal.title.ar}" وأسندتها للمدرب كمدرب رئيسي`,
        `Admin approved course proposal "${proposal.title.en}" and assigned proposing instructor as Lead Instructor`,
      );
      return newCourse;
    },
    [courseProposals, courses, pushActivity],
  );

  const rejectCourseProposal = useCallback(
    (proposalId: string, reason?: string) => {
      const proposal = courseProposals.find((p) => p.id === proposalId);
      if (!proposal) return;
      const reasonText = reason?.trim()
        ? { ar: reason.trim(), en: reason.trim() }
        : {
          ar: 'يرجى استكمال تفاصيل المنهج والأهداف قبل إعادة الإرسال.',
          en: 'Please expand the course details and outcomes before resubmitting.',
        };

      setCourseProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? {
              ...p,
              status: 'rejected',
              rejectionReason: reasonText,
              updatedAt: { ar: 'الآن (مرفوض)', en: 'Just now (Rejected)' },
            }
            : p,
        ),
      );
      setApprovalHistory((prev) => [
        {
          id: `aph-${Date.now()}`,
          itemType: 'course',
          title: proposal.title,
          courseSlug: proposal.id,
          decision: 'rejected',
          reason: reasonText,
          decidedAt: { ar: 'الآن', en: 'Just now' },
        },
        ...prev,
      ]);
    },
    [courseProposals],
  );

  const updateCourseLesson = useCallback(
    (courseSlug: string, lessonId: string, patch: Partial<PlatformLesson>) => {
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug
            ? {
              ...c,
              modules: c.modules.map((m) => ({
                ...m,
                lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...patch } : l)),
              })),
            }
            : c,
        ),
      );
      if (patch.status === 'pending_approval') {
        pushActivity(
          'lesson',
          `أُرسل درس جديد للموافقة الإدارية في ${courseSlug}`,
          `A lesson was submitted for Admin approval in ${courseSlug}`,
        );
      } else if (patch.status === 'published') {
        pushActivity(
          'lesson',
          `تم نشر درس في دورة ${courseSlug}`,
          `A lesson was published in ${courseSlug}`,
        );
      }
    },
    [pushActivity],
  );

  const moveCourseLesson = useCallback(
    (courseSlug: string, moduleId: string, lessonId: string, direction: 'up' | 'down') => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.slug !== courseSlug) return c;
          return {
            ...c,
            modules: c.modules.map((m) => {
              if (m.id !== moduleId) return m;
              const idx = m.lessons.findIndex((l) => l.id === lessonId);
              if (idx < 0) return m;
              const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
              if (targetIdx < 0 || targetIdx >= m.lessons.length) return m;
              const next = [...m.lessons];
              const [moved] = next.splice(idx, 1);
              next.splice(targetIdx, 0, moved);
              return { ...m, lessons: next };
            }),
          };
        }),
      );
    },
    [],
  );

  // Students
  const setStudentStatus = useCallback((studentId: string, status: StudentAccountStatus) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)));
  }, []);

  const setCourseLeadAndManagers = useCallback(
    (courseSlug: string, leadInstructorSlug: string, enrollmentManagerSlugs: string[]) => {
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug
            ? {
              ...c,
              leadInstructorSlug,
              enrollmentManagerSlugs,
              lastUpdated: { ar: 'الآن (تحديث صلاحيات الالتحاق)', en: 'Just now (Permissions updated)' },
            }
            : c,
        ),
      );
      pushActivity(
        'instructor',
        `حدّثت الإدارة المدرب الرئيسي وصلاحيات تأكيد الدفع لدورة ${courseSlug}`,
        `Admin updated Lead Instructor & payment-confirmation permissions for ${courseSlug}`,
      );
    },
    [pushActivity],
  );

  const updateCoursePricing = useCallback(
    (courseSlug: string, pricing: CoursePricingConfig) => {
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug
            ? {
              ...c,
              pricing,
              priceLabel: pricing.isFree
                ? { ar: 'مجانية', en: 'Free' }
                : {
                  ar: `${pricing.priceAmount.toLocaleString()} ${pricing.currency}`,
                  en: `${pricing.priceAmount.toLocaleString()} ${pricing.currency}`,
                },
              lastUpdated: { ar: 'الآن (تحديث التسعير)', en: 'Just now (Pricing updated)' },
            }
            : c,
        ),
      );
      const courseDbId = courseIdBySlugRef.current[courseSlug];
      if (user && courseDbId) {
        void dbUpdateCoursePricing(courseDbId, pricing);
      }
    },
    [user],
  );

  const canInstructorConfirmPayment = useCallback(
    (courseSlug: string, instructorSlug: string): boolean => {
      const course = courses.find((c) => c.slug === courseSlug);
      if (!course) return false;
      const inst = instructors.find((i) => i.slug === instructorSlug);
      if (inst && inst.status !== 'active') return false;
      if (!course.instructorSlugs.includes(instructorSlug)) return false;
      const lead = course.leadInstructorSlug ?? course.instructorSlugs[0];
      if (lead === instructorSlug) return true;
      return Boolean(course.enrollmentManagerSlugs?.includes(instructorSlug));
    },
    [courses, instructors],
  );

  const appendAudit = useCallback(
    (
      enrollmentId: string,
      eventType: EnrollmentAuditEventType,
      actorId: string,
      actorRole: 'student' | 'instructor' | 'admin',
      newStatus: string,
      previousStatus?: string,
      reason?: string,
    ) => {
      setEnrollmentAuditLog((prev) => [
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          enrollmentId,
          eventType,
          actorId,
          actorRole,
          timestamp: { ar: 'الآن', en: 'Just now' },
          previousStatus,
          newStatus,
          reason,
        },
        ...prev,
      ]);
    },
    [],
  );

  const pushStudentNotification = useCallback(
    (titleAr: string, titleEn: string, bodyAr: string, bodyEn: string, targetPath: string) => {
      setStudentNotifications((prev) => [
        {
          id: `snotif-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          kind: 'update',
          title: { ar: titleAr, en: titleEn },
          body: { ar: bodyAr, en: bodyEn },
          timeLabel: { ar: 'الآن', en: 'Just now' },
          isRead: false,
          targetPath,
        },
        ...prev,
      ]);
    },
    [],
  );

  const markStudentNotificationRead = useCallback(
    (id: string) => {
      setStudentNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      if (user && isUuid(id)) {
        void dbMarkNotificationRead(id);
      }
    },
    [user],
  );

  const markAllStudentNotificationsRead = useCallback(() => {
    setStudentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (user) {
      void dbMarkAllNotificationsRead(user.id);
    }
  }, [user]);

  // Enrollment Requests (Shared with Student, Instructor & Admin Portals)
  const getCourseAvailabilityForDemoStudent = useCallback(
    (courseSlug: string): CourseAvailabilityState => {
      const enrolledRec = studentEnrolledCourses.find((e) => e.courseSlug === courseSlug);
      if (enrolledRec) {
        return enrolledRec.isSuspended ? 'suspended' : 'enrolled';
      }
      const req = enrollmentRequests.find((r) => r.courseSlug === courseSlug);
      if (req?.status === 'pending') return 'pending';
      if (req?.status === 'awaiting_payment') return 'awaiting_payment';
      if (req?.status === 'suspended') return 'suspended';
      if (req?.status === 'rejected') return 'rejected';
      if (req?.status === 'cancelled') return 'cancelled';
      return 'available';
    },
    [enrollmentRequests, studentEnrolledCourses],
  );

  const submitDemoStudentEnrollmentRequest = useCallback(
    (
      courseSlug: string,
      studentMessage?: string,
    ): { ok: boolean; reason?: 'enrolled' | 'pending' | 'closed' } => {
      const course = courses.find((c) => c.slug === courseSlug);
      if (course && !course.pricing.enrollmentOpen) {
        return { ok: false, reason: 'closed' };
      }
      if (studentEnrolledCourses.some((e) => e.courseSlug === courseSlug && !e.isSuspended)) {
        return { ok: false, reason: 'enrolled' };
      }
      if (
        enrollmentRequests.some(
          (r) =>
            r.courseSlug === courseSlug &&
            (r.status === 'pending' || r.status === 'awaiting_payment' || r.status === 'active'),
        )
      ) {
        return { ok: false, reason: 'pending' };
      }

      const priceSnapshot = course?.pricing.isFree ? 0 : (course?.pricing.priceAmount ?? 1500);
      const currency = course?.pricing.currency ?? 'EGP';
      const isFreeSnapshot = Boolean(course?.pricing.isFree);
      const leadInstructorSlug =
        course?.leadInstructorSlug ?? course?.instructorSlugs[0] ?? 'dr-tariq-al-mansour';

      const newReq: EnrollmentRequestRecord = {
        id: `req-demo-${Date.now()}`,
        studentId: 'stu-sara',
        courseSlug,
        leadInstructorSlug,
        status: 'pending',
        paymentStatus: isFreeSnapshot ? 'not_required' : 'unpaid',
        priceSnapshot,
        currency,
        isFreeSnapshot,
        studentMessage: studentMessage?.trim() || undefined,
        requestedAt: { ar: 'الآن (طلب محلي تجريبي)', en: 'Just now (Local Demo Request)' },
        updatedAt: { ar: 'الآن', en: 'Just now' },
      };

      setEnrollmentRequests((prev) => [
        newReq,
        ...prev.filter(
          (r) => !(r.courseSlug === courseSlug && (r.status === 'rejected' || r.status === 'cancelled')),
        ),
      ]);

      appendAudit(
        newReq.id,
        'request_created',
        'stu-sara',
        'student',
        'pending',
        undefined,
        isFreeSnapshot ? 'Free course request' : `Price snapshot: ${priceSnapshot} ${currency}`,
      );

      pushStudentNotification(
        'تم إرسال طلب الالتحاق',
        'Enrollment Request Submitted',
        `تم إرسال طلبك لدورة "${course?.title.ar ?? courseSlug}" وهو بانتظار رد المدرب.`,
        `Your request for "${course?.title.en ?? courseSlug}" was submitted and is awaiting instructor review.`,
        '/student/enrollment-requests',
      );

      pushActivity(
        'enrollment',
        `طلب التحاق جديد لدورة "${course?.title.ar ?? courseSlug}" (${priceSnapshot} ${currency})`,
        `New enrollment request for "${course?.title.en ?? courseSlug}" (${priceSnapshot} ${currency})`,
      );
      if (user) {
        const dbCourseId = courseIdBySlugRef.current[courseSlug];
        if (dbCourseId) {
          void rpcSubmitEnrollment(dbCourseId, studentMessage);
        }
      }
      return { ok: true };
    },
    [appendAudit, courses, enrollmentRequests, pushActivity, pushStudentNotification, studentEnrolledCourses, user],
  );

  const grantStudentAccessOnce = useCallback(
    (courseSlug: string, labelAr: string, labelEn: string) => {
      const course = courses.find((c) => c.slug === courseSlug);
      const firstLessonId =
        course?.modules.flatMap((m) => m.lessons).find((l) => l.status === 'published')?.id ??
        course?.modules[0]?.lessons[0]?.id ??
        'l1';

      setStudentEnrolledCourses((prev) => {
        const existing = prev.find((e) => e.courseSlug === courseSlug);
        if (existing) {
          return prev.map((e) =>
            e.courseSlug === courseSlug
              ? { ...e, isSuspended: false, lastAccessedLabel: { ar: labelAr, en: labelEn } }
              : e,
          );
        }
        return [
          {
            courseSlug,
            completedLessonIds: [],
            lastAccessedLabel: { ar: labelAr, en: labelEn },
            lastLessonId: firstLessonId,
            isSuspended: false,
          },
          ...prev,
        ];
      });

      setStudents((prev) =>
        prev.map((s) =>
          s.id === 'stu-sara' && !s.enrolledCourseSlugs.includes(courseSlug)
            ? { ...s, enrolledCourseSlugs: [...s.enrolledCourseSlugs, courseSlug] }
            : s,
        ),
      );
    },
    [courses],
  );

  const acceptEnrollmentForPayment = useCallback(
    (requestId: string, actorInstructorSlug: string): { ok: boolean } => {
      const target = enrollmentRequests.find((r) => r.id === requestId);
      if (!target || target.status !== 'pending') return { ok: false };
      const course = courses.find((c) => c.slug === target.courseSlug);

      // If free course, activate immediately
      if (target.isFreeSnapshot) {
        setEnrollmentRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? {
                ...r,
                status: 'active',
                paymentStatus: 'not_required',
                updatedAt: { ar: 'الآن', en: 'Just now' },
              }
              : r,
          ),
        );
        grantStudentAccessOnce(target.courseSlug, 'مفعّل (دورة مجانية)', 'Active (Free Course)');
        appendAudit(requestId, 'enrollment_activated', actorInstructorSlug, 'instructor', 'active', 'pending');
        pushStudentNotification(
          'تم تفعيل التحاقك بالدورة',
          'Enrollment Active',
          `أصبحت دورة "${course?.title.ar ?? target.courseSlug}" متاحة في تعلّمي.`,
          `"${course?.title.en ?? target.courseSlug}" is now active in My Learning.`,
          `/student/courses/${target.courseSlug}`,
        );
        return { ok: true };
      }

      setEnrollmentRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
              ...r,
              status: 'awaiting_payment',
              paymentStatus: 'awaiting_payment',
              updatedAt: { ar: 'الآن', en: 'Just now' },
              reviewNote: {
                ar: 'قبل المدرب طلبك — يرجى تنسيق الدفع المباشر حسب التعليمات الموضحة.',
                en: 'Instructor accepted your request — please coordinate direct payment using the instructions provided.',
              },
            }
            : r,
        ),
      );
      appendAudit(
        requestId,
        'instructor_accepted',
        actorInstructorSlug,
        'instructor',
        'awaiting_payment',
        'pending',
      );
      pushStudentNotification(
        'طلبك بانتظار تنسيق الدفع',
        'Awaiting Payment Coordination',
        `قبل المدرب طلبك لدورة "${course?.title.ar ?? target.courseSlug}". راجع تعليمات الدفع المباشر.`,
        `Instructor accepted your request for "${course?.title.en ?? target.courseSlug}". Review direct payment instructions.`,
        '/student/enrollment-requests',
      );
      if (user && /^[0-9a-f-]{36}$/i.test(requestId)) {
        void rpcAcceptEnrollment(requestId);
      }
      return { ok: true };
    },
    [appendAudit, courses, enrollmentRequests, grantStudentAccessOnce, pushStudentNotification, user],
  );

  const confirmDirectPaymentAndActivate = useCallback(
    (
      requestId: string,
      actorInstructorSlug: string,
    ): { ok: boolean; reason?: 'unauthorized' | 'invalid_state' } => {
      const target = enrollmentRequests.find((r) => r.id === requestId);
      if (!target || (target.status !== 'awaiting_payment' && target.status !== 'pending')) {
        return { ok: false, reason: 'invalid_state' };
      }
      if (!canInstructorConfirmPayment(target.courseSlug, actorInstructorSlug)) {
        return { ok: false, reason: 'unauthorized' };
      }

      const inst = instructors.find((i) => i.slug === actorInstructorSlug);
      const course = courses.find((c) => c.slug === target.courseSlug);

      setEnrollmentRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
              ...r,
              status: 'active',
              paymentStatus: 'confirmed',
              updatedAt: { ar: 'الآن', en: 'Just now' },
              paymentConfirmation: {
                instructorSlug: actorInstructorSlug,
                instructorName: inst?.name ?? { ar: actorInstructorSlug, en: actorInstructorSlug },
                confirmedAt: { ar: 'الآن (إقرار المدرب)', en: 'Just now (Instructor Declaration)' },
                amount: r.priceSnapshot,
                currency: r.currency,
                declarationAccepted: true,
              },
              reviewNote: {
                ar: 'أقرّ المدرب باستلام الدفع المباشر وتم تفعيل وصولك للدورة.',
                en: 'Instructor declared direct payment received — your course access is now Active.',
              },
            }
            : r,
        ),
      );

      grantStudentAccessOnce(
        target.courseSlug,
        'مفعّل للتو (تأكيد المدرب)',
        'Just activated (Payment Confirmed)',
      );

      appendAudit(
        requestId,
        'payment_confirmed',
        actorInstructorSlug,
        'instructor',
        'payment_confirmed',
        target.status,
        `Instructor declared ${target.priceSnapshot} ${target.currency} received directly.`,
      );
      appendAudit(
        requestId,
        'enrollment_activated',
        actorInstructorSlug,
        'instructor',
        'active',
        'payment_confirmed',
      );

      pushStudentNotification(
        'تم تأكيد الدفع وتفعيل الدورة',
        'Payment Confirmed & Enrollment Active',
        `أكد المدرب استلام الرسوم لدورة "${course?.title.ar ?? target.courseSlug}" وأصبحت متاحة الآن في تعلّمي.`,
        `Instructor confirmed direct payment for "${course?.title.en ?? target.courseSlug}". You can start learning now!`,
        `/student/courses/${target.courseSlug}`,
      );

      pushActivity(
        'enrollment',
        `أكد المدرب استلام الدفع (${target.priceSnapshot} ${target.currency}) وتفعيل دورة "${course?.title.ar ?? target.courseSlug}"`,
        `Instructor confirmed payment (${target.priceSnapshot} ${target.currency}) and activated "${course?.title.en ?? target.courseSlug}"`,
      );
      if (user && /^[0-9a-f-]{36}$/i.test(requestId)) {
        void rpcConfirmDirectPayment(requestId);
      }
      return { ok: true };
    },
    [
      appendAudit,
      canInstructorConfirmPayment,
      courses,
      enrollmentRequests,
      grantStudentAccessOnce,
      instructors,
      pushActivity,
      pushStudentNotification,
      user,
    ],
  );

  const approveEnrollmentRequest = useCallback(
    (requestId: string) => {
      const target = enrollmentRequests.find((r) => r.id === requestId);
      if (!target || (target.status !== 'pending' && target.status !== 'awaiting_payment')) return;
      const course = courses.find((c) => c.slug === target.courseSlug);

      setEnrollmentRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
              ...r,
              status: 'active',
              paymentStatus: r.isFreeSnapshot ? 'not_required' : 'confirmed',
              updatedAt: { ar: 'الآن', en: 'Just now' },
              reviewNote: {
                ar: 'تمت الموافقة من لوحة الإدارة — أصبحت الدورة متاحة الآن في "تعلّمي".',
                en: 'Approved by Super Admin — course is now accessible in My Learning.',
              },
            }
            : r,
        ),
      );

      grantStudentAccessOnce(target.courseSlug, 'معتمد للتو من الإدارة', 'Just approved by Admin');
      appendAudit(requestId, 'enrollment_activated', 'super-admin', 'admin', 'active', target.status);
      pushStudentNotification(
        'تم اعتماد التحاقك بالدورة',
        'Enrollment Approved',
        `تم تفعيل دورة "${course?.title.ar ?? target.courseSlug}" في تعلّمي.`,
        `"${course?.title.en ?? target.courseSlug}" is now active in My Learning.`,
        `/student/courses/${target.courseSlug}`,
      );
      pushActivity(
        'enrollment',
        `اعتمدت الإدارة التحاق سارة العلي بدورة "${course?.title.ar ?? target.courseSlug}"`,
        `Admin approved Sara Al-Ali's enrollment in "${course?.title.en ?? target.courseSlug}"`,
      );
    },
    [appendAudit, courses, enrollmentRequests, grantStudentAccessOnce, pushActivity, pushStudentNotification],
  );

  const rejectEnrollmentRequest = useCallback(
    (
      requestId: string,
      reason?: string,
      actorRole: 'instructor' | 'admin' = 'admin',
      actorId = 'super-admin',
    ) => {
      const target = enrollmentRequests.find((r) => r.id === requestId);
      if (!target || (target.status !== 'pending' && target.status !== 'awaiting_payment')) return;
      const course = courses.find((c) => c.slug === target.courseSlug);
      const trimmed = reason?.trim();
      const reviewNote: BilingualText = trimmed
        ? { ar: trimmed, en: trimmed }
        : {
          ar: 'تم رفض الطلب. تبقى الدورة مغلقة حتى اعتماد طلب جديد.',
          en: 'Request rejected. Course remains locked until a new request is approved.',
        };

      setEnrollmentRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: 'rejected', updatedAt: { ar: 'الآن', en: 'Just now' }, reviewNote }
            : r,
        ),
      );
      appendAudit(requestId, 'instructor_rejected', actorId, actorRole, 'rejected', target.status, trimmed);
      pushStudentNotification(
        'تحديث حول طلب الالتحاق',
        'Enrollment Request Rejected',
        `لم يُعتمد طلبك لدورة "${course?.title.ar ?? target.courseSlug}": ${reviewNote.ar}`,
        `Your request for "${course?.title.en ?? target.courseSlug}" was rejected: ${reviewNote.en}`,
        '/student/enrollment-requests',
      );
      if (user && /^[0-9a-f-]{36}$/i.test(requestId)) {
        void rpcRejectEnrollment(requestId, trimmed);
      }
    },
    [appendAudit, courses, enrollmentRequests, pushStudentNotification, user],
  );

  const cancelEnrollmentRequest = useCallback(
    (
      requestId: string,
      actorRole: 'student' | 'instructor' | 'admin',
      actorId: string,
      reason?: string,
    ) => {
      const target = enrollmentRequests.find((r) => r.id === requestId);
      if (!target) return;
      setEnrollmentRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
              ...r,
              status: 'cancelled',
              updatedAt: { ar: 'الآن', en: 'Just now' },
              reviewNote: reason?.trim() ? { ar: reason.trim(), en: reason.trim() } : r.reviewNote,
            }
            : r,
        ),
      );
      appendAudit(requestId, 'enrollment_cancelled', actorId, actorRole, 'cancelled', target.status, reason);
      if (user && isUuid(requestId)) {
        void rpcCancelEnrollment(requestId, reason);
      }
    },
    [appendAudit, enrollmentRequests, user],
  );

  const suspendEnrollment = useCallback(
    (requestId: string, reason?: string) => {
      const target = enrollmentRequests.find((r) => r.id === requestId);
      if (!target) return;
      const course = courses.find((c) => c.slug === target.courseSlug);
      const trimmed = reason?.trim() || 'Suspended by Super Admin';
      setEnrollmentRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
              ...r,
              status: 'suspended',
              updatedAt: { ar: 'الآن', en: 'Just now' },
              reviewNote: { ar: trimmed, en: trimmed },
            }
            : r,
        ),
      );
      // Preserve student progress while suspending access!
      setStudentEnrolledCourses((prev) =>
        prev.map((e) => (e.courseSlug === target.courseSlug ? { ...e, isSuspended: true } : e)),
      );
      appendAudit(requestId, 'admin_suspended', 'super-admin', 'admin', 'suspended', target.status, trimmed);
      pushStudentNotification(
        'تم تعليق الوصول إلى الدورة مؤقتًا',
        'Course Enrollment Suspended',
        `تم تعليق وصولك لدورة "${course?.title.ar ?? target.courseSlug}" مؤقتًا مع حفظ تقدمك.`,
        `Your access to "${course?.title.en ?? target.courseSlug}" is temporarily suspended. Your progress is preserved.`,
        '/student/enrollment-requests',
      );
      if (user && /^[0-9a-f-]{36}$/i.test(requestId)) {
        void rpcAdminSuspendEnrollment(requestId, trimmed);
      }
    },
    [appendAudit, courses, enrollmentRequests, pushStudentNotification, user],
  );

  const reactivateEnrollment = useCallback(
    (requestId: string, reason?: string) => {
      const target = enrollmentRequests.find((r) => r.id === requestId);
      if (!target) return;
      const course = courses.find((c) => c.slug === target.courseSlug);
      const trimmed = reason?.trim() || 'Reactivated by Super Admin';
      setEnrollmentRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
              ...r,
              status: 'active',
              updatedAt: { ar: 'الآن', en: 'Just now' },
              reviewNote: { ar: trimmed, en: trimmed },
            }
            : r,
        ),
      );
      grantStudentAccessOnce(target.courseSlug, 'أُعيد التفعيل من الإدارة', 'Reactivated by Admin');
      appendAudit(requestId, 'admin_reactivated', 'super-admin', 'admin', 'active', target.status, trimmed);
      pushStudentNotification(
        'تمت إعادة تفعيل وصولك للدورة',
        'Course Enrollment Reactivated',
        `عاد وصولك لدورة "${course?.title.ar ?? target.courseSlug}" مع كامل تقدمك السابق.`,
        `Your access to "${course?.title.en ?? target.courseSlug}" has been restored with all previous progress.`,
        `/student/courses/${target.courseSlug}`,
      );
      if (user && /^[0-9a-f-]{36}$/i.test(requestId)) {
        void rpcAdminReactivateEnrollment(requestId, trimmed);
      }
    },
    [appendAudit, courses, enrollmentRequests, grantStudentAccessOnce, pushStudentNotification, user],
  );

  const adminOverrideEnrollmentStatus = useCallback(
    (requestId: string, newStatus: EnrollmentRequestStatus, reason: string) => {
      const trimmed = reason.trim();
      if (!trimmed) return;
      const target = enrollmentRequests.find((r) => r.id === requestId);
      if (!target) return;

      setEnrollmentRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
              ...r,
              status: newStatus,
              paymentStatus: newStatus === 'refunded' ? 'refunded_record' : r.paymentStatus,
              updatedAt: { ar: 'الآن (تعديل إداري)', en: 'Just now (Admin Override)' },
              // Preserve original paymentConfirmation untouched!
              adminOverride: {
                reason: trimmed,
                timestamp: { ar: 'الآن', en: 'Just now' },
                previousStatus: target.status,
              },
            }
            : r,
        ),
      );

      if (newStatus === 'active' || newStatus === 'approved') {
        grantStudentAccessOnce(target.courseSlug, 'مفعّل بقرار إداري', 'Activated via Admin Override');
      } else if (newStatus === 'suspended' || newStatus === 'refunded' || newStatus === 'cancelled') {
        setStudentEnrolledCourses((prev) =>
          prev.map((e) => (e.courseSlug === target.courseSlug ? { ...e, isSuspended: true } : e)),
        );
      }

      appendAudit(requestId, 'admin_override', 'super-admin', 'admin', newStatus, target.status, trimmed);
      if (user && /^[0-9a-f-]{36}$/i.test(requestId)) {
        void rpcAdminOverrideEnrollment(requestId, newStatus, trimmed);
      }
    },
    [appendAudit, enrollmentRequests, grantStudentAccessOnce, user],
  );

  const submitEnrollmentDispute = useCallback(
    (enrollmentId: string, category: DisputeCategory, description: string) => {
      const target = enrollmentRequests.find((r) => r.id === enrollmentId);
      if (!target || !description.trim()) return;
      const course = courses.find((c) => c.slug === target.courseSlug);
      const dispute: EnrollmentDispute = {
        id: `disp-${Date.now()}`,
        enrollmentId,
        studentId: target.studentId,
        courseSlug: target.courseSlug,
        leadInstructorSlug: target.leadInstructorSlug,
        category,
        description: description.trim(),
        status: 'open',
        createdAt: { ar: 'الآن', en: 'Just now' },
      };
      setEnrollmentDisputes((prev) => [dispute, ...prev]);
      appendAudit(enrollmentId, 'dispute_submitted', target.studentId, 'student', 'dispute_open', target.status, description.trim());
      const courseDbId = courseIdBySlugRef.current[target.courseSlug];
      if (user && isUuid(enrollmentId) && courseDbId) {
        void submitDisputeToDb(enrollmentId, user.id, courseDbId, category, description.trim());
      }
      pushActivity(
        'enrollment',
        `بلاغ نزاع التحاق جديد حول دورة "${course?.title.ar ?? target.courseSlug}"`,
        `New enrollment dispute submitted for "${course?.title.en ?? target.courseSlug}"`,
      );
    },
    [appendAudit, courses, enrollmentRequests, pushActivity, user],
  );

  const resolveEnrollmentDispute = useCallback(
    (
      disputeId: string,
      resolutionNote: string,
      options?: { suspendAccess?: boolean; refundConfirmedByParties?: boolean },
    ) => {
      const dispute = enrollmentDisputes.find((d) => d.id === disputeId);
      if (!dispute || !resolutionNote.trim()) return;
      const course = courses.find((c) => c.slug === dispute.courseSlug);

      setEnrollmentDisputes((prev) =>
        prev.map((d) =>
          d.id === disputeId
            ? {
              ...d,
              status: 'resolved',
              resolutionNote: resolutionNote.trim(),
              refundConfirmedByParties: Boolean(options?.refundConfirmedByParties),
              resolvedAt: { ar: 'الآن', en: 'Just now' },
            }
            : d,
        ),
      );

      if (options?.suspendAccess) {
        suspendEnrollment(dispute.enrollmentId, resolutionNote.trim());
      }
      if (options?.refundConfirmedByParties) {
        adminOverrideEnrollmentStatus(
          dispute.enrollmentId,
          'refunded',
          `Parties confirmed refund: ${resolutionNote.trim()}`,
        );
      }

      appendAudit(
        dispute.enrollmentId,
        'dispute_resolved',
        'super-admin',
        'admin',
        'dispute_resolved',
        'dispute_open',
        resolutionNote.trim(),
      );
      pushStudentNotification(
        'تمت معالجة بلاغ الالتحاق',
        'Enrollment Dispute Resolved',
        `سجّلت الإدارة حلًا لبلاغك حول دورة "${course?.title.ar ?? dispute.courseSlug}": ${resolutionNote.trim()}`,
        `Admin recorded a resolution for your "${course?.title.en ?? dispute.courseSlug}" dispute: ${resolutionNote.trim()}`,
        '/student/enrollment-requests',
      );
      if (user && isUuid(disputeId)) {
        void rpcResolveDispute(
          disputeId,
          resolutionNote.trim(),
          Boolean(options?.suspendAccess),
          Boolean(options?.refundConfirmedByParties),
        );
      }
    },
    [
      adminOverrideEnrollmentStatus,
      appendAudit,
      courses,
      enrollmentDisputes,
      pushStudentNotification,
      suspendEnrollment,
      user,
    ],
  );

  // Course & Lesson Approvals
  const approveCourseSubmission = useCallback(
    (courseSlug: string) => {
      const course = courses.find((c) => c.slug === courseSlug);
      if (!course) return;
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug ? { ...c, status: 'published', pendingApproval: false } : c,
        ),
      );
      setApprovalHistory((prev) => [
        {
          id: `aph-${Date.now()}`,
          itemType: 'course',
          title: course.title,
          courseSlug,
          decision: 'approved',
          decidedAt: { ar: 'الآن', en: 'Just now' },
        },
        ...prev,
      ]);
    },
    [courses],
  );

  const rejectCourseSubmission = useCallback(
    (courseSlug: string, reason?: string) => {
      const course = courses.find((c) => c.slug === courseSlug);
      if (!course) return;
      setCourses((prev) =>
        prev.map((c) =>
          c.slug === courseSlug ? { ...c, status: 'draft', pendingApproval: false } : c,
        ),
      );
      setApprovalHistory((prev) => [
        {
          id: `aph-${Date.now()}`,
          itemType: 'course',
          title: course.title,
          courseSlug,
          decision: 'rejected',
          reason: reason?.trim() ? { ar: reason.trim(), en: reason.trim() } : undefined,
          decidedAt: { ar: 'الآن', en: 'Just now' },
        },
        ...prev,
      ]);
    },
    [courses],
  );

  const approveLessonSubmission = useCallback(
    (courseSlug: string, lessonId: string) => {
      const course = courses.find((c) => c.slug === courseSlug);
      const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
      if (!lesson) return;

      if (lesson.pendingRevision && lesson.pendingRevision.status === 'pending_approval') {
        const rev = lesson.pendingRevision;
        updateCourseLesson(courseSlug, lessonId, {
          title: rev.title,
          shortDescription: rev.shortDescription,
          description: rev.description,
          durationMinutes: rev.durationMinutes,
          lessonType: rev.lessonType,
          videoProvider: rev.videoProvider,
          videoUrl: rev.videoUrl,
          videoSourceId: rev.videoSourceId,
          materialsNote: rev.materialsNote,
          lessonResources: rev.lessonResources,
          isPreview: rev.isPreview,
          status: 'published',
          pendingRevision: undefined,
          rejectionReason: undefined,
        });
        setApprovalHistory((prev) => [
          {
            id: `aph-${Date.now()}`,
            itemType: 'lesson',
            title: rev.title,
            courseSlug,
            decision: 'approved',
            decidedAt: { ar: 'الآن', en: 'Just now' },
          },
          ...prev,
        ]);
        return;
      }

      updateCourseLesson(courseSlug, lessonId, {
        status: 'published',
        rejectionReason: undefined,
      });
      setApprovalHistory((prev) => [
        {
          id: `aph-${Date.now()}`,
          itemType: 'lesson',
          title: lesson.title,
          courseSlug,
          decision: 'approved',
          decidedAt: { ar: 'الآن', en: 'Just now' },
        },
        ...prev,
      ]);
    },
    [courses, updateCourseLesson],
  );

  const rejectLessonSubmission = useCallback(
    (courseSlug: string, lessonId: string, reason?: string) => {
      const course = courses.find((c) => c.slug === courseSlug);
      const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
      if (!lesson) return;
      const reasonText = reason?.trim()
        ? { ar: reason.trim(), en: reason.trim() }
        : { ar: 'يرجى المراجعة والتعديل قبل إعادة النشر.', en: 'Please revise before resubmitting.' };

      // Preserve the live published lesson if rejecting a revision!
      if (lesson.status === 'published' && lesson.pendingRevision) {
        updateCourseLesson(courseSlug, lessonId, {
          pendingRevision: {
            ...lesson.pendingRevision,
            status: 'rejected',
            rejectionReason: reasonText,
          },
        });
        setApprovalHistory((prev) => [
          {
            id: `aph-${Date.now()}`,
            itemType: 'lesson',
            title: lesson.pendingRevision!.title,
            courseSlug,
            decision: 'rejected',
            reason: reasonText,
            decidedAt: { ar: 'الآن', en: 'Just now' },
          },
          ...prev,
        ]);
        return;
      }

      updateCourseLesson(courseSlug, lessonId, {
        status: 'rejected',
        rejectionReason: reasonText,
      });
      setApprovalHistory((prev) => [
        {
          id: `aph-${Date.now()}`,
          itemType: 'lesson',
          title: lesson.title,
          courseSlug,
          decision: 'rejected',
          reason: reasonText,
          decidedAt: { ar: 'الآن', en: 'Just now' },
        },
        ...prev,
      ]);
    },
    [courses, updateCourseLesson],
  );

  // Reviews
  const moderateReview = useCallback(
    (reviewId: string, status: ReviewStatus, note?: string) => {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
              ...r,
              status,
              moderationNote: note?.trim() ? { ar: note.trim(), en: note.trim() } : r.moderationNote,
            }
            : r,
        ),
      );
      if (user && isUuid(reviewId)) {
        void dbModerateCourseReview(reviewId, status, note);
      }
    },
    [user],
  );

  const removeReview = useCallback(
    (reviewId: string) => {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      if (user && isUuid(reviewId)) {
        void dbDeleteCourseReview(reviewId);
      }
    },
    [user],
  );

  // Community Moderation
  const toggleHideCommunityPost = useCallback(
    (postId: string) => {
      const target = communityPosts.find((p) => p.id === postId);
      const nextHidden = target ? !target.isHidden : true;
      setCommunityPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isHidden: !p.isHidden } : p)),
      );
      setModerationLog((prev) => [
        {
          id: `ml-${Date.now()}`,
          action: { ar: 'تبديل إخفاء/إظهار منشور', en: 'Toggled post visibility' },
          target: { ar: postId, en: postId },
          timestamp: { ar: 'الآن', en: 'Just now' },
        },
        ...prev,
      ]);
      if (user && isUuid(postId)) {
        void dbModerateCommunityPost(
          postId,
          { is_hidden: nextHidden },
          {
            courseId: target ? courseIdBySlugRef.current[target.courseSlug] : undefined,
            moderatorId: user.id,
            actionType: nextHidden ? 'hide_post' : 'unhide_post',
          },
        );
      }
    },
    [communityPosts, user],
  );

  const removeCommunityPost = useCallback(
    (postId: string) => {
      setCommunityPosts((prev) => prev.filter((p) => p.id !== postId));
      setModerationLog((prev) => [
        {
          id: `ml-${Date.now()}`,
          action: { ar: 'حذف منشور مجتمعي', en: 'Removed community post' },
          target: { ar: postId, en: postId },
          timestamp: { ar: 'الآن', en: 'Just now' },
        },
        ...prev,
      ]);
      if (user && isUuid(postId)) {
        void dbDeleteCommunityPost(postId);
      }
    },
    [user],
  );

  // Notifications & Settings
  const updateNotificationEvent = useCallback(
    (key: string, patch: Partial<NotificationEventConfig>) => {
      setNotificationEvents((prev) =>
        prev.map((ev) => (ev.key === key ? { ...ev, ...patch } : ev)),
      );
    },
    [],
  );

  const updateSettings = useCallback(
    (patch: Partial<PlatformSettingsState>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
      if (user) {
        const dbPatch: Record<string, unknown> = {};
        if (patch.requireLessonApproval !== undefined) {
          dbPatch.require_lesson_approval = patch.requireLessonApproval;
        }
        if (patch.requireReviewModeration !== undefined) {
          dbPatch.require_review_moderation = patch.requireReviewModeration;
        }
        if (Object.keys(dbPatch).length > 0) {
          void dbUpdatePlatformSettings(dbPatch);
        }
      }
    },
    [user],
  );

  const value = useMemo<PlatformDemoContextValue>(
    () => ({
      getCourseDbId,
      getDisciplineDbId,
      isAdminDemoActive,
      enterAdminDemo,
      exitAdminDemo,
      resetAllPlatformDemo,
      disciplines,
      createDiscipline,
      updateDiscipline,
      deleteDiscipline,
      instructors,
      inviteInstructor,
      updateInstructor,
      setInstructorStatus,
      courses,
      createCourse,
      updateCourse,
      setCourseSuspended,
      submitCourseForReview,
      setCourseInstructors,
      setCourseLeadAndManagers,
      updateCoursePricing,
      canInstructorConfirmPayment,
      addCourseModule,
      updateCourseModule,
      deleteCourseModule,
      reorderCourseModules,
      addCourseLesson,
      updateCourseLesson,
      deleteCourseLesson,
      duplicateCourseLesson,
      reorderCourseLessons,
      moveLessonToModule,
      moveCourseLesson,
      saveLessonChanges,
      courseProposals,
      createCourseProposal,
      updateCourseProposal,
      submitCourseProposal,
      approveCourseProposal,
      rejectCourseProposal,
      students,
      setStudentStatus,
      studentEnrolledCourses,
      setStudentEnrolledCourses,
      enrollmentRequests,
      enrollmentAuditLog,
      enrollmentDisputes,
      studentNotifications,
      markStudentNotificationRead,
      markAllStudentNotificationsRead,
      getCourseAvailabilityForDemoStudent,
      submitDemoStudentEnrollmentRequest,
      acceptEnrollmentForPayment,
      confirmDirectPaymentAndActivate,
      approveEnrollmentRequest,
      rejectEnrollmentRequest,
      cancelEnrollmentRequest,
      suspendEnrollment,
      reactivateEnrollment,
      adminOverrideEnrollmentStatus,
      submitEnrollmentDispute,
      resolveEnrollmentDispute,
      approvalHistory,
      approveCourseSubmission,
      rejectCourseSubmission,
      approveLessonSubmission,
      rejectLessonSubmission,
      reviews,
      moderateReview,
      removeReview,
      communityPosts,
      moderationLog,
      toggleHideCommunityPost,
      removeCommunityPost,
      notificationEvents,
      updateNotificationEvent,
      settings,
      updateSettings,
      activityTimeline,
    }),
    [
      getCourseDbId,
      getDisciplineDbId,
      isAdminDemoActive,
      enterAdminDemo,
      exitAdminDemo,
      resetAllPlatformDemo,
      disciplines,
      createDiscipline,
      updateDiscipline,
      deleteDiscipline,
      instructors,
      inviteInstructor,
      updateInstructor,
      setInstructorStatus,
      courses,
      createCourse,
      updateCourse,
      setCourseSuspended,
      submitCourseForReview,
      setCourseInstructors,
      setCourseLeadAndManagers,
      updateCoursePricing,
      canInstructorConfirmPayment,
      addCourseModule,
      updateCourseModule,
      deleteCourseModule,
      reorderCourseModules,
      addCourseLesson,
      updateCourseLesson,
      deleteCourseLesson,
      duplicateCourseLesson,
      reorderCourseLessons,
      moveLessonToModule,
      moveCourseLesson,
      saveLessonChanges,
      courseProposals,
      createCourseProposal,
      updateCourseProposal,
      submitCourseProposal,
      approveCourseProposal,
      rejectCourseProposal,
      students,
      setStudentStatus,
      studentEnrolledCourses,
      enrollmentRequests,
      enrollmentAuditLog,
      enrollmentDisputes,
      studentNotifications,
      markStudentNotificationRead,
      markAllStudentNotificationsRead,
      getCourseAvailabilityForDemoStudent,
      submitDemoStudentEnrollmentRequest,
      acceptEnrollmentForPayment,
      confirmDirectPaymentAndActivate,
      approveEnrollmentRequest,
      rejectEnrollmentRequest,
      cancelEnrollmentRequest,
      suspendEnrollment,
      reactivateEnrollment,
      adminOverrideEnrollmentStatus,
      submitEnrollmentDispute,
      resolveEnrollmentDispute,
      approvalHistory,
      approveCourseSubmission,
      rejectCourseSubmission,
      approveLessonSubmission,
      rejectLessonSubmission,
      reviews,
      moderateReview,
      removeReview,
      communityPosts,
      moderationLog,
      toggleHideCommunityPost,
      removeCommunityPost,
      notificationEvents,
      updateNotificationEvent,
      settings,
      updateSettings,
      activityTimeline,
    ],
  );

  return <PlatformDemoContext.Provider value={value}>{children}</PlatformDemoContext.Provider>;
}

export function usePlatformDemo(): PlatformDemoContextValue {
  const ctx = useContext(PlatformDemoContext);
  if (!ctx) {
    throw new Error('usePlatformDemo must be used within PlatformDemoProvider');
  }
  return ctx;
}

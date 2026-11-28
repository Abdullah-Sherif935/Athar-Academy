import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { usePlatformDemo } from '../../../app/providers/PlatformDemoContext';
import {
  fetchOwnInstructorPortalData,
  updateOwnInstructorProfileInDb,
} from '../../../services/instructorOnboardingService';
import {
  dbCreateAnnouncement,
  dbCreateCommunityPost,
  dbDeleteCommunityPost,
  dbMarkConversationRead,
  dbModerateCommunityPost,
  dbPublishAnnouncement,
  dbSendMessage,
  isUuid,
} from '../../../services/lmsService';
import type {
  CourseLanguage,
  CoursePricingConfig,
  CourseProposal,
  EnrollmentDispute,
  LessonResourceItem,
  LessonType,
  PlatformCourse,
  PlatformLesson,
  PlatformModule,
} from '../../../data/mock/admin';
import type { EnrollmentRequestRecord } from '../../../data/mock/student';
import type { BilingualText, CourseLevel } from '../../../data/mock/types';
import {
  DEMO_INSTRUCTOR_SLUG,
  INITIAL_ASSIGNED_STUDENTS,
  INITIAL_INSTRUCTOR_ANNOUNCEMENTS,
  INITIAL_INSTRUCTOR_COMMUNITY_POSTS,
  INITIAL_INSTRUCTOR_CONVERSATIONS,
  INITIAL_INSTRUCTOR_PREFS,
  INITIAL_INSTRUCTOR_PROFILE,
  type AssignedStudentRecord,
  type InstructorAnnouncementRecord,
  type InstructorConversationItem,
  type InstructorNotificationPreferences,
  type InstructorProfileState,
  type ModerationPostItem,
  type PublishStatus,
} from '../../../data/mock/instructor';

const INSTRUCTOR_DEMO_KEY = 'athar-instructor-demo-active';

function readInitialActive(): boolean {
  try {
    return window.localStorage.getItem(INSTRUCTOR_DEMO_KEY) === 'true';
  } catch {
    return false;
  }
}

export interface InstructorDemoContextValue {
  refreshInstructorData: () => Promise<void>;
  isDemoActive: boolean;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  resetDemoData: () => void;
  isInstructorDisabled: boolean;
  requireLessonApproval: boolean;
  profile: InstructorProfileState;
  updateProfile: (patch: Partial<InstructorProfileState>) => void;
  assignedCourses: PlatformCourse[];
  getAssignedCourse: (slug: string) => PlatformCourse | undefined;
  updateCourseMetadata: (slug: string, patch: Partial<PlatformCourse>) => void;
  toggleCourseStatus: (slug: string) => void;
  submitCourseForReview: (slug: string) => void;
  addModule: (courseSlug: string, title: string, description?: string) => void;
  updateModule: (courseSlug: string, moduleId: string, patch: Partial<PlatformModule>) => void;
  deleteModule: (courseSlug: string, moduleId: string) => void;
  reorderModules: (courseSlug: string, fromIndex: number, toIndex: number) => void;
  addLesson: (
    courseSlug: string,
    moduleId: string,
    title: string,
    lessonType?: LessonType,
  ) => void;
  updateLesson: (courseSlug: string, lessonId: string, patch: Partial<PlatformLesson>) => void;
  deleteLesson: (courseSlug: string, moduleId: string, lessonId: string) => void;
  duplicateLesson: (courseSlug: string, moduleId: string, lessonId: string) => void;
  reorderLessons: (
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
  moveLesson: (
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
  ) => { status: 'draft' | 'pending_approval' | 'published'; isRevision: boolean } | null;
  myProposals: CourseProposal[];
  createProposal: (input: {
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
  updateProposal: (proposalId: string, patch: Partial<CourseProposal>) => void;
  submitProposal: (proposalId: string) => void;
  // Phase 03C-2: Enrollment & Direct Payment Confirmation
  assignedEnrollmentRequests: EnrollmentRequestRecord[];
  assignedDisputes: EnrollmentDispute[];
  canConfirmPaymentForCourse: (courseSlug: string) => boolean;
  acceptEnrollmentForPayment: (requestId: string) => { ok: boolean };
  confirmDirectPayment: (requestId: string) => { ok: boolean; reason?: 'unauthorized' | 'invalid_state' };
  rejectEnrollment: (requestId: string, reason?: string) => void;
  cancelEnrollment: (requestId: string, reason?: string) => void;
  updateCoursePricing: (courseSlug: string, pricing: CoursePricingConfig) => void;
  students: AssignedStudentRecord[];
  getStudentById: (id: string) => AssignedStudentRecord | undefined;
  posts: ModerationPostItem[];
  replyToPost: (postId: string, content: string) => void;
  togglePinPost: (postId: string) => void;
  toggleHidePost: (postId: string) => void;
  deletePost: (postId: string) => void;
  publishCommunityAnnouncement: (courseSlug: string, title: string, content: string) => void;
  announcements: InstructorAnnouncementRecord[];
  createAnnouncement: (
    courseSlug: string,
    title: string,
    body: string,
    status: PublishStatus,
  ) => void;
  publishAnnouncement: (id: string) => void;
  conversations: InstructorConversationItem[];
  sendMessage: (conversationId: string, content: string) => void;
  markConversationRead: (conversationId: string) => void;
  notificationPrefs: InstructorNotificationPreferences;
  updateNotificationPref: (key: keyof InstructorNotificationPreferences, value: boolean) => void;
}

const InstructorDemoContext = createContext<InstructorDemoContextValue | null>(null);

export function InstructorDemoProvider({ children }: { children: ReactNode }) {
  const { user, profile: authProfile } = useAuth();
  const platform = usePlatformDemo();

  const [isDemoActive, setIsDemoActive] = useState<boolean>(readInitialActive);
  const [profile, setProfile] = useState<InstructorProfileState>(INITIAL_INSTRUCTOR_PROFILE);
  const [realAssignedSlugs, setRealAssignedSlugs] = useState<string[] | null>(null);
  const [students] = useState<AssignedStudentRecord[]>(INITIAL_ASSIGNED_STUDENTS);
  const [posts, setPosts] = useState<ModerationPostItem[]>(INITIAL_INSTRUCTOR_COMMUNITY_POSTS);
  const [announcements, setAnnouncements] = useState<InstructorAnnouncementRecord[]>(
    INITIAL_INSTRUCTOR_ANNOUNCEMENTS,
  );
  const [conversations, setConversations] = useState<InstructorConversationItem[]>(
    INITIAL_INSTRUCTOR_CONVERSATIONS,
  );
  const [notificationPrefs, setNotificationPrefs] =
    useState<InstructorNotificationPreferences>(INITIAL_INSTRUCTOR_PREFS);

  const { refreshLiveCatalog } = platform;

  // Hydrate real instructor profile and assigned courses from Supabase when signed in
  const refreshInstructorData = useCallback(async () => {
    if (!user) {
      setRealAssignedSlugs(null);
      return;
    }
    const [res] = await Promise.all([
      fetchOwnInstructorPortalData(user.id),
      refreshLiveCatalog(),
    ]);
    setRealAssignedSlugs(res.assignedCourseSlugs);
    if (res.instructorProfile) {
      const ip = res.instructorProfile;
      setProfile((prev) => ({
        ...prev,
        slug: ip.slug,
        fullName: ip.fullName,
        initials: ip.initials,
        title: ip.title,
        biography: ip.biography,
        expertise: ip.expertise,
      }));
    }
  }, [refreshLiveCatalog, user]);

  useEffect(() => {
    void refreshInstructorData();
  }, [refreshInstructorData]);

  const platformInstructor = platform.instructors.find((i) => i.slug === DEMO_INSTRUCTOR_SLUG);
  const isInstructorDisabled = user
    ? Boolean(authProfile && authProfile.account_status !== 'active')
    : platformInstructor
      ? platformInstructor.status !== 'active'
      : false;

  const assignedCourses = useMemo(
    () =>
      isInstructorDisabled
        ? []
        : user
          ? platform.courses.filter(
            (c) => (realAssignedSlugs ?? []).includes(c.slug) && c.status !== 'archived',
          )
          : platform.courses.filter(
            (c) => c.instructorSlugs.includes(DEMO_INSTRUCTOR_SLUG) && c.status !== 'archived',
          ),
    [isInstructorDisabled, platform.courses, realAssignedSlugs, user],
  );

  const enterDemoMode = useCallback(() => {
    setIsDemoActive(true);
    try {
      window.localStorage.setItem(INSTRUCTOR_DEMO_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  const exitDemoMode = useCallback(() => {
    setIsDemoActive(false);
    try {
      window.localStorage.removeItem(INSTRUCTOR_DEMO_KEY);
    } catch {
      // ignore
    }
  }, []);

  const resetDemoData = useCallback(() => {
    platform.resetAllPlatformDemo();
    setProfile(INITIAL_INSTRUCTOR_PROFILE);
    setPosts(INITIAL_INSTRUCTOR_COMMUNITY_POSTS);
    setAnnouncements(INITIAL_INSTRUCTOR_ANNOUNCEMENTS);
    setConversations(INITIAL_INSTRUCTOR_CONVERSATIONS);
    setNotificationPrefs(INITIAL_INSTRUCTOR_PREFS);
  }, [platform]);

  const updateProfile = useCallback(
    (patch: Partial<InstructorProfileState>) => {
      setProfile((prev) => ({ ...prev, ...patch }));
      if (user) {
        void updateOwnInstructorProfileInDb(user.id, {
          fullNameAr: patch.fullName?.ar,
          fullNameEn: patch.fullName?.en,
          titleAr: patch.title?.ar,
          titleEn: patch.title?.en,
          biographyAr: patch.biography?.ar,
          biographyEn: patch.biography?.en,
          website: patch.website,
        });
      } else {
        platform.updateInstructor(DEMO_INSTRUCTOR_SLUG, {
          name: patch.fullName,
          title: patch.title,
          biography: patch.biography,
        });
      }
    },
    [platform, user],
  );

  const getAssignedCourse = useCallback(
    (slug: string) => assignedCourses.find((c) => c.slug === slug),
    [assignedCourses],
  );

  const updateCourseMetadata = useCallback(
    (slug: string, patch: Partial<PlatformCourse>) => {
      const target = assignedCourses.find((c) => c.slug === slug);
      if (!target || target.suspended) return;
      // Strip Admin-controlled protected fields
      const {
        slug: _s,
        code: _c,
        instructorSlugs: _i,
        leadInstructorSlug: _l,
        status: _st,
        pendingApproval: _pa,
        suspended: _su,
        ...allowedPatch
      } = patch;
      void _s;
      void _c;
      void _i;
      void _l;
      void _st;
      void _pa;
      void _su;
      platform.updateCourse(slug, allowedPatch);
    },
    [assignedCourses, platform],
  );

  const toggleCourseStatus = useCallback(
    (slug: string) => {
      const target = assignedCourses.find((c) => c.slug === slug);
      if (!target || target.suspended) return;
      platform.updateCourse(slug, {
        status: target.status === 'published' ? 'draft' : 'published',
      });
    },
    [assignedCourses, platform],
  );

  const submitCourseForReview = useCallback(
    (slug: string) => {
      const target = assignedCourses.find((c) => c.slug === slug);
      if (!target || target.suspended) return;
      platform.submitCourseForReview(slug);
    },
    [assignedCourses, platform],
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
    ) => {
      const target = assignedCourses.find((c) => c.slug === courseSlug);
      if (!target) return null;
      if (target.suspended && mode === 'publish_or_submit') return null;
      return platform.saveLessonChanges(courseSlug, lessonId, payload, mode);
    },
    [assignedCourses, platform],
  );

  const myProposals = useMemo(
    () =>
      isInstructorDisabled
        ? []
        : platform.courseProposals.filter((p) => p.proposingInstructorSlug === DEMO_INSTRUCTOR_SLUG),
    [isInstructorDisabled, platform.courseProposals],
  );

  const createProposal = useCallback(
    (input: {
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
    }) =>
      platform.createCourseProposal({
        ...input,
        proposingInstructorSlug: DEMO_INSTRUCTOR_SLUG,
      }),
    [platform],
  );

  // Phase 03C-2: Scoped Enrollment Requests & Direct Payment Confirmation
  const assignedCourseSlugs = useMemo(
    () => new Set(assignedCourses.map((c) => c.slug)),
    [assignedCourses],
  );

  const assignedEnrollmentRequests = useMemo(
    () =>
      isInstructorDisabled
        ? []
        : platform.enrollmentRequests.filter((r) => assignedCourseSlugs.has(r.courseSlug)),
    [assignedCourseSlugs, isInstructorDisabled, platform.enrollmentRequests],
  );

  const assignedDisputes = useMemo(
    () =>
      isInstructorDisabled
        ? []
        : platform.enrollmentDisputes.filter((d) => assignedCourseSlugs.has(d.courseSlug)),
    [assignedCourseSlugs, isInstructorDisabled, platform.enrollmentDisputes],
  );

  const canConfirmPaymentForCourse = useCallback(
    (courseSlug: string) => platform.canInstructorConfirmPayment(courseSlug, DEMO_INSTRUCTOR_SLUG),
    [platform],
  );

  const acceptEnrollmentForPayment = useCallback(
    (requestId: string) => platform.acceptEnrollmentForPayment(requestId, DEMO_INSTRUCTOR_SLUG),
    [platform],
  );

  const confirmDirectPayment = useCallback(
    (requestId: string) => platform.confirmDirectPaymentAndActivate(requestId, DEMO_INSTRUCTOR_SLUG),
    [platform],
  );

  const rejectEnrollment = useCallback(
    (requestId: string, reason?: string) =>
      platform.rejectEnrollmentRequest(requestId, reason, 'instructor', DEMO_INSTRUCTOR_SLUG),
    [platform],
  );

  const cancelEnrollment = useCallback(
    (requestId: string, reason?: string) =>
      platform.cancelEnrollmentRequest(requestId, 'instructor', DEMO_INSTRUCTOR_SLUG, reason),
    [platform],
  );

  const updateCoursePricing = useCallback(
    (courseSlug: string, pricing: CoursePricingConfig) => {
      if (!canConfirmPaymentForCourse(courseSlug)) return;
      platform.updateCoursePricing(courseSlug, pricing);
    },
    [canConfirmPaymentForCourse, platform],
  );

  const getStudentById = useCallback(
    (id: string) => students.find((s) => s.id === id),
    [students],
  );

  const replyToPost = useCallback(
    (postId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
              ...post,
              replies: [
                ...post.replies,
                {
                  id: `irep-${Date.now()}`,
                  authorName: profile.fullName,
                  authorRole: 'instructor',
                  initials: profile.initials,
                  content: { ar: trimmed, en: trimmed },
                  timeLabel: { ar: 'الآن (تجريبي)', en: 'Just now (Demo)' },
                },
              ],
            }
            : post,
        ),
      );
    },
    [profile],
  );

  const togglePinPost = useCallback(
    (postId: string) => {
      const target = posts.find((p) => p.id === postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p)),
      );
      if (user && isUuid(postId)) {
        void dbModerateCommunityPost(
          postId,
          { is_pinned: !target?.isPinned },
          {
            courseId: target ? platform.getCourseDbId(target.courseSlug) : undefined,
            moderatorId: user.id,
            actionType: !target?.isPinned ? 'pin_post' : 'unpin_post',
          },
        );
      }
    },
    [platform, posts, user],
  );

  const toggleHidePost = useCallback(
    (postId: string) => {
      const target = posts.find((p) => p.id === postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isHidden: !p.isHidden } : p)),
      );
      if (user && isUuid(postId)) {
        void dbModerateCommunityPost(
          postId,
          { is_hidden: !target?.isHidden },
          {
            courseId: target ? platform.getCourseDbId(target.courseSlug) : undefined,
            moderatorId: user.id,
            actionType: !target?.isHidden ? 'hide_post' : 'unhide_post',
          },
        );
      }
    },
    [platform, posts, user],
  );

  const deletePost = useCallback(
    (postId: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (user && isUuid(postId)) {
        void dbDeleteCommunityPost(postId);
      }
    },
    [user],
  );

  const publishCommunityAnnouncement = useCallback(
    (courseSlug: string, title: string, content: string) => {
      const trimmedTitle = title.trim();
      const trimmedContent = content.trim();
      if (!trimmedTitle || !trimmedContent) return;
      if (!assignedCourses.some((c) => c.slug === courseSlug)) return;

      const tempId = `ipost-ann-${Date.now()}`;
      const newPost: ModerationPostItem = {
        id: tempId,
        courseSlug,
        authorName: profile.fullName,
        authorRole: 'instructor',
        initials: profile.initials,
        title: { ar: trimmedTitle, en: trimmedTitle },
        content: { ar: trimmedContent, en: trimmedContent },
        timeLabel: { ar: 'الآن (تجريبي)', en: 'Just now (Demo)' },
        isPinned: true,
        isHidden: false,
        isAnnouncement: true,
        replies: [],
      };
      setPosts((prev) => [newPost, ...prev]);
      const courseDbId = platform.getCourseDbId(courseSlug);
      if (user && courseDbId) {
        void dbCreateCommunityPost({
          courseId: courseDbId,
          authorId: user.id,
          title: trimmedTitle,
          content: trimmedContent,
          isAnnouncement: true,
        }).then(({ data }) => {
          if (!data?.id) return;
          setPosts((prev) => prev.map((p) => (p.id === tempId ? { ...p, id: data.id } : p)));
        });
      }
    },
    [assignedCourses, platform, profile, user],
  );

  const createAnnouncement = useCallback(
    (courseSlug: string, title: string, body: string, status: PublishStatus) => {
      if (!assignedCourses.some((c) => c.slug === courseSlug)) return;
      const trimmedTitle = title.trim();
      const trimmedBody = body.trim();
      if (!trimmedTitle || !trimmedBody) return;

      const tempId = `ann-${Date.now()}`;
      const record: InstructorAnnouncementRecord = {
        id: tempId,
        courseSlug,
        title: { ar: trimmedTitle, en: trimmedTitle },
        body: { ar: trimmedBody, en: trimmedBody },
        status,
        createdAt: { ar: 'الآن (تجريبي)', en: 'Just now (Demo)' },
      };
      setAnnouncements((prev) => [record, ...prev]);
      const courseDbId = platform.getCourseDbId(courseSlug);
      if (user && courseDbId) {
        void dbCreateAnnouncement({
          courseId: courseDbId,
          authorId: user.id,
          title: trimmedTitle,
          body: trimmedBody,
          status,
        }).then(({ data }) => {
          if (!data?.id) return;
          setAnnouncements((prev) =>
            prev.map((a) => (a.id === tempId ? { ...a, id: data.id } : a)),
          );
        });
      }
      if (status === 'published') {
        publishCommunityAnnouncement(courseSlug, trimmedTitle, trimmedBody);
      }
    },
    [assignedCourses, platform, publishCommunityAnnouncement, user],
  );

  const publishAnnouncement = useCallback(
    (id: string) => {
      const target = announcements.find((a) => a.id === id);
      if (!target || target.status === 'published') return;
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'published' } : a)),
      );
      if (user && isUuid(id)) {
        void dbPublishAnnouncement(id);
      }
      publishCommunityAnnouncement(target.courseSlug, target.title.en, target.body.en);
    },
    [announcements, publishCommunityAnnouncement, user],
  );

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
              ...conv,
              unreadCount: 0,
              messages: [
                ...conv.messages,
                {
                  id: `im-${Date.now()}`,
                  sender: 'instructor',
                  content: { ar: trimmed, en: trimmed },
                  timeLabel: { ar: 'الآن (تجريبي)', en: 'Just now (Demo)' },
                },
              ],
            }
            : conv,
        ),
      );
      if (user && isUuid(conversationId)) {
        void dbSendMessage(conversationId, user.id, trimmed);
      }
    },
    [user],
  );

  const markConversationRead = useCallback(
    (conversationId: string) => {
      setConversations((prev) =>
        prev.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)),
      );
      if (user && isUuid(conversationId)) {
        void dbMarkConversationRead(conversationId, user.id);
      }
    },
    [user],
  );

  const updateNotificationPref = useCallback(
    (key: keyof InstructorNotificationPreferences, value: boolean) => {
      setNotificationPrefs((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const value = useMemo<InstructorDemoContextValue>(
    () => ({
      refreshInstructorData,
      isDemoActive,
      enterDemoMode,
      exitDemoMode,
      resetDemoData,
      isInstructorDisabled,
      requireLessonApproval: platform.settings.requireLessonApproval,
      profile,
      updateProfile,
      assignedCourses,
      getAssignedCourse,
      updateCourseMetadata,
      toggleCourseStatus,
      submitCourseForReview,
      addModule: platform.addCourseModule,
      updateModule: platform.updateCourseModule,
      deleteModule: platform.deleteCourseModule,
      reorderModules: platform.reorderCourseModules,
      addLesson: platform.addCourseLesson,
      updateLesson: platform.updateCourseLesson,
      deleteLesson: platform.deleteCourseLesson,
      duplicateLesson: platform.duplicateCourseLesson,
      reorderLessons: platform.reorderCourseLessons,
      moveLessonToModule: platform.moveLessonToModule,
      moveLesson: platform.moveCourseLesson,
      saveLessonChanges,
      myProposals,
      createProposal,
      updateProposal: platform.updateCourseProposal,
      submitProposal: platform.submitCourseProposal,
      assignedEnrollmentRequests,
      assignedDisputes,
      canConfirmPaymentForCourse,
      acceptEnrollmentForPayment,
      confirmDirectPayment,
      rejectEnrollment,
      cancelEnrollment,
      updateCoursePricing,
      students,
      getStudentById,
      posts,
      replyToPost,
      togglePinPost,
      toggleHidePost,
      deletePost,
      publishCommunityAnnouncement,
      announcements,
      createAnnouncement,
      publishAnnouncement,
      conversations,
      sendMessage,
      markConversationRead,
      notificationPrefs,
      updateNotificationPref,
    }),
    [
      refreshInstructorData,
      isDemoActive,
      enterDemoMode,
      exitDemoMode,
      resetDemoData,
      isInstructorDisabled,
      platform.settings.requireLessonApproval,
      platform.addCourseModule,
      platform.updateCourseModule,
      platform.deleteCourseModule,
      platform.reorderCourseModules,
      platform.addCourseLesson,
      platform.updateCourseLesson,
      platform.deleteCourseLesson,
      platform.duplicateCourseLesson,
      platform.reorderCourseLessons,
      platform.moveLessonToModule,
      platform.moveCourseLesson,
      platform.updateCourseProposal,
      platform.submitCourseProposal,
      profile,
      updateProfile,
      assignedCourses,
      getAssignedCourse,
      updateCourseMetadata,
      toggleCourseStatus,
      submitCourseForReview,
      saveLessonChanges,
      myProposals,
      createProposal,
      assignedEnrollmentRequests,
      assignedDisputes,
      canConfirmPaymentForCourse,
      acceptEnrollmentForPayment,
      confirmDirectPayment,
      rejectEnrollment,
      cancelEnrollment,
      updateCoursePricing,
      students,
      getStudentById,
      posts,
      replyToPost,
      togglePinPost,
      toggleHidePost,
      deletePost,
      publishCommunityAnnouncement,
      announcements,
      createAnnouncement,
      publishAnnouncement,
      conversations,
      sendMessage,
      markConversationRead,
      notificationPrefs,
      updateNotificationPref,
    ],
  );

  return (
    <InstructorDemoContext.Provider value={value}>{children}</InstructorDemoContext.Provider>
  );
}

export function useInstructorDemo(): InstructorDemoContextValue {
  const ctx = useContext(InstructorDemoContext);
  if (!ctx) {
    throw new Error('useInstructorDemo must be used within InstructorDemoProvider');
  }
  return ctx;
}

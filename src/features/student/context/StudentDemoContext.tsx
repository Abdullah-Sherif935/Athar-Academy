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
  dbCreateCommunityComment,
  dbCreateCommunityPost,
  dbMarkConversationRead,
  dbSendMessage,
  dbUpsertNotificationPreferences,
  isUuid,
  rpcUpsertLessonProgress,
} from '../../../services/lmsService';
import type { DisputeCategory, EnrollmentDispute } from '../../../data/mock/admin';
import {
  INITIAL_CERTIFICATES,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATION_PREFS,
  INITIAL_STUDENT_PROFILE,
  type CommunityPostItem,
  type ConversationItem,
  type CourseAvailabilityState,
  type DemoStudentProfile,
  type EnrolledCourseRecord,
  type EnrollmentRequestRecord,
  type StudentCertificate,
  type StudentNotification,
  type StudentNotificationPreferences,
} from '../../../data/mock/student';

const DEMO_ACTIVE_KEY = 'athar-student-demo-active';

function readInitialDemoActive(): boolean {
  try {
    return window.localStorage.getItem(DEMO_ACTIVE_KEY) === 'true';
  } catch {
    return false;
  }
}

export interface StudentDemoContextValue {
  isDemoActive: boolean;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  resetDemoData: () => void;
  profile: DemoStudentProfile;
  updateProfile: (patch: Partial<DemoStudentProfile>) => void;
  enrolledCourses: EnrolledCourseRecord[];
  enrollmentRequests: EnrollmentRequestRecord[];
  myDisputes: EnrollmentDispute[];
  submitDispute: (enrollmentId: string, category: DisputeCategory, description: string) => void;
  getCourseAvailability: (courseSlug: string) => CourseAvailabilityState;
  getLatestRequestForCourse: (courseSlug: string) => EnrollmentRequestRecord | undefined;
  requestEnrollment: (
    courseSlug: string,
    studentMessage?: string,
  ) => { ok: boolean; reason?: 'enrolled' | 'pending' | 'closed' };
  toggleLessonComplete: (courseSlug: string, lessonId: string) => void;
  isLessonUnlocked: (courseSlug: string, lessonId: string) => boolean;
  getCourseProgress: (courseSlug: string) => {
    completed: number;
    total: number;
    percent: number;
  };
  lessonNotes: Record<string, string>;
  saveLessonNote: (courseSlug: string, lessonId: string, note: string) => void;
  playbackPositions: Record<string, number>;
  savePlaybackPosition: (courseSlug: string, lessonId: string, seconds: number) => void;
  posts: CommunityPostItem[];
  addPost: (courseSlug: string, content: string) => void;
  addReply: (postId: string, content: string) => void;
  toggleLikePost: (postId: string) => void;
  conversations: ConversationItem[];
  sendMessage: (conversationId: string, text: string) => void;
  markConversationRead: (conversationId: string) => void;
  notifications: StudentNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  certificates: StudentCertificate[];
  notificationPrefs: StudentNotificationPreferences;
  updateNotificationPref: (key: keyof StudentNotificationPreferences, value: boolean) => void;
}

const StudentDemoContext = createContext<StudentDemoContextValue | null>(null);

export function StudentDemoProvider({ children }: { children: ReactNode }) {
  const { user, profile: authProfile } = useAuth();
  const platform = usePlatformDemo();

  const [isDemoActive, setIsDemoActive] = useState<boolean>(readInitialDemoActive);
  const [profile, setProfile] = useState<DemoStudentProfile>(INITIAL_STUDENT_PROFILE);
  const [lessonNotes, setLessonNotes] = useState<Record<string, string>>({});
  const [playbackPositions, setPlaybackPositions] = useState<Record<string, number>>({});
  const [posts, setPosts] = useState<CommunityPostItem[]>(
    import.meta.env.DEV ? INITIAL_COMMUNITY_POSTS : [],
  );
  const [conversations, setConversations] = useState<ConversationItem[]>(
    import.meta.env.DEV ? INITIAL_CONVERSATIONS : [],
  );
  const [certificates, setCertificates] = useState<StudentCertificate[]>(
    import.meta.env.DEV ? INITIAL_CERTIFICATES : [],
  );
  const [notificationPrefs, setNotificationPrefs] =
    useState<StudentNotificationPreferences>(INITIAL_NOTIFICATION_PREFS);

  // Sync real student profile, notes, and playback positions from Supabase when authenticated
  useEffect(() => {
    if (!user || !authProfile) return;
    setProfile((prev) => ({
      ...prev,
      fullName: {
        ar: authProfile.full_name_ar || authProfile.full_name_en || prev.fullName.ar,
        en: authProfile.full_name_en || authProfile.full_name_ar || prev.fullName.en,
      },
      initials: authProfile.initials || prev.initials,
      email: authProfile.email || user.email || prev.email,
    }));
  }, [authProfile, user]);

  useEffect(() => {
    if (!user) return;
    setLessonNotes(platform.hydratedLessonNotes);
  }, [platform.hydratedLessonNotes, user]);

  useEffect(() => {
    if (!user) return;
    setPlaybackPositions(platform.hydratedPlaybackPositions);
  }, [platform.hydratedPlaybackPositions, user]);

  const activeEnrolledCourses = useMemo(
    () => platform.studentEnrolledCourses.filter((e) => !e.isSuspended),
    [platform.studentEnrolledCourses],
  );

  const getFlatPublishedLessonIds = useCallback(
    (courseSlug: string): string[] => {
      const course = platform.courses.find((c) => c.slug === courseSlug);
      if (!course) return [];
      return course.modules.flatMap((mod) =>
        mod.lessons.filter((l) => l.status === 'published').map((l) => l.id),
      );
    },
    [platform.courses],
  );

  const enterDemoMode = useCallback(() => {
    setIsDemoActive(true);
    try {
      window.localStorage.setItem(DEMO_ACTIVE_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  const exitDemoMode = useCallback(() => {
    setIsDemoActive(false);
    try {
      window.localStorage.removeItem(DEMO_ACTIVE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const resetDemoData = useCallback(() => {
    platform.resetAllPlatformDemo();
    setProfile(INITIAL_STUDENT_PROFILE);
    setLessonNotes({});
    setPosts(INITIAL_COMMUNITY_POSTS);
    setConversations(INITIAL_CONVERSATIONS);
    setCertificates(INITIAL_CERTIFICATES);
    setNotificationPrefs(INITIAL_NOTIFICATION_PREFS);
  }, [platform]);

  const updateProfile = useCallback((patch: Partial<DemoStudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const getLatestRequestForCourse = useCallback(
    (courseSlug: string) =>
      platform.enrollmentRequests.find((req) => req.courseSlug === courseSlug),
    [platform.enrollmentRequests],
  );

  const getCourseProgress = useCallback(
    (courseSlug: string) => {
      const lessonIds = getFlatPublishedLessonIds(courseSlug);
      const record = platform.studentEnrolledCourses.find((item) => item.courseSlug === courseSlug);
      const completed = record
        ? record.completedLessonIds.filter((id) => lessonIds.includes(id)).length
        : 0;
      const total = lessonIds.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { completed, total, percent };
    },
    [getFlatPublishedLessonIds, platform.studentEnrolledCourses],
  );

  const isLessonUnlocked = useCallback(
    (courseSlug: string, lessonId: string) => {
      const lessonIds = getFlatPublishedLessonIds(courseSlug);
      const idx = lessonIds.indexOf(lessonId);
      if (idx <= 0) return true;
      const record = platform.studentEnrolledCourses.find((item) => item.courseSlug === courseSlug);
      if (!record) return false;
      const prevLessonId = lessonIds[idx - 1];
      return (
        record.completedLessonIds.includes(lessonId) ||
        record.completedLessonIds.includes(prevLessonId)
      );
    },
    [getFlatPublishedLessonIds, platform.studentEnrolledCourses],
  );

  const toggleLessonComplete = useCallback(
    (courseSlug: string, lessonId: string) => {
      const lessonIds = getFlatPublishedLessonIds(courseSlug);
      platform.setStudentEnrolledCourses((prev) =>
        prev.map((record) => {
          if (record.courseSlug !== courseSlug) return record;
          const alreadyDone = record.completedLessonIds.includes(lessonId);
          const nextCompleted = alreadyDone
            ? record.completedLessonIds.filter((id) => id !== lessonId)
            : [...record.completedLessonIds, lessonId];

          const nextIdx = lessonIds.indexOf(lessonId) + 1;
          const nextLessonId =
            !alreadyDone && nextIdx < lessonIds.length ? lessonIds[nextIdx] : lessonId;

          if (!alreadyDone && lessonIds.length > 0 && nextCompleted.length >= lessonIds.length) {
            setCertificates((certs) => {
              if (certs.some((c) => c.courseSlug === courseSlug)) return certs;
              return [
                ...certs,
                {
                  id: `cert-demo-${courseSlug}`,
                  courseSlug,
                  certificateCode: `ATHAR-DEMO-2026-00${certs.length + 1}`,
                  issuedLabel: { ar: 'الآن (معاينة تجريبية)', en: 'Just now (Demo Preview)' },
                },
              ];
            });
          }

          return {
            ...record,
            completedLessonIds: nextCompleted,
            lastLessonId: nextLessonId,
            lastAccessedLabel: { ar: 'الآن (نموذجي)', en: 'Just now (Demo)' },
          };
        }),
      );
      const courseDbId = platform.getCourseDbId(courseSlug);
      if (user && courseDbId && isUuid(lessonId)) {
        const rec = platform.studentEnrolledCourses.find((e) => e.courseSlug === courseSlug);
        const willBeCompleted = !rec?.completedLessonIds.includes(lessonId);
        void rpcUpsertLessonProgress({
          courseId: courseDbId,
          lessonId,
          isCompleted: willBeCompleted,
        });
      }
    },
    [getFlatPublishedLessonIds, platform, user],
  );

  const saveLessonNote = useCallback(
    (courseSlug: string, lessonId: string, note: string) => {
      setLessonNotes((prev) => ({ ...prev, [`${courseSlug}:${lessonId}`]: note }));
      const courseDbId = platform.getCourseDbId(courseSlug);
      if (user && courseDbId && isUuid(lessonId)) {
        void rpcUpsertLessonProgress({
          courseId: courseDbId,
          lessonId,
          notes: note,
        });
      }
    },
    [platform, user],
  );

  const savePlaybackPosition = useCallback(
    (courseSlug: string, lessonId: string, seconds: number) => {
      const clamped = Math.max(0, Math.round(seconds));
      setPlaybackPositions((prev) => ({ ...prev, [`${courseSlug}:${lessonId}`]: clamped }));
      const courseDbId = platform.getCourseDbId(courseSlug);
      if (user && courseDbId && isUuid(lessonId)) {
        void rpcUpsertLessonProgress({
          courseId: courseDbId,
          lessonId,
          playbackSeconds: clamped,
        });
      }
    },
    [platform, user],
  );

  const addPost = useCallback(
    (courseSlug: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      const tempId = `post-demo-${Date.now()}`;
      const newPost: CommunityPostItem = {
        id: tempId,
        courseSlug,
        authorName: profile.fullName,
        authorRole: 'student',
        initials: profile.initials,
        content: { ar: trimmed, en: trimmed },
        timeLabel: { ar: 'الآن (تجريبي)', en: 'Just now (Demo)' },
        likes: 0,
        likedByMe: false,
        replies: [],
      };
      setPosts((prev) => [newPost, ...prev]);
      const courseDbId = platform.getCourseDbId(courseSlug);
      if (user && courseDbId) {
        void dbCreateCommunityPost({
          courseId: courseDbId,
          authorId: user.id,
          content: trimmed,
        }).then(({ data }) => {
          if (!data?.id) return;
          setPosts((prev) => prev.map((p) => (p.id === tempId ? { ...p, id: data.id } : p)));
        });
      }
    },
    [platform, profile, user],
  );

  const addReply = useCallback(
    (postId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      const targetPost = posts.find((p) => p.id === postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
              ...post,
              replies: [
                ...post.replies,
                {
                  id: `reply-demo-${Date.now()}`,
                  authorName: profile.fullName,
                  authorRole: 'student',
                  initials: profile.initials,
                  content: { ar: trimmed, en: trimmed },
                  timeLabel: { ar: 'الآن (تجريبي)', en: 'Just now (Demo)' },
                },
              ],
            }
            : post,
        ),
      );
      const courseDbId = targetPost ? platform.getCourseDbId(targetPost.courseSlug) : undefined;
      if (user && isUuid(postId) && courseDbId) {
        void dbCreateCommunityComment({
          postId,
          courseId: courseDbId,
          authorId: user.id,
          content: trimmed,
        });
      }
    },
    [platform, posts, profile, user],
  );

  const toggleLikePost = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const nextLiked = !post.likedByMe;
        return {
          ...post,
          likedByMe: nextLiked,
          likes: nextLiked ? post.likes + 1 : Math.max(0, post.likes - 1),
        };
      }),
    );
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      const trimmed = text.trim();
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
                  id: `msg-demo-${Date.now()}`,
                  sender: 'student',
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
    (key: keyof StudentNotificationPreferences, value: boolean) => {
      setNotificationPrefs((prev) => ({ ...prev, [key]: value }));
      if (user) {
        const keyMap: Record<keyof StudentNotificationPreferences, string> = {
          newLessons: 'new_lessons',
          instructorAnnouncements: 'instructor_announcements',
          communityReplies: 'community_replies',
          directMessages: 'direct_messages',
          weeklySummary: 'weekly_summary',
        };
        const dbCol = keyMap[key];
        if (dbCol) {
          void dbUpsertNotificationPreferences(user.id, { [dbCol]: value });
        }
      }
    },
    [user],
  );

  const value = useMemo<StudentDemoContextValue>(
    () => ({
      isDemoActive,
      enterDemoMode,
      exitDemoMode,
      resetDemoData,
      profile,
      updateProfile,
      enrolledCourses: activeEnrolledCourses,
      enrollmentRequests: platform.enrollmentRequests,
      myDisputes: platform.enrollmentDisputes,
      submitDispute: platform.submitEnrollmentDispute,
      getCourseAvailability: platform.getCourseAvailabilityForDemoStudent,
      getLatestRequestForCourse,
      requestEnrollment: platform.submitDemoStudentEnrollmentRequest,
      toggleLessonComplete,
      isLessonUnlocked,
      getCourseProgress,
      lessonNotes,
      saveLessonNote,
      playbackPositions,
      savePlaybackPosition,
      posts,
      addPost,
      addReply,
      toggleLikePost,
      conversations,
      sendMessage,
      markConversationRead,
      notifications: platform.studentNotifications,
      markNotificationRead: platform.markStudentNotificationRead,
      markAllNotificationsRead: platform.markAllStudentNotificationsRead,
      certificates,
      notificationPrefs,
      updateNotificationPref,
    }),
    [
      isDemoActive,
      enterDemoMode,
      exitDemoMode,
      resetDemoData,
      profile,
      updateProfile,
      activeEnrolledCourses,
      platform.enrollmentRequests,
      platform.enrollmentDisputes,
      platform.submitEnrollmentDispute,
      platform.getCourseAvailabilityForDemoStudent,
      platform.submitDemoStudentEnrollmentRequest,
      platform.studentNotifications,
      platform.markStudentNotificationRead,
      platform.markAllStudentNotificationsRead,
      getLatestRequestForCourse,
      toggleLessonComplete,
      isLessonUnlocked,
      getCourseProgress,
      lessonNotes,
      saveLessonNote,
      playbackPositions,
      savePlaybackPosition,
      posts,
      addPost,
      addReply,
      toggleLikePost,
      conversations,
      sendMessage,
      markConversationRead,
      certificates,
      notificationPrefs,
      updateNotificationPref,
    ],
  );

  return <StudentDemoContext.Provider value={value}>{children}</StudentDemoContext.Provider>;
}

export function useStudentDemo(): StudentDemoContextValue {
  const ctx = useContext(StudentDemoContext);
  if (!ctx) {
    throw new Error('useStudentDemo must be used within StudentDemoProvider');
  }
  return ctx;
}

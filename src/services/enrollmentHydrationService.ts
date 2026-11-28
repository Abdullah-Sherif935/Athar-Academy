import { supabase } from '../lib/supabase';
import type {
  CourseCurrency,
  DisputeCategory,
  EnrollmentAuditEvent,
  EnrollmentAuditEventType,
  EnrollmentDispute,
  PlatformStudent,
} from '../data/mock/admin';
import type {
  EnrolledCourseRecord,
  EnrollmentRequestRecord,
  EnrollmentRequestStatus,
  PaymentStatus,
  StudentNotification,
} from '../data/mock/student';
import type { BilingualText } from '../data/mock/types';

export interface OperationalSnapshot {
  enrollmentRequests: EnrollmentRequestRecord[];
  studentEnrolledCourses: EnrolledCourseRecord[];
  lessonNotes: Record<string, string>;
  playbackPositions: Record<string, number>;
  studentNotifications: StudentNotification[];
  enrollmentAuditLog: EnrollmentAuditEvent[];
  enrollmentDisputes: EnrollmentDispute[];
  students: PlatformStudent[];
  error: string | null;
}

function formatDateLabel(iso?: string | null): BilingualText {
  if (!iso) return { ar: '—', en: '—' };
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { ar: iso, en: iso };
  return {
    ar: date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
    en: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  };
}

/**
 * Hydrates real operational LMS data from Supabase for the currently authenticated user.
 * Strictly respects RLS — only rows authorized for this user (Student / Instructor / Super Admin)
 * are returned. Never falls back to mock data.
 */
export async function fetchOperationalSnapshot(
  userId: string,
  courseSlugById: Record<string, string>,
  instructorSlugById: Record<string, string>,
  courseLeadSlugBySlug: Record<string, string>,
): Promise<OperationalSnapshot> {
  const empty: OperationalSnapshot = {
    enrollmentRequests: [],
    studentEnrolledCourses: [],
    lessonNotes: {},
    playbackPositions: {},
    studentNotifications: [],
    enrollmentAuditLog: [],
    enrollmentDisputes: [],
    students: [],
    error: null,
  };

  if (!supabase) {
    return { ...empty, error: 'Supabase client is not configured.' };
  }

  const [reqRes, enrollRes, progRes, notifRes, auditRes, dispRes] = await Promise.all([
    supabase.from('enrollment_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('course_enrollments').select('*').order('enrolled_at', { ascending: false }),
    supabase.from('lesson_progress').select('*').eq('student_id', userId),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('enrollment_audit_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('enrollment_disputes').select('*').order('created_at', { ascending: false }),
  ]);

  const firstError =
    reqRes.error ||
    enrollRes.error ||
    progRes.error ||
    notifRes.error ||
    auditRes.error ||
    dispRes.error;

  if (firstError) {
    return { ...empty, error: firstError.message };
  }

  // Gather unique student IDs referenced in enrollment_requests / course_enrollments
  const studentIdSet = new Set<string>();
  (reqRes.data ?? []).forEach((r) => {
    if (r.student_id) studentIdSet.add(r.student_id);
  });
  (enrollRes.data ?? []).forEach((e) => {
    if (e.student_id) studentIdSet.add(e.student_id);
  });

  const enrolledSlugsByStudent = new Map<string, string[]>();
  (enrollRes.data ?? []).forEach((e) => {
    const slug = courseSlugById[e.course_id];
    if (!slug || e.is_suspended) return;
    const list = enrolledSlugsByStudent.get(e.student_id) ?? [];
    if (!list.includes(slug)) list.push(slug);
    enrolledSlugsByStudent.set(e.student_id, list);
  });

  let students: PlatformStudent[] = [];
  if (studentIdSet.size > 0) {
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('id, email, full_name_ar, full_name_en, initials, account_status, created_at')
      .in('id', Array.from(studentIdSet));

    students = (profileRows ?? []).map((p): PlatformStudent => {
      const ar = p.full_name_ar || p.full_name_en || p.email || 'طالب';
      const en = p.full_name_en || p.full_name_ar || p.email || 'Student';
      const joined = formatDateLabel(p.created_at);
      return {
        id: p.id,
        fullName: { ar, en },
        initials:
          p.initials ||
          en
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) ||
          'ST',
        email: p.email ?? '',
        enrolledCourseSlugs: enrolledSlugsByStudent.get(p.id) ?? [],
        status: p.account_status === 'suspended' ? 'suspended' : 'active',
        registeredAt: joined,
        lastActivity: joined,
        avgProgress: 0,
      };
    });
  }

  // Map enrollment_requests
  const enrollmentRequests: EnrollmentRequestRecord[] = (reqRes.data ?? [])
    .map((r) => {
      const courseSlug = courseSlugById[r.course_id];
      if (!courseSlug) return null;
      const leadInstructorSlug =
        (r.lead_instructor_id ? instructorSlugById[r.lead_instructor_id] : undefined) ??
        courseLeadSlugBySlug[courseSlug] ??
        '';
      const req: EnrollmentRequestRecord = {
        id: r.id,
        studentId: r.student_id,
        courseSlug,
        leadInstructorSlug,
        status: (r.status as EnrollmentRequestStatus) ?? 'pending',
        paymentStatus: (r.payment_status as PaymentStatus) ?? 'unpaid',
        priceSnapshot: Number(r.price_snapshot ?? 0),
        currency: (r.currency as CourseCurrency) ?? 'EGP',
        isFreeSnapshot: Boolean(r.is_free_snapshot),
        studentMessage: r.student_message ?? undefined,
        requestedAt: formatDateLabel(r.created_at),
        updatedAt: formatDateLabel(r.updated_at ?? r.created_at),
        reviewNote: r.review_note ? { ar: r.review_note, en: r.review_note } : undefined,
        paymentConfirmation: r.payment_confirmed_at
          ? {
              instructorSlug:
                (r.payment_confirmed_by ? instructorSlugById[r.payment_confirmed_by] : undefined) ??
                leadInstructorSlug,
              instructorName: { ar: 'المدرب المعتمد', en: 'Authorized Instructor' },
              confirmedAt: formatDateLabel(r.payment_confirmed_at),
              amount: Number(r.price_snapshot ?? 0),
              currency: (r.currency as CourseCurrency) ?? 'EGP',
              declarationAccepted: true as const,
            }
          : undefined,
      };
      return req;
    })
    .filter((item): item is EnrollmentRequestRecord => item !== null);

  // Map lesson_progress for the current user
  const completedByCourseId = new Map<string, string[]>();
  const lastLessonByCourseId = new Map<string, { lessonId: string; updatedAt: string }>();
  const lessonNotes: Record<string, string> = {};
  const playbackPositions: Record<string, number> = {};

  (progRes.data ?? []).forEach((p) => {
    const courseSlug = courseSlugById[p.course_id];
    if (!courseSlug) return;
    if (p.is_completed) {
      const arr = completedByCourseId.get(p.course_id) ?? [];
      if (!arr.includes(p.lesson_id)) arr.push(p.lesson_id);
      completedByCourseId.set(p.course_id, arr);
    }
    if (typeof p.notes === 'string' && p.notes.length > 0) {
      lessonNotes[`${courseSlug}:${p.lesson_id}`] = p.notes;
    }
    if (typeof p.playback_position_seconds === 'number' && p.playback_position_seconds > 0) {
      playbackPositions[`${courseSlug}:${p.lesson_id}`] = p.playback_position_seconds;
    }
    const prevLast = lastLessonByCourseId.get(p.course_id);
    const ts = p.updated_at ?? p.completed_at ?? '';
    if (!prevLast || ts > prevLast.updatedAt) {
      lastLessonByCourseId.set(p.course_id, { lessonId: p.lesson_id, updatedAt: ts });
    }
  });

  // Map course_enrollments for the current user (student portal My Learning)
  const studentEnrolledCourses: EnrolledCourseRecord[] = (enrollRes.data ?? [])
    .filter((e) => e.student_id === userId)
    .map((e): EnrolledCourseRecord | null => {
      const courseSlug = courseSlugById[e.course_id];
      if (!courseSlug) return null;
      const lastInfo = lastLessonByCourseId.get(e.course_id);
      return {
        courseSlug,
        completedLessonIds: completedByCourseId.get(e.course_id) ?? [],
        lastAccessedLabel: formatDateLabel(e.last_accessed_at ?? e.enrolled_at),
        lastLessonId: lastInfo?.lessonId ?? '',
        isSuspended: Boolean(e.is_suspended),
      };
    })
    .filter((item): item is EnrolledCourseRecord => item !== null);

  // Map notifications
  const studentNotifications: StudentNotification[] = (notifRes.data ?? []).map((n) => ({
    id: n.id,
    kind: (n.kind as StudentNotification['kind']) ?? 'update',
    title: { ar: n.title_ar ?? n.title_en ?? '', en: n.title_en ?? n.title_ar ?? '' },
    body: { ar: n.body_ar ?? n.body_en ?? '', en: n.body_en ?? n.body_ar ?? '' },
    timeLabel: formatDateLabel(n.created_at),
    isRead: Boolean(n.is_read),
    targetPath: n.target_path ?? '/student',
  }));

  // Map audit events
  const enrollmentAuditLog: EnrollmentAuditEvent[] = (auditRes.data ?? []).map((a) => ({
    id: a.id,
    enrollmentId: a.enrollment_request_id,
    eventType: (a.event_type as EnrollmentAuditEventType) ?? 'request_created',
    actorId: a.actor_id ?? 'system',
    actorRole: (a.actor_role as EnrollmentAuditEvent['actorRole']) ?? 'admin',
    timestamp: formatDateLabel(a.created_at),
    previousStatus: a.previous_status ?? undefined,
    newStatus: a.new_status ?? '',
    reason: a.reason ?? undefined,
  }));

  // Map disputes
  const enrollmentDisputes: EnrollmentDispute[] = (dispRes.data ?? [])
    .map((d): EnrollmentDispute | null => {
      const courseSlug = courseSlugById[d.course_id];
      if (!courseSlug) return null;
      return {
        id: d.id,
        enrollmentId: d.enrollment_request_id,
        studentId: d.student_id,
        courseSlug,
        leadInstructorSlug: courseLeadSlugBySlug[courseSlug] ?? '',
        category: (d.category as DisputeCategory) ?? 'other',
        description: d.description ?? '',
        status: d.status === 'resolved' ? 'resolved' : 'open',
        createdAt: formatDateLabel(d.created_at),
        resolutionNote: d.resolution_note ?? undefined,
        refundConfirmedByParties: Boolean(d.refund_confirmed_by_parties),
        resolvedAt: d.resolved_at ? formatDateLabel(d.resolved_at) : undefined,
      };
    })
    .filter((item): item is EnrollmentDispute => item !== null);

  return {
    enrollmentRequests,
    studentEnrolledCourses,
    lessonNotes,
    playbackPositions,
    studentNotifications,
    enrollmentAuditLog,
    enrollmentDisputes,
    students,
    error: null,
  };
}

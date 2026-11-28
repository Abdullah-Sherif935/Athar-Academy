import { supabase } from '../lib/supabase';
import type {
  AdminCourseStatus,
  CourseCurrency,
  CoursePricingConfig,
  DisputeCategory,
  LessonResourceItem,
  LessonType,
  PaymentMethodType,
  PlatformCourse,
  PlatformDiscipline,
  PlatformLesson,
  PlatformModule,
  ReviewStatus,
} from '../data/mock/admin';
import type { CourseLevel } from '../data/mock/types';

export interface LiveCatalogSnapshot {
  disciplines: PlatformDiscipline[];
  courses: PlatformCourse[];
  courseIdBySlug: Record<string, string>;
  courseSlugById: Record<string, string>;
  disciplineIdBySlug: Record<string, string>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value?: string | null): value is string {
  return Boolean(value && UUID_RE.test(value));
}

const RESOURCE_ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/png',
  'image/jpeg',
]);
const RESOURCE_MAX_BYTES = 25 * 1024 * 1024;

const COMMUNITY_ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);
const COMMUNITY_MAX_BYTES = 10 * 1024 * 1024;

/**
 * Fetches live public/authorized catalog data from Supabase PostgreSQL.
 * Returns null if Supabase is not configured or query fails.
 */
export async function fetchLiveCatalog(): Promise<LiveCatalogSnapshot | null> {
  if (!supabase) return null;

  const [discRes, courseRes, modRes, lesRes, payRes, resRes] = await Promise.all([
    supabase.from('disciplines').select('*').order('created_at', { ascending: true }),
    supabase.from('courses').select('*').order('created_at', { ascending: false }),
    supabase.from('course_modules').select('*').order('sort_order', { ascending: true }),
    supabase.from('lessons').select('*').order('sort_order', { ascending: true }),
    supabase.from('course_payment_settings').select('*'),
    supabase.from('lesson_resources').select('*').order('created_at', { ascending: true }),
  ]);

  if (discRes.error || courseRes.error || !discRes.data || !courseRes.data) {
    return null;
  }

  const disciplineIdBySlug: Record<string, string> = {};
  const disciplineSlugById: Record<string, string> = {};

  const disciplines: PlatformDiscipline[] = discRes.data.map((d) => {
    disciplineIdBySlug[d.slug] = d.id;
    disciplineSlugById[d.id] = d.slug;
    return {
      slug: d.slug,
      name: { ar: d.name_ar, en: d.name_en },
      shortDescription: { ar: d.short_description_ar, en: d.short_description_en },
      overview: {
        ar: d.overview_ar || d.short_description_ar,
        en: d.overview_en || d.short_description_en,
      },
      highlights: Array.isArray(d.highlights) ? d.highlights : [],
      iconName: d.icon_name ?? 'compass',
      accent: d.accent ?? 'blue',
      featured: Boolean(d.featured),
      isActive: Boolean(d.is_active),
    };
  });

  interface DbPaymentSettingsRow {
    course_id: string;
    is_free?: boolean;
    price_amount?: number;
    currency?: string;
    payment_methods?: string[];
    payment_instructions_ar?: string;
    payment_instructions_en?: string;
    enrollment_open?: boolean;
  }

  const payByCourseId = new Map<string, DbPaymentSettingsRow>();
  ((payRes.data ?? []) as DbPaymentSettingsRow[]).forEach((p) => payByCourseId.set(p.course_id, p));

  const resourcesByLessonId = new Map<string, LessonResourceItem[]>();
  (resRes.data ?? []).forEach((r) => {
    const arr = resourcesByLessonId.get(r.lesson_id) ?? [];
    arr.push({
      id: r.id,
      title: { ar: r.title_ar ?? r.title_en ?? '', en: r.title_en ?? r.title_ar ?? '' },
      description: { ar: r.description_ar ?? '', en: r.description_en ?? '' },
      type: (r.resource_type as LessonResourceItem['type']) ?? 'pdf',
      fileNameOrUrl: r.external_url ?? r.storage_path ?? r.file_name ?? '',
      status: 'attached_demo',
    });
    resourcesByLessonId.set(r.lesson_id, arr);
  });

  const lessonsByModId = new Map<string, PlatformLesson[]>();
  (lesRes.data ?? []).forEach((l) => {
    const arr = lessonsByModId.get(l.module_id) ?? [];
    arr.push({
      id: l.id,
      title: { ar: l.title_ar, en: l.title_en },
      shortDescription: { ar: l.short_description_ar ?? '', en: l.short_description_en ?? '' },
      description: { ar: l.description_ar ?? '', en: l.description_en ?? '' },
      durationMinutes: l.duration_minutes ?? 15,
      lessonType: (l.lesson_type as LessonType) ?? 'video',
      videoProvider: l.video_provider ?? 'youtube_unlisted',
      videoUrl: l.video_url ?? undefined,
      videoSourceId: l.video_source_id ?? '',
      materialsNote: { ar: l.materials_note_ar ?? '', en: l.materials_note_en ?? '' },
      resources: [],
      lessonResources: resourcesByLessonId.get(l.id) ?? [],
      isPreview: Boolean(l.is_preview),
      status: l.status === 'approved' ? 'published' : l.status,
      rejectionReason: l.rejection_reason
        ? { ar: l.rejection_reason, en: l.rejection_reason }
        : undefined,
    });
    lessonsByModId.set(l.module_id, arr);
  });

  const modsByCourseId = new Map<string, PlatformModule[]>();
  (modRes.data ?? []).forEach((m) => {
    const arr = modsByCourseId.get(m.course_id) ?? [];
    arr.push({
      id: m.id,
      title: { ar: m.title_ar, en: m.title_en },
      description:
        m.description_ar || m.description_en
          ? { ar: m.description_ar ?? '', en: m.description_en ?? '' }
          : undefined,
      lessons: lessonsByModId.get(m.id) ?? [],
    });
    modsByCourseId.set(m.course_id, arr);
  });

  const courseIdBySlug: Record<string, string> = {};
  const courseSlugById: Record<string, string> = {};

  const courses: PlatformCourse[] = courseRes.data.map((c) => {
    courseIdBySlug[c.slug] = c.id;
    courseSlugById[c.id] = c.slug;
    const pay = payByCourseId.get(c.id);
    return {
      slug: c.slug,
      code: c.code,
      title: { ar: c.title_ar, en: c.title_en },
      shortDescription: { ar: c.short_description_ar ?? '', en: c.short_description_en ?? '' },
      fullDescription: { ar: c.full_description_ar ?? '', en: c.full_description_en ?? '' },
      disciplineSlug: disciplineSlugById[c.discipline_id] ?? 'software-technology',
      instructorSlugs: [],
      leadInstructorSlug: undefined,
      enrollmentManagerSlugs: [],
      pricing: {
        isFree: Boolean(pay?.is_free),
        priceAmount: Number(pay?.price_amount ?? 1500),
        currency: (pay?.currency as CourseCurrency) ?? 'EGP',
        paymentMethods: (pay?.payment_methods as PaymentMethodType[]) ?? [
          'vodafone_cash',
          'instapay',
          'bank_transfer',
        ],
        paymentInstructions: {
          ar:
            pay?.payment_instructions_ar ??
            'تواصل مع المدرب الرئيسي لتنسيق الدفع المباشر خارج المنصة.',
          en:
            pay?.payment_instructions_en ??
            'Contact the Lead Instructor to coordinate direct payment outside the platform.',
        },
        enrollmentOpen: pay?.enrollment_open ?? true,
      },
      level: (c.level as CourseLevel) ?? 'beginner',
      duration: { ar: c.duration_ar ?? '', en: c.duration_en ?? '' },
      language: c.language ?? 'bilingual',
      thumbnailUrl: c.thumbnail_url ?? undefined,
      accent: c.accent ?? 'blue',
      featured: Boolean(c.featured),
      status:
        c.status === 'published' ? 'published' : c.status === 'archived' ? 'archived' : 'draft',
      pendingApproval: c.status === 'pending_approval',
      suspended: Boolean(c.is_suspended),
      lastUpdated: { ar: 'متزامن مع قاعدة البيانات', en: 'Synced with Database' },
      whatYouWillLearn: Array.isArray(c.what_you_will_learn) ? c.what_you_will_learn : [],
      objectives: Array.isArray(c.objectives) ? c.objectives : [],
      requirements: Array.isArray(c.requirements) ? c.requirements : [],
      targetAudience: Array.isArray(c.target_audience) ? c.target_audience : [],
      modules: modsByCourseId.get(c.id) ?? [],
      resources: [],
    };
  });

  return {
    disciplines,
    courses,
    courseIdBySlug,
    courseSlugById,
    disciplineIdBySlug,
  };
}

// ============================================================================
// Enrollment & Direct Payment Transactional RPCs
// ============================================================================

export async function rpcSubmitEnrollment(courseId: string, studentMessage?: string) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_submit_enrollment_request', {
    p_course_id: courseId,
    p_student_message: studentMessage ?? null,
  });
}

export async function rpcAcceptEnrollment(requestId: string) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_accept_enrollment_for_payment', { p_request_id: requestId });
}

export async function rpcConfirmDirectPayment(requestId: string) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_confirm_direct_payment', {
    p_request_id: requestId,
    p_declaration_accepted: true,
  });
}

export async function rpcRejectEnrollment(requestId: string, reason?: string) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_reject_enrollment_request', {
    p_request_id: requestId,
    p_reason: reason ?? null,
  });
}

export async function rpcCancelEnrollment(requestId: string, reason?: string) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_cancel_enrollment_request', {
    p_request_id: requestId,
    p_reason: reason ?? null,
  });
}

export async function rpcAdminSuspendEnrollment(requestId: string, reason: string) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_admin_suspend_enrollment', {
    p_request_id: requestId,
    p_reason: reason,
  });
}

export async function rpcAdminReactivateEnrollment(requestId: string, reason: string) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_admin_reactivate_enrollment', {
    p_request_id: requestId,
    p_reason: reason,
  });
}

export async function rpcAdminOverrideEnrollment(
  requestId: string,
  newStatus: string,
  reason: string,
) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_admin_override_enrollment', {
    p_request_id: requestId,
    p_new_status: newStatus,
    p_reason: reason,
  });
}

export async function submitDisputeToDb(
  enrollmentRequestId: string,
  studentId: string,
  courseId: string,
  category: DisputeCategory,
  description: string,
) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.from('enrollment_disputes').insert({
    enrollment_request_id: enrollmentRequestId,
    student_id: studentId,
    course_id: courseId,
    category,
    description,
  });
}

export async function rpcResolveDispute(
  disputeId: string,
  resolutionNote: string,
  suspendAccess = false,
  refundConfirmed = false,
) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_resolve_enrollment_dispute', {
    p_dispute_id: disputeId,
    p_resolution_note: resolutionNote,
    p_suspend_access: suspendAccess,
    p_refund_confirmed: refundConfirmed,
  });
}

// ============================================================================
// Disciplines, Courses, Pricing & Proposals CRUD
// ============================================================================

export async function dbCreateDiscipline(input: {
  slug: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
}) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  return supabase
    .from('disciplines')
    .insert({
      slug: input.slug,
      name_ar: input.nameAr,
      name_en: input.nameEn,
      short_description_ar: input.descAr,
      short_description_en: input.descEn,
      overview_ar: input.descAr,
      overview_en: input.descEn,
    })
    .select('id, slug')
    .single();
}

export async function dbUpdateDiscipline(
  disciplineId: string,
  patch: Partial<{
    name_ar: string;
    name_en: string;
    short_description_ar: string;
    short_description_en: string;
    is_active: boolean;
    featured: boolean;
  }>,
) {
  if (!supabase || !isUuid(disciplineId)) return { error: null };
  return supabase.from('disciplines').update(patch).eq('id', disciplineId);
}

export async function dbDeleteDiscipline(disciplineId: string) {
  if (!supabase || !isUuid(disciplineId)) return { error: null };
  return supabase.from('disciplines').delete().eq('id', disciplineId);
}

export async function dbCreateCourse(input: {
  slug: string;
  code: string;
  disciplineId: string;
  titleAr: string;
  titleEn: string;
  shortDescAr: string;
  shortDescEn: string;
  level: CourseLevel;
  durationAr: string;
  durationEn: string;
  status: AdminCourseStatus;
  createdBy?: string;
}) {
  if (!supabase || !isUuid(input.disciplineId)) return { data: null, error: null };
  const res = await supabase
    .from('courses')
    .insert({
      slug: input.slug,
      code: input.code,
      discipline_id: input.disciplineId,
      title_ar: input.titleAr,
      title_en: input.titleEn,
      short_description_ar: input.shortDescAr,
      short_description_en: input.shortDescEn,
      full_description_ar: input.shortDescAr,
      full_description_en: input.shortDescEn,
      level: input.level,
      duration_ar: input.durationAr,
      duration_en: input.durationEn,
      status: input.status,
      created_by: input.createdBy ?? null,
    })
    .select('id, slug')
    .single();

  if (res.data?.id) {
    await supabase.from('course_payment_settings').insert({ course_id: res.data.id });
  }
  return res;
}

export async function dbUpdateCourse(
  courseId: string,
  patch: Record<string, unknown>,
) {
  if (!supabase || !isUuid(courseId)) return { error: null };
  return supabase.from('courses').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', courseId);
}

export async function dbUpdateCoursePricing(courseId: string, pricing: CoursePricingConfig) {
  if (!supabase || !isUuid(courseId)) return { error: null };
  return supabase.from('course_payment_settings').upsert(
    {
      course_id: courseId,
      is_free: pricing.isFree,
      price_amount: pricing.isFree ? 0 : pricing.priceAmount,
      currency: pricing.currency,
      payment_methods: pricing.paymentMethods,
      payment_instructions_ar: pricing.paymentInstructions.ar,
      payment_instructions_en: pricing.paymentInstructions.en,
      enrollment_open: pricing.enrollmentOpen,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'course_id' },
  );
}

export async function dbCreateCourseProposal(input: {
  proposingInstructorId: string;
  disciplineId: string;
  titleAr: string;
  titleEn: string;
  shortDescAr: string;
  shortDescEn: string;
  fullDescAr: string;
  fullDescEn: string;
  level: CourseLevel;
  durationAr: string;
  durationEn: string;
  language: string;
  thumbnailUrl?: string;
  suggestedPriceAr: string;
  suggestedPriceEn: string;
  enrollmentNotesAr: string;
  enrollmentNotesEn: string;
  status: 'draft' | 'pending_approval';
}) {
  if (!supabase || !isUuid(input.disciplineId)) return { data: null, error: null };
  return supabase
    .from('course_proposals')
    .insert({
      proposing_instructor_id: input.proposingInstructorId,
      discipline_id: input.disciplineId,
      title_ar: input.titleAr,
      title_en: input.titleEn,
      short_description_ar: input.shortDescAr,
      short_description_en: input.shortDescEn,
      full_description_ar: input.fullDescAr,
      full_description_en: input.fullDescEn,
      level: input.level,
      duration_ar: input.durationAr,
      duration_en: input.durationEn,
      language: input.language,
      thumbnail_url: input.thumbnailUrl ?? null,
      suggested_price_ar: input.suggestedPriceAr,
      suggested_price_en: input.suggestedPriceEn,
      enrollment_notes_ar: input.enrollmentNotesAr,
      enrollment_notes_en: input.enrollmentNotesEn,
      status: input.status,
    })
    .select('id')
    .single();
}

export async function rpcApproveCourseProposal(proposalId: string) {
  if (!supabase || !isUuid(proposalId)) return { data: null, error: null };
  return supabase.rpc('rpc_approve_course_proposal', { p_proposal_id: proposalId });
}

export async function rpcRejectCourseProposal(proposalId: string, reason?: string) {
  if (!supabase || !isUuid(proposalId)) return { error: null };
  return supabase.rpc('rpc_reject_course_proposal', {
    p_proposal_id: proposalId,
    p_reason: reason ?? null,
  });
}

// ============================================================================
// Instructor Curriculum, Modules, Lessons, Ordering & Revisions CRUD
// ============================================================================

export async function dbCreateModule(
  courseId: string,
  titleAr: string,
  titleEn: string,
  sortOrder: number,
  descAr = '',
  descEn = '',
) {
  if (!supabase || !isUuid(courseId)) return { data: null, error: null };
  return supabase
    .from('course_modules')
    .insert({
      course_id: courseId,
      title_ar: titleAr,
      title_en: titleEn,
      description_ar: descAr,
      description_en: descEn,
      sort_order: sortOrder,
    })
    .select('id')
    .single();
}

export async function dbUpdateModule(
  moduleId: string,
  patch: Partial<{ title_ar: string; title_en: string; description_ar: string; description_en: string; sort_order: number }>,
) {
  if (!supabase || !isUuid(moduleId)) return { error: null };
  return supabase
    .from('course_modules')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', moduleId);
}

export async function dbDeleteModule(moduleId: string) {
  if (!supabase || !isUuid(moduleId)) return { error: null };
  return supabase.from('course_modules').delete().eq('id', moduleId);
}

export async function dbReorderModules(orderedModuleIds: string[]) {
  if (!supabase) return;
  const valid = orderedModuleIds.filter((id) => isUuid(id));
  await Promise.all(
    valid.map((id, idx) =>
      supabase!.from('course_modules').update({ sort_order: idx + 1 }).eq('id', id),
    ),
  );
}

export async function dbCreateLesson(input: {
  courseId: string;
  moduleId: string;
  titleAr: string;
  titleEn: string;
  lessonType: LessonType;
  sortOrder: number;
  status?: 'draft' | 'pending_approval' | 'published';
}) {
  if (!supabase || !isUuid(input.courseId) || !isUuid(input.moduleId)) {
    return { data: null, error: null };
  }
  return supabase
    .from('lessons')
    .insert({
      course_id: input.courseId,
      module_id: input.moduleId,
      title_ar: input.titleAr,
      title_en: input.titleEn,
      lesson_type: input.lessonType,
      sort_order: input.sortOrder,
      status: input.status ?? 'draft',
    })
    .select('id')
    .single();
}

export async function dbUpdateLesson(lessonId: string, patch: Record<string, unknown>) {
  if (!supabase || !isUuid(lessonId)) return { error: null };
  return supabase
    .from('lessons')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', lessonId);
}

export async function dbDeleteLesson(lessonId: string) {
  if (!supabase || !isUuid(lessonId)) return { error: null };
  return supabase.from('lessons').delete().eq('id', lessonId);
}

export async function dbReorderLessons(moduleId: string, orderedLessonIds: string[]) {
  if (!supabase || !isUuid(moduleId)) return;
  const valid = orderedLessonIds.filter((id) => isUuid(id));
  await Promise.all(
    valid.map((id, idx) =>
      supabase!
        .from('lessons')
        .update({ module_id: moduleId, sort_order: idx + 1, updated_at: new Date().toISOString() })
        .eq('id', id),
    ),
  );
}

export async function dbCreateLessonRevision(input: {
  lessonId: string;
  courseId: string;
  submittedBy: string;
  titleAr: string;
  titleEn: string;
  shortDescAr: string;
  shortDescEn: string;
  descAr: string;
  descEn: string;
  lessonType: LessonType;
  videoProvider: string;
  videoUrl?: string;
  videoSourceId: string;
  durationMinutes: number;
  materialsNoteAr: string;
  materialsNoteEn: string;
  isPreview: boolean;
  status: 'draft' | 'pending_approval';
}) {
  if (!supabase || !isUuid(input.lessonId) || !isUuid(input.courseId)) {
    return { data: null, error: null };
  }
  return supabase
    .from('lesson_revisions')
    .insert({
      lesson_id: input.lessonId,
      course_id: input.courseId,
      submitted_by: input.submittedBy,
      title_ar: input.titleAr,
      title_en: input.titleEn,
      short_description_ar: input.shortDescAr,
      short_description_en: input.shortDescEn,
      description_ar: input.descAr,
      description_en: input.descEn,
      lesson_type: input.lessonType,
      video_provider: input.videoProvider,
      video_url: input.videoUrl ?? null,
      video_source_id: input.videoSourceId,
      duration_minutes: input.durationMinutes,
      materials_note_ar: input.materialsNoteAr,
      materials_note_en: input.materialsNoteEn,
      is_preview: input.isPreview,
      status: input.status,
    })
    .select('id')
    .single();
}

export async function rpcApproveLessonRevision(revisionId: string) {
  if (!supabase || !isUuid(revisionId)) return { error: null };
  return supabase.rpc('rpc_approve_lesson_revision', { p_revision_id: revisionId });
}

export async function rpcRejectLessonRevision(revisionId: string, reason?: string) {
  if (!supabase || !isUuid(revisionId)) return { error: null };
  return supabase.rpc('rpc_reject_lesson_revision', {
    p_revision_id: revisionId,
    p_reason: reason ?? null,
  });
}

// ============================================================================
// Student Progress, Playback Position & Notes
// ============================================================================

export async function rpcUpsertLessonProgress(input: {
  courseId: string;
  lessonId: string;
  isCompleted?: boolean;
  playbackSeconds?: number;
  notes?: string;
}) {
  if (!supabase || !isUuid(input.courseId) || !isUuid(input.lessonId)) {
    return { data: null, error: null };
  }
  return supabase.rpc('rpc_upsert_lesson_progress', {
    p_course_id: input.courseId,
    p_lesson_id: input.lessonId,
    p_is_completed: input.isCompleted ?? null,
    p_playback_seconds: input.playbackSeconds ?? null,
    p_notes: input.notes ?? null,
  });
}

// ============================================================================
// Community Posts, Comments, Moderation, Direct Messaging & Announcements
// ============================================================================

export async function dbCreateCommunityPost(input: {
  courseId: string;
  authorId: string;
  content: string;
  title?: string;
  isAnnouncement?: boolean;
}) {
  if (!supabase || !isUuid(input.courseId)) return { data: null, error: null };
  return supabase
    .from('course_community_posts')
    .insert({
      course_id: input.courseId,
      author_id: input.authorId,
      title: input.title ?? null,
      content: input.content,
      is_announcement: Boolean(input.isAnnouncement),
    })
    .select('id')
    .single();
}

export async function dbCreateCommunityComment(input: {
  postId: string;
  courseId: string;
  authorId: string;
  content: string;
}) {
  if (!supabase || !isUuid(input.postId) || !isUuid(input.courseId)) {
    return { data: null, error: null };
  }
  return supabase
    .from('community_comments')
    .insert({
      post_id: input.postId,
      course_id: input.courseId,
      author_id: input.authorId,
      content: input.content,
    })
    .select('id')
    .single();
}

export async function dbModerateCommunityPost(
  postId: string,
  patch: Partial<{ is_hidden: boolean; is_pinned: boolean; is_reported: boolean }>,
  moderationLog?: { courseId?: string; moderatorId: string; actionType: string; reason?: string },
) {
  if (!supabase || !isUuid(postId)) return { error: null };
  const res = await supabase
    .from('course_community_posts')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', postId);

  if (!res.error && moderationLog) {
    await supabase.from('community_moderation_actions').insert({
      course_id: moderationLog.courseId && isUuid(moderationLog.courseId) ? moderationLog.courseId : null,
      post_id: postId,
      moderator_id: moderationLog.moderatorId,
      action_type: moderationLog.actionType,
      reason: moderationLog.reason ?? null,
    });
  }
  return res;
}

export async function dbDeleteCommunityPost(postId: string) {
  if (!supabase || !isUuid(postId)) return { error: null };
  return supabase.from('course_community_posts').delete().eq('id', postId);
}

export async function rpcCreateOrGetConversation(courseId: string, otherUserId: string) {
  if (!supabase || !isUuid(courseId) || !isUuid(otherUserId)) {
    return { data: null, error: new Error('Invalid conversation parameters') };
  }
  return supabase.rpc('rpc_create_or_get_conversation', {
    p_course_id: courseId,
    p_other_user_id: otherUserId,
  });
}

export async function dbSendMessage(conversationId: string, senderId: string, content: string) {
  if (!supabase || !isUuid(conversationId)) return { data: null, error: null };
  return supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select('id, created_at')
    .single();
}

export async function dbMarkConversationRead(conversationId: string, userId: string) {
  if (!supabase || !isUuid(conversationId)) return { error: null };
  return supabase
    .from('conversation_participants')
    .update({ unread_count: 0 })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
}

export async function dbCreateAnnouncement(input: {
  courseId: string;
  authorId: string;
  title: string;
  body: string;
  status: 'draft' | 'published';
}) {
  if (!supabase || !isUuid(input.courseId)) return { data: null, error: null };
  return supabase
    .from('announcements')
    .insert({
      course_id: input.courseId,
      author_id: input.authorId,
      title: input.title,
      body: input.body,
      status: input.status,
      published_at: input.status === 'published' ? new Date().toISOString() : null,
    })
    .select('id')
    .single();
}

export async function dbPublishAnnouncement(announcementId: string) {
  if (!supabase || !isUuid(announcementId)) return { error: null };
  return supabase
    .from('announcements')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', announcementId);
}

// ============================================================================
// Notifications, Preferences, Reviews, Settings & Analytics
// ============================================================================

export async function dbMarkNotificationRead(notificationId: string) {
  if (!supabase || !isUuid(notificationId)) return { error: null };
  return supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
}

export async function dbMarkAllNotificationsRead(userId: string) {
  if (!supabase || !isUuid(userId)) return { error: null };
  return supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
}

export async function dbUpsertNotificationPreferences(
  userId: string,
  prefs: Partial<{
    new_lessons: boolean;
    instructor_announcements: boolean;
    community_replies: boolean;
    direct_messages: boolean;
    weekly_summary: boolean;
  }>,
) {
  if (!supabase || !isUuid(userId)) return { error: null };
  return supabase.from('notification_preferences').upsert(
    {
      user_id: userId,
      ...prefs,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
}

export async function dbSubmitCourseReview(input: {
  courseId: string;
  studentId: string;
  rating: number;
  comment: string;
}) {
  if (!supabase || !isUuid(input.courseId)) return { data: null, error: null };
  return supabase
    .from('course_reviews')
    .upsert(
      {
        course_id: input.courseId,
        student_id: input.studentId,
        rating: Math.max(1, Math.min(5, Math.round(input.rating))),
        comment: input.comment,
        status: 'pending',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'course_id,student_id' },
    )
    .select('id')
    .single();
}

export async function dbModerateCourseReview(
  reviewId: string,
  status: ReviewStatus,
  note?: string,
) {
  if (!supabase || !isUuid(reviewId)) return { error: null };
  return supabase
    .from('course_reviews')
    .update({ status, moderation_note: note ?? null, updated_at: new Date().toISOString() })
    .eq('id', reviewId);
}

export async function dbDeleteCourseReview(reviewId: string) {
  if (!supabase || !isUuid(reviewId)) return { error: null };
  return supabase.from('course_reviews').delete().eq('id', reviewId);
}

export async function dbUpsertInstructorResponse(
  reviewId: string,
  instructorId: string,
  responseText: string,
) {
  if (!supabase || !isUuid(reviewId)) return { error: null };
  return supabase.from('instructor_responses').upsert(
    {
      review_id: reviewId,
      instructor_id: instructorId,
      response_text: responseText,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'review_id' },
  );
}

export async function dbUpdatePlatformSettings(patch: Record<string, unknown>) {
  if (!supabase) return { error: null };
  return supabase
    .from('platform_settings')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', 1);
}

export async function dbUpdateProfileAccountStatus(
  userId: string,
  status: 'active' | 'inactive' | 'suspended' | 'revoked',
) {
  if (!supabase || !isUuid(userId)) return { error: null };
  return supabase
    .from('profiles')
    .update({ account_status: status, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

export async function dbLogAnalyticsEvent(
  userId: string,
  eventName: string,
  courseId?: string,
  metadata: Record<string, unknown> = {},
) {
  if (!supabase || !isUuid(userId)) return { error: null };
  return supabase.from('analytics_events').insert({
    user_id: userId,
    course_id: courseId && isUuid(courseId) ? courseId : null,
    event_name: eventName,
    metadata,
  });
}

// ============================================================================
// Private Storage Helpers (Client Validation + Signed URLs)
// ============================================================================

export async function uploadCourseResourceFile(courseId: string, file: File) {
  if (!supabase) return { path: null, error: new Error('Supabase not configured') };
  if (file.size > RESOURCE_MAX_BYTES) {
    return { path: null, error: new Error('File exceeds 25 MB limit') };
  }
  if (!RESOURCE_ALLOWED_MIME.has(file.type)) {
    return { path: null, error: new Error(`Unsupported file type: ${file.type || 'unknown'}`) };
  }
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const path = `${courseId}/${safeName}`;
  const { error } = await supabase.storage.from('course-resources').upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  return { path: error ? null : path, error };
}

export async function uploadCommunityAttachmentFile(courseId: string, file: File) {
  if (!supabase) return { path: null, error: new Error('Supabase not configured') };
  if (file.size > COMMUNITY_MAX_BYTES) {
    return { path: null, error: new Error('Attachment exceeds 10 MB limit') };
  }
  if (!COMMUNITY_ALLOWED_MIME.has(file.type)) {
    return { path: null, error: new Error(`Unsupported attachment type: ${file.type || 'unknown'}`) };
  }
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const path = `${courseId}/${safeName}`;
  const { error } = await supabase.storage.from('community-attachments').upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  return { path: error ? null : path, error };
}

export async function getSignedResourceUrl(storagePath: string, expiresInSeconds = 300) {
  if (!supabase) return { url: null, error: new Error('Supabase not configured') };
  const { data, error } = await supabase.storage
    .from('course-resources')
    .createSignedUrl(storagePath, expiresInSeconds);
  return { url: data?.signedUrl ?? null, error };
}

export async function getSignedCommunityAttachmentUrl(storagePath: string, expiresInSeconds = 300) {
  if (!supabase) return { url: null, error: new Error('Supabase not configured') };
  const { data, error } = await supabase.storage
    .from('community-attachments')
    .createSignedUrl(storagePath, expiresInSeconds);
  return { url: data?.signedUrl ?? null, error };
}

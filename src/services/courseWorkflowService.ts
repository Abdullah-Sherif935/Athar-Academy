import { supabase } from '../lib/supabase';
import type {
  CourseCurrency,
  CourseLanguage,
  LessonResourceItem,
  LessonResourceType,
  PaymentMethodType,
} from '../data/mock/admin';
import type { BilingualText, CourseLevel } from '../data/mock/types';
import { isUuid, uploadCourseResourceFile } from './lmsService';

export interface CreateDraftCourseInput {
  disciplineId: string;
  titleAr: string;
  titleEn: string;
  shortDescAr: string;
  shortDescEn: string;
  fullDescAr?: string;
  fullDescEn?: string;
  level: CourseLevel;
  language: CourseLanguage;
  durationAr: string;
  durationEn: string;
  thumbnailUrl?: string;
  whatYouWillLearn: BilingualText[];
  objectives: BilingualText[];
  requirements: BilingualText[];
  targetAudience: BilingualText[];
  isFree: boolean;
  priceAmount: number;
  currency: CourseCurrency;
  paymentMethods: PaymentMethodType[];
  paymentInstructionsAr: string;
  paymentInstructionsEn: string;
  enrollmentOpen: boolean;
}

export interface PendingAdminCourseReview {
  id: string;
  slug: string;
  code: string;
  title: BilingualText;
  shortDescription: BilingualText;
  fullDescription: BilingualText;
  level: CourseLevel;
  language: string;
  duration: BilingualText;
  thumbnailUrl: string | null;
  status: string;
  rejectionReason: string | null;
  leadInstructorName: BilingualText;
  leadInstructorEmail: string;
  pricing: {
    isFree: boolean;
    priceAmount: number;
    currency: string;
    paymentMethods: string[];
    paymentInstructionsAr: string;
    paymentInstructionsEn: string;
    enrollmentOpen: boolean;
  };
  modules: Array<{
    id: string;
    title: BilingualText;
    description: BilingualText;
    sortOrder: number;
    lessons: Array<{
      id: string;
      title: BilingualText;
      description: BilingualText;
      lessonType: string;
      videoProvider: string;
      videoUrl: string | null;
      videoSourceId: string;
      durationMinutes: number;
      isPreview: boolean;
      status: string;
      resources: LessonResourceItem[];
    }>;
  }>;
}

export async function instructorCreateDraftCourse(input: CreateDraftCourseInput): Promise<{
  data: { courseId: string; slug: string; code: string } | null;
  error: string | null;
}> {
  if (!supabase) return { data: null, error: 'Supabase is not configured.' };
  const { data, error } = await supabase.rpc('rpc_instructor_create_draft_course', {
    p_discipline_id: input.disciplineId,
    p_title_ar: input.titleAr,
    p_title_en: input.titleEn,
    p_short_desc_ar: input.shortDescAr,
    p_short_desc_en: input.shortDescEn,
    p_full_desc_ar: input.fullDescAr ?? '',
    p_full_desc_en: input.fullDescEn ?? '',
    p_level: input.level,
    p_language: input.language,
    p_duration_ar: input.durationAr,
    p_duration_en: input.durationEn,
    p_thumbnail_url: input.thumbnailUrl ?? null,
    p_what_you_will_learn: input.whatYouWillLearn,
    p_objectives: input.objectives,
    p_requirements: input.requirements,
    p_target_audience: input.targetAudience,
    p_is_free: input.isFree,
    p_price_amount: input.isFree ? 0 : input.priceAmount,
    p_currency: input.currency,
    p_payment_methods: input.paymentMethods,
    p_payment_instructions_ar: input.paymentInstructionsAr,
    p_payment_instructions_en: input.paymentInstructionsEn,
    p_enrollment_open: input.enrollmentOpen,
  });

  if (error) return { data: null, error: error.message };
  const row = (Array.isArray(data) ? data[0] : data) as
    | { course_id: string; slug: string; code: string }
    | undefined;
  if (!row?.course_id) return { data: null, error: 'Failed to create course.' };
  return {
    data: { courseId: row.course_id, slug: row.slug, code: row.code },
    error: null,
  };
}

export async function instructorSubmitCourseForReview(courseId: string): Promise<{
  error: string | null;
}> {
  if (!supabase || !isUuid(courseId)) {
    return { error: 'Invalid course ID or Supabase not configured.' };
  }
  const { error } = await supabase.rpc('rpc_instructor_submit_course_for_review', {
    p_course_id: courseId,
  });
  return { error: error ? error.message : null };
}

export async function adminApproveSubmittedCourse(
  courseId: string,
  publishImmediately = false,
): Promise<{ status: string | null; error: string | null }> {
  if (!supabase || !isUuid(courseId)) {
    return { status: null, error: 'Invalid course ID.' };
  }
  const { data, error } = await supabase.rpc('rpc_admin_approve_course', {
    p_course_id: courseId,
    p_publish_immediately: publishImmediately,
  });
  return { status: (data as string) ?? null, error: error ? error.message : null };
}

export async function adminRejectSubmittedCourse(
  courseId: string,
  reason: string,
): Promise<{ error: string | null }> {
  if (!supabase || !isUuid(courseId)) {
    return { error: 'Invalid course ID.' };
  }
  const { error } = await supabase.rpc('rpc_admin_reject_course', {
    p_course_id: courseId,
    p_reason: reason,
  });
  return { error: error ? error.message : null };
}

/**
 * Uploads a private resource file to `course-resources/<courseId>/...` and persists metadata in `lesson_resources`.
 */
export async function uploadAndAttachLessonResource(input: {
  courseId: string;
  lessonId: string;
  title: string;
  description: string;
  resourceType: LessonResourceType;
  file?: File;
  externalUrl?: string;
  sortOrder?: number;
}): Promise<{ item: LessonResourceItem | null; error: string | null }> {
  if (!supabase || !isUuid(input.courseId) || !isUuid(input.lessonId)) {
    return { item: null, error: 'Course and lesson must be saved in Supabase before attaching files.' };
  }

  let storagePath: string | null = null;
  let fileName: string | null = null;
  let fileSizeBytes: number | null = null;
  let externalUrl: string | null = null;

  if (input.file) {
    const up = await uploadCourseResourceFile(input.courseId, input.file);
    if (up.error || !up.path) {
      return { item: null, error: up.error?.message || 'File upload failed.' };
    }
    storagePath = up.path;
    fileName = input.file.name;
    fileSizeBytes = input.file.size;
  } else if (input.externalUrl?.trim()) {
    externalUrl = input.externalUrl.trim();
    fileName = externalUrl;
  } else {
    return { item: null, error: 'Please select a file to upload or enter an external URL.' };
  }

  const { data, error } = await supabase
    .from('lesson_resources')
    .insert({
      course_id: input.courseId,
      lesson_id: input.lessonId,
      title_ar: input.title.trim(),
      title_en: input.title.trim(),
      description_ar: input.description.trim(),
      description_en: input.description.trim(),
      resource_type: input.resourceType,
      storage_path: storagePath,
      external_url: externalUrl,
      file_name: fileName,
      file_size_bytes: fileSizeBytes,
      sort_order: input.sortOrder ?? 0,
    })
    .select('id, storage_path, external_url, file_name')
    .single();

  if (error || !data) {
    return { item: null, error: error?.message || 'Failed to save resource metadata.' };
  }

  return {
    item: {
      id: data.id,
      title: { ar: input.title.trim(), en: input.title.trim() },
      description: { ar: input.description.trim(), en: input.description.trim() },
      type: input.resourceType,
      fileNameOrUrl: data.external_url ?? data.storage_path ?? data.file_name ?? '',
      status: 'attached_demo',
    },
    error: null,
  };
}

export async function deleteLessonResourceFromDb(resourceId: string): Promise<{ error: string | null }> {
  if (!supabase || !isUuid(resourceId)) return { error: null };
  const { error } = await supabase.from('lesson_resources').delete().eq('id', resourceId);
  return { error: error ? error.message : null };
}

/**
 * Fetches real courses with status = 'pending_approval' (plus full curriculum, pricing, resources, and Lead Instructor)
 * for Super Admin review on /admin/approvals.
 */
export async function fetchPendingCoursesForAdmin(): Promise<{
  courses: PendingAdminCourseReview[];
  error: string | null;
}> {
  if (!supabase) return { courses: [], error: 'Supabase not configured.' };

  const { data: courseRows, error: cErr } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'pending_approval')
    .order('updated_at', { ascending: false });

  if (cErr) return { courses: [], error: cErr.message };
  if (!courseRows || courseRows.length === 0) return { courses: [], error: null };

  const courseIds = courseRows.map((c) => c.id);

  const [modRes, lesRes, resRes, payRes, instRes] = await Promise.all([
    supabase
      .from('course_modules')
      .select('*')
      .in('course_id', courseIds)
      .order('sort_order', { ascending: true }),
    supabase
      .from('lessons')
      .select('*')
      .in('course_id', courseIds)
      .order('sort_order', { ascending: true }),
    supabase
      .from('lesson_resources')
      .select('*')
      .in('course_id', courseIds)
      .order('sort_order', { ascending: true }),
    supabase.from('course_payment_settings').select('*').in('course_id', courseIds),
    supabase
      .from('course_instructors')
      .select('course_id, role, profiles:instructor_id (full_name_ar, full_name_en, email)')
      .in('course_id', courseIds),
  ]);

  const resourcesByLesson = new Map<string, LessonResourceItem[]>();
  (resRes.data ?? []).forEach((r) => {
    const arr = resourcesByLesson.get(r.lesson_id) ?? [];
    arr.push({
      id: r.id,
      title: { ar: r.title_ar ?? '', en: r.title_en ?? '' },
      description: { ar: r.description_ar ?? '', en: r.description_en ?? '' },
      type: (r.resource_type as LessonResourceType) ?? 'pdf',
      fileNameOrUrl: r.external_url ?? r.storage_path ?? r.file_name ?? '',
      status: 'attached_demo',
    });
    resourcesByLesson.set(r.lesson_id, arr);
  });

  const lessonsByModule = new Map<string, PendingAdminCourseReview['modules'][number]['lessons']>();
  (lesRes.data ?? []).forEach((l) => {
    const arr = lessonsByModule.get(l.module_id) ?? [];
    arr.push({
      id: l.id,
      title: { ar: l.title_ar, en: l.title_en },
      description: { ar: l.description_ar ?? '', en: l.description_en ?? '' },
      lessonType: l.lesson_type ?? 'video',
      videoProvider: l.video_provider ?? 'youtube_unlisted',
      videoUrl: l.video_url ?? null,
      videoSourceId: l.video_source_id ?? '',
      durationMinutes: l.duration_minutes ?? 15,
      isPreview: Boolean(l.is_preview),
      status: l.status,
      resources: resourcesByLesson.get(l.id) ?? [],
    });
    lessonsByModule.set(l.module_id, arr);
  });

  const modulesByCourse = new Map<string, PendingAdminCourseReview['modules']>();
  (modRes.data ?? []).forEach((m) => {
    const arr = modulesByCourse.get(m.course_id) ?? [];
    arr.push({
      id: m.id,
      title: { ar: m.title_ar, en: m.title_en },
      description: { ar: m.description_ar ?? '', en: m.description_en ?? '' },
      sortOrder: m.sort_order ?? 0,
      lessons: lessonsByModule.get(m.id) ?? [],
    });
    modulesByCourse.set(m.course_id, arr);
  });

  const payByCourse = new Map<string, Record<string, unknown>>();
  (payRes.data ?? []).forEach((p) => payByCourse.set(p.course_id, p));

  const leadByCourse = new Map<string, { name: BilingualText; email: string }>();
  (instRes.data ?? []).forEach((ci) => {
    if (ci.role !== 'lead' && leadByCourse.has(ci.course_id)) return;
    const p = (Array.isArray(ci.profiles) ? ci.profiles[0] : ci.profiles) as
      | { full_name_ar?: string; full_name_en?: string; email?: string }
      | null;
    if (p) {
      leadByCourse.set(ci.course_id, {
        name: { ar: p.full_name_ar || p.full_name_en || '', en: p.full_name_en || p.full_name_ar || '' },
        email: p.email ?? '',
      });
    }
  });

  const result: PendingAdminCourseReview[] = courseRows.map((c) => {
    const pay = payByCourse.get(c.id);
    const lead = leadByCourse.get(c.id);
    return {
      id: c.id,
      slug: c.slug,
      code: c.code,
      title: { ar: c.title_ar, en: c.title_en },
      shortDescription: { ar: c.short_description_ar ?? '', en: c.short_description_en ?? '' },
      fullDescription: { ar: c.full_description_ar ?? '', en: c.full_description_en ?? '' },
      level: (c.level as CourseLevel) ?? 'beginner',
      language: c.language ?? 'bilingual',
      duration: { ar: c.duration_ar ?? '', en: c.duration_en ?? '' },
      thumbnailUrl: c.thumbnail_url ?? null,
      status: c.status,
      rejectionReason: c.rejection_reason ?? null,
      leadInstructorName: lead?.name ?? { ar: 'مدرب', en: 'Instructor' },
      leadInstructorEmail: lead?.email ?? '',
      pricing: {
        isFree: Boolean(pay?.is_free),
        priceAmount: Number(pay?.price_amount ?? 0),
        currency: String(pay?.currency ?? 'EGP'),
        paymentMethods: Array.isArray(pay?.payment_methods) ? (pay.payment_methods as string[]) : [],
        paymentInstructionsAr: String(pay?.payment_instructions_ar ?? ''),
        paymentInstructionsEn: String(pay?.payment_instructions_en ?? ''),
        enrollmentOpen: pay?.enrollment_open !== false,
      },
      modules: modulesByCourse.get(c.id) ?? [],
    };
  });

  return { courses: result, error: null };
}

import { supabase } from '../lib/supabase';
import type {
  CourseCurrency,
  DisputeCategory,
  PaymentMethodType,
  PlatformCourse,
  PlatformDiscipline,
  PlatformLesson,
  PlatformModule,
} from '../data/mock/admin';
import type { CourseLevel } from '../data/mock/types';

export interface LiveCatalogSnapshot {
  disciplines: PlatformDiscipline[];
  courses: PlatformCourse[];
  courseIdBySlug: Record<string, string>;
  courseSlugById: Record<string, string>;
  disciplineIdBySlug: Record<string, string>;
}

/**
 * Fetches live public/authorized catalog data from Supabase PostgreSQL.
 * Returns null if Supabase is not configured or query fails.
 */
export async function fetchLiveCatalog(): Promise<LiveCatalogSnapshot | null> {
  if (!supabase) return null;

  const [discRes, courseRes, modRes, lesRes, payRes] = await Promise.all([
    supabase.from('disciplines').select('*').order('created_at', { ascending: true }),
    supabase.from('courses').select('*').order('created_at', { ascending: false }),
    supabase.from('course_modules').select('*').order('sort_order', { ascending: true }),
    supabase.from('lessons').select('*').order('sort_order', { ascending: true }),
    supabase.from('course_payment_settings').select('*'),
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
      overview: { ar: d.overview_ar || d.short_description_ar, en: d.overview_en || d.short_description_en },
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

  const lessonsByModId = new Map<string, PlatformLesson[]>();
  (lesRes.data ?? []).forEach((l) => {
    const arr = lessonsByModId.get(l.module_id) ?? [];
    arr.push({
      id: l.id,
      title: { ar: l.title_ar, en: l.title_en },
      shortDescription: { ar: l.short_description_ar ?? '', en: l.short_description_en ?? '' },
      description: { ar: l.description_ar ?? '', en: l.description_en ?? '' },
      durationMinutes: l.duration_minutes ?? 15,
      lessonType: l.lesson_type ?? 'video',
      videoProvider: l.video_provider ?? 'youtube_unlisted',
      videoUrl: l.video_url ?? undefined,
      videoSourceId: l.video_source_id ?? '',
      materialsNote: { ar: l.materials_note_ar ?? '', en: l.materials_note_en ?? '' },
      resources: [],
      lessonResources: [],
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
      description: m.description_ar || m.description_en
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
      status: c.status === 'published' ? 'published' : c.status === 'archived' ? 'archived' : 'draft',
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

// Transactional RPC wrappers
export async function rpcSubmitEnrollment(courseId: string, studentMessage?: string) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_submit_enrollment_request', {
    p_course_id: courseId,
    p_student_message: studentMessage ?? null,
  });
}

export async function rpcAcceptEnrollment(requestId: string) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_accept_enrollment_for_payment', { p_request_id: requestId });
}

export async function rpcConfirmDirectPayment(requestId: string) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_confirm_direct_payment', {
    p_request_id: requestId,
    p_declaration_accepted: true,
  });
}

export async function rpcRejectEnrollment(requestId: string, reason?: string) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_reject_enrollment_request', {
    p_request_id: requestId,
    p_reason: reason ?? null,
  });
}

export async function rpcAdminSuspendEnrollment(requestId: string, reason: string) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_admin_suspend_enrollment', {
    p_request_id: requestId,
    p_reason: reason,
  });
}

export async function rpcAdminReactivateEnrollment(requestId: string, reason: string) {
  if (!supabase) return { error: new Error('Supabase not configured') };
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
  if (!supabase) return { error: new Error('Supabase not configured') };
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

// Private Storage helper (signed URLs for authorized learners/instructors)
export async function uploadCourseResourceFile(courseId: string, file: File) {
  if (!supabase) return { path: null, error: new Error('Supabase not configured') };
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const path = `${courseId}/${safeName}`;
  const { error } = await supabase.storage.from('course-resources').upload(path, file, {
    upsert: false,
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

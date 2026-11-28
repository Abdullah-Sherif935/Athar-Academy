import { supabase } from '../lib/supabase';
import type { BilingualText } from '../data/mock/types';

export type RealAccountStatus = 'active' | 'inactive' | 'suspended' | 'revoked';
export type InvitationStatus = 'pending' | 'accepted' | 'active';

export interface RealInstructorAssignment {
  courseId: string;
  courseSlug: string;
  courseCode: string;
  courseTitle: BilingualText;
  courseStatus: string;
  role: 'lead' | 'co_instructor';
  canConfirmPayments: boolean;
}

export interface RealAdminAuditEvent {
  id: string;
  actionType: string;
  courseId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface RealInstructorRecord {
  userId: string;
  slug: string;
  email: string;
  fullName: BilingualText;
  initials: string;
  avatarUrl: string | null;
  title: BilingualText;
  shortBio: BilingualText;
  biography: BilingualText;
  expertise: BilingualText[];
  accountStatus: RealAccountStatus;
  invitationStatus: InvitationStatus;
  invitedAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
  assignments: RealInstructorAssignment[];
}

export interface CreateRealInstructorInput {
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  titleAr?: string;
  titleEn?: string;
  bioAr?: string;
  bioEn?: string;
  specializations?: string[];
  avatarUrl?: string;
  accountStatus?: 'active' | 'inactive' | 'suspended';
}

export interface CreateRealInstructorResult {
  ok: boolean;
  userId?: string;
  slug?: string;
  email?: string;
  deliveryMethod?: 'email_invite' | 'setup_link';
  setupLink?: string | null;
  inviteWarning?: string | null;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Fetches all real instructors from Supabase (profiles + instructor_profiles + course_instructors).
 * Requires authenticated Super Admin session (enforced server-side by RLS).
 */
export async function fetchRealInstructors(): Promise<{
  instructors: RealInstructorRecord[];
  error: string | null;
}> {
  if (!supabase) return { instructors: [], error: 'Supabase is not configured.' };

  const [instRes, assignRes, coursesRes] = await Promise.all([
    supabase
      .from('instructor_profiles')
      .select(
        `
        user_id,
        slug,
        title_ar,
        title_en,
        short_bio_ar,
        short_bio_en,
        biography_ar,
        biography_en,
        expertise,
        invitation_status,
        invited_at,
        accepted_at,
        created_at,
        profiles:user_id (
          id,
          email,
          full_name_ar,
          full_name_en,
          initials,
          avatar_url,
          account_status,
          created_at
        )
      `,
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('course_instructors')
      .select('course_id, instructor_id, role, can_confirm_payments'),
    supabase.from('courses').select('id, slug, code, title_ar, title_en, status'),
  ]);

  if (instRes.error) {
    return { instructors: [], error: instRes.error.message };
  }

  const courseById = new Map<
    string,
    { id: string; slug: string; code: string; title_ar: string; title_en: string; status: string }
  >();
  (coursesRes.data ?? []).forEach((c) => courseById.set(c.id, c));

  const assignmentsByInstructor = new Map<string, RealInstructorAssignment[]>();
  (assignRes.data ?? []).forEach((a) => {
    const course = courseById.get(a.course_id);
    if (!course) return;
    const list = assignmentsByInstructor.get(a.instructor_id) ?? [];
    list.push({
      courseId: course.id,
      courseSlug: course.slug,
      courseCode: course.code,
      courseTitle: { ar: course.title_ar, en: course.title_en },
      courseStatus: course.status,
      role: a.role === 'lead' ? 'lead' : 'co_instructor',
      canConfirmPayments: Boolean(a.can_confirm_payments),
    });
    assignmentsByInstructor.set(a.instructor_id, list);
  });

  const instructors: RealInstructorRecord[] = (instRes.data ?? []).map((row) => {
    const prof = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as
      | {
          id: string;
          email: string;
          full_name_ar: string;
          full_name_en: string;
          initials: string;
          avatar_url: string | null;
          account_status: RealAccountStatus;
          created_at: string;
        }
      | null;

    const expertiseArr = Array.isArray(row.expertise)
      ? (row.expertise as Array<BilingualText | string>).map((item) =>
          typeof item === 'string' ? { ar: item, en: item } : item,
        )
      : [];

    return {
      userId: row.user_id,
      slug: row.slug,
      email: prof?.email ?? '',
      fullName: {
        ar: prof?.full_name_ar || prof?.full_name_en || '',
        en: prof?.full_name_en || prof?.full_name_ar || '',
      },
      initials: prof?.initials || 'IN',
      avatarUrl: prof?.avatar_url ?? null,
      title: { ar: row.title_ar ?? '', en: row.title_en ?? '' },
      shortBio: { ar: row.short_bio_ar ?? '', en: row.short_bio_en ?? '' },
      biography: { ar: row.biography_ar ?? '', en: row.biography_en ?? '' },
      expertise: expertiseArr,
      accountStatus: prof?.account_status ?? 'active',
      invitationStatus: (row.invitation_status as InvitationStatus) ?? 'active',
      invitedAt: row.invited_at ?? null,
      acceptedAt: row.accepted_at ?? null,
      createdAt: row.created_at ?? prof?.created_at ?? new Date().toISOString(),
      assignments: assignmentsByInstructor.get(row.user_id) ?? [],
    };
  });

  return { instructors, error: null };
}

export async function fetchInstructorAuditEvents(
  targetUserId: string,
): Promise<RealAdminAuditEvent[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('admin_audit_events')
    .select('id, action_type, course_id, metadata, created_at')
    .eq('target_user_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(30);

  return (data ?? []).map((e) => ({
    id: e.id,
    actionType: e.action_type,
    courseId: e.course_id ?? null,
    metadata: (e.metadata ?? {}) as Record<string, unknown>,
    createdAt: e.created_at,
  }));
}

/**
 * Calls the secure server-side Edge Function `admin-create-instructor`.
 * Never uses a service-role key on the client.
 */
export async function invokeAdminCreateInstructor(
  input: CreateRealInstructorInput,
): Promise<CreateRealInstructorResult> {
  if (!supabase) {
    return { ok: false, errorCode: 'NOT_CONFIGURED', errorMessage: 'Supabase is not configured.' };
  }

  const redirectTo = `${window.location.origin}/set-password`;
  const { data, error } = await supabase.functions.invoke('admin-create-instructor', {
    body: {
      ...input,
      redirectTo,
    },
  });

  if (error) {
    // Extract structured error payload from Edge Function response when available
    let errorCode = 'EDGE_FUNCTION_ERROR';
    let errorMessage = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx) {
        const parsed = (await ctx.json()) as { error?: string; message?: string };
        if (parsed.error) errorCode = parsed.error;
        if (parsed.message) errorMessage = parsed.message;
      }
    } catch {
      // keep default errorMessage
    }
    return { ok: false, errorCode, errorMessage };
  }

  const payload = data as {
    ok?: boolean;
    userId?: string;
    slug?: string;
    email?: string;
    deliveryMethod?: 'email_invite' | 'setup_link';
    setupLink?: string | null;
    inviteWarning?: string | null;
    error?: string;
    message?: string;
  };

  if (!payload?.ok) {
    return {
      ok: false,
      errorCode: payload?.error ?? 'UNKNOWN_ERROR',
      errorMessage: payload?.message ?? 'Failed to create instructor.',
    };
  }

  return {
    ok: true,
    userId: payload.userId,
    slug: payload.slug,
    email: payload.email,
    deliveryMethod: payload.deliveryMethod,
    setupLink: payload.setupLink ?? null,
    inviteWarning: payload.inviteWarning ?? null,
  };
}

export async function adminUpdateRealInstructor(
  userId: string,
  patch: {
    fullNameAr?: string;
    fullNameEn?: string;
    titleAr?: string;
    titleEn?: string;
    shortBioAr?: string;
    shortBioEn?: string;
    biographyAr?: string;
    biographyEn?: string;
    expertise?: BilingualText[];
    avatarUrl?: string;
    accountStatus?: RealAccountStatus;
  },
) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_admin_update_instructor', {
    p_user_id: userId,
    p_full_name_ar: patch.fullNameAr ?? null,
    p_full_name_en: patch.fullNameEn ?? null,
    p_title_ar: patch.titleAr ?? null,
    p_title_en: patch.titleEn ?? null,
    p_short_bio_ar: patch.shortBioAr ?? null,
    p_short_bio_en: patch.shortBioEn ?? null,
    p_biography_ar: patch.biographyAr ?? null,
    p_biography_en: patch.biographyEn ?? null,
    p_expertise: patch.expertise ?? null,
    p_avatar_url: patch.avatarUrl ?? null,
    p_account_status: patch.accountStatus ?? null,
  });
}

export async function adminSetCourseInstructor(
  courseId: string,
  instructorId: string,
  action: 'assign' | 'remove' | 'set_lead' | 'set_co' | 'set_payment_permission',
  canConfirmPayments = false,
) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.rpc('rpc_admin_set_course_instructor', {
    p_course_id: courseId,
    p_instructor_id: instructorId,
    p_action: action,
    p_can_confirm_payments: canConfirmPayments,
  });
}

export async function markInstructorOnboardingComplete() {
  if (!supabase) return { error: null };
  return supabase.rpc('rpc_mark_instructor_onboarding_complete');
}

export async function fetchOwnInstructorPortalData(userId: string): Promise<{
  instructorProfile: RealInstructorRecord | null;
  assignedCourseSlugs: string[];
  leadCourseSlugs: string[];
  canConfirmPaymentCourseSlugs: string[];
}> {
  if (!supabase) {
    return {
      instructorProfile: null,
      assignedCourseSlugs: [],
      leadCourseSlugs: [],
      canConfirmPaymentCourseSlugs: [],
    };
  }

  const [profRes, instRes, assignRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('instructor_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase
      .from('course_instructors')
      .select('course_id, role, can_confirm_payments, courses:course_id (id, slug, code, title_ar, title_en, status)')
      .eq('instructor_id', userId),
  ]);

  const prof = profRes.data;
  const inst = instRes.data;
  if (!prof || !inst) {
    return {
      instructorProfile: null,
      assignedCourseSlugs: [],
      leadCourseSlugs: [],
      canConfirmPaymentCourseSlugs: [],
    };
  }

  const assignedCourseSlugs: string[] = [];
  const leadCourseSlugs: string[] = [];
  const canConfirmPaymentCourseSlugs: string[] = [];
  const assignments: RealInstructorAssignment[] = [];

  (assignRes.data ?? []).forEach((row) => {
    const c = (Array.isArray(row.courses) ? row.courses[0] : row.courses) as
      | { id: string; slug: string; code: string; title_ar: string; title_en: string; status: string }
      | null;
    if (!c) return;
    assignedCourseSlugs.push(c.slug);
    if (row.role === 'lead') leadCourseSlugs.push(c.slug);
    if (row.role === 'lead' || row.can_confirm_payments) {
      canConfirmPaymentCourseSlugs.push(c.slug);
    }
    assignments.push({
      courseId: c.id,
      courseSlug: c.slug,
      courseCode: c.code,
      courseTitle: { ar: c.title_ar, en: c.title_en },
      courseStatus: c.status,
      role: row.role === 'lead' ? 'lead' : 'co_instructor',
      canConfirmPayments: Boolean(row.can_confirm_payments),
    });
  });

  const expertiseArr = Array.isArray(inst.expertise)
    ? (inst.expertise as Array<BilingualText | string>).map((item) =>
        typeof item === 'string' ? { ar: item, en: item } : item,
      )
    : [];

  return {
    instructorProfile: {
      userId: prof.id,
      slug: inst.slug,
      email: prof.email,
      fullName: { ar: prof.full_name_ar || prof.full_name_en, en: prof.full_name_en || prof.full_name_ar },
      initials: prof.initials || 'IN',
      avatarUrl: prof.avatar_url ?? null,
      title: { ar: inst.title_ar ?? '', en: inst.title_en ?? '' },
      shortBio: { ar: inst.short_bio_ar ?? '', en: inst.short_bio_en ?? '' },
      biography: { ar: inst.biography_ar ?? '', en: inst.biography_en ?? '' },
      expertise: expertiseArr,
      accountStatus: prof.account_status ?? 'active',
      invitationStatus: (inst.invitation_status as InvitationStatus) ?? 'active',
      invitedAt: inst.invited_at ?? null,
      acceptedAt: inst.accepted_at ?? null,
      createdAt: inst.created_at ?? prof.created_at,
      assignments,
    },
    assignedCourseSlugs,
    leadCourseSlugs,
    canConfirmPaymentCourseSlugs,
  };
}

export async function updateOwnInstructorProfileInDb(
  userId: string,
  patch: {
    fullNameAr?: string;
    fullNameEn?: string;
    titleAr?: string;
    titleEn?: string;
    biographyAr?: string;
    biographyEn?: string;
    website?: string;
  },
) {
  if (!supabase) return { error: new Error('Supabase not configured') };

  const profilePatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.fullNameAr !== undefined) profilePatch.full_name_ar = patch.fullNameAr;
  if (patch.fullNameEn !== undefined) profilePatch.full_name_en = patch.fullNameEn;
  if (patch.biographyAr !== undefined) profilePatch.bio_ar = patch.biographyAr;
  if (patch.biographyEn !== undefined) profilePatch.bio_en = patch.biographyEn;

  const instPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.titleAr !== undefined) instPatch.title_ar = patch.titleAr;
  if (patch.titleEn !== undefined) instPatch.title_en = patch.titleEn;
  if (patch.biographyAr !== undefined) {
    instPatch.biography_ar = patch.biographyAr;
    instPatch.short_bio_ar = patch.biographyAr;
  }
  if (patch.biographyEn !== undefined) {
    instPatch.biography_en = patch.biographyEn;
    instPatch.short_bio_en = patch.biographyEn;
  }
  if (patch.website !== undefined) {
    instPatch.social_links = { website: patch.website };
  }

  const [pRes, iRes] = await Promise.all([
    supabase.from('profiles').update(profilePatch).eq('id', userId),
    supabase.from('instructor_profiles').update(instPatch).eq('user_id', userId),
  ]);

  return { error: pRes.error || iRes.error || null };
}

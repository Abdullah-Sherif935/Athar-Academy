import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateInstructorPayload {
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
  redirectTo?: string;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function makeSlug(nameEn: string, email: string): string {
  const base = (nameEn || email.split('@')[0] || 'instructor')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = crypto.randomUUID().slice(0, 4);
  return `${base || 'instructor'}-${suffix}`;
}

function makeInitials(nameEn: string, nameAr: string, email: string): string {
  const source = (nameEn || nameAr || email.split('@')[0] || 'IN').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'METHOD_NOT_ALLOWED' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: 'SERVER_MISCONFIGURED' }, 500);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return jsonResponse({ error: 'UNAUTHORIZED', message: 'Missing authorization token.' }, 401);
  }

  // 1. Authenticate caller via Supabase Auth (never trust client claims)
  const supabaseUser = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await supabaseUser.auth.getUser(token);
  if (userErr || !userData?.user) {
    return jsonResponse({ error: 'UNAUTHORIZED', message: 'Invalid or expired session.' }, 401);
  }
  const callerId = userData.user.id;

  // 2. Verify caller is an ACTIVE Super Admin in public.user_roles + public.profiles
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [{ data: callerProfile }, { data: callerRole }] = await Promise.all([
    supabaseAdmin.from('profiles').select('account_status').eq('id', callerId).maybeSingle(),
    supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .eq('role', 'super_admin')
      .maybeSingle(),
  ]);

  if (!callerRole || callerProfile?.account_status !== 'active') {
    return jsonResponse(
      { error: 'FORBIDDEN', message: 'Super Admin authorization required.' },
      403,
    );
  }

  // 3. Parse & validate payload
  let payload: CreateInstructorPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'INVALID_JSON', message: 'Invalid request body.' }, 400);
  }

  const email = (payload.email ?? '').trim().toLowerCase();
  const fullNameAr = (payload.fullNameAr ?? '').trim();
  const fullNameEn = (payload.fullNameEn ?? '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: 'INVALID_EMAIL', message: 'A valid email address is required.' }, 400);
  }
  if (!fullNameAr && !fullNameEn) {
    return jsonResponse({ error: 'MISSING_NAME', message: 'Full name is required.' }, 400);
  }

  const resolvedAr = fullNameAr || fullNameEn;
  const resolvedEn = fullNameEn || fullNameAr;
  const titleAr = (payload.titleAr ?? '').trim() || 'مدرب في أكاديمية أثر';
  const titleEn = (payload.titleEn ?? '').trim() || 'ATHAR ACADEMY Instructor';
  const bioAr = (payload.bioAr ?? '').trim();
  const bioEn = (payload.bioEn ?? '').trim();
  const avatarUrl = (payload.avatarUrl ?? '').trim() || null;
  const accountStatus =
    payload.accountStatus && ['active', 'inactive', 'suspended'].includes(payload.accountStatus)
      ? payload.accountStatus
      : 'active';
  const specializations = Array.isArray(payload.specializations)
    ? payload.specializations
        .map((s) => String(s).trim())
        .filter(Boolean)
        .map((s) => ({ ar: s, en: s }))
    : [];

  const redirectTo =
    payload.redirectTo?.trim() || 'https://athar-academy-peach.vercel.app/set-password';

  // 4. Duplicate email guard before Auth creation
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  if (existingProfile) {
    return jsonResponse(
      {
        error: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email address already exists.',
      },
      409,
    );
  }

  // 5. Create & invite user via Supabase Auth Admin API
  let newUserId: string | null = null;
  let deliveryMethod: 'email_invite' | 'setup_link' = 'email_invite';
  let inviteWarning: string | null = null;

  const inviteRes = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { full_name: resolvedEn },
  });

  if (inviteRes.error) {
    const msg = inviteRes.error.message.toLowerCase();
    if (msg.includes('already been registered') || msg.includes('already exists')) {
      return jsonResponse(
        {
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists.',
        },
        409,
      );
    }

    // Fallback if built-in SMTP/email rate limit rejects inviteUserByEmail:
    // create confirmed Auth user + generate a real one-time recovery/setup link.
    const createRes = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: resolvedEn },
    });

    if (createRes.error || !createRes.data?.user) {
      return jsonResponse(
        {
          error: 'AUTH_CREATE_FAILED',
          message: createRes.error?.message || inviteRes.error.message,
        },
        500,
      );
    }

    newUserId = createRes.data.user.id;
    deliveryMethod = 'setup_link';
    inviteWarning = inviteRes.error.message;
  } else {
    newUserId = inviteRes.data.user.id;
  }

  // Generate a direct one-time setup link that lands directly on /set-password with token_hash
  let setupLink: string | null = null;
  const linkRes = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo },
  });
  if (!linkRes.error && linkRes.data?.properties?.hashed_token) {
    const tokenHash = encodeURIComponent(linkRes.data.properties.hashed_token);
    const sep = redirectTo.includes('?') ? '&' : '?';
    setupLink = `${redirectTo}${sep}token_hash=${tokenHash}&type=recovery`;
  } else if (!linkRes.error && linkRes.data?.properties?.action_link) {
    setupLink = linkRes.data.properties.action_link;
  }

  // 6. Initialize profiles, instructor_profiles, user_roles, and admin_audit_events atomically.
  //    Roll back Auth user on ANY failure to prevent orphaned records.
  try {
    const initials = makeInitials(resolvedEn, resolvedAr, email);
    const slug = makeSlug(resolvedEn, email);

    const { error: profErr } = await supabaseAdmin.from('profiles').upsert(
      {
        id: newUserId,
        email,
        full_name_ar: resolvedAr,
        full_name_en: resolvedEn,
        initials,
        avatar_url: avatarUrl,
        bio_ar: bioAr,
        bio_en: bioEn,
        account_status: accountStatus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );
    if (profErr) throw new Error(`Profile upsert failed: ${profErr.message}`);

    const { error: instErr } = await supabaseAdmin.from('instructor_profiles').upsert(
      {
        user_id: newUserId,
        slug,
        title_ar: titleAr,
        title_en: titleEn,
        short_bio_ar: bioAr || titleAr,
        short_bio_en: bioEn || titleEn,
        biography_ar: bioAr || titleAr,
        biography_en: bioEn || titleEn,
        expertise: specializations,
        invitation_status: 'pending',
        invited_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    if (instErr) throw new Error(`Instructor profile insert failed: ${instErr.message}`);

    const { error: roleErr } = await supabaseAdmin.from('user_roles').upsert(
      {
        user_id: newUserId,
        role: 'instructor',
        granted_by: callerId,
      },
      { onConflict: 'user_id,role' },
    );
    if (roleErr) throw new Error(`Role assignment failed: ${roleErr.message}`);

    const { error: auditErr } = await supabaseAdmin.from('admin_audit_events').insert({
      actor_id: callerId,
      target_user_id: newUserId,
      action_type: 'instructor_created',
      metadata: {
        email,
        slug,
        account_status: accountStatus,
        delivery_method: deliveryMethod,
      },
    });
    if (auditErr) throw new Error(`Audit log insert failed: ${auditErr.message}`);

    return jsonResponse(
      {
        ok: true,
        userId: newUserId,
        slug,
        email,
        deliveryMethod,
        setupLink,
        inviteWarning,
      },
      201,
    );
  } catch (dbErr) {
    // Cleanup Auth user so zero orphaned records remain
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    const message = dbErr instanceof Error ? dbErr.message : 'Database initialization failed.';
    return jsonResponse({ error: 'DB_INIT_FAILED', message }, 500);
  }
});

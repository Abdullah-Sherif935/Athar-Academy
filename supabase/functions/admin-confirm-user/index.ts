import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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

  const supabaseUser = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await supabaseUser.auth.getUser(token);
  if (userErr || !userData?.user) {
    return jsonResponse({ error: 'UNAUTHORIZED', message: 'Invalid or expired session.' }, 401);
  }
  const callerId = userData.user.id;

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

  let payload: { userId?: string; reason?: string };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'INVALID_JSON', message: 'Invalid request body.' }, 400);
  }

  const targetUserId = (payload.userId ?? '').trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId)) {
    return jsonResponse({ error: 'INVALID_USER_ID', message: 'Valid target userId UUID is required.' }, 400);
  }

  const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
    targetUserId,
    { email_confirm: true },
  );

  if (updateErr || !updated?.user) {
    return jsonResponse(
      { error: 'CONFIRM_FAILED', message: updateErr?.message ?? 'Unable to confirm user.' },
      400,
    );
  }

  await supabaseAdmin.from('admin_audit_events').insert({
    actor_id: callerId,
    target_user_id: targetUserId,
    action_type: 'user_email_confirmed_by_admin',
    metadata: {
      email: updated.user.email,
      reason: payload.reason?.trim() || 'Authorized administrative email confirmation',
    },
  });

  return jsonResponse({
    ok: true,
    userId: updated.user.id,
    email: updated.user.email,
    emailConfirmedAt: updated.user.email_confirmed_at,
  });
});

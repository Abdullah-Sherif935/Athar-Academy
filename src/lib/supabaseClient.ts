import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

let cachedClient: SupabaseClient | null = null;

/**
 * Minimal publishable-key Supabase client for future phases.
 * Phase 01 does not execute database queries or authentication flows.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!env.isSupabaseConfigured || !env.supabaseUrl || !env.supabasePublishableKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(env.supabaseUrl, env.supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return cachedClient;
}

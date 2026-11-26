export interface AppEnvStatus {
  supabaseUrl: string | null;
  supabasePublishableKey: string | null;
  isSupabaseConfigured: boolean;
  missingVars: string[];
}

function readEnv(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const supabaseUrl = readEnv(import.meta.env.VITE_SUPABASE_URL);
const supabasePublishableKey = readEnv(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const missingVars: string[] = [];
if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
if (!supabasePublishableKey) missingVars.push('VITE_SUPABASE_PUBLISHABLE_KEY');

export const env: AppEnvStatus = {
  supabaseUrl,
  supabasePublishableKey,
  isSupabaseConfigured: missingVars.length === 0,
  missingVars,
};

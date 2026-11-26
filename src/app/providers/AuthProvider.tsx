import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export type AppRole = 'super_admin' | 'instructor' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  full_name_ar: string;
  full_name_en: string;
  initials: string;
  avatar_url: string | null;
  account_status: 'active' | 'inactive' | 'suspended' | 'revoked';
  preferred_language: 'ar' | 'en';
  preferred_theme: 'system' | 'light' | 'dark';
}

export interface AuthContextValue {
  isConfigured: boolean;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  roles: AppRole[];
  primaryRole: AppRole | null;
  hasRole: (role: AppRole) => boolean;
  getHomeRoute: () => string;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string; role?: AppRole | null }>;
  signUp: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string; needsEmailVerification?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  refreshAuth: () => Promise<void>;
  bootstrapSuperAdmin: () => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function getHomeRouteForRole(role: AppRole | null): string {
  if (role === 'super_admin') return '/admin';
  if (role === 'instructor') return '/instructor';
  if (role === 'student') return '/student';
  return '/';
}

function resolvePrimaryRole(roles: AppRole[]): AppRole | null {
  if (roles.includes('super_admin')) return 'super_admin';
  if (roles.includes('instructor')) return 'instructor';
  if (roles.includes('student')) return 'student';
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const loadUserProfileAndRoles = useCallback(async (userId: string): Promise<AppRole[]> => {
    if (!supabase) return [];

    const [{ data: profileData }, { data: rolesData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId),
    ]);

    if (profileData) {
      setProfile(profileData as UserProfile);
    } else {
      setProfile(null);
    }

    const fetchedRoles = ((rolesData ?? []) as Array<{ role: AppRole }>).map((r) => r.role);
    setRoles(fetchedRoles);
    return fetchedRoles;
  }, []);

  const refreshAuth = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    if (data.session?.user) {
      await loadUserProfileAndRoles(data.session.user.id);
    } else {
      setProfile(null);
      setRoles([]);
    }
    setIsLoading(false);
  }, [loadUserProfileAndRoles]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    void refreshAuth();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        void loadUserProfileAndRoles(nextSession.user.id);
      } else {
        setProfile(null);
        setRoles([]);
      }
      setIsLoading(false);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [loadUserProfileAndRoles, refreshAuth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { ok: false, error: 'Supabase is not configured.' };
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data.user) {
        return { ok: false, error: error?.message ?? 'Invalid credentials.' };
      }
      const nextRoles = await loadUserProfileAndRoles(data.user.id);
      return { ok: true, role: resolvePrimaryRole(nextRoles) };
    },
    [loadUserProfileAndRoles],
  );

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    if (!supabase) return { ok: false, error: 'Supabase is not configured.' };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    const needsEmailVerification = !data.session;
    return { ok: true, needsEmailVerification };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setRoles([]);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { ok: false, error: 'Supabase is not configured.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const bootstrapSuperAdmin = useCallback(async () => {
    if (!supabase || !session?.user) return { ok: false, error: 'Sign in first.' };
    const { error } = await supabase.rpc('rpc_bootstrap_super_admin');
    if (error) return { ok: false, error: error.message };
    await loadUserProfileAndRoles(session.user.id);
    return { ok: true };
  }, [loadUserProfileAndRoles, session?.user]);

  const primaryRole = useMemo(() => resolvePrimaryRole(roles), [roles]);

  const hasRole = useCallback(
    (role: AppRole) => roles.includes(role) || roles.includes('super_admin'),
    [roles],
  );

  const getHomeRoute = useCallback(() => getHomeRouteForRole(primaryRole), [primaryRole]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured: isSupabaseConfigured,
      isLoading,
      session,
      user: session?.user ?? null,
      profile,
      roles,
      primaryRole,
      hasRole,
      getHomeRoute,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshAuth,
      bootstrapSuperAdmin,
    }),
    [
      isLoading,
      session,
      profile,
      roles,
      primaryRole,
      hasRole,
      getHomeRoute,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshAuth,
      bootstrapSuperAdmin,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

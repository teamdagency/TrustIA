'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthUser, UserRole, OrgSummary, PlanSlug } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentOrganizationId: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setCurrentOrganization: (orgId: string) => void;
  can: (minRole: UserRole) => boolean;
  isSuperAdmin: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const {
    user,
    isLoading,
    currentOrganizationId,
    setUser,
    setLoading,
    setCurrentOrganization,
    logout: logoutStore,
    can,
    isSuperAdmin,
  } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setUser(null);
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        logoutStore();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const [{ data: userData }, { data: memberships }] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).maybeSingle(),
        supabase
          .from('organization_members')
          .select('role, organization:organizations(id, name, slug, logo_url, type)')
          .eq('user_id', userId),
      ]);

      const organizations: OrgSummary[] = (memberships ?? []).map((m: any) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role as UserRole,
        type: m.organization.type,
        logoUrl: m.organization.logo_url,
      }));

      // Preserve current org if still valid
      const storedOrgId = useAuthStore.getState().currentOrganizationId;
      const activeOrg = organizations.find((o) => o.id === storedOrgId) ?? organizations[0];

      const authUser: AuthUser = {
        id: userId,
        email: userData?.email ?? '',
        fullName: userData?.full_name ?? '',
        avatarUrl: userData?.avatar_url ?? null,
        organizations,
        currentOrganization: activeOrg
          ? { ...activeOrg, plan: 'starter' as PlanSlug }
          : undefined,
      };

      setUser(authUser);
    } catch {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await fetchUserData(session.user.id);
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    logoutStore();
    router.push('/');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        currentOrganizationId,
        login,
        signup,
        logout,
        resetPassword,
        setCurrentOrganization,
        can,
        isSuperAdmin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

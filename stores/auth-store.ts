import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, Organization, UserRole } from '@/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentOrganizationId: string | null;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentOrganization: (orgId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      currentOrganizationId: null,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          currentOrganizationId: user?.currentOrganization?.id ?? user?.organizations[0]?.id ?? null,
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      setCurrentOrganization: (orgId) =>
        set((state) => {
          if (!state.user) return state;
          const org = state.user.organizations.find((o) => o.id === orgId);
          if (!org) return state;
          return {
            currentOrganizationId: orgId,
            user: {
              ...state.user,
              currentOrganization: {
                id: org.id,
                name: org.name,
                slug: org.slug,
                role: org.role,
                plan: 'starter',
              },
            },
          };
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          currentOrganizationId: null,
        }),
    }),
    {
      name: 'trustia-auth',
      partialize: (state) => ({
        currentOrganizationId: state.currentOrganizationId,
      }),
    }
  )
);

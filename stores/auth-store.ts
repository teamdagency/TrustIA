import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, UserRole, OrgSummary, PlanSlug } from '@/types';
import { hasPermission } from '@/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentOrganizationId: string | null;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentOrganization: (orgId: string) => void;
  logout: () => void;
  // RBAC helpers
  currentOrg: () => (OrgSummary & { plan: PlanSlug }) | undefined;
  currentRole: () => UserRole | undefined;
  can: (minRole: UserRole) => boolean;
  isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      currentOrganizationId: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          currentOrganizationId:
            get().currentOrganizationId && user?.organizations.some((o) => o.id === get().currentOrganizationId)
              ? get().currentOrganizationId
              : user?.currentOrganization?.id ?? user?.organizations[0]?.id ?? null,
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
                ...org,
                plan: 'starter' as PlanSlug,
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

      currentOrg: () => get().user?.currentOrganization,
      currentRole: () => get().user?.currentOrganization?.role,
      can: (minRole) => {
        const role = get().user?.currentOrganization?.role;
        if (!role) return false;
        return hasPermission(role, minRole);
      },
      isSuperAdmin: () => get().user?.currentOrganization?.role === 'super_admin',
    }),
    {
      name: 'trustia-auth',
      partialize: (state) => ({
        currentOrganizationId: state.currentOrganizationId,
      }),
    }
  )
);

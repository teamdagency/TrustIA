import { Database } from '@/lib/supabase/client';

export type User = Database['public']['Tables']['users']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row'];
export type Plan = Database['public']['Tables']['plans']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Campaign = Database['public']['Tables']['campaigns']['Row'];
export type Reward = Database['public']['Tables']['rewards']['Row'];

export type UserRole = 'owner' | 'admin' | 'member';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  organizations: {
    id: string;
    name: string;
    slug: string;
    role: UserRole;
  }[];
  currentOrganization?: {
    id: string;
    name: string;
    slug: string;
    role: UserRole;
    plan: string;
  };
}

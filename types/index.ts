// ─── Roles ────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'super_admin'
  | 'agency_owner'
  | 'agency_admin'
  | 'business_owner'
  | 'manager'
  | 'staff'
  | 'readonly'
  | 'owner'
  | 'admin'
  | 'member';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  agency_owner: 90,
  agency_admin: 80,
  business_owner: 70,
  owner: 70,
  manager: 60,
  admin: 60,
  staff: 40,
  member: 40,
  readonly: 10,
};

export function hasPermission(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

// ─── Status enums ─────────────────────────────────────────────────────────────

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export type OrganizationType = 'agency' | 'business' | 'franchise';
export type PlanSlug = 'starter' | 'pro' | 'business' | 'enterprise';

// ─── Core entities ─────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  organizations: OrgSummary[];
  currentOrganization?: OrgSummary & { plan: PlanSlug };
}

export interface OrgSummary {
  id: string;
  name: string;
  slug: string;
  role: UserRole;
  type?: OrganizationType;
  logoUrl?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  industry: string | null;
  country: string;
  timezone: string;
  locale: string;
  plan_id: string | null;
  subscription_status: string;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  type: OrganizationType;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  invited_by: string | null;
  joined_at: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: UserRole;
  token: string;
  invited_by: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface WhiteLabelConfig {
  id: string;
  organization_id: string;
  brand_name: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url: string | null;
  favicon_url: string | null;
  custom_domain: string | null;
  email_from_name: string | null;
  email_from_address: string | null;
  sms_from_name: string | null;
  custom_css: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  plan?: Plan;
}

export interface Plan {
  id: string;
  name: string;
  slug: PlanSlug;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  limits: {
    max_reviews: number;
    max_campaigns: number;
    max_team_members: number;
  };
  is_active: boolean;
}

export interface AuditLog {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: { email: string; full_name: string };
}

export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  organization_id: string | null;
  flag: string;
  enabled: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── Business entities ─────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  locale: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  organization_id: string;
  customer_id: string | null;
  rating: number;
  title: string;
  content: string;
  source: string;
  external_id: string | null;
  status: ReviewStatus;
  is_verified: boolean;
  responded_at: string | null;
  response_content: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  organization_id: string;
  email: string | null;
  phone: string | null;
  full_name: string;
  custom_fields: Record<string, unknown>;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  type: 'email' | 'sms' | 'both';
  status: CampaignStatus;
  template_email: string | null;
  template_sms: string | null;
  trigger_event: string;
  delay_hours: number;
  max_reminders: number;
  created_by: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reward {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  type: 'discount' | 'gift' | 'points' | 'custom';
  value: number;
  min_rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

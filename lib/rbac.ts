import type { UserRole } from '@/types';

const ROLE_HIERARCHY: Record<UserRole, number> = {
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

const PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'],
  agency_owner: [
    'manage_org', 'manage_members', 'manage_billing', 'manage_white_label',
    'manage_campaigns', 'manage_customers', 'manage_reviews', 'manage_api_keys',
    'view_analytics', 'view_audit_logs',
  ],
  agency_admin: [
    'manage_org', 'manage_members', 'manage_campaigns', 'manage_customers',
    'manage_reviews', 'view_analytics', 'view_audit_logs',
  ],
  business_owner: [
    'manage_org', 'manage_members', 'manage_billing', 'manage_campaigns',
    'manage_customers', 'manage_reviews', 'view_analytics',
  ],
  owner: [
    'manage_org', 'manage_members', 'manage_billing', 'manage_campaigns',
    'manage_customers', 'manage_reviews', 'view_analytics', 'view_audit_logs',
  ],
  manager: ['manage_campaigns', 'manage_customers', 'manage_reviews', 'view_analytics'],
  admin: ['manage_members', 'manage_campaigns', 'manage_customers', 'manage_reviews', 'view_analytics', 'view_audit_logs'],
  staff: ['manage_reviews', 'manage_customers', 'view_analytics'],
  member: ['manage_reviews', 'manage_customers', 'view_analytics'],
  readonly: ['view_analytics'],
};

export function canAccess(role: UserRole, action: string): boolean {
  const allowed = PERMISSIONS[role] ?? [];
  return allowed.includes('*') || allowed.includes(action);
}

export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

export function getPermissions(role: UserRole): string[] {
  return PERMISSIONS[role] ?? [];
}

export type Permission =
  | 'manage_org'
  | 'manage_members'
  | 'manage_billing'
  | 'manage_white_label'
  | 'manage_campaigns'
  | 'manage_customers'
  | 'manage_reviews'
  | 'manage_api_keys'
  | 'view_analytics'
  | 'view_audit_logs';

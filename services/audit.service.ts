import { AuditRepository } from '@/repositories/audit.repository';

export const AuditActions = {
  // Auth
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_SIGNUP: 'user.signup',
  PASSWORD_CHANGED: 'user.password_changed',

  // Organization
  ORG_CREATED: 'org.created',
  ORG_UPDATED: 'org.updated',

  // Members
  MEMBER_INVITED: 'member.invited',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',

  // Billing
  SUBSCRIPTION_CREATED: 'billing.subscription_created',
  SUBSCRIPTION_UPDATED: 'billing.subscription_updated',
  SUBSCRIPTION_CANCELED: 'billing.subscription_canceled',
  PAYMENT_FAILED: 'billing.payment_failed',

  // Campaigns
  CAMPAIGN_CREATED: 'campaign.created',
  CAMPAIGN_UPDATED: 'campaign.updated',
  CAMPAIGN_DELETED: 'campaign.deleted',

  // API
  API_KEY_CREATED: 'api_key.created',
  API_KEY_DELETED: 'api_key.deleted',
} as const;

export type AuditAction = typeof AuditActions[keyof typeof AuditActions];

export class AuditService {
  static async log(params: {
    organizationId: string | null;
    userId?: string | null;
    action: AuditAction;
    resource: string;
    resourceId?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    await AuditRepository.log({
      organization_id: params.organizationId,
      user_id: params.userId,
      action: params.action,
      resource: params.resource,
      resource_id: params.resourceId,
      metadata: params.metadata,
    });
  }
}

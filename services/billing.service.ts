import { SubscriptionRepository, PlanRepository } from '@/repositories/subscription.repository';
import { AuditService, AuditActions } from '@/services/audit.service';

export class BillingService {
  static async getSubscription(organizationId: string) {
    return SubscriptionRepository.findByOrg(organizationId);
  }

  static async getPlans() {
    return PlanRepository.findAll();
  }

  static async syncStripeSubscription(params: {
    organizationId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    planSlug: string;
    status: string;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
  }) {
    const plan = await PlanRepository.findBySlug(params.planSlug);
    if (!plan) throw new Error(`Plan not found: ${params.planSlug}`);

    const sub = await SubscriptionRepository.upsert(params.organizationId, {
      plan_id: plan.id,
      status: params.status,
      stripe_subscription_id: params.stripeSubscriptionId,
      stripe_customer_id: params.stripeCustomerId,
      current_period_start: params.currentPeriodStart ?? null,
      current_period_end: params.currentPeriodEnd ?? null,
      cancel_at_period_end: params.cancelAtPeriodEnd ?? false,
    });

    await SubscriptionRepository.updateStripeCustomer(params.organizationId, params.stripeCustomerId);

    return sub;
  }

  static async cancelSubscription(organizationId: string, userId: string) {
    const sub = await SubscriptionRepository.findByOrg(organizationId);
    if (!sub) throw new Error('No subscription found');

    await SubscriptionRepository.upsert(organizationId, {
      plan_id: sub.plan_id,
      status: 'canceled',
      stripe_subscription_id: sub.stripe_subscription_id,
      stripe_customer_id: sub.stripe_customer_id ?? '',
      cancel_at_period_end: true,
    });

    await AuditService.log({
      organizationId,
      userId,
      action: AuditActions.SUBSCRIPTION_CANCELED,
      resource: 'subscription',
      resourceId: sub.id,
    });
  }
}

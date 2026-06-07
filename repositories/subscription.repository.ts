import { supabase } from '@/lib/supabase/client';
import type { Subscription, Plan } from '@/types';

export class SubscriptionRepository {
  static async findByOrg(organizationId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plan:plans(*)')
      .eq('organization_id', organizationId)
      .maybeSingle();
    if (error) throw error;
    return data as (Subscription & { plan: Plan }) | null;
  }

  static async upsert(organizationId: string, data: {
    plan_id: string;
    status: string;
    stripe_subscription_id?: string | null;
    stripe_customer_id?: string | null;
    current_period_start?: string | null;
    current_period_end?: string | null;
    cancel_at_period_end?: boolean;
  }) {
    const { data: sub, error } = await supabase
      .from('subscriptions')
      .upsert({ organization_id: organizationId, ...data }, { onConflict: 'organization_id' })
      .select('*, plan:plans(*)')
      .single();
    if (error) throw error;
    return sub as Subscription & { plan: Plan };
  }

  static async updateStripeCustomer(organizationId: string, stripeCustomerId: string) {
    const { error } = await supabase
      .from('organizations')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', organizationId);
    if (error) throw error;
  }
}

export class PlanRepository {
  static async findAll() {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly');
    if (error) throw error;
    return (data ?? []) as Plan[];
  }

  static async findBySlug(slug: string) {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data as Plan | null;
  }
}

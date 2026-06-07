import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { BillingService } from '@/services/billing.service';
import { AuditService, AuditActions } from '@/services/audit.service';

// Stripe webhook handler — validates signature then dispatches events to BillingService
export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: any;

  try {
    // Dynamic import to avoid Edge Runtime issues
    const stripe = (await import('stripe')).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });
    event = stripeClient.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    await handleStripeEvent(event, supabase);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Stripe Webhook] Handler error:', err.message);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}

async function handleStripeEvent(event: any, supabase: any) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const customerId = sub.customer;

      // Find org by stripe customer id
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();

      if (!org) {
        console.warn(`[Stripe Webhook] No org for customer ${customerId}`);
        return;
      }

      const planSlug = sub.items?.data?.[0]?.price?.lookup_key ?? 'starter';

      await BillingService.syncStripeSubscription({
        organizationId: org.id,
        stripeCustomerId: customerId,
        stripeSubscriptionId: sub.id,
        planSlug,
        status: sub.status,
        currentPeriodStart: sub.current_period_start
          ? new Date(sub.current_period_start * 1000).toISOString()
          : null,
        currentPeriodEnd: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      });

      await AuditService.log({
        organizationId: org.id,
        userId: null,
        action: event.type === 'customer.subscription.created'
          ? AuditActions.SUBSCRIPTION_CREATED
          : AuditActions.SUBSCRIPTION_UPDATED,
        resource: 'subscription',
        resourceId: sub.id,
        metadata: { status: sub.status, planSlug },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('stripe_customer_id', sub.customer)
        .maybeSingle();

      if (org) {
        await BillingService.cancelSubscription(org.id, 'stripe_webhook');
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('stripe_customer_id', invoice.customer)
        .maybeSingle();

      if (org) {
        await AuditService.log({
          organizationId: org.id,
          userId: null,
          action: AuditActions.PAYMENT_FAILED,
          resource: 'invoice',
          resourceId: invoice.id,
          metadata: { amount: invoice.amount_due, currency: invoice.currency },
        });
      }
      break;
    }

    default:
      break;
  }
}

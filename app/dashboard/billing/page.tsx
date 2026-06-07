'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { BillingService } from '@/services/billing.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Check, AlertCircle } from 'lucide-react';
import type { Subscription, Plan } from '@/types';

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['100 avis/mois', '5 campagnes', '2 membres', 'Widget site web', 'Email'],
  pro: ['1 000 avis/mois', '20 campagnes', '10 membres', 'SMS', 'Analytics avances'],
  enterprise: ['Illimite', 'Membres illimites', 'White-label', 'API complet', 'Account manager'],
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Actif', trialing: 'Essai gratuit', past_due: 'Paiement en retard', canceled: 'Annule',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default', trialing: 'secondary', past_due: 'destructive', canceled: 'outline',
};

export default function BillingPage() {
  const { currentOrganizationId, can } = useAuth();
  const isAdmin = can('manage_billing' as any);
  const [subscription, setSubscription] = useState<(Subscription & { plan: Plan }) | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentOrganizationId) return;
    const load = async () => {
      const [sub, plansData] = await Promise.all([
        BillingService.getSubscription(currentOrganizationId),
        BillingService.getPlans(),
      ]);
      setSubscription(sub);
      setPlans(plansData);
      setIsLoading(false);
    };
    load();
  }, [currentOrganizationId]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Facturation</h1>
        <p className="text-muted-foreground mt-1">Gerez votre abonnement et vos paiements.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Abonnement actuel</CardTitle>
            {subscription && (
              <Badge variant={STATUS_VARIANT[subscription.status] ?? 'secondary'}>
                {STATUS_LABEL[subscription.status] ?? subscription.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg capitalize">{subscription.plan?.name ?? 'Plan inconnu'}</p>
                  <p className="text-muted-foreground text-sm">
                    {subscription.current_period_end
                      ? `Renouvellement le ${new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}`
                      : 'Pas de renouvellement prevu'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {((subscription.plan?.price_monthly ?? 0) / 100).toFixed(0)}€
                    <span className="text-sm font-normal text-muted-foreground">/mois</span>
                  </p>
                </div>
              </div>
              {subscription.cancel_at_period_end && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  Votre abonnement sera annule a la fin de la periode.
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">Aucun abonnement actif. Choisissez un plan ci-dessous.</p>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Changer de plan</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = subscription?.plan?.slug === plan.slug;
            const features = PLAN_FEATURES[plan.slug] ?? (plan.features as string[]);
            return (
              <Card key={plan.id} className={isCurrent ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    {isCurrent && <Badge>Actuel</Badge>}
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{(plan.price_monthly / 100).toFixed(0)}€</span>
                    <span className="text-muted-foreground text-sm">/mois</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-1.5">
                    {features.map((f: string) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={isCurrent ? 'outline' : 'default'} disabled={isCurrent || !isAdmin}>
                    {isCurrent ? 'Plan actuel' : 'Choisir ce plan'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

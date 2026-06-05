'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const plans = [
  {
    name: 'Starter',
    slug: 'starter',
    description: 'Pour les petites entreprises',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      'Collecte d\'avis',
      'Widget site web',
      'Email de sollicitation',
      'Tableau de bord basique',
      '100 avis/mois',
      '2 membres d\'equipe',
    ],
    limits: {
      reviews: 100,
      campaigns: 5,
      teamMembers: 2,
    },
    highlighted: false,
  },
  {
    name: 'Pro',
    slug: 'pro',
    description: 'Pour les entreprises en croissance',
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: [
      'Tout Starter',
      'SMS automatises',
      'Analytics avances',
      'Multi-sites',
      'Support prioritaire',
      '1000 avis/mois',
      '10 membres d\'equipe',
    ],
    limits: {
      reviews: 1000,
      campaigns: 20,
      teamMembers: 10,
    },
    highlighted: true,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Pour les grandes structures',
    monthlyPrice: 199,
    yearlyPrice: 159,
    features: [
      'Tout Pro',
      'White-label complet',
      'API complet',
      'Integrations custom',
      'Account manager dedie',
      'Avis illimites',
      'Equipe illimitee',
    ],
    limits: {
      reviews: -1,
      campaigns: -1,
      teamMembers: -1,
    },
    highlighted: false,
  },
];

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Des tarifs adaptes a vos besoins
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Choisissez le plan qui correspond a vos objectifs. Changez a tout moment.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annuel
              <Badge variant="secondary" className="text-xs bg-success/20 text-success">
                -20%
              </Badge>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl border-2 p-8 ${
                plan.highlighted
                  ? 'border-primary bg-primary/5 shadow-lg scale-105'
                  : 'border-border bg-card'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Plus populaire
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}€
                  </span>
                  <span className="text-muted-foreground">
                    /{billingPeriod === 'monthly' ? 'mois' : 'mois (facture annuellement)'}
                  </span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.yearlyPrice * 12}€/an
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.highlighted ? 'default' : 'outline'}
                className="w-full"
              >
                <Link href="/auth/signup">
                  {plan.slug === 'enterprise' ? 'Nous contacter' : 'Commencer l\'essai gratuit'}
                </Link>
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                14 jours d\'essai gratuit
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

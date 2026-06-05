'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star } from 'lucide-react';

const features = [
  {
    icon: 'mail',
    title: 'Collecte d\'avis',
    description: 'Collectez automatiquement des avis authentiques via email, SMS ou widget integre',
  },
  {
    icon: 'globe',
    title: 'Multi-plateformes',
    description: 'Centralisez vos avis Google, Facebook, TripAdvisor et plus encore',
  },
  {
    icon: 'chart',
    title: 'Analytics avances',
    description: 'Analysez vos performances et suivez votre evolution en temps reel',
  },
  {
    icon: 'bot',
    title: 'Automatisation IA',
    description: 'Automatisez la collecte et les reponses grace a l\'intelligence artificielle',
  },
  {
    icon: 'gift',
    title: 'Programme de recompenses',
    description: 'Motivez vos clients avec un systeme de recompenses personnalisable',
  },
  {
    icon: 'palette',
    title: 'White-label',
    description: 'Personnalisez la plateforme aux couleurs de votre marque',
  },
];

const stats = [
  { value: '98%', label: 'Satisfaction client' },
  { value: '45%', label: 'Augmentation des avis positifs' },
  { value: '2x', label: 'Plus de visibilite' },
  { value: '5000+', label: 'Entreprises nous font confiance' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>Nouveau : Automatisation IA pour vos reponses</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            Collectionnez et gerez vos{' '}
            <span className="text-gradient">avis clients</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Developpez votre reputation en ligne avec TrustIA. Collectez, analysez et repondez
            a vos avis clients sur toutes les plateformes en un seul endroit.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/auth/signup">
                Commencer gratuitement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="#demo">
                <Play className="w-4 h-4 mr-2" />
                Voir la demo
              </Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            Essai gratuit 14 jours - Aucune carte bancaise requise
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-muted-foreground">
            Une solution complete pour gerer votre reputation en ligne et developper votre entreprise.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote: "TrustIA a transforme notre gestion des avis. Nous avons triple notre nombre d'avis positifs en 3 mois.",
    author: "Marie D.",
    role: "Directrice, Restaurant Le Gourmet",
    rating: 5,
  },
  {
    quote: "L'automatisation IA nous fait gagner des heures chaque semaine. Un outil indispensable.",
    author: "Thomas L.",
    role: "Gerant, Auto-Service Plus",
    rating: 5,
  },
  {
    quote: "Notre score Google est passe de 3.8 a 4.7 grace a une meilleure gestion des avis negatifs.",
    author: "Sophie M.",
    role: "Responsable marketing, Hotel Belle Vue",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-muted-foreground">
            Decouvrez comment TrustIA aide les entreprises a developper leur reputation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card p-6 rounded-xl border border-border"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 text-accent fill-current" />
                ))}
              </div>
              <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    question: 'Comment fonctionne la collecte d\'avis ?',
    answer: 'Apres un achat ou un service, vous pouvez envoyer automatiquement une demande d\'avis par email ou SMS a vos clients. Le lien dirige vers une page de formulaire personnalisee ou vers vos pages Google/Facebook.',
  },
  {
    question: 'Puis-je centraliser les avis de differentes plateformes ?',
    answer: 'Oui, TrustIA integre Google, Facebook, TripAdvisor, Trustpilot et plus. Tous vos avis sont centralises dans un tableau de bord unique.',
  },
  {
    question: 'L\'IA peut-elle vraiment repondre automatiquement ?',
    answer: 'Notre IA analyse chaque avis et genere des reponses personnalisees et professionnelles. Vous pouvez valider et modifier avant envoi, ou activer le mode automatique.',
  },
  {
    question: 'Proposez-vous une periode d\'essai ?',
    answer: 'Oui, l\'essai gratuit de 14 jours vous donne acces a toutes les fonctionnalites du plan Pro. Aucune carte bancaire necessaire.',
  },
  {
    question: 'Mes donnees sont-elles securisees ?',
    answer: 'Absolument. Nous utilisons un chiffrement de niveau bancaire, hebergeons vos donnees en Europe et respectons le RGPD.',
  },
  {
    question: 'Puis-je personnaliser la plateforme avec ma marque ?',
    answer: 'Le plan Enterprise inclut le white-label complet : logo, couleurs, domaine personnalise, emails au nom de votre marque.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Questions frequentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Trouvez les reponses a vos questions
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="bg-card p-6 rounded-lg border border-border"
            >
              <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

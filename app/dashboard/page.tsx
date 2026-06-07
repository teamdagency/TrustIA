'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { ReviewRepository } from '@/repositories/review.repository';
import { CampaignRepository } from '@/repositories/campaign.repository';
import { CustomerRepository } from '@/repositories/customer.repository';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Star, Mail, Users, TrendingUp, ArrowUpRight, Clock,
  ChevronRight, AlertCircle,
} from 'lucide-react';

interface DashboardStats {
  totalReviews: number;
  averageRating: number;
  activeCampaigns: number;
  totalCustomers: number;
  pendingReviews: number;
}

export default function DashboardPage() {
  const { user, currentOrganizationId } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || 'Utilisateur';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentOrganizationId) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [reviewStats, recent, activeCampaigns, totalCustomers] = await Promise.all([
          ReviewRepository.getStats(currentOrganizationId),
          ReviewRepository.findByOrg(currentOrganizationId, { limit: 4 }),
          CampaignRepository.countByOrg(currentOrganizationId),
          CustomerRepository.countByOrg(currentOrganizationId),
        ]);

        setStats({
          totalReviews: reviewStats.total,
          averageRating: reviewStats.averageRating,
          activeCampaigns,
          totalCustomers,
          pendingReviews: reviewStats.byStatus.pending,
        });
        setRecentReviews(recent.data);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [currentOrganizationId]);

  const statCards = stats
    ? [
        { title: 'Total des avis', value: stats.totalReviews.toLocaleString('fr-FR'), icon: Star, href: '/dashboard/reviews', color: 'text-primary' },
        { title: 'Campagnes actives', value: String(stats.activeCampaigns), icon: Mail, href: '/dashboard/campaigns', color: 'text-success' },
        { title: 'Clients', value: stats.totalCustomers.toLocaleString('fr-FR'), icon: Users, href: '/dashboard/customers', color: 'text-accent' },
        { title: 'Note moyenne', value: stats.averageRating > 0 ? `${stats.averageRating}/5` : '—', icon: TrendingUp, href: '/dashboard/reviews', color: 'text-warning' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold">Bonjour, {firstName} !</h1>
        <p className="text-muted-foreground mt-1">
          {user?.currentOrganization?.name ?? 'Votre organisation'} — tableau de bord
        </p>
      </motion.div>

      {stats && stats.pendingReviews > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
            <p className="text-sm">
              <strong>{stats.pendingReviews}</strong> avis en attente de moderation.
            </p>
            <Button asChild size="sm" variant="outline" className="ml-auto flex-shrink-0">
              <Link href="/dashboard/reviews">Voir</Link>
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                <CardContent><Skeleton className="h-8 w-16" /></CardContent>
              </Card>
            ))
          : statCards.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link href={s.href}>
                  <Card className="hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{s.value}</div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Voir le detail
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Avis recents</CardTitle>
                  <CardDescription>Les derniers avis de vos clients</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/reviews">Voir tout <ChevronRight className="w-3 h-3 ml-1" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : recentReviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun avis pour l&apos;instant</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium text-sm">{review.customer?.full_name || 'Client anonyme'}</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/20'}`} />
                            ))}
                          </div>
                          <Badge variant="secondary" className="text-xs capitalize">{review.source}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{review.content || review.title || '—'}</p>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Gerez votre reputation en quelques clics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/campaigns"><Mail className="w-4 h-4 mr-2" />Nouvelle campagne</Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/customers"><Users className="w-4 h-4 mr-2" />Ajouter des clients</Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/reviews"><Star className="w-4 h-4 mr-2" />Moderer les avis</Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/settings/organization"><TrendingUp className="w-4 h-4 mr-2" />Configurer l&apos;organisation</Link>
              </Button>
            </CardContent>
          </Card>

          {user?.currentOrganization && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Organisation</p>
                  <Badge variant="outline" className="text-xs capitalize">{user.currentOrganization.role}</Badge>
                </div>
                <p className="font-semibold">{user.currentOrganization.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{user.currentOrganization.slug}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

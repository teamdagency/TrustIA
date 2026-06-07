'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { ReviewRepository } from '@/repositories/review.repository';
import { ReviewService } from '@/services/review.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Star, Search, Filter, MessageSquare, Check, X, Flag, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Review, ReviewStatus } from '@/types';

const STATUS_CONFIG: Record<ReviewStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'En attente', variant: 'secondary' },
  approved: { label: 'Approuve', variant: 'default' },
  rejected: { label: 'Rejete', variant: 'destructive' },
  flagged: { label: 'Signale', variant: 'outline' },
};

const SOURCE_ICON: Record<string, string> = {
  google: 'G',
  facebook: 'f',
  tripadvisor: 'TA',
  trustpilot: 'TP',
  internal: '•',
  custom: '★',
};

export default function ReviewsPage() {
  const { currentOrganizationId, user, can } = useAuth();
  const { toast } = useToast();
  const canManage = can('manage_reviews');

  const [reviews, setReviews] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [respondTarget, setRespondTarget] = useState<any | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!currentOrganizationId) return;
    setIsLoading(true);
    try {
      const [result, statsData] = await Promise.all([
        ReviewRepository.findByOrg(currentOrganizationId, {
          status: statusFilter !== 'all' ? statusFilter as ReviewStatus : undefined,
          rating: ratingFilter !== 'all' ? Number(ratingFilter) : undefined,
          search: search || undefined,
          limit: 50,
        }),
        ReviewRepository.getStats(currentOrganizationId),
      ]);
      setReviews(result.data);
      setTotal(result.count);
      setStats(statsData);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganizationId, statusFilter, ratingFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (reviewId: string, newStatus: ReviewStatus) => {
    if (!currentOrganizationId || !user) return;
    try {
      if (newStatus === 'approved') await ReviewService.approve(reviewId, currentOrganizationId, user.id);
      else if (newStatus === 'rejected') await ReviewService.reject(reviewId, currentOrganizationId, user.id);
      await load();
      toast({ title: 'Statut mis a jour' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleRespond = async () => {
    if (!respondTarget || !currentOrganizationId || !user || !responseText.trim()) return;
    setIsSubmitting(true);
    try {
      await ReviewService.respond(respondTarget.id, responseText, currentOrganizationId, user.id);
      setRespondTarget(null);
      setResponseText('');
      await load();
      toast({ title: 'Reponse publiee' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Avis clients</h1>
          <p className="text-muted-foreground mt-1">{total} avis au total</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total', value: stats.total, icon: Star, color: 'text-primary' },
            { label: 'Note moyenne', value: stats.averageRating > 0 ? `${stats.averageRating}/5` : '—', icon: TrendingUp, color: 'text-success' },
            { label: 'En attente', value: stats.byStatus.pending, icon: Flag, color: 'text-warning' },
            { label: 'Ce mois', value: stats.recentCount, icon: MessageSquare, color: 'text-accent' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{s.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher un avis..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Approuves</SelectItem>
            <SelectItem value="rejected">Rejetes</SelectItem>
            <SelectItem value="flagged">Signales</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les notes</SelectItem>
            {[5, 4, 3, 2, 1].map((r) => (
              <SelectItem key={r} value={String(r)}>{r} etoiles</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun avis trouve</p>
            </div>
          ) : (
            <div className="divide-y">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-medium text-sm">{review.customer?.full_name || 'Client anonyme'}</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
                          ))}
                        </div>
                        <Badge variant={STATUS_CONFIG[review.status as ReviewStatus]?.variant ?? 'secondary'} className="text-xs">
                          {STATUS_CONFIG[review.status as ReviewStatus]?.label ?? review.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                          {SOURCE_ICON[review.source] ?? review.source}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {review.title && <p className="text-sm font-medium mb-1">{review.title}</p>}
                      <p className="text-sm text-muted-foreground line-clamp-2">{review.content}</p>
                      {review.response_content && (
                        <div className="mt-2 pl-3 border-l-2 border-primary/40">
                          <p className="text-xs text-muted-foreground mb-0.5">Votre reponse</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{review.response_content}</p>
                        </div>
                      )}
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {review.status === 'pending' && (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-success hover:text-success" onClick={() => handleStatusChange(review.id, 'approved')} title="Approuver">
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleStatusChange(review.id, 'rejected')} title="Rejeter">
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {!review.response_content && (
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setRespondTarget(review); setResponseText(''); }} title="Repondre">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Respond Dialog */}
      <Dialog open={!!respondTarget} onOpenChange={(o) => !o && setRespondTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Repondre a l&apos;avis</DialogTitle>
          </DialogHeader>
          {respondTarget && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg text-sm">
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-3 h-3 ${j < respondTarget.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />
                  ))}
                  <span className="text-xs text-muted-foreground">{respondTarget.customer?.full_name || 'Client anonyme'}</span>
                </div>
                <p className="text-muted-foreground">{respondTarget.content}</p>
              </div>
              <div className="space-y-2">
                <Label>Votre reponse</Label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Merci pour votre avis..."
                  rows={4}
                />
              </div>
              <Button className="w-full" disabled={!responseText.trim() || isSubmitting} onClick={handleRespond}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Publier la reponse
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

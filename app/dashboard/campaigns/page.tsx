'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { CampaignService } from '@/services/campaign.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Mail, Smartphone, Play, Pause, Trash2, Loader2,
  MoreHorizontal, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import type { Campaign, CampaignStatus } from '@/types';

const STATUS_CONFIG: Record<CampaignStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  draft: { label: 'Brouillon', variant: 'secondary', icon: Clock },
  active: { label: 'Active', variant: 'default', icon: CheckCircle2 },
  paused: { label: 'Suspendue', variant: 'outline', icon: Pause },
  completed: { label: 'Terminee', variant: 'secondary', icon: CheckCircle2 },
};

const TYPE_ICON = { email: Mail, sms: Smartphone, both: Mail };

export default function CampaignsPage() {
  const { currentOrganizationId, user, can } = useAuth();
  const { toast } = useToast();
  const canManage = can('manage_campaigns');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'email' | 'sms' | 'both'>('email');
  const [templateEmail, setTemplateEmail] = useState('');
  const [delayHours, setDelayHours] = useState('24');

  const load = useCallback(async () => {
    if (!currentOrganizationId) return;
    setIsLoading(true);
    try {
      const data = await CampaignService.list(currentOrganizationId);
      setCampaigns(data);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganizationId]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganizationId || !user) return;
    setIsCreating(true);
    try {
      await CampaignService.create({
        organizationId: currentOrganizationId,
        userId: user.id,
        name,
        description,
        type,
        templateEmail: templateEmail || undefined,
        delayHours: Number(delayHours),
      });
      setDialogOpen(false);
      setName(''); setDescription(''); setTemplateEmail(''); setDelayHours('24');
      await load();
      toast({ title: 'Campagne creee' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (id: string, status: CampaignStatus) => {
    if (!currentOrganizationId || !user) return;
    await CampaignService.updateStatus(id, status, currentOrganizationId, user.id);
    await load();
    toast({ title: 'Statut mis a jour' });
  };

  const handleDelete = async (id: string) => {
    if (!currentOrganizationId || !user) return;
    await CampaignService.delete(id, currentOrganizationId, user.id);
    await load();
    toast({ title: 'Campagne supprimee' });
  };

  const activeCount = campaigns.filter((c) => c.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campagnes</h1>
          <p className="text-muted-foreground mt-1">{activeCount} campagne{activeCount !== 1 ? 's' : ''} active{activeCount !== 1 ? 's' : ''}</p>
        </div>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Nouvelle campagne</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Creer une campagne</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="campName">Nom <span className="text-destructive">*</span></Label>
                  <Input id="campName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Campagne satisfaction clients" required />
                </div>
                <div className="space-y-2">
                  <Label>Type de campagne</Label>
                  <Select value={type} onValueChange={(v) => setType(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email uniquement</SelectItem>
                      <SelectItem value="sms">SMS uniquement</SelectItem>
                      <SelectItem value="both">Email + SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Delai d&apos;envoi (heures apres achat)</Label>
                  <Select value={delayHours} onValueChange={setDelayHours}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 heure</SelectItem>
                      <SelectItem value="6">6 heures</SelectItem>
                      <SelectItem value="24">24 heures</SelectItem>
                      <SelectItem value="48">48 heures</SelectItem>
                      <SelectItem value="72">72 heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(type === 'email' || type === 'both') && (
                  <div className="space-y-2">
                    <Label>Modele email</Label>
                    <Textarea
                      value={templateEmail}
                      onChange={(e) => setTemplateEmail(e.target.value)}
                      placeholder="Bonjour {nom}, merci pour votre achat..."
                      rows={3}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Description (optionnel)</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description interne" />
                </div>
                <Button type="submit" className="w-full" disabled={isCreating || !name.trim()}>
                  {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Creer la campagne
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Mail className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-4">Aucune campagne pour l&apos;instant</p>
            {canManage && (
              <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Creer ma premiere campagne</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign, i) => {
            const statusCfg = STATUS_CONFIG[campaign.status];
            const TypeIcon = TYPE_ICON[campaign.type] ?? Mail;
            return (
              <motion.div key={campaign.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TypeIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-sm truncate">{campaign.name}</CardTitle>
                          <p className="text-xs text-muted-foreground capitalize">{campaign.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Badge variant={statusCfg.variant} className="text-xs">{statusCfg.label}</Badge>
                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {campaign.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'active')}>
                                  <Play className="w-4 h-4 mr-2" />Lancer
                                </DropdownMenuItem>
                              )}
                              {campaign.status === 'active' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'paused')}>
                                  <Pause className="w-4 h-4 mr-2" />Suspendre
                                </DropdownMenuItem>
                              )}
                              {campaign.status === 'paused' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'active')}>
                                  <Play className="w-4 h-4 mr-2" />Reprendre
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDelete(campaign.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1">
                    {campaign.description && (
                      <p className="text-xs text-muted-foreground mb-3">{campaign.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {campaign.delay_hours}h delai
                      </span>
                      <span>{new Date(campaign.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

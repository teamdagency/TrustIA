'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, UserPlus, Trash2, Users } from 'lucide-react';
import type { OrganizationMember, Invitation, UserRole } from '@/types';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietaire',
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Collaborateur',
  readonly: 'Lecture seule',
  agency_owner: 'Agence Owner',
  agency_admin: 'Agence Admin',
  business_owner: 'Business Owner',
  member: 'Membre',
};

export default function MembersPage() {
  const { currentOrganizationId, user, can } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isAdmin = can('admin');

  const load = async () => {
    if (!currentOrganizationId) return;
    setIsLoading(true);
    const [{ data: m }, { data: inv }] = await Promise.all([
      supabase
        .from('organization_members')
        .select('*, user:users(id, email, full_name, avatar_url)')
        .eq('organization_id', currentOrganizationId),
      supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', currentOrganizationId)
        .is('accepted_at', null),
    ]);
    setMembers((m ?? []) as OrganizationMember[]);
    setInvitations((inv ?? []) as Invitation[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [currentOrganizationId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganizationId || !user) return;
    setIsInviting(true);
    try {
      const { error } = await supabase.from('invitations').insert({
        organization_id: currentOrganizationId,
        email: inviteEmail,
        role: inviteRole,
        invited_by: user.id,
      });
      if (error) throw error;
      setInviteEmail('');
      setDialogOpen(false);
      await load();
      toast({ title: 'Invitation envoyee', description: `${inviteEmail} a ete invite.` });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer l\'invitation', variant: 'destructive' });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await supabase.from('organization_members').delete().eq('id', memberId);
    if (!error) { await load(); toast({ title: 'Membre supprime' }); }
  };

  const handleCancelInvitation = async (invId: string) => {
    await supabase.from('invitations').delete().eq('id', invId);
    await load();
    toast({ title: 'Invitation annulee' });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Membres</h1>
          <p className="text-muted-foreground mt-1">Gerez l&apos;equipe de votre organisation.</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="w-4 h-4 mr-2" />Inviter</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inviter un membre</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Adresse email</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Collaborateur</SelectItem>
                      <SelectItem value="readonly">Lecture seule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isInviting}>
                  {isInviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Envoyer l&apos;invitation
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" /> Membres actifs ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-3">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{(m.user?.full_name ?? m.user?.email ?? '?').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{m.user?.full_name || m.user?.email}</p>
                      <p className="text-xs text-muted-foreground">{m.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{ROLE_LABELS[m.role] ?? m.role}</Badge>
                    {isAdmin && m.user_id !== user?.id && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleRemoveMember(m.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitations en attente ({invitations.length})</CardTitle>
            <CardDescription>Ces personnes n&apos;ont pas encore accepte leur invitation.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Expire le {new Date(inv.expires_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{ROLE_LABELS[inv.role] ?? inv.role}</Badge>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleCancelInvitation(inv.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

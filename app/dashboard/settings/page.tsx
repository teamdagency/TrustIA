'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { UserRepository } from '@/repositories/user.repository';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Lock, Globe } from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await UserRepository.update(user!.id, { full_name: fullName });
      await refreshUser();
      toast({ title: 'Profil mis a jour' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de mettre a jour le profil', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: 'Mot de passe mis a jour' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de changer le mot de passe', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Parametres du compte</h1>
        <p className="text-muted-foreground mt-1">Gerez vos informations personnelles et votre securite.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="w-4 h-4" /> Profil</CardTitle>
          <CardDescription>Vos informations personnelles visibles par votre equipe.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatarUrl ?? ''} />
                <AvatarFallback className="text-lg">
                  {user?.fullName?.charAt(0).toUpperCase() ?? user?.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{user?.email}</p>
                <p>Photo de profil via Gravatar</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse email</Label>
              <Input value={user?.email} disabled className="bg-muted" />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="w-4 h-4" /> Securite</CardTitle>
          <CardDescription>Changez votre mot de passe.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 caracteres"
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetez le mot de passe"
                required
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Changer le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

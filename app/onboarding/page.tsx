'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { TenantService } from '@/services/tenant.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('FR');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsCreating(true);
    try {
      await TenantService.createOrganization({
        name: name.trim(),
        industry: industry || null,
        country,
        createdByUserId: user.id,
      });
      await refreshUser();
      router.push('/dashboard');
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message ?? 'Impossible de creer l\'organisation', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-primary rounded-xl items-center justify-center mb-4">
            <svg className="w-7 h-7 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Bienvenue sur TrustIA</h1>
          <p className="text-muted-foreground mt-1">Creez votre organisation pour commencer</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Nouvelle organisation
            </CardTitle>
            <CardDescription>
              Cette organisation regroupe votre equipe et vos donnees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nom de l&apos;organisation <span className="text-destructive">*</span></Label>
                <Input
                  id="orgName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Restaurant Le Central"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Secteur d&apos;activite</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Choisir un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restauration</SelectItem>
                    <SelectItem value="beauty">Beaute & Bien-etre</SelectItem>
                    <SelectItem value="health">Sante</SelectItem>
                    <SelectItem value="retail">Commerce</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="hotel">Hotellerie</SelectItem>
                    <SelectItem value="realestate">Immobilier</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pays</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="BE">Belgique</SelectItem>
                    <SelectItem value="CH">Suisse</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isCreating || !name.trim()}>
                {isCreating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creation en cours...</>
                ) : (
                  <>Creer l&apos;organisation <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Essai gratuit 14 jours, aucune carte requise.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, Palette, Globe } from 'lucide-react';
import type { Organization, WhiteLabelConfig } from '@/types';

export default function OrganizationSettingsPage() {
  const { user, currentOrganizationId, can, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [org, setOrg] = useState<Organization | null>(null);
  const [wl, setWl] = useState<WhiteLabelConfig | null>(null);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('FR');
  const [brandName, setBrandName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');

  const isAdmin = can('admin');

  useEffect(() => {
    if (!currentOrganizationId) return;
    const load = async () => {
      const [{ data: orgData }, { data: wlData }] = await Promise.all([
        supabase.from('organizations').select('*').eq('id', currentOrganizationId).maybeSingle(),
        supabase.from('white_label_configs').select('*').eq('organization_id', currentOrganizationId).maybeSingle(),
      ]);
      if (orgData) {
        setOrg(orgData as Organization);
        setName(orgData.name);
        setIndustry(orgData.industry ?? '');
        setCountry(orgData.country ?? 'FR');
      }
      if (wlData) {
        setWl(wlData as WhiteLabelConfig);
        setBrandName(wlData.brand_name ?? '');
        setPrimaryColor(wlData.primary_color ?? '#2563eb');
      }
    };
    load();
  }, [currentOrganizationId]);

  const handleOrgSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganizationId || !isAdmin) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name, industry: industry || null, country })
        .eq('id', currentOrganizationId);
      if (error) throw error;
      await refreshUser();
      toast({ title: 'Organisation mise a jour' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleWlSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganizationId || !isAdmin) return;
    setIsSaving(true);
    try {
      if (wl) {
        await supabase.from('white_label_configs').update({ brand_name: brandName, primary_color: primaryColor }).eq('id', wl.id);
      } else {
        await supabase.from('white_label_configs').insert({ organization_id: currentOrganizationId, brand_name: brandName, primary_color: primaryColor });
      }
      toast({ title: 'White-label mis a jour' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!org) {
    return <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Parametres de l&apos;organisation</h1>
        <p className="text-muted-foreground mt-1">Configurez votre organisation et votre image de marque.</p>
      </div>

      {/* Org Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Informations</CardTitle>
          <CardDescription>Informations generales de l&apos;organisation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOrgSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Identifiant unique (slug)</Label>
              <Input value={org.slug} disabled className="bg-muted font-mono text-sm" />
              <p className="text-xs text-muted-foreground">Non modifiable apres creation.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgName">Nom de l&apos;organisation</Label>
              <Input
                id="orgName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isAdmin}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Secteur d&apos;activite</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={!isAdmin}
                placeholder="ex: Restauration, Beaute, Sante..."
              />
            </div>
            <div className="space-y-2">
              <Label>Pays</Label>
              <Select value={country} onValueChange={setCountry} disabled={!isAdmin}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="BE">Belgique</SelectItem>
                  <SelectItem value="CH">Suisse</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enregistrer
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* White Label */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Palette className="w-4 h-4" /> White-label</CardTitle>
              <CardDescription>Personnalisez l&apos;apparence de la plateforme.</CardDescription>
            </div>
            <Badge variant={wl?.enabled ? 'default' : 'secondary'}>
              {wl?.enabled ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWlSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brandName">Nom de la marque</Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                disabled={!isAdmin}
                placeholder="Votre marque"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Couleur principale</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={!isAdmin}
                  className="h-10 w-16 rounded border cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={!isAdmin}
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Globe className="w-3 h-3" /> Domaine personnalise</Label>
              <Input
                value={wl?.custom_domain ?? ''}
                disabled
                placeholder="reviews.votremarque.com"
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Disponible sur le plan Enterprise.</p>
            </div>
            {isAdmin && (
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enregistrer
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { CustomerService } from '@/services/customer.service';
import { CustomerRepository } from '@/repositories/customer.repository';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Trash2, Loader2, Users, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Customer } from '@/types';

export default function CustomersPage() {
  const { currentOrganizationId, can } = useAuth();
  const { toast } = useToast();
  const canManage = can('manage_customers');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tags, setTags] = useState('');

  const load = useCallback(async () => {
    if (!currentOrganizationId) return;
    setIsLoading(true);
    try {
      const result = await CustomerRepository.findByOrg(currentOrganizationId, {
        search: search || undefined,
        limit: 60,
      });
      setCustomers(result.data);
      setTotal(result.count);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganizationId, search]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganizationId) return;
    setIsCreating(true);
    try {
      await CustomerService.create({
        organizationId: currentOrganizationId,
        fullName: fullName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      setDialogOpen(false);
      setFullName(''); setEmail(''); setPhone(''); setTags('');
      await load();
      toast({ title: 'Client ajoute' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await CustomerService.delete(id);
    await load();
    toast({ title: 'Client supprime' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">{total} client{total !== 1 ? 's' : ''}</p>
        </div>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Ajouter un client</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau client</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="custName">Nom complet <span className="text-destructive">*</span></Label>
                  <Input id="custName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Marie Dupont" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custEmail">Email</Label>
                  <Input id="custEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="marie@exemple.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custPhone">Telephone</Label>
                  <Input id="custPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 00 00 00 00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custTags">Tags (separes par virgule)</Label>
                  <Input id="custTags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="vip, fidele, pro" />
                </div>
                <Button type="submit" className="w-full" disabled={isCreating || !fullName.trim()}>
                  {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Ajouter le client
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher par nom, email, telephone..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : customers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun client trouve</p>
              {canManage && !search && (
                <Button className="mt-4" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Ajouter le premier client</Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {customers.map((customer, i) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarFallback className="text-sm font-medium">
                        {customer.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{customer.full_name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {customer.email && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />{customer.email}
                          </span>
                        )}
                        {customer.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />{customer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {customer.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs hidden sm:flex">{tag}</Badge>
                    ))}
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    {canManage && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(customer.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

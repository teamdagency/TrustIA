import { supabase } from '@/lib/supabase/client';
import type { Campaign, CampaignStatus } from '@/types';

export class CampaignRepository {
  static async findByOrg(organizationId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Campaign[];
  }

  static async findById(id: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Campaign | null;
  }

  static async create(data: {
    organization_id: string;
    name: string;
    description?: string;
    type?: 'email' | 'sms' | 'both';
    template_email?: string | null;
    template_sms?: string | null;
    trigger_event?: string;
    delay_hours?: number;
    created_by?: string | null;
  }) {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return campaign as Campaign;
  }

  static async update(id: string, data: Partial<Pick<Campaign, 'name' | 'description' | 'type' | 'status' | 'template_email' | 'template_sms' | 'delay_hours'>>) {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return campaign as Campaign;
  }

  static async updateStatus(id: string, status: CampaignStatus) {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ status, ...(status === 'active' ? { started_at: new Date().toISOString() } : {}), ...(status === 'completed' ? { ended_at: new Date().toISOString() } : {}) })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Campaign;
  }

  static async delete(id: string) {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw error;
  }

  static async countByOrg(organizationId: string) {
    const { count, error } = await supabase
      .from('campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'active');
    if (error) throw error;
    return count ?? 0;
  }
}

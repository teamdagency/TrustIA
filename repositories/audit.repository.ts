import { supabase } from '@/lib/supabase/client';
import type { AuditLog } from '@/types';

export class AuditRepository {
  static async log(entry: {
    organization_id: string | null;
    user_id?: string | null;
    action: string;
    resource: string;
    resource_id?: string | null;
    metadata?: Record<string, unknown>;
    ip_address?: string | null;
    user_agent?: string | null;
  }) {
    const { error } = await supabase.from('audit_logs').insert(entry);
    if (error) console.error('[AuditLog]', error.message);
  }

  static async findByOrg(organizationId: string, limit = 50) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, user:users(email, full_name)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as AuditLog[];
  }
}

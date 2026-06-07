import { supabase } from '@/lib/supabase/client';
import type { Customer } from '@/types';

export interface CustomerFilters {
  search?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

export class CustomerRepository {
  static async findByOrg(organizationId: string, filters: CustomerFilters = {}) {
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }
    if (filters.tag) {
      query = query.contains('tags', [filters.tag]);
    }
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset) query = query.range(filters.offset, (filters.offset ?? 0) + (filters.limit ?? 20) - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data ?? []) as Customer[], count: count ?? 0 };
  }

  static async findById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Customer | null;
  }

  static async create(data: {
    organization_id: string;
    full_name: string;
    email?: string | null;
    phone?: string | null;
    tags?: string[];
    custom_fields?: Record<string, unknown>;
  }) {
    const { data: customer, error } = await supabase
      .from('customers')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return customer as Customer;
  }

  static async update(id: string, data: Partial<Pick<Customer, 'full_name' | 'email' | 'phone' | 'tags' | 'custom_fields'>>) {
    const { data: customer, error } = await supabase
      .from('customers')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return customer as Customer;
  }

  static async delete(id: string) {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  }

  static async countByOrg(organizationId: string) {
    const { count, error } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId);
    if (error) throw error;
    return count ?? 0;
  }
}

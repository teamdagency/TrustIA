import { supabase } from '@/lib/supabase/client';
import type { Review, ReviewStatus } from '@/types';

export interface ReviewFilters {
  status?: ReviewStatus;
  source?: string;
  rating?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ReviewStats {
  total: number;
  averageRating: number;
  byStatus: Record<ReviewStatus, number>;
  byRating: Record<number, number>;
  recentCount: number;
}

export class ReviewRepository {
  static async findByOrg(organizationId: string, filters: ReviewFilters = {}) {
    let query = supabase
      .from('reviews')
      .select('*, customer:customers(id, full_name, email)', { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.source) query = query.eq('source', filters.source);
    if (filters.rating) query = query.eq('rating', filters.rating);
    if (filters.search) {
      query = query.or(`content.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
    }
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset) query = query.range(filters.offset, (filters.offset ?? 0) + (filters.limit ?? 20) - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data ?? []) as (Review & { customer?: { id: string; full_name: string; email: string | null } | null })[], count: count ?? 0 };
  }

  static async findById(id: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, customer:customers(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Review | null;
  }

  static async create(data: {
    organization_id: string;
    customer_id?: string | null;
    rating: number;
    title?: string;
    content?: string;
    source?: string;
  }) {
    const { data: review, error } = await supabase
      .from('reviews')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return review as Review;
  }

  static async updateStatus(id: string, status: ReviewStatus) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Review;
  }

  static async respond(id: string, responseContent: string) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ response_content: responseContent, responded_at: new Date().toISOString(), status: 'approved' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Review;
  }

  static async getStats(organizationId: string): Promise<ReviewStats> {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating, status, created_at')
      .eq('organization_id', organizationId);
    if (error) throw error;

    const reviews = data ?? [];
    const total = reviews.length;
    const avgRating = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

    const byStatus = { pending: 0, approved: 0, rejected: 0, flagged: 0 } as Record<ReviewStatus, number>;
    const byRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
    let recentCount = 0;

    for (const r of reviews) {
      byStatus[r.status as ReviewStatus] = (byStatus[r.status as ReviewStatus] ?? 0) + 1;
      byRating[r.rating] = (byRating[r.rating] ?? 0) + 1;
      if (r.created_at >= thirtyDaysAgo) recentCount++;
    }

    return { total, averageRating: Math.round(avgRating * 10) / 10, byStatus, byRating, recentCount };
  }
}

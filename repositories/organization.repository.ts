import { supabase } from '@/lib/supabase/client';
import type { Organization } from '@/types';

export class OrganizationRepository {
  static async findById(id: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Organization | null;
  }

  static async findBySlug(slug: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data as Organization | null;
  }

  static async create(data: {
    name: string;
    slug: string;
    industry?: string | null;
    country?: string;
    trial_ends_at?: string;
    type?: string;
  }) {
    const { data: org, error } = await supabase
      .from('organizations')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return org as Organization;
  }

  static async update(id: string, data: Partial<Pick<Organization, 'name' | 'industry' | 'country' | 'locale' | 'timezone'>>) {
    const { data: org, error } = await supabase
      .from('organizations')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return org as Organization;
  }

  static async slugExists(slug: string) {
    const { data } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    return !!data;
  }

  static async generateUniqueSlug(base: string) {
    const slugify = (t: string) =>
      t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let slug = slugify(base);
    let attempt = 0;
    while (await OrganizationRepository.slugExists(slug)) {
      attempt++;
      slug = `${slugify(base)}-${attempt}`;
    }
    return slug;
  }
}

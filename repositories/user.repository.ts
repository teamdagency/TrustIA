import { supabase } from '@/lib/supabase/client';
import type { User } from '@/types';

export class UserRepository {
  static async findById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as User | null;
  }

  static async update(id: string, data: Partial<Pick<User, 'full_name' | 'avatar_url' | 'locale' | 'timezone'>>) {
    const { data: user, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return user as User;
  }
}

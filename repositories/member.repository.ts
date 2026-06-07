import { supabase } from '@/lib/supabase/client';
import type { OrganizationMember, UserRole, Invitation } from '@/types';

export class MemberRepository {
  static async findByOrg(organizationId: string) {
    const { data, error } = await supabase
      .from('organization_members')
      .select('*, user:users(id, email, full_name, avatar_url)')
      .eq('organization_id', organizationId);
    if (error) throw error;
    return (data ?? []) as OrganizationMember[];
  }

  static async findByUser(userId: string) {
    const { data, error } = await supabase
      .from('organization_members')
      .select('role, organization:organizations(id, name, slug, logo_url, type)')
      .eq('user_id', userId);
    if (error) throw error;
    return data ?? [];
  }

  static async create(organizationId: string, userId: string, role: UserRole, invitedBy?: string) {
    const { data, error } = await supabase
      .from('organization_members')
      .insert({ organization_id: organizationId, user_id: userId, role, invited_by: invitedBy ?? null })
      .select()
      .single();
    if (error) throw error;
    return data as OrganizationMember;
  }

  static async remove(memberId: string) {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId);
    if (error) throw error;
  }

  static async updateRole(memberId: string, role: UserRole) {
    const { data, error } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('id', memberId)
      .select()
      .single();
    if (error) throw error;
    return data as OrganizationMember;
  }

  static async countByOrg(organizationId: string) {
    const { count, error } = await supabase
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId);
    if (error) throw error;
    return count ?? 0;
  }
}

export class InvitationRepository {
  static async findPendingByOrg(organizationId: string) {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('organization_id', organizationId)
      .is('accepted_at', null);
    if (error) throw error;
    return (data ?? []) as Invitation[];
  }

  static async findByToken(token: string) {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .maybeSingle();
    if (error) throw error;
    return data as Invitation | null;
  }

  static async create(organizationId: string, email: string, role: UserRole, invitedBy: string) {
    const { data, error } = await supabase
      .from('invitations')
      .insert({ organization_id: organizationId, email, role, invited_by: invitedBy })
      .select()
      .single();
    if (error) throw error;
    return data as Invitation;
  }

  static async accept(token: string) {
    const { error } = await supabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('token', token);
    if (error) throw error;
  }

  static async cancel(invitationId: string) {
    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitationId);
    if (error) throw error;
  }
}

import { OrganizationRepository } from '@/repositories/organization.repository';
import { MemberRepository } from '@/repositories/member.repository';
import { AuditService, AuditActions } from '@/services/audit.service';
import type { UserRole } from '@/types';

export class TenantService {
  static async createOrganization(params: {
    name: string;
    industry?: string | null;
    country?: string;
    createdByUserId: string;
    ownerRole?: UserRole;
  }) {
    const slug = await OrganizationRepository.generateUniqueSlug(params.name);

    const org = await OrganizationRepository.create({
      name: params.name,
      slug,
      industry: params.industry ?? null,
      country: params.country ?? 'FR',
      trial_ends_at: new Date(Date.now() + 14 * 86_400_000).toISOString(),
    });

    await MemberRepository.create(org.id, params.createdByUserId, params.ownerRole ?? 'owner');

    await AuditService.log({
      organizationId: org.id,
      userId: params.createdByUserId,
      action: AuditActions.ORG_CREATED,
      resource: 'organization',
      resourceId: org.id,
      metadata: { name: org.name, slug: org.slug },
    });

    return org;
  }

  static async inviteMember(params: {
    organizationId: string;
    invitedByUserId: string;
    email: string;
    role: UserRole;
  }) {
    const { InvitationRepository } = await import('@/repositories/member.repository');

    const invitation = await InvitationRepository.create(
      params.organizationId,
      params.email,
      params.role,
      params.invitedByUserId
    );

    await AuditService.log({
      organizationId: params.organizationId,
      userId: params.invitedByUserId,
      action: AuditActions.MEMBER_INVITED,
      resource: 'invitation',
      resourceId: invitation.id,
      metadata: { email: params.email, role: params.role },
    });

    return invitation;
  }

  static async removeMember(params: {
    organizationId: string;
    memberId: string;
    removedByUserId: string;
  }) {
    await MemberRepository.remove(params.memberId);

    await AuditService.log({
      organizationId: params.organizationId,
      userId: params.removedByUserId,
      action: AuditActions.MEMBER_REMOVED,
      resource: 'member',
      resourceId: params.memberId,
    });
  }
}

import { CampaignRepository } from '@/repositories/campaign.repository';
import { AuditService, AuditActions } from '@/services/audit.service';
import type { CampaignStatus } from '@/types';

export class CampaignService {
  static async list(organizationId: string) {
    return CampaignRepository.findByOrg(organizationId);
  }

  static async create(params: {
    organizationId: string;
    userId: string;
    name: string;
    description?: string;
    type?: 'email' | 'sms' | 'both';
    templateEmail?: string;
    templateSms?: string;
    triggerEvent?: string;
    delayHours?: number;
  }) {
    const campaign = await CampaignRepository.create({
      organization_id: params.organizationId,
      name: params.name,
      description: params.description,
      type: params.type ?? 'email',
      template_email: params.templateEmail ?? null,
      template_sms: params.templateSms ?? null,
      trigger_event: params.triggerEvent ?? 'manual',
      delay_hours: params.delayHours ?? 24,
      created_by: params.userId,
    });

    await AuditService.log({
      organizationId: params.organizationId,
      userId: params.userId,
      action: AuditActions.CAMPAIGN_CREATED,
      resource: 'campaign',
      resourceId: campaign.id,
      metadata: { name: campaign.name, type: campaign.type },
    });

    return campaign;
  }

  static async updateStatus(id: string, status: CampaignStatus, organizationId: string, userId: string) {
    const campaign = await CampaignRepository.updateStatus(id, status);
    await AuditService.log({
      organizationId,
      userId,
      action: AuditActions.CAMPAIGN_UPDATED,
      resource: 'campaign',
      resourceId: id,
      metadata: { status },
    });
    return campaign;
  }

  static async delete(id: string, organizationId: string, userId: string) {
    await CampaignRepository.delete(id);
    await AuditService.log({
      organizationId,
      userId,
      action: AuditActions.CAMPAIGN_DELETED,
      resource: 'campaign',
      resourceId: id,
    });
  }
}

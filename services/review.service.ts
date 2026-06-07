import { ReviewRepository } from '@/repositories/review.repository';
import { AuditService, AuditActions } from '@/services/audit.service';
import type { ReviewStatus } from '@/types';

export class ReviewService {
  static async list(organizationId: string, filters = {}) {
    return ReviewRepository.findByOrg(organizationId, filters);
  }

  static async getStats(organizationId: string) {
    return ReviewRepository.getStats(organizationId);
  }

  static async approve(id: string, organizationId: string, userId: string) {
    const review = await ReviewRepository.updateStatus(id, 'approved');
    await AuditService.log({ organizationId, userId, action: AuditActions.CAMPAIGN_UPDATED, resource: 'review', resourceId: id, metadata: { status: 'approved' } });
    return review;
  }

  static async reject(id: string, organizationId: string, userId: string) {
    const review = await ReviewRepository.updateStatus(id, 'rejected');
    await AuditService.log({ organizationId, userId, action: AuditActions.CAMPAIGN_UPDATED, resource: 'review', resourceId: id, metadata: { status: 'rejected' } });
    return review;
  }

  static async respond(id: string, responseContent: string, organizationId: string, userId: string) {
    const review = await ReviewRepository.respond(id, responseContent);
    await AuditService.log({ organizationId, userId, action: AuditActions.CAMPAIGN_UPDATED, resource: 'review', resourceId: id, metadata: { responded: true } });
    return review;
  }
}

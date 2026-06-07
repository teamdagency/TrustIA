import { CustomerRepository } from '@/repositories/customer.repository';

export class CustomerService {
  static async list(organizationId: string, filters = {}) {
    return CustomerRepository.findByOrg(organizationId, filters);
  }

  static async create(params: {
    organizationId: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    tags?: string[];
  }) {
    return CustomerRepository.create({
      organization_id: params.organizationId,
      full_name: params.fullName,
      email: params.email ?? null,
      phone: params.phone ?? null,
      tags: params.tags ?? [],
    });
  }

  static async update(id: string, data: { full_name?: string; email?: string | null; phone?: string | null; tags?: string[] }) {
    return CustomerRepository.update(id, data);
  }

  static async delete(id: string) {
    return CustomerRepository.delete(id);
  }
}

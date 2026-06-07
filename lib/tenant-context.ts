import type { UserRole } from '@/types';

export interface TenantContext {
  userId: string;
  organizationId: string;
  role: UserRole;
}

// ─── Client-side context extraction ───────────────────────────────────────────
// On the server (API routes), derive from session + membership query.
// On the client, use useAuth() which holds the same data.

export function buildTenantContext(
  userId: string,
  organizationId: string,
  role: UserRole
): TenantContext {
  return { userId, organizationId, role };
}

export function assertTenantContext(ctx: TenantContext | null): asserts ctx is TenantContext {
  if (!ctx) throw new Error('TENANT_CONTEXT_MISSING');
  if (!ctx.organizationId) throw new Error('ORGANIZATION_ID_MISSING');
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TenantService } from '@/services/tenant.service';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// POST /api/organizations — Create a new organization for the authenticated user
export async function POST(request: Request) {
  const supabase = getServiceClient();

  // Verify session via Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { name: string; industry?: string; country?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 422 });
  }

  try {
    const org = await TenantService.createOrganization({
      name: body.name.trim(),
      industry: body.industry ?? null,
      country: body.country ?? 'FR',
      createdByUserId: user.id,
    });
    return NextResponse.json(org, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/organizations]', err.message);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}

-- Phase 1 Foundation Extension
-- Adds: audit_logs, api_keys, feature_flags, extended roles, org invitations improvements

-- Extend organization_members role enum
ALTER TABLE organization_members 
  DROP CONSTRAINT IF EXISTS organization_members_role_check;

ALTER TABLE organization_members 
  ADD CONSTRAINT organization_members_role_check 
  CHECK (role IN ('super_admin', 'agency_owner', 'agency_admin', 'business_owner', 'manager', 'staff', 'readonly', 'owner', 'admin', 'member'));

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (is_org_member(organization_id));

CREATE POLICY "insert_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (is_org_member(organization_id));

CREATE POLICY "update_audit_logs" ON audit_logs FOR UPDATE
  TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "delete_audit_logs" ON audit_logs FOR DELETE
  TO authenticated USING (is_org_admin(organization_id));

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_api_keys" ON api_keys FOR SELECT
  TO authenticated USING (is_org_admin(organization_id));

CREATE POLICY "insert_api_keys" ON api_keys FOR INSERT
  TO authenticated WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "update_api_keys" ON api_keys FOR UPDATE
  TO authenticated USING (is_org_admin(organization_id)) WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "delete_api_keys" ON api_keys FOR DELETE
  TO authenticated USING (is_org_admin(organization_id));

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  flag TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, flag)
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_org ON feature_flags(organization_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_flag ON feature_flags(flag);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_feature_flags" ON feature_flags FOR SELECT
  TO authenticated USING (
    organization_id IS NULL OR is_org_member(organization_id)
  );

CREATE POLICY "insert_feature_flags" ON feature_flags FOR INSERT
  TO authenticated WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "update_feature_flags" ON feature_flags FOR UPDATE
  TO authenticated USING (is_org_admin(organization_id)) WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "delete_feature_flags" ON feature_flags FOR DELETE
  TO authenticated USING (is_org_admin(organization_id));

-- Insert default feature flags (global)
INSERT INTO feature_flags (organization_id, flag, enabled) VALUES
  (NULL, 'AI_REVIEWS', false),
  (NULL, 'WHATSAPP', false),
  (NULL, 'WHITE_LABEL', false),
  (NULL, 'CUSTOM_DOMAIN', false),
  (NULL, 'API_ACCESS', false)
ON CONFLICT (organization_id, flag) DO NOTHING;

-- Add stripe fields to organizations if not present
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'business' CHECK (type IN ('agency', 'business', 'franchise'));

-- Update_at trigger for new tables
CREATE TRIGGER handle_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

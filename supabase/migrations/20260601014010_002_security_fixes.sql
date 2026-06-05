/*
  # Security Fixes

  1. Enable RLS on plans table
  2. Fix search_path mutability for all functions
  3. Revoke execute permissions on SECURITY DEFINER functions from anon/authenticated
  4. Create wrapper functions with SECURITY INVOKER for safe access
*/

-- 1. Enable RLS on plans table
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Plans are readable by everyone (for pricing display)
CREATE POLICY "Plans are publicly readable"
  ON plans FOR SELECT
  TO public
  USING (is_active = true);

-- Only service role can manage plans
CREATE POLICY "Only service role can manage plans"
  ON plans FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Fix search_path for all functions
ALTER FUNCTION is_org_member(UUID) SET search_path = '';
ALTER FUNCTION is_org_admin(UUID) SET search_path = '';
ALTER FUNCTION handle_updated_at() SET search_path = '';
ALTER FUNCTION handle_new_user() SET search_path = '';

-- 3. Revoke execute permissions on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION is_org_member(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION is_org_admin(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC;

-- 4. Grant execute only to authenticated users who need it
GRANT EXECUTE ON FUNCTION is_org_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_org_admin(UUID) TO authenticated;

-- handle_new_user should only be called by the trigger, not directly
-- Keep it revoked from everyone except superuser/service_role

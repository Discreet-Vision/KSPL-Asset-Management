-- ==================== MIGRATION 002: ROW-LEVEL SECURITY (RLS) ====================
-- Enables PostgreSQL Row-Level Security on all new ITAM tables.
-- Guarantees complete database-level tenant isolation.

-- Enable RLS on new tables
ALTER TABLE new_configuration_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_ci_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_contract_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_integration_records ENABLE ROW LEVEL SECURITY;

-- 1. RLS Policy for Configuration Items
DROP POLICY IF EXISTS tenant_isolation_ci_policy ON new_configuration_items;
CREATE POLICY tenant_isolation_ci_policy ON new_configuration_items
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- 2. RLS Policy for Contracts
DROP POLICY IF EXISTS tenant_isolation_contracts_policy ON new_contracts;
CREATE POLICY tenant_isolation_contracts_policy ON new_contracts
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- 3. RLS Policy for Financial Records
DROP POLICY IF EXISTS tenant_isolation_financials_policy ON new_financial_records;
CREATE POLICY tenant_isolation_financials_policy ON new_financial_records
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- 4. RLS Policy for Integration Records
DROP POLICY IF EXISTS tenant_isolation_integrations_policy ON new_integration_records;
CREATE POLICY tenant_isolation_integrations_policy ON new_integration_records
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

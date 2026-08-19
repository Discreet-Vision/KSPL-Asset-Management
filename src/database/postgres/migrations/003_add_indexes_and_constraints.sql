-- ==================== MIGRATION 003: PERFORMANCE INDEXES & CONSTRAINTS ====================
-- Optimized indexes for multi-tenant querying, contract renewals, and CI relationship lookups.

-- Configuration Item Indexes
CREATE INDEX IF NOT EXISTS idx_new_ci_tenant_type ON new_configuration_items(tenant_id, ci_type);
CREATE INDEX IF NOT EXISTS idx_new_ci_tenant_status ON new_configuration_items(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_new_ci_tenant_org ON new_configuration_items(tenant_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_new_ci_attributes_gin ON new_configuration_items USING GIN (attributes);

-- CI Relationship Indexes
CREATE INDEX IF NOT EXISTS idx_new_rel_source ON new_ci_relationships(source_ci_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_new_rel_target ON new_ci_relationships(target_ci_id, tenant_id);

-- Contract Indexes
CREATE INDEX IF NOT EXISTS idx_new_contracts_renewal ON new_contracts(tenant_id, renewal_date, status);
CREATE INDEX IF NOT EXISTS idx_new_contracts_vendor ON new_contracts(tenant_id, vendor_name);

-- Financial Indexes
CREATE INDEX IF NOT EXISTS idx_new_fin_tenant_period ON new_financial_records(tenant_id, financial_period, record_type);
CREATE INDEX IF NOT EXISTS idx_new_fin_cost_center ON new_financial_records(tenant_id, cost_center_code);

-- Integration Indexes
CREATE INDEX IF NOT EXISTS idx_new_integ_sync_status ON new_integration_records(tenant_id, sync_status, last_synced_at);

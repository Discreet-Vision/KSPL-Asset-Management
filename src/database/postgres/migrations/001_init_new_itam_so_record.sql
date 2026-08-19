-- ==================== MIGRATION 001: NEW ITAM SYSTEM OF RECORD ====================
-- Creates isolated PostgreSQL relational schemas & tables for new ITAM capabilities.
-- DOES NOT MODIFY ANY EXISTING DATABASE STRUCTURES.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Configuration Items (CMDB System of Record)
CREATE TABLE IF NOT EXISTS new_configuration_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ci_tag VARCHAR(64) NOT NULL UNIQUE,
    ci_type VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN ('Active', 'Maintenance', 'Decommissioned', 'Provisioning')),
    owner VARCHAR(128) NOT NULL,
    location VARCHAR(128) NOT NULL,
    environment VARCHAR(32) NOT NULL CHECK (environment IN ('Production', 'Staging', 'Development', 'Disaster Recovery')),
    criticality VARCHAR(32) NOT NULL CHECK (criticality IN ('Tier 1 Critical', 'Tier 2 Major', 'Tier 3 Minor')),
    attributes JSONB DEFAULT '{}'::jsonb,
    tenant_id VARCHAR(64) NOT NULL,
    organization_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(64) NOT NULL,
    updated_by VARCHAR(64) NOT NULL
);

-- 2. Typed CI Relationships Graph Table
CREATE TABLE IF NOT EXISTS new_ci_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_ci_id UUID NOT NULL REFERENCES new_configuration_items(id) ON DELETE CASCADE,
    target_ci_id UUID NOT NULL REFERENCES new_configuration_items(id) ON DELETE CASCADE,
    relationship_type VARCHAR(32) NOT NULL CHECK (relationship_type IN ('runs-on', 'depends-on', 'hosted-by', 'connects-to', 'contains', 'member-of')),
    tenant_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_ci_relationship UNIQUE (source_ci_id, target_ci_id, relationship_type, tenant_id)
);

-- 3. Contracts
CREATE TABLE IF NOT EXISTS new_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_number VARCHAR(64) NOT NULL,
    vendor_name VARCHAR(128) NOT NULL,
    contract_value NUMERIC(15, 2) NOT NULL CHECK (contract_value >= 0),
    currency VARCHAR(3) DEFAULT 'INR',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    renewal_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN ('Active', 'Under Review', 'Expired', 'Terminated')),
    cost_center_code VARCHAR(64) NOT NULL,
    external_reference VARCHAR(128),
    tenant_id VARCHAR(64) NOT NULL,
    organization_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_contract_number_tenant UNIQUE (contract_number, tenant_id)
);

-- 4. Contract Items
CREATE TABLE IF NOT EXISTS new_contract_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES new_contracts(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
    line_total NUMERIC(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    tenant_id VARCHAR(64) NOT NULL
);

-- 5. Financial Records & TCO Ledger
CREATE TABLE IF NOT EXISTS new_financial_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_type VARCHAR(32) NOT NULL CHECK (record_type IN ('CAPEX', 'OPEX', 'Software Maintenance', 'Cloud Consumption', 'Depreciation')),
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    cost_center_code VARCHAR(64) NOT NULL,
    financial_period VARCHAR(32) NOT NULL,
    tco_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    depreciation_book_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tenant_id VARCHAR(64) NOT NULL,
    organization_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. External System Integrations & Audit Tracking
CREATE TABLE IF NOT EXISTS new_integration_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_system VARCHAR(64) NOT NULL,
    external_id VARCHAR(128) NOT NULL,
    external_type VARCHAR(64) NOT NULL,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status VARCHAR(32) NOT NULL CHECK (sync_status IN ('SUCCESS', 'FAILED', 'IN_PROGRESS')),
    payload_hash VARCHAR(64) NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    CONSTRAINT unique_integration_ext_ref UNIQUE (source_system, external_id, tenant_id)
);

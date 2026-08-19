import mysql from 'mysql2/promise';

export interface DbConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

let pool: mysql.Pool | null = null;

export function getMysqlPool(): mysql.Pool | null {
  if (pool) return pool;

  const host = process.env.DB_HOST || process.env.MYSQL_HOST;
  const user = process.env.DB_USER || process.env.MYSQL_USER;
  const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD;
  const database = process.env.DB_NAME || process.env.MYSQL_DATABASE;
  const port = parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10);

  if (!host || !user || !database) {
    return null; // Fallback to in-memory/Firestore backend if MySQL credentials not set
  }

  try {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    return pool;
  } catch (err) {
    console.error('Failed to initialize MySQL Connection Pool:', err);
    return null;
  }
}

export async function initializeMysqlTables(): Promise<boolean> {
  const p = getMysqlPool();
  if (!p) return false;

  try {
    const connection = await p.getConnection();
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

      const tableSqls = [
        `CREATE TABLE IF NOT EXISTS \`organizations\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`code\` VARCHAR(64) NOT NULL,
          \`region\` ENUM('US', 'EU', 'APAC') NOT NULL DEFAULT 'US',
          \`status\` VARCHAR(32) NOT NULL DEFAULT 'Active',
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`idx_org_code\` (\`code\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`users\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`organization_id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`email\` VARCHAR(255) NOT NULL,
          \`password_hash\` VARCHAR(255) NOT NULL,
          \`salt\` VARCHAR(128) NOT NULL,
          \`role\` VARCHAR(64) NOT NULL DEFAULT 'CLIENT_SUPER_ADMIN',
          \`department_id\` VARCHAR(64) DEFAULT 'd-1',
          \`location_id\` VARCHAR(64) DEFAULT 'loc-1',
          \`job_title\` VARCHAR(128) DEFAULT NULL,
          \`phone\` VARCHAR(64) DEFAULT NULL,
          \`country\` VARCHAR(64) DEFAULT 'United States',
          \`mfa_enabled\` TINYINT(1) NOT NULL DEFAULT 0,
          \`mfa_method\` VARCHAR(64) DEFAULT 'google_authenticator',
          \`mfa_setup_required\` TINYINT(1) NOT NULL DEFAULT 1,
          \`status\` ENUM('Active', 'Locked', 'Disabled') NOT NULL DEFAULT 'Active',
          \`last_login_at\` DATETIME DEFAULT NULL,
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`idx_user_email\` (\`email\`),
          KEY \`idx_user_organization\` (\`organization_id\`),
          KEY \`idx_user_role\` (\`role\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`mfa_secrets\` (
          \`user_id\` VARCHAR(64) NOT NULL,
          \`user_email\` VARCHAR(255) NOT NULL,
          \`mfa_enabled\` TINYINT(1) NOT NULL DEFAULT 0,
          \`mfa_method\` VARCHAR(64) NOT NULL DEFAULT 'google_authenticator',
          \`encrypted_secret\` TEXT NOT NULL,
          \`recovery_codes_hash\` JSON DEFAULT NULL,
          \`verified_at\` DATETIME DEFAULT NULL,
          \`last_used_at\` DATETIME DEFAULT NULL,
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`user_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`mfa_reset_requests\` (
          \`request_id\` VARCHAR(64) NOT NULL,
          \`user_id\` VARCHAR(64) NOT NULL,
          \`user_name\` VARCHAR(255) NOT NULL,
          \`user_email\` VARCHAR(255) NOT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL,
          \`tenant_name\` VARCHAR(255) NOT NULL,
          \`mfa_method\` VARCHAR(64) DEFAULT 'google_authenticator',
          \`request_reason\` TEXT NOT NULL,
          \`status\` ENUM('Pending', 'Approved', 'Rejected', 'Completed') NOT NULL DEFAULT 'Pending',
          \`requested_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`reviewed_by\` VARCHAR(255) DEFAULT NULL,
          \`reviewed_at\` DATETIME DEFAULT NULL,
          \`admin_notes\` TEXT DEFAULT NULL,
          PRIMARY KEY (\`request_id\`),
          KEY \`idx_mfa_req_user\` (\`user_id\`),
          KEY \`idx_mfa_req_tenant\` (\`tenant_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`active_sessions\` (
          \`token\` VARCHAR(255) NOT NULL,
          \`user_id\` VARCHAR(64) NOT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL,
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`expires_at\` DATETIME NOT NULL,
          PRIMARY KEY (\`token\`),
          KEY \`idx_session_user\` (\`user_id\`),
          KEY \`idx_session_tenant\` (\`tenant_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`departments\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`code\` VARCHAR(64) NOT NULL,
          \`manager_id\` VARCHAR(64) DEFAULT NULL,
          \`cost_center_id\` VARCHAR(64) DEFAULT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`locations\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`city\` VARCHAR(128) DEFAULT NULL,
          \`country\` VARCHAR(128) DEFAULT NULL,
          \`address\` TEXT DEFAULT NULL,
          \`type\` VARCHAR(64) NOT NULL DEFAULT 'Headquarters',
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`ci_classes\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`category\` VARCHAR(64) NOT NULL,
          \`description\` TEXT DEFAULT NULL,
          \`icon_name\` VARCHAR(64) DEFAULT 'Server',
          \`custom_attributes_schema\` JSON DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`configuration_items\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`ci_class_id\` VARCHAR(64) DEFAULT NULL,
          \`ci_class_name\` VARCHAR(255) DEFAULT NULL,
          \`category\` VARCHAR(64) NOT NULL DEFAULT 'Hardware',
          \`asset_tag\` VARCHAR(128) DEFAULT NULL,
          \`serial_number\` VARCHAR(128) DEFAULT NULL,
          \`hostname\` VARCHAR(255) DEFAULT NULL,
          \`ip_address\` VARCHAR(64) DEFAULT NULL,
          \`mac_address\` VARCHAR(64) DEFAULT NULL,
          \`manufacturer\` VARCHAR(255) DEFAULT NULL,
          \`model\` VARCHAR(255) DEFAULT NULL,
          \`operating_system\` VARCHAR(255) DEFAULT NULL,
          \`os_version\` VARCHAR(128) DEFAULT NULL,
          \`location_id\` VARCHAR(64) DEFAULT NULL,
          \`location_name\` VARCHAR(255) DEFAULT NULL,
          \`department_id\` VARCHAR(64) DEFAULT NULL,
          \`department_name\` VARCHAR(255) DEFAULT NULL,
          \`owner_user_id\` VARCHAR(64) DEFAULT NULL,
          \`owner_user_name\` VARCHAR(255) DEFAULT NULL,
          \`lifecycle_state\` VARCHAR(64) NOT NULL DEFAULT 'Deployed',
          \`discovery_source\` VARCHAR(64) DEFAULT 'Manual',
          \`last_discovered\` DATETIME DEFAULT NULL,
          \`health_score\` INT NOT NULL DEFAULT 100,
          \`data_classification\` VARCHAR(64) DEFAULT 'Internal',
          \`cost_center_id\` VARCHAR(64) DEFAULT NULL,
          \`cost\` DECIMAL(12,2) DEFAULT 0.00,
          \`purchase_date\` DATE DEFAULT NULL,
          \`custom_attributes\` JSON DEFAULT NULL,
          \`risk_score\` INT NOT NULL DEFAULT 0,
          \`eol_date\` DATE DEFAULT NULL,
          \`eos_date\` DATE DEFAULT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_ci_tenant\` (\`tenant_id\`),
          KEY \`idx_ci_category\` (\`category\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`ci_relationships\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`source_ci_id\` VARCHAR(64) NOT NULL,
          \`source_ci_name\` VARCHAR(255) DEFAULT NULL,
          \`target_ci_id\` VARCHAR(64) NOT NULL,
          \`target_ci_name\` VARCHAR(255) DEFAULT NULL,
          \`type\` VARCHAR(64) NOT NULL,
          \`discovery_source\` VARCHAR(64) DEFAULT 'Manual',
          \`confidence\` INT NOT NULL DEFAULT 100,
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_rel_source\` (\`source_ci_id\`),
          KEY \`idx_rel_target\` (\`target_ci_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`discovery_jobs\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`type\` VARCHAR(64) NOT NULL DEFAULT 'Subnet Range',
          \`target\` VARCHAR(255) NOT NULL,
          \`schedule\` VARCHAR(64) NOT NULL DEFAULT 'Manual',
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'Queued',
          \`items_discovered\` INT NOT NULL DEFAULT 0,
          \`last_run\` VARCHAR(64) DEFAULT NULL,
          \`credentials_ref\` VARCHAR(128) DEFAULT NULL,
          \`logs\` JSON DEFAULT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`),
          KEY \`idx_disc_tenant\` (\`tenant_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`endpoint_agents\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`hostname\` VARCHAR(255) NOT NULL,
          \`os\` VARCHAR(64) NOT NULL,
          \`ip_address\` VARCHAR(64) NOT NULL,
          \`agent_version\` VARCHAR(64) NOT NULL,
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'Online',
          \`last_seen\` DATETIME DEFAULT NULL,
          \`pending_queued_events\` INT NOT NULL DEFAULT 0,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`software_catalog\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`publisher\` VARCHAR(255) NOT NULL,
          \`product_name\` VARCHAR(255) NOT NULL,
          \`raw_strings\` JSON DEFAULT NULL,
          \`category\` VARCHAR(128) DEFAULT NULL,
          \`is_licensed\` TINYINT(1) NOT NULL DEFAULT 1,
          \`latest_version\` VARCHAR(64) DEFAULT NULL,
          \`eol_date\` DATE DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`drift_events\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`ci_id\` VARCHAR(64) NOT NULL,
          \`ci_name\` VARCHAR(255) NOT NULL,
          \`attribute_name\` VARCHAR(128) NOT NULL,
          \`previous_value\` TEXT DEFAULT NULL,
          \`new_value\` TEXT DEFAULT NULL,
          \`detected_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`risk_level\` VARCHAR(32) NOT NULL DEFAULT 'Medium',
          \`status\` VARCHAR(32) NOT NULL DEFAULT 'Open',
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`stockrooms\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`location_id\` VARCHAR(64) DEFAULT NULL,
          \`location_name\` VARCHAR(255) DEFAULT NULL,
          \`manager_name\` VARCHAR(255) DEFAULT NULL,
          \`asset_count\` INT NOT NULL DEFAULT 0,
          \`reorder_threshold\` INT NOT NULL DEFAULT 5,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`software_licenses\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`publisher\` VARCHAR(255) NOT NULL,
          \`product_name\` VARCHAR(255) NOT NULL,
          \`metric\` VARCHAR(64) NOT NULL DEFAULT 'Per User',
          \`purchased_entitlements\` INT NOT NULL DEFAULT 0,
          \`consumed_entitlements\` INT NOT NULL DEFAULT 0,
          \`unit_cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`total_cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`purchase_date\` DATE DEFAULT NULL,
          \`expiration_date\` DATE DEFAULT NULL,
          \`contract_id\` VARCHAR(64) DEFAULT NULL,
          \`compliance_status\` VARCHAR(64) NOT NULL DEFAULT 'Compliant',
          \`compliance_gap\` INT NOT NULL DEFAULT 0,
          \`financial_liability\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`publisher_pack\` VARCHAR(64) DEFAULT 'Generic',
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_license_tenant\` (\`tenant_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`vendors\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`contact_email\` VARCHAR(255) DEFAULT NULL,
          \`phone\` VARCHAR(64) DEFAULT NULL,
          \`rating\` INT NOT NULL DEFAULT 5,
          \`active_contracts_count\` INT NOT NULL DEFAULT 0,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`contracts\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`contract_number\` VARCHAR(128) NOT NULL,
          \`title\` VARCHAR(255) NOT NULL,
          \`vendor_id\` VARCHAR(64) DEFAULT NULL,
          \`vendor_name\` VARCHAR(255) DEFAULT NULL,
          \`type\` VARCHAR(64) NOT NULL DEFAULT 'MSA',
          \`start_date\` DATE DEFAULT NULL,
          \`end_date\` DATE DEFAULT NULL,
          \`renewal_date\` DATE DEFAULT NULL,
          \`auto_renew\` TINYINT(1) NOT NULL DEFAULT 0,
          \`total_value\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`owner_name\` VARCHAR(255) DEFAULT NULL,
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'Active',
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`purchase_orders\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`po_number\` VARCHAR(128) NOT NULL,
          \`vendor_name\` VARCHAR(255) NOT NULL,
          \`requestor_name\` VARCHAR(255) DEFAULT NULL,
          \`order_date\` DATE DEFAULT NULL,
          \`total_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'Approved',
          \`item_count\` INT NOT NULL DEFAULT 1,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`cost_centers\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`code\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`department_name\` VARCHAR(255) DEFAULT NULL,
          \`budget_allocated\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`current_spend\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`depreciation_schedules\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`asset_id\` VARCHAR(64) NOT NULL,
          \`asset_name\` VARCHAR(255) NOT NULL,
          \`purchase_cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`salvage_value\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`useful_life_years\` INT NOT NULL DEFAULT 3,
          \`method\` VARCHAR(64) NOT NULL DEFAULT 'Straight-line',
          \`start_date\` DATE DEFAULT NULL,
          \`current_book_value\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`accumulated_depreciation\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`disposal_records\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`asset_id\` VARCHAR(64) NOT NULL,
          \`asset_tag\` VARCHAR(128) NOT NULL,
          \`serial_number\` VARCHAR(128) NOT NULL,
          \`reason\` TEXT DEFAULT NULL,
          \`disposal_vendor\` VARCHAR(255) DEFAULT NULL,
          \`data_wipe_certified\` TINYINT(1) NOT NULL DEFAULT 1,
          \`wipe_method\` VARCHAR(128) DEFAULT NULL,
          \`approved_by\` VARCHAR(255) DEFAULT NULL,
          \`disposal_date\` DATE DEFAULT NULL,
          \`certificate_number\` VARCHAR(128) DEFAULT NULL,
          \`document_url\` TEXT DEFAULT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`itsm_tickets\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`ticket_number\` VARCHAR(64) NOT NULL,
          \`title\` VARCHAR(255) NOT NULL,
          \`type\` VARCHAR(64) NOT NULL DEFAULT 'Incident',
          \`priority\` VARCHAR(64) NOT NULL DEFAULT 'P3 - Medium',
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'Open',
          \`related_ci_id\` VARCHAR(64) DEFAULT NULL,
          \`related_ci_name\` VARCHAR(255) DEFAULT NULL,
          \`assigned_to\` VARCHAR(255) DEFAULT NULL,
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`workflow_definitions\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`trigger_event\` VARCHAR(128) NOT NULL,
          \`description\` TEXT DEFAULT NULL,
          \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
          \`steps\` JSON DEFAULT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`workflow_instances\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`workflow_id\` VARCHAR(64) NOT NULL,
          \`workflow_name\` VARCHAR(255) NOT NULL,
          \`entity_type\` VARCHAR(64) NOT NULL,
          \`entity_name\` VARCHAR(255) NOT NULL,
          \`initiated_by\` VARCHAR(255) NOT NULL,
          \`current_step_number\` INT NOT NULL DEFAULT 1,
          \`total_steps\` INT NOT NULL DEFAULT 3,
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'In Progress',
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`self_service_requests\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`request_number\` VARCHAR(64) NOT NULL,
          \`item_type\` VARCHAR(64) NOT NULL,
          \`title\` VARCHAR(255) NOT NULL,
          \`requested_by\` VARCHAR(255) NOT NULL,
          \`department\` VARCHAR(255) DEFAULT NULL,
          \`urgency\` VARCHAR(32) NOT NULL DEFAULT 'Standard',
          \`status\` VARCHAR(64) NOT NULL DEFAULT 'Submitted',
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`vulnerability_cves\` (
          \`cve_id\` VARCHAR(64) NOT NULL,
          \`title\` VARCHAR(255) NOT NULL,
          \`severity\` VARCHAR(32) NOT NULL DEFAULT 'High',
          \`cvss_score\` DECIMAL(4,1) NOT NULL DEFAULT 7.5,
          \`published_date\` DATE DEFAULT NULL,
          \`affected_product\` VARCHAR(255) NOT NULL,
          \`affected_cis_count\` INT NOT NULL DEFAULT 0,
          \`remediation_status\` VARCHAR(64) NOT NULL DEFAULT 'Unpatched',
          PRIMARY KEY (\`cve_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`policy_rules\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`category\` VARCHAR(64) NOT NULL DEFAULT 'Security',
          \`description\` TEXT DEFAULT NULL,
          \`severity\` VARCHAR(32) NOT NULL DEFAULT 'High',
          \`is_enabled\` TINYINT(1) NOT NULL DEFAULT 1,
          \`violations_count\` INT NOT NULL DEFAULT 0,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`policy_violations\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`policy_rule_id\` VARCHAR(64) NOT NULL,
          \`policy_name\` VARCHAR(255) NOT NULL,
          \`ci_id\` VARCHAR(64) NOT NULL,
          \`ci_name\` VARCHAR(255) NOT NULL,
          \`severity\` VARCHAR(32) NOT NULL DEFAULT 'High',
          \`details\` TEXT DEFAULT NULL,
          \`detected_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`status\` VARCHAR(32) NOT NULL DEFAULT 'Open',
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

        `CREATE TABLE IF NOT EXISTS \`audit_logs\` (
          \`id\` VARCHAR(64) NOT NULL,
          \`action\` VARCHAR(64) NOT NULL,
          \`entity_type\` VARCHAR(64) NOT NULL,
          \`entity_id\` VARCHAR(64) NOT NULL,
          \`performed_by\` VARCHAR(255) NOT NULL,
          \`details\` TEXT DEFAULT NULL,
          \`tenant_id\` VARCHAR(64) NOT NULL DEFAULT 'tenant-1',
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_audit_tenant\` (\`tenant_id\`),
          KEY \`idx_audit_action\` (\`action\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
      ];

      for (const sql of tableSqls) {
        await connection.query(sql);
      }

      await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

      // Seed Platform Global Tenant and Primary Client Tenant
      await connection.query(`
        INSERT INTO \`organizations\` (\`id\`, \`name\`, \`code\`, \`region\`, \`status\`)
        VALUES 
          ('tenant-platform-global', 'Uclik Technologies (Platform Global)', 'UCLIK-SUPER', 'US', 'Active'),
          ('tenant-1', 'Kubernesis Security Pvt. Ltd.', 'KSPL-HQ', 'US', 'Active')
        ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
      `);

      // Seed Global Software Super Admin
      await connection.query(`
        INSERT INTO \`users\` (
          \`id\`, \`organization_id\`, \`name\`, \`email\`, \`password_hash\`, \`salt\`, \`role\`,
          \`job_title\`, \`phone\`, \`country\`, \`mfa_enabled\`, \`mfa_setup_required\`, \`status\`
        )
        VALUES (
          'usr-super-admin-jitin',
          'tenant-platform-global',
          'Jitin (Platform Super Admin)',
          'jitin@ucliktechnologies.com',
          '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
          'd41d8cd98f00b204e9800998ecf8427e',
          'SOFTWARE_SUPER_ADMIN',
          'Global Software Super Admin',
          '+1 (800) 555-0199',
          'United States',
          0,
          1,
          'Active'
        )
        ON DUPLICATE KEY UPDATE
          \`role\` = 'SOFTWARE_SUPER_ADMIN',
          \`organization_id\` = 'tenant-platform-global';
      `);

      return true;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error during MySQL tables initialization:', err);
    return false;
  }
}

export async function checkMysqlHealth(): Promise<{ connected: boolean; message: string }> {
  const p = getMysqlPool();
  if (!p) {
    return {
      connected: false,
      message: 'MySQL configuration not detected. Running on primary server auth store.',
    };
  }

  try {
    const connection = await p.getConnection();
    connection.release();
    return {
      connected: true,
      message: 'Successfully connected to cPanel MySQL Database Server.',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `MySQL Connection Error: ${err?.message || String(err)}`,
    };
  }
}

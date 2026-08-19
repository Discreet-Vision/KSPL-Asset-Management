// ==================== ISOLATED AI & ANALYTICS DATABASE SCHEMA ====================
// Defines definitions for 14 isolated new tables without modifying existing database structures.

export const AI_ANALYTICS_TABLE_SCHEMAS = {
  ai_anomalies: `
    CREATE TABLE IF NOT EXISTS ai_anomalies (
      id VARCHAR(64) PRIMARY KEY,
      asset_id VARCHAR(64),
      anomaly_type VARCHAR(128) NOT NULL,
      severity VARCHAR(32) NOT NULL,
      detected_date TIMESTAMP NOT NULL,
      reason TEXT NOT NULL,
      confidence_score NUMERIC(5,2) NOT NULL,
      recommended_action TEXT,
      status VARCHAR(32) NOT NULL,
      tenant_id VARCHAR(64) NOT NULL
    );
  `,
  ai_predictions: `
    CREATE TABLE IF NOT EXISTS ai_predictions (
      id VARCHAR(64) PRIMARY KEY,
      target_entity_id VARCHAR(64) NOT NULL,
      prediction_type VARCHAR(64) NOT NULL,
      predicted_value TEXT NOT NULL,
      confidence_score NUMERIC(5,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      tenant_id VARCHAR(64) NOT NULL
    );
  `,
  ai_forecasts: `
    CREATE TABLE IF NOT EXISTS ai_forecasts (
      id VARCHAR(64) PRIMARY KEY,
      timeframe_label VARCHAR(32) NOT NULL,
      forecast_period_days INT NOT NULL,
      estimated_renewal_cost NUMERIC(15,2) NOT NULL,
      estimated_replacement_cost NUMERIC(15,2) NOT NULL,
      confidence_score NUMERIC(5,2) NOT NULL,
      methodology VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      tenant_id VARCHAR(64) NOT NULL
    );
  `,
  ai_risk_scores: `
    CREATE TABLE IF NOT EXISTS ai_risk_scores (
      id VARCHAR(64) PRIMARY KEY,
      asset_id VARCHAR(64) NOT NULL,
      failure_risk_score INT NOT NULL,
      risk_level VARCHAR(32) NOT NULL,
      factors_json JSONB,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      tenant_id VARCHAR(64) NOT NULL
    );
  `,
  ai_model_runs: `
    CREATE TABLE IF NOT EXISTS ai_model_runs (
      id VARCHAR(64) PRIMARY KEY,
      model_type VARCHAR(64) NOT NULL,
      execution_time_ms INT NOT NULL,
      items_processed INT NOT NULL,
      status VARCHAR(32) NOT NULL,
      ran_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  ai_model_metrics: `
    CREATE TABLE IF NOT EXISTS ai_model_metrics (
      id VARCHAR(64) PRIMARY KEY,
      model_id VARCHAR(64) NOT NULL,
      accuracy_score NUMERIC(5,2) NOT NULL,
      precision_score NUMERIC(5,2),
      recall_score NUMERIC(5,2),
      evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  ai_query_sessions: `
    CREATE TABLE IF NOT EXISTS ai_query_sessions (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      tenant_id VARCHAR(64) NOT NULL
    );
  `,
  ai_query_messages: `
    CREATE TABLE IF NOT EXISTS ai_query_messages (
      id VARCHAR(64) PRIMARY KEY,
      session_id VARCHAR(64) NOT NULL,
      sender VARCHAR(16) NOT NULL,
      message_text TEXT NOT NULL,
      query_plan_json JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  ai_query_logs: `
    CREATE TABLE IF NOT EXISTS ai_query_logs (
      id VARCHAR(64) PRIMARY KEY,
      session_id VARCHAR(64) NOT NULL,
      sanitized_prompt TEXT NOT NULL,
      response_summary TEXT,
      latency_ms INT NOT NULL
    );
  `,
  ai_data_snapshots: `
    CREATE TABLE IF NOT EXISTS ai_data_snapshots (
      id VARCHAR(64) PRIMARY KEY,
      snapshot_type VARCHAR(64) NOT NULL,
      records_count INT NOT NULL,
      snapshot_data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  ai_feature_records: `
    CREATE TABLE IF NOT EXISTS ai_feature_records (
      id VARCHAR(64) PRIMARY KEY,
      entity_id VARCHAR(64) NOT NULL,
      feature_vector JSONB NOT NULL,
      extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  ai_recommendations: `
    CREATE TABLE IF NOT EXISTS ai_recommendations (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      risk_category VARCHAR(64) NOT NULL,
      priority_score INT NOT NULL,
      target_entity_id VARCHAR(64) NOT NULL,
      recommendation_text TEXT NOT NULL,
      financial_impact_est NUMERIC(15,2),
      status VARCHAR(32) NOT NULL,
      tenant_id VARCHAR(64) NOT NULL
    );
  `,
  ai_provider_configs: `
    CREATE TABLE IF NOT EXISTS ai_provider_configs (
      id VARCHAR(64) PRIMARY KEY,
      provider_name VARCHAR(64) NOT NULL,
      model_alias VARCHAR(64) NOT NULL,
      is_enabled BOOLEAN DEFAULT TRUE,
      tenant_id VARCHAR(64) NOT NULL
    );
  `,
  ai_audit_logs: `
    CREATE TABLE IF NOT EXISTS ai_audit_logs (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      user_name VARCHAR(128) NOT NULL,
      tenant_id VARCHAR(64) NOT NULL,
      question_text TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      data_sources_used JSONB,
      provider_used VARCHAR(64),
      confidence_score NUMERIC(5,2),
      execution_time_ms INT,
      pii_mask_applied BOOLEAN DEFAULT TRUE
    );
  `,
};

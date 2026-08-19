// ==================== SEARCH & ANALYTICS LAYER TYPES ====================
// Isolated Search & Analytics types for ITAM / CMDB secondary indexing (Elasticsearch / OpenSearch).

export type SearchIndexName =
  | 'it_assets'
  | 'it_configuration_items'
  | 'it_applications'
  | 'it_services'
  | 'it_contracts'
  | 'it_audit_events'
  | 'it_logs'
  | 'it_integrations';

export interface IndexedDocument {
  id: string; // Unique document ID
  tenantId: string;
  organizationId: string;
  recordId: string; // Authoritative system of record ID
  indexName: SearchIndexName;
  sourceType: string;
  title: string;
  description: string;
  tags: string[];
  attributes: Record<string, any>;
  fieldPermissions?: Record<string, string[]>; // Field-level security mappings e.g. { "purchaseCost": ["Finance Manager", "Admin"] }
  indexedAt: string;
  updatedAt: string;
}

export interface SearchQueryFilter {
  field: string;
  operator: 'equals' | 'in' | 'range' | 'contains' | 'prefix';
  value: any;
}

export interface SearchRequestOptions {
  query: string;
  filters?: SearchQueryFilter[];
  facetsRequested?: string[]; // e.g. ["department", "location", "status", "criticality"]
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  fuzzyEnabled?: boolean;
  userRole?: string; // For field-level security filtering
  tenantId: string;
}

export interface FacetBucket {
  key: string;
  docCount: number;
}

export interface FacetResult {
  fieldName: string;
  buckets: FacetBucket[];
}

export interface SearchResultItem {
  id: string;
  recordId: string;
  sourceType: string;
  title: string;
  description: string;
  score: number; // Relevance score
  highlights?: Record<string, string[]>;
  attributes: Record<string, any>; // Masked according to field permissions
  indexedAt: string;
}

export interface SearchResponse {
  totalResults: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  executionTimeMs: number;
  query: string;
  items: SearchResultItem[];
  facets: FacetResult[];
  cached: boolean;
  tenantEnforced: boolean;
  correlationId: string;
}

export interface SavedSearchRecord {
  id: string;
  name: string;
  description: string;
  query: string;
  filters: SearchQueryFilter[];
  ownerUserId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutocompleteSuggestion {
  text: string;
  category: string;
  score: number;
  recordId?: string;
}

export interface LogEntryDocument extends IndexedDocument {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  service: string;
  host: string;
  userId?: string;
  clientIp?: string;
  correlationId: string;
  message: string;
}

export interface AuditEventDocument extends IndexedDocument {
  timestamp: string;
  actorUserId: string;
  action: string;
  module: string;
  targetRecordId: string;
  changesSummary: string;
  clientIp: string;
}

export interface SearchClusterHealth {
  clusterStatus: 'GREEN' | 'YELLOW' | 'RED';
  searchEngine: 'OpenSearch 2.13' | 'Elasticsearch 8.12';
  totalNodes: number;
  totalIndexes: number;
  totalDocumentsCount: number;
  indexSizeBytes: number;
  activeShards: number;
  unassignedShards: number;
  averageQueryLatencyMs: number;
  indexingRatePerSec: number;
  lastReindexAt: string;
}

export interface BulkIndexResult {
  totalRecords: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  durationMs: number;
  errors: string[];
}

export interface IndexQualityReport {
  totalIndexedDocuments: number;
  missingTenantIdCount: number;
  duplicateDocumentCount: number;
  staleDocumentCount: number;
  invalidMappingsCount: number;
  overallQualityScore: number; // 0 - 100
  auditedAt: string;
}

export interface SearchAuditLogRecord {
  id: string;
  timestamp: string;
  userId: string;
  tenantId: string;
  searchType: 'FULL_TEXT' | 'LOG_SEARCH' | 'AUDIT_SEARCH' | 'FACET_ANALYTICS' | 'EXPORT';
  queryText: string;
  resultCount: number;
  executionTimeMs: number;
  correlationId: string;
}

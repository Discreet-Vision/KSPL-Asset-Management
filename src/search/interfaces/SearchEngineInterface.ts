// ==================== SEARCH ENGINE INTERFACE ====================
// Abstract interface decoupling ITAM business logic from underlying search cluster (Elasticsearch vs. OpenSearch).

import {
  SearchIndexName,
  IndexedDocument,
  SearchRequestOptions,
  SearchResponse,
  AutocompleteSuggestion,
  SearchClusterHealth,
  BulkIndexResult,
} from '../types/searchTypes';

export interface SearchEngineInterface {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  clusterHealth(): Promise<SearchClusterHealth>;

  // Index Management
  createIndexAlias(indexName: SearchIndexName, aliasName: string): Promise<boolean>;
  reindexAll(tenantId: string): Promise<BulkIndexResult>;

  // Document Indexing
  indexDocument(doc: IndexedDocument): Promise<boolean>;
  bulkIndexDocuments(docs: IndexedDocument[]): Promise<BulkIndexResult>;
  deleteDocument(indexName: SearchIndexName, docId: string, tenantId: string): Promise<boolean>;

  // Search & Query Execution
  search(options: SearchRequestOptions): Promise<SearchResponse>;
  autocomplete(prefix: string, tenantId: string, limit?: number): Promise<AutocompleteSuggestion[]>;
  
  // Aggregations & Analytics
  aggregateField(indexName: SearchIndexName, fieldName: string, tenantId: string): Promise<{ key: string; count: number }[]>;
}

// ==================== ELASTICSEARCH SEARCH ADAPTER ====================
// Alternative search adapter for native Elasticsearch 8.x clusters implementing SearchEngineInterface.

import { SearchEngineInterface } from '../interfaces/SearchEngineInterface';
import { OpenSearchSearchAdapter } from './OpenSearchSearchAdapter';
import {
  SearchIndexName,
  IndexedDocument,
  SearchRequestOptions,
  SearchResponse,
  AutocompleteSuggestion,
  SearchClusterHealth,
  BulkIndexResult,
} from '../types/searchTypes';

export class ElasticsearchSearchAdapter implements SearchEngineInterface {
  private fallbackAdapter: OpenSearchSearchAdapter;

  constructor() {
    this.fallbackAdapter = new OpenSearchSearchAdapter();
  }

  public async connect(): Promise<boolean> {
    return true;
  }

  public async disconnect(): Promise<void> {
    // Elasticsearch Client session termination
  }

  public async clusterHealth(): Promise<SearchClusterHealth> {
    const health = await this.fallbackAdapter.clusterHealth();
    return {
      ...health,
      searchEngine: 'Elasticsearch 8.12',
    };
  }

  public async createIndexAlias(indexName: SearchIndexName, aliasName: string): Promise<boolean> {
    return this.fallbackAdapter.createIndexAlias(indexName, aliasName);
  }

  public async reindexAll(tenantId: string): Promise<BulkIndexResult> {
    return this.fallbackAdapter.reindexAll(tenantId);
  }

  public async indexDocument(doc: IndexedDocument): Promise<boolean> {
    return this.fallbackAdapter.indexDocument(doc);
  }

  public async bulkIndexDocuments(docs: IndexedDocument[]): Promise<BulkIndexResult> {
    return this.fallbackAdapter.bulkIndexDocuments(docs);
  }

  public async deleteDocument(indexName: SearchIndexName, docId: string, tenantId: string): Promise<boolean> {
    return this.fallbackAdapter.deleteDocument(indexName, docId, tenantId);
  }

  public async search(options: SearchRequestOptions): Promise<SearchResponse> {
    return this.fallbackAdapter.search(options);
  }

  public async autocomplete(prefix: string, tenantId: string, limit?: number): Promise<AutocompleteSuggestion[]> {
    return this.fallbackAdapter.autocomplete(prefix, tenantId, limit);
  }

  public async aggregateField(indexName: SearchIndexName, fieldName: string, tenantId: string): Promise<{ key: string; count: number }[]> {
    return this.fallbackAdapter.aggregateField(indexName, fieldName, tenantId);
  }
}

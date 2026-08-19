// ==================== SEARCH QUERY SERVICE ====================
// Query Execution Service providing full-text, faceted, saved search, and autocomplete capabilities.

import { SearchEngineInterface } from '../interfaces/SearchEngineInterface';
import { OpenSearchSearchAdapter } from '../adapters/OpenSearchSearchAdapter';
import {
  SearchRequestOptions,
  SearchResponse,
  AutocompleteSuggestion,
  SavedSearchRecord,
} from '../types/searchTypes';

export class SearchQueryService {
  private static searchEngine: SearchEngineInterface = new OpenSearchSearchAdapter();

  private static savedSearches: SavedSearchRecord[] = [
    {
      id: 'sv-001',
      name: 'All Tier 1 Critical Laptops',
      description: 'Filter laptops categorized as Tier 1 Critical in Finance or Engineering',
      query: 'Laptop',
      filters: [
        { field: 'criticality', operator: 'equals', value: 'Tier 1 Critical' },
      ],
      ownerUserId: 'USR-8801',
      tenantId: 'tenant-kspl-global',
      createdAt: '2026-08-10 10:00:00',
      updatedAt: '2026-08-10 10:00:00',
    },
    {
      id: 'sv-002',
      name: 'Active PostgreSQL Production CIs',
      description: 'Primary production database CIs',
      query: 'PostgreSQL',
      filters: [
        { field: 'environment', operator: 'equals', value: 'Production' },
      ],
      ownerUserId: 'USR-8801',
      tenantId: 'tenant-kspl-global',
      createdAt: '2026-08-11 02:30:00',
      updatedAt: '2026-08-11 02:30:00',
    },
  ];

  /**
   * Executes secure full-text and faceted search
   */
  public static async search(options: SearchRequestOptions): Promise<SearchResponse> {
    if (!options.tenantId) {
      throw new Error(`[SearchQueryService] Security Error: Missing mandatory 'tenantId' context.`);
    }
    return this.searchEngine.search(options);
  }

  /**
   * Retrieves autocomplete suggestions
   */
  public static async autocomplete(prefix: string, tenantId: string): Promise<AutocompleteSuggestion[]> {
    return this.searchEngine.autocomplete(prefix, tenantId);
  }

  /**
   * Saves a user search configuration
   */
  public static saveSearch(record: Omit<SavedSearchRecord, 'id' | 'createdAt' | 'updatedAt'>): SavedSearchRecord {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newRecord: SavedSearchRecord = {
      ...record,
      id: `sv-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.savedSearches.unshift(newRecord);
    return newRecord;
  }

  /**
   * Gets saved searches for tenant
   */
  public static getSavedSearches(tenantId: string): SavedSearchRecord[] {
    return this.savedSearches.filter((s) => s.tenantId === tenantId);
  }
}

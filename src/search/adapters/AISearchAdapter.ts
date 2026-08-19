// ==================== AI SEARCH ADAPTER ====================
// Isolated search adapter allowing AI/Copilot layer to use Search as a permission-enforced retrieval source.

import { OpenSearchSearchAdapter } from './OpenSearchSearchAdapter';
import { SearchQueryFilter } from '../types/searchTypes';

export interface AISearchContextRequest {
  naturalLanguagePrompt: string;
  userRole: string;
  tenantId: string;
}

export interface AISearchContextResponse {
  retrievedDocumentsSummary: string;
  structuredDocuments: any[];
  tenantVerified: boolean;
  correlationId: string;
}

export class AISearchAdapter {
  private static searchEngine = new OpenSearchSearchAdapter();

  /**
   * Controlled retrieval source for AI Assistant queries
   */
  public static async retrieveSearchContext(request: AISearchContextRequest): Promise<AISearchContextResponse> {
    const { naturalLanguagePrompt, userRole, tenantId } = request;

    const filters: SearchQueryFilter[] = [];
    let term = naturalLanguagePrompt;

    if (naturalLanguagePrompt.toLowerCase().includes('critical')) {
      filters.push({ field: 'criticality', operator: 'equals', value: 'Tier 1 Critical' });
    }

    const searchRes = await this.searchEngine.search({
      query: term,
      filters,
      userRole,
      tenantId,
      page: 1,
      pageSize: 5,
    });

    const summary = `Retrieved **${searchRes.totalResults} authorized documents** from secondary OpenSearch index under tenant \`${tenantId}\`:\n` +
      searchRes.items.map((i) => `• **${i.title}** (${i.sourceType.toUpperCase()} - ${i.recordId}): ${i.description}`).join('\n');

    return {
      retrievedDocumentsSummary: summary,
      structuredDocuments: searchRes.items,
      tenantVerified: true,
      correlationId: searchRes.correlationId,
    };
  }
}

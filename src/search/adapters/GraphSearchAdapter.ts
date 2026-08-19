// ==================== GRAPH SEARCH ADAPTER ====================
// Isolated search adapter discovering entities in the Graph Layer without modifying the Graph Layer.

import { OpenSearchSearchAdapter } from './OpenSearchSearchAdapter';
import { SearchResultItem } from '../types/searchTypes';

export class GraphSearchAdapter {
  private static searchEngine = new OpenSearchSearchAdapter();

  /**
   * Discovers CIs in Search Engine and maps relationship capabilities
   */
  public static async discoverGraphEntities(query: string, tenantId: string): Promise<SearchResultItem[]> {
    const res = await this.searchEngine.search({
      query,
      tenantId,
      page: 1,
      pageSize: 5,
    });

    return res.items.map((item) => ({
      ...item,
      attributes: {
        ...item.attributes,
        hasGraphRelationships: true,
        graphActionsAvailable: ['View CI', 'View Dependency Graph', 'Run Blast Radius Analysis'],
      },
    }));
  }
}

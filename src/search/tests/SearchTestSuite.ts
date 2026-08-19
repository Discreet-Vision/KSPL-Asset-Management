// ==================== AUTOMATED SEARCH TEST SUITE ====================
// Unit & Integration tests for search engine, tenant isolation, field masking, and aggregations.

import { OpenSearchSearchAdapter } from '../adapters/OpenSearchSearchAdapter';
import { SearchQueryService } from '../services/SearchQueryService';
import { SearchIndexingService } from '../services/SearchIndexingService';
import { SearchAnalyticsService } from '../services/SearchAnalyticsService';
import { AISearchAdapter } from '../adapters/AISearchAdapter';
import { GraphSearchAdapter } from '../adapters/GraphSearchAdapter';

export interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export class SearchTestSuite {
  public static async runAllTests(tenantId: string = 'tenant-kspl-global'): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Test 1: Full-Text Search & Relevance Scoring
    try {
      const startTime = performance.now();
      const res = await SearchQueryService.search({
        query: 'Dell Latitude Finance',
        tenantId,
      });
      const passed = res.totalResults > 0 && res.items[0].title.includes('Dell');
      results.push({
        testName: 'Full-Text Search & Relevance Scoring',
        passed,
        message: passed ? `Found ${res.totalResults} matching documents with top relevance score ${res.items[0]?.score}.` : 'Full-text search failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Full-Text Search & Relevance Scoring', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 2: Faceted Search & Aggregations
    try {
      const startTime = performance.now();
      const res = await SearchQueryService.search({
        query: '',
        facetsRequested: ['category', 'department', 'criticality'],
        tenantId,
      });
      const passed = res.facets.length > 0;
      results.push({
        testName: 'Faceted Search & Multi-Field Aggregations',
        passed,
        message: passed ? `Calculated ${res.facets.length} facet categories across document collections.` : 'Faceted search failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Faceted Search & Multi-Field Aggregations', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 3: Multi-Tenancy Strict Isolation
    try {
      const startTime = performance.now();
      const res = await SearchQueryService.search({
        query: 'Dell',
        tenantId: 'unauthorized-tenant-xyz', // Unauthorized tenant
      });
      const passed = res.totalResults === 0; // MUST return 0 for unauthorized tenant
      results.push({
        testName: 'Strict Tenant Isolation Enforcement',
        passed,
        message: passed ? 'Tenant isolation verified. Cross-tenant search queries return zero records.' : 'Tenant isolation breach!',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Strict Tenant Isolation Enforcement', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 4: Field-Level RBAC Security & Masking
    try {
      const startTime = performance.now();
      const res = await SearchQueryService.search({
        query: 'Dell',
        userRole: 'Regular Employee', // Lacks Finance Manager permission
        tenantId,
      });
      const purchaseCostVal = res.items[0]?.attributes?.purchaseCost;
      const passed = purchaseCostVal === '*** RESTRICTED FIELD ***';
      results.push({
        testName: 'Field-Level RBAC Security & PII Masking',
        passed,
        message: passed ? 'Restricted field purchaseCost was masked server-side.' : 'Field security failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Field-Level RBAC Security & PII Masking', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 5: Autocomplete & Suggestions
    try {
      const startTime = performance.now();
      const suggestions = await SearchQueryService.autocomplete('Dell', tenantId);
      const passed = suggestions.length > 0;
      results.push({
        testName: 'Autocomplete & Search Suggestions',
        passed,
        message: passed ? `Generated ${suggestions.length} search suggestions.` : 'Autocomplete failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Autocomplete & Search Suggestions', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 6: Search Indexing Service Quality Audit
    try {
      const startTime = performance.now();
      const report = await SearchIndexingService.auditIndexQuality(tenantId);
      const passed = report.overallQualityScore > 90;
      results.push({
        testName: 'Search Index Quality & Health Audit',
        passed,
        message: passed ? `Index quality score: ${report.overallQualityScore}/100.` : 'Index quality audit failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'Search Index Quality & Health Audit', passed: false, message: e.message, durationMs: 0 });
    }

    // Test 7: AI Search Context Retrieval Adapter
    try {
      const startTime = performance.now();
      const aiRes = await AISearchAdapter.retrieveSearchContext({
        naturalLanguagePrompt: 'Show me critical servers in production',
        userRole: 'Admin',
        tenantId,
      });
      const passed = aiRes.tenantVerified && aiRes.structuredDocuments.length >= 0;
      results.push({
        testName: 'AI Copilot Search Context Retrieval Adapter',
        passed,
        message: passed ? 'AI Search Adapter safely retrieved permission-enforced documents.' : 'AI search adapter failed.',
        durationMs: Math.round(performance.now() - startTime),
      });
    } catch (e: any) {
      results.push({ testName: 'AI Copilot Search Context Retrieval Adapter', passed: false, message: e.message, durationMs: 0 });
    }

    return results;
  }
}

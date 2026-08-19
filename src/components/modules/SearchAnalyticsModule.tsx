import React, { useState, useEffect } from 'react';
import {
  Search,
  Database,
  Filter,
  BarChart3,
  Shield,
  FileText,
  Clock,
  Download,
  Terminal,
  Play,
  RefreshCw,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Save,
  Trash2,
  Tag,
  ListFilter,
  PieChart,
  Activity,
  Layers,
  Lock,
  Eye,
  FileCode,
} from 'lucide-react';

import { SearchQueryService } from '../../search/services/SearchQueryService';
import { SearchIndexingService } from '../../search/services/SearchIndexingService';
import { SearchAnalyticsService, SearchAnalyticsDashboardData } from '../../search/services/SearchAnalyticsService';
import { SearchAuditService } from '../../search/services/SearchAuditService';
import { SearchTestSuite, TestResult } from '../../search/tests/SearchTestSuite';
import { OpenSearchSearchAdapter } from '../../search/adapters/OpenSearchSearchAdapter';
import { AISearchAdapter } from '../../search/adapters/AISearchAdapter';

import {
  SearchResponse,
  SearchResultItem,
  SavedSearchRecord,
  AutocompleteSuggestion,
  SearchClusterHealth,
  IndexQualityReport,
} from '../../search/types/searchTypes';

export const SearchAnalyticsModule: React.FC = () => {
  const tenantId = 'tenant-kspl-global';

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'logs' | 'analytics' | 'health' | 'tests' | 'export'>('search');

  // Search State
  const [searchQuery, setSearchQuery] = useState('Dell Latitude Finance');
  const [userRole, setUserRole] = useState<'Admin' | 'Finance Manager' | 'Regular Employee'>('Regular Employee');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [fuzzyEnabled, setFuzzyEnabled] = useState(true);

  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Autocomplete
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);

  // Saved Searches
  const [savedSearches, setSavedSearches] = useState<SavedSearchRecord[]>([]);

  // Logs & Audit State
  const [logSearchQuery, setLogSearchQuery] = useState('WARN');
  const [logResponse, setLogResponse] = useState<SearchResponse | null>(null);

  // Analytics Dashboard Data
  const [analyticsData, setAnalyticsData] = useState<SearchAnalyticsDashboardData | null>(null);

  // Cluster Health & Quality
  const [clusterHealth, setClusterHealth] = useState<SearchClusterHealth | null>(null);
  const [qualityReport, setQualityReport] = useState<IndexQualityReport | null>(null);

  // Test Results
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const adapter = new OpenSearchSearchAdapter();

  useEffect(() => {
    executeSearch();
    loadDashboardAnalytics();
    loadClusterHealth();
  }, []);

  const executeSearch = async () => {
    setIsSearching(true);
    try {
      const filters = selectedCategoryFilter !== 'ALL'
        ? [{ field: 'category', operator: 'equals' as const, value: selectedCategoryFilter }]
        : [];

      const res = await SearchQueryService.search({
        query: searchQuery,
        filters,
        facetsRequested: ['category', 'department', 'status', 'criticality'],
        fuzzyEnabled,
        userRole,
        tenantId,
      });

      setSearchResponse(res);

      // Fetch suggestions
      if (searchQuery.trim()) {
        const sugs = await SearchQueryService.autocomplete(searchQuery, tenantId);
        setSuggestions(sugs);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const loadDashboardAnalytics = async () => {
    try {
      const data = await SearchAnalyticsService.getDashboardAnalytics(tenantId);
      setAnalyticsData(data);
      const saved = SearchQueryService.getSavedSearches(tenantId);
      setSavedSearches(saved);
    } catch (err) {
      console.error('Analytics load error:', err);
    }
  };

  const loadClusterHealth = async () => {
    try {
      const health = await adapter.clusterHealth();
      setClusterHealth(health);
      const quality = await SearchIndexingService.auditIndexQuality(tenantId);
      setQualityReport(quality);
    } catch (err) {
      console.error('Cluster health error:', err);
    }
  };

  const handleExecuteLogSearch = async () => {
    try {
      const res = await SearchQueryService.search({
        query: logSearchQuery,
        tenantId,
        page: 1,
        pageSize: 10,
      });
      setLogResponse(res);
    } catch (err) {
      console.error('Log search error:', err);
    }
  };

  const handleSaveCurrentSearch = () => {
    if (!searchQuery) return;
    const record = SearchQueryService.saveSearch({
      name: `Search: "${searchQuery}"`,
      description: `Saved query for ${searchQuery} under role ${userRole}`,
      query: searchQuery,
      filters: selectedCategoryFilter !== 'ALL' ? [{ field: 'category', operator: 'equals', value: selectedCategoryFilter }] : [],
      ownerUserId: 'USR-8801',
      tenantId,
    });
    setSavedSearches(SearchQueryService.getSavedSearches(tenantId));
  };

  const handleRunTests = async () => {
    const results = await SearchTestSuite.runAllTests(tenantId);
    setTestResults(results);
  };

  const handleExportCsv = () => {
    if (!searchResponse) return;
    const csv = SearchAuditService.exportToCsv(searchResponse.items, tenantId, 'USR-8801');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-export-${tenantId}.csv`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans bg-black min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 rounded border border-blue-500 shadow-sm">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight font-mono">
                ITAM SEARCH & ANALYTICS ENGINE
              </h1>
              <span className="bg-blue-600 text-white text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border border-blue-500">
                OPENSEARCH 2.13
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Secondary Indexing • Full-Text Relevance • Faceted Analytics • PII Masking • Log & Audit Search
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-black p-1 border border-zinc-800 rounded font-mono text-xs overflow-x-auto">
          {[
            { id: 'search', label: 'Full-Text Search', icon: Search },
            { id: 'saved', label: 'Saved Searches', icon: Save },
            { id: 'logs', label: 'Log & Audit Search', icon: FileText },
            { id: 'analytics', label: 'Analytics Aggregations', icon: BarChart3 },
            { id: 'health', label: 'Cluster & Quality', icon: Activity },
            { id: 'tests', label: 'Tests Suite', icon: Play },
            { id: 'export', label: 'Exports & Security', icon: Download },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                  isActive ? 'bg-blue-600 text-white font-bold border border-blue-500' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cluster Status Bar */}
      <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-zinc-400">
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            <span>Search Cluster:</span>
            <strong className="text-white">{clusterHealth?.searchEngine || 'OpenSearch 2.13'}</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">Cluster Status: <strong className="text-green-400">{clusterHealth?.clusterStatus || 'GREEN'}</strong></span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">Indexed Docs: <strong className="text-white">{clusterHealth?.totalDocumentsCount || 6}</strong></span>
        </div>

        <div className="flex items-center space-x-2 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>Tenant Filter Active (tenant_id = '{tenantId}')</span>
        </div>
      </div>

      {/* TAB 1: FULL-TEXT & FACETED SEARCH */}
      {activeTab === 'search' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Main Search Controls */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search Asset Name, Tag, Serial Number, Hostname, Vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                  className="w-full bg-black text-white pl-9 pr-4 py-2.5 border border-zinc-800 rounded focus:border-blue-500 focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="bg-black text-white border border-zinc-800 rounded px-3 py-2.5 text-xs focus:outline-none"
                >
                  <option value="Regular Employee">Role: Regular Employee (Masked Costs)</option>
                  <option value="Finance Manager">Role: Finance Manager (Unmasked)</option>
                  <option value="Admin">Role: System Admin (Full Access)</option>
                </select>

                <button
                  onClick={executeSearch}
                  disabled={isSearching}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded border border-blue-500 cursor-pointer flex items-center space-x-2"
                >
                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Search</span>
                </button>

                <button
                  onClick={handleSaveCurrentSearch}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold px-3 py-2.5 rounded cursor-pointer"
                  title="Save Search"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Suggestions list if available */}
            {suggestions.length > 0 && (
              <div className="p-2 bg-black border border-zinc-800 rounded flex items-center space-x-2 text-[10px] text-zinc-400">
                <span className="text-blue-400 font-bold">Suggestions:</span>
                {suggestions.map((s, idx) => (
                  <span
                    key={idx}
                    onClick={() => {
                      setSearchQuery(s.text);
                      executeSearch();
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                  >
                    {s.text} <span className="text-zinc-500">({s.category})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Search Results Grid with Facets Sidebar */}
          {searchResponse && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Faceted Filter Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-white text-xs flex items-center space-x-2 border-b border-zinc-800 pb-2">
                    <ListFilter className="w-4 h-4 text-blue-500" />
                    <span>FACETED AGGREGATION FILTERS</span>
                  </h3>

                  {searchResponse.facets.map((facet) => (
                    <div key={facet.fieldName} className="space-y-1">
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{facet.fieldName}</div>
                      <div className="space-y-1">
                        {facet.buckets.map((b) => (
                          <div
                            key={b.key}
                            onClick={() => {
                              setSelectedCategoryFilter(b.key);
                              executeSearch();
                            }}
                            className="flex items-center justify-between text-[10px] p-1.5 rounded bg-black border border-zinc-900 hover:border-zinc-700 cursor-pointer text-zinc-300"
                          >
                            <span>{b.key}</span>
                            <span className="px-1.5 py-0.2 rounded bg-zinc-800 font-bold text-white">{b.docCount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Results Main Section */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
                  <span>Found <strong className="text-white">{searchResponse.totalResults} matching records</strong> in <strong className="text-blue-400">{searchResponse.executionTimeMs} ms</strong></span>
                  <span>Correlation ID: <strong className="text-zinc-500">{searchResponse.correlationId}</strong></span>
                </div>

                <div className="space-y-3">
                  {searchResponse.items.map((item) => (
                    <div key={item.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2 hover:border-zinc-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase">
                            {item.sourceType}
                          </span>
                          <span className="text-zinc-400 text-[10px]">{item.recordId}</span>
                        </div>
                        <span className="text-zinc-500 text-[10px]">Relevance Score: {item.score}</span>
                      </div>

                      <div className="font-bold text-white text-sm">{item.title}</div>
                      <div className="text-zinc-400 text-xs">{item.description}</div>

                      {/* Attributes Detail */}
                      <div className="mt-3 pt-3 border-t border-zinc-900 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                        {Object.entries(item.attributes).map(([key, val]) => (
                          <div key={key} className="p-1.5 bg-black border border-zinc-900 rounded">
                            <span className="text-zinc-500 uppercase">{key}:</span>{' '}
                            <span className={val === '*** RESTRICTED FIELD ***' ? 'text-red-400 font-bold' : 'text-zinc-200'}>
                              {String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {searchResponse.items.length === 0 && (
                    <div className="text-zinc-500 text-center py-12">No records found matching query "{searchQuery}".</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED SEARCHES */}
      {activeTab === 'saved' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
            <Save className="w-4 h-4 text-blue-500" />
            <span>SAVED SEARCH CONFIGURATIONS</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedSearches.map((s) => (
              <div key={s.id} className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{s.name}</span>
                  <span className="text-zinc-500 text-[10px]">{s.createdAt}</span>
                </div>
                <div className="text-zinc-400 text-[11px]">{s.description}</div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[10px]">
                  <span className="text-blue-400">Query: "{s.query}"</span>
                  <button
                    onClick={() => {
                      setSearchQuery(s.query);
                      setActiveTab('search');
                      executeSearch();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded cursor-pointer"
                  >
                    Run Search
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LOG & AUDIT SEARCH */}
      {activeTab === 'logs' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>LOG & AUDIT EVENT SEARCH ENGINE</span>
            </h3>

            <div className="flex space-x-2">
              <input
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Search logs or audit events by keyword e.g. WARN, Financial..."
                className="flex-1 bg-black text-white border border-zinc-800 focus:border-blue-500 p-2 rounded text-xs focus:outline-none"
              />
              <button
                onClick={handleExecuteLogSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded border border-blue-500 cursor-pointer"
              >
                Execute Search
              </button>
            </div>
          </div>

          {logResponse && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-2">
              <div className="font-bold text-white text-xs border-b border-zinc-800 pb-2">Log & Audit Search Results ({logResponse.totalResults})</div>
              {logResponse.items.map((item) => (
                <div key={item.id} className="p-3 bg-black border border-zinc-800 rounded space-y-1 text-xs">
                  <div className="flex justify-between text-blue-400 font-bold">
                    <span>[{item.sourceType.toUpperCase()}] {item.title}</span>
                    <span className="text-zinc-500">{item.recordId}</span>
                  </div>
                  <div className="text-zinc-300">{item.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ANALYTICS AGGREGATIONS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 font-mono text-xs">
          {analyticsData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-white text-xs border-b border-zinc-800 pb-2">Category Aggregations</h4>
                <div className="space-y-2">
                  {analyticsData.categoryDistribution.map((c) => (
                    <div key={c.label} className="p-2 bg-black border border-zinc-800 rounded flex justify-between items-center">
                      <span className="text-zinc-300">{c.label}</span>
                      <span className="font-bold text-blue-400">{c.count} ({c.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-white text-xs border-b border-zinc-800 pb-2">Criticality Distribution</h4>
                <div className="space-y-2">
                  {analyticsData.criticalityDistribution.map((c) => (
                    <div key={c.label} className="p-2 bg-black border border-zinc-800 rounded flex justify-between items-center">
                      <span className="text-zinc-300">{c.label}</span>
                      <span className="font-bold text-red-400">{c.count} ({c.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CLUSTER & QUALITY */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2">Cluster Status & Performance</h3>
            <div className="space-y-2 text-[11px]">
              <div className="p-2 bg-black border border-zinc-800 rounded flex justify-between">
                <span>Search Engine:</span> <strong>{clusterHealth?.searchEngine}</strong>
              </div>
              <div className="p-2 bg-black border border-zinc-800 rounded flex justify-between">
                <span>Active Shards:</span> <strong>{clusterHealth?.activeShards}</strong>
              </div>
              <div className="p-2 bg-black border border-zinc-800 rounded flex justify-between">
                <span>Query Latency:</span> <strong className="text-blue-400">{clusterHealth?.averageQueryLatencyMs} ms</strong>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2">Index Quality Audit</h3>
            <div className="p-3 bg-black border border-zinc-800 rounded flex justify-between items-center">
              <span>Overall Index Quality Score:</span>
              <span className="text-xl font-bold text-green-400">{qualityReport?.overallQualityScore} / 100</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TESTS SUITE */}
      {activeTab === 'tests' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <Play className="w-4 h-4 text-blue-500" />
              <span>AUTOMATED SEARCH LAYER INTEGRATION TEST RUNNER</span>
            </h3>

            <button
              onClick={handleRunTests}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded border border-blue-500 cursor-pointer"
            >
              Run All 7 Tests
            </button>
          </div>

          <div className="space-y-2">
            {testResults.map((t, idx) => (
              <div key={idx} className="p-3 bg-black border border-zinc-800 rounded flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{t.testName}</div>
                  <div className="text-zinc-400 text-[10px]">{t.message}</div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-zinc-500 text-[10px]">{t.durationMs}ms</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${t.passed ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-red-400'}`}>
                    {t.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            ))}

            {testResults.length === 0 && (
              <div className="text-zinc-500 text-center py-8">Click "Run All 7 Tests" to execute live search suite.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: EXPORTS & SECURITY */}
      {activeTab === 'export' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
            <Download className="w-4 h-4 text-blue-500" />
            <span>EXPORT SEARCH RESULTS WITH RBAC ENFORCEMENT</span>
          </h3>

          <p className="text-zinc-400 text-[11px]">
            Exports active search results enforcing strict tenant isolation, RBAC field masking, and audit logging.
          </p>

          <button
            onClick={handleExportCsv}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded border border-blue-500 cursor-pointer"
          >
            Export Active Search Results as CSV
          </button>
        </div>
      )}
    </div>
  );
};

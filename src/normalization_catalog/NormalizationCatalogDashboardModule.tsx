import React, { useState } from 'react';
import { 
  Database, Search, Sliders, CheckCircle2, AlertCircle, RefreshCw, 
  Layers, Play, ArrowRight, Eye, Check, X, FileCheck, ShieldCheck, 
  HelpCircle, History, Upload, Download, Tag, BookOpen, Sparkles
} from 'lucide-react';
import { 
  SoftwareType, 
  SoftwareCategory, 
  SoftwareLifecycleStatus, 
  NormalizationStatus, 
  PublisherCatalogEntry, 
  CanonicalSoftwareProduct, 
  SoftwareAliasMapping, 
  SoftwareNormalizationResult, 
  NormalizationCatalogBatchReport 
} from './types';
import { softwareNormalizationCatalogEngine } from './normalizationEngine';

export const NormalizationCatalogDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'normalizer_test' | 'catalog_browser' | 'publishers_aliases' | 'review_queue' | 'batch_simulator' | 'bulk_import'
  >('normalizer_test');

  // Engine State
  const [publishers, setPublishers] = useState<PublisherCatalogEntry[]>(
    softwareNormalizationCatalogEngine.getPublishers()
  );
  const [products, setProducts] = useState<CanonicalSoftwareProduct[]>(
    softwareNormalizationCatalogEngine.getProducts()
  );
  const [aliases, setAliases] = useState<SoftwareAliasMapping[]>(
    softwareNormalizationCatalogEngine.getAliasMappings()
  );

  // Single Test Input
  const [testInput, setTestInput] = useState<string>('MSFT OFC 365 E3 (64-bit)');
  const [testResult, setTestResult] = useState<SoftwareNormalizationResult | null>(
    softwareNormalizationCatalogEngine.normalizeSoftwareString('MSFT OFC 365 E3 (64-bit)')
  );

  // Batch Test State
  const [batchRawText, setBatchRawText] = useState<string>(
    `MS Office 365 E3\nAdobe Acrobat Pro DC v2023\nMSFT SQL Server 2022 Enterprise\nUnknown-Legacy-App-1.0\nOffice365-E3\nOracle Corp Database 19c`
  );
  const [batchOutput, setBatchOutput] = useState<{
    results: SoftwareNormalizationResult[];
    batchReport: NormalizationCatalogBatchReport;
  } | null>(null);

  // Review Queue Sample State
  const [reviewItems, setReviewItems] = useState<SoftwareNormalizationResult[]>([
    softwareNormalizationCatalogEngine.normalizeSoftwareString('MS Office 365 Pro Plus'),
    softwareNormalizationCatalogEngine.normalizeSoftwareString('Adobe Reader DC 2022'),
    softwareNormalizationCatalogEngine.normalizeSoftwareString('SQLServer-2022-Ent')
  ]);

  // Form States
  const [newProdName, setNewProdName] = useState('');
  const [newPublisher, setNewPublisher] = useState('Microsoft');
  const [newEdition, setNewEdition] = useState('');
  const [newCategory, setNewCategory] = useState<SoftwareCategory>('Productivity');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleRunSingleTest = () => {
    const res = softwareNormalizationCatalogEngine.normalizeSoftwareString(testInput);
    setTestResult(res);
  };

  const handleRunBatchTest = () => {
    const lines = batchRawText.split('\n').filter(l => l.trim() !== '');
    const out = softwareNormalizationCatalogEngine.runBatchNormalization(lines);
    setBatchOutput(out);
  };

  const handleApproveReview = (item: SoftwareNormalizationResult) => {
    if (item.matchedPublisher && item.matchedProduct) {
      softwareNormalizationCatalogEngine.learnMappingDecision(
        item.rawDiscoveredString,
        item.matchedPublisher,
        item.matchedProduct,
        item.matchedEdition
      );
    }
    setReviewItems(reviewItems.filter(i => i.rawDiscoveredString !== item.rawDiscoveredString));
    setSaveSuccessMsg(`Approved mapping for "${item.rawDiscoveredString}". Rule learned for future normalizations.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const newProd: CanonicalSoftwareProduct = {
      id: `prod-${Date.now()}`,
      publisherId: 'pub-custom',
      publisherName: newPublisher,
      productName: newProdName,
      edition: newEdition || undefined,
      softwareType: 'Application',
      category: newCategory,
      lifecycleStatus: 'Active',
      variants: [newProdName],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    softwareNormalizationCatalogEngine.addProduct(newProd);
    setProducts(softwareNormalizationCatalogEngine.getProducts());
    setNewProdName('');
    setNewEdition('');
    setSaveSuccessMsg(`New canonical product "${newProdName}" added to content library catalog.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Software Normalization Catalog & Content Library
            </h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Content Catalog v2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Raw Software String Parsing • Publisher Alias Matching • Canonical Catalog Repository • Confidence Scoring Engine
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950">
          {(
            [
              ['normalizer_test', 'String Parser Inspector'],
              ['catalog_browser', 'Canonical Products'],
              ['publishers_aliases', 'Publishers & Aliases'],
              ['review_queue', `Review Queue (${reviewItems.length})`],
              ['batch_simulator', 'Batch Simulator'],
              ['bulk_import', 'Import / Export']
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeTab === key
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-red-950 border border-red-700 text-red-200 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-red-500" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: STRING PARSER INSPECTOR */}
      {activeTab === 'normalizer_test' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          {/* Left Form: Input */}
          <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-red-600" />
                <span>Raw String Normalization Tester</span>
              </h2>
              <p className="text-neutral-400 text-[11px] mt-1">
                Test how raw discovery software strings parse and resolve against canonical product library.
              </p>
            </div>

            <div className="space-y-3 bg-black border border-neutral-800 p-4">
              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Discovered Raw Software String</label>
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white font-bold focus:outline-none focus:border-red-600"
                  placeholder="e.g. MSFT OFC 365 E3 (64-bit)"
                />
              </div>

              <div className="flex gap-2">
                {['MSFT OFC 365 E3', 'Adobe Acrobat Pro DC', 'SQLServer-2022-Ent', 'O365 E3'].map(sample => (
                  <button
                    key={sample}
                    onClick={() => {
                      setTestInput(sample);
                      setTestResult(softwareNormalizationCatalogEngine.normalizeSoftwareString(sample));
                    }}
                    className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-[9px] text-neutral-400 hover:text-white"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunSingleTest}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider transition-colors"
            >
              Parse & Normalize String
            </button>
          </div>

          {/* Right Panel: Normalization Provenance Report */}
          <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2 flex justify-between items-center">
              <span>Normalization Inspection Outcome</span>
              {testResult && (
                <span className="bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 text-[10px] font-bold uppercase">
                  Status: {testResult.normalizationStatus} ({testResult.confidenceScore}%)
                </span>
              )}
            </div>

            {testResult && (
              <div className="space-y-3">
                <div className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="text-[10px] text-neutral-500 uppercase">Original Preserved Raw String</div>
                  <div className="text-white font-bold text-sm bg-neutral-950 p-2 border border-neutral-900">
                    "{testResult.rawDiscoveredString}"
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="bg-black border border-neutral-800 p-3">
                    <span className="text-neutral-500 uppercase">Resolved Publisher</span>
                    <div className="text-red-400 font-bold text-xs mt-1">
                      {testResult.matchedPublisher || 'Unresolved'}
                    </div>
                  </div>

                  <div className="bg-black border border-neutral-800 p-3">
                    <span className="text-neutral-500 uppercase">Canonical Product Name</span>
                    <div className="text-white font-bold text-xs mt-1">
                      {testResult.matchedProduct || 'Unresolved'}
                    </div>
                  </div>

                  <div className="bg-black border border-neutral-800 p-3">
                    <span className="text-neutral-500 uppercase">Edition / Architecture</span>
                    <div className="text-white font-bold mt-1">
                      Edition: {testResult.matchedEdition || 'N/A'} | Arch: {testResult.extractedArchitecture || 'N/A'}
                    </div>
                  </div>

                  <div className="bg-black border border-neutral-800 p-3">
                    <span className="text-neutral-500 uppercase">Matching Method</span>
                    <div className="text-white font-bold mt-1">
                      {testResult.matchingMethod}
                    </div>
                  </div>
                </div>

                {/* Explanation Trail */}
                <div className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase border-b border-neutral-900 pb-1">
                    Matching Audit & Provenance Trail
                  </div>
                  <div className="space-y-1">
                    {testResult.explanation.map((step, idx) => (
                      <div key={idx} className="text-[10px] text-neutral-300 flex items-center space-x-2">
                        <span className="text-red-600 font-bold">›</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CANONICAL PRODUCTS REPOSITORY */}
      {activeTab === 'catalog_browser' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          {/* Left: Add Product */}
          <form onSubmit={handleAddProduct} className="lg:col-span-4 bg-neutral-950 border border-neutral-800 p-4 space-y-3">
            <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2">
              Add Canonical Software Record
            </div>

            <div className="space-y-2 text-[10px]">
              <div>
                <label className="block text-neutral-400 uppercase mb-1">Publisher</label>
                <select
                  value={newPublisher}
                  onChange={(e) => setNewPublisher(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white"
                >
                  {publishers.map(p => (
                    <option key={p.id} value={p.canonicalName}>{p.canonicalName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">Canonical Product Name</label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                  placeholder="e.g. Photoshop"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">Edition</label>
                <input
                  type="text"
                  value={newEdition}
                  onChange={(e) => setNewEdition(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white"
                  placeholder="e.g. Creative Cloud / Pro"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as SoftwareCategory)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white"
                >
                  <option value="Productivity">Productivity</option>
                  <option value="Security">Security</option>
                  <option value="Database">Database</option>
                  <option value="Operating System">Operating System</option>
                  <option value="Development">Development</option>
                  <option value="SaaS">SaaS</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider"
            >
              Add Product to Catalog
            </button>
          </form>

          {/* Right: Products List */}
          <div className="lg:col-span-8 bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2 flex justify-between items-center">
              <span>Canonical Content Library Products ({products.length})</span>
            </div>

            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div>
                      <span className="text-red-400 font-bold uppercase text-xs">{p.publisherName}</span>
                      <h3 className="text-white font-bold text-sm">{p.productName}</h3>
                    </div>
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 font-bold uppercase">
                      Category: {p.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-400">
                    <div>Edition: <strong className="text-white">{p.edition || 'Standard'}</strong></div>
                    <div>Type: <strong className="text-white">{p.softwareType}</strong></div>
                    <div>Family: <strong className="text-white">{p.productFamily || 'N/A'}</strong></div>
                    <div>Lifecycle: <strong className="text-white">{p.lifecycleStatus}</strong></div>
                  </div>

                  <div className="pt-2 border-t border-neutral-950 text-[10px]">
                    <span className="text-neutral-500">Registered String Variants: </span>
                    <span className="text-neutral-300 font-mono">{p.variants.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PUBLISHERS & ALIASES */}
      {activeTab === 'publishers_aliases' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-red-600" />
                <span>Canonical Publishers & Normalization Aliases</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishers.map(pub => (
                <div key={pub.id} className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <span className="text-white font-bold text-sm">{pub.canonicalName}</span>
                    <span className="text-[10px] text-neutral-500">{pub.id}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase">Configured Publisher Aliases:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pub.aliases.map(al => (
                        <span key={al} className="bg-neutral-900 border border-neutral-800 text-neutral-200 px-2 py-0.5 text-[10px]">
                          {al}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MANUAL REVIEW QUEUE */}
      {activeTab === 'review_queue' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-red-600" />
                <span>Ambiguous Software Normalization Review Queue</span>
              </h2>
            </div>

            {reviewItems.length === 0 ? (
              <div className="p-6 bg-black border border-neutral-900 text-neutral-500 text-center">
                Review queue empty. All software discovery records normalized automatically.
              </div>
            ) : (
              <div className="space-y-3">
                {reviewItems.map((item, idx) => (
                  <div key={idx} className="bg-black border border-neutral-800 p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                      <span className="font-bold text-white text-sm">
                        Raw Discovery String: "{item.rawDiscoveredString}"
                      </span>
                      <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 font-bold">
                        Match Score: {item.confidenceScore}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[10px]">
                      <div className="bg-neutral-950 border border-neutral-900 p-3">
                        <span className="text-neutral-500 uppercase">Suggested Publisher Target</span>
                        <div className="text-red-400 font-bold mt-1">{item.matchedPublisher || 'Unknown'}</div>
                      </div>

                      <div className="bg-neutral-950 border border-neutral-900 p-3">
                        <span className="text-neutral-500 uppercase">Suggested Product Target</span>
                        <div className="text-white font-bold mt-1">{item.matchedProduct || 'Unknown'}</div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        onClick={() => handleApproveReview(item)}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase"
                      >
                        Approve Mapping & Learn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: BATCH SIMULATOR */}
      {activeTab === 'batch_simulator' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                  <Play className="w-4 h-4 text-red-600" />
                  <span>Asynchronous Batch Software Normalization Simulator</span>
                </h2>
              </div>

              <button
                onClick={handleRunBatchTest}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider"
              >
                Process Batch Normalization
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-neutral-400 text-[10px] uppercase">Raw Discovery Stream Input (Line-by-Line)</label>
              <textarea
                rows={5}
                value={batchRawText}
                onChange={(e) => setBatchRawText(e.target.value)}
                className="w-full bg-black border border-neutral-800 p-3 text-white font-mono text-xs focus:outline-none focus:border-red-600"
              />
            </div>

            {batchOutput && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 bg-black border border-neutral-800 p-4">
                  <div>
                    <span className="text-neutral-500 text-[10px] uppercase">Total Records</span>
                    <div className="text-xl font-bold text-white mt-1">{batchOutput.batchReport.totalRecordsProcessed}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] uppercase">Normalized</span>
                    <div className="text-xl font-bold text-red-500 mt-1">{batchOutput.batchReport.normalizedCount}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] uppercase">Needs Review</span>
                    <div className="text-xl font-bold text-white mt-1">{batchOutput.batchReport.needsReviewCount}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] uppercase">Average Confidence</span>
                    <div className="text-xl font-bold text-neutral-300 mt-1">{batchOutput.batchReport.averageConfidencePct}%</div>
                  </div>
                </div>

                <div className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2">
                    Batch Output Detail
                  </div>
                  {batchOutput.results.map((res, i) => (
                    <div key={i} className="p-2.5 bg-neutral-950 border border-neutral-800 flex justify-between items-center text-[10px]">
                      <div>
                        <span className="text-white font-bold">"{res.rawDiscoveredString}"</span>
                        <span className="text-neutral-400"> ──&gt; {res.matchedPublisher || 'Unresolved'} {res.matchedProduct || 'Unresolved'}</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-red-400 font-bold">{res.confidenceScore}%</span>
                        <span className="bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 font-bold uppercase">
                          {res.normalizationStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: IMPORT / EXPORT */}
      {activeTab === 'bulk_import' && (
        <div className="bg-neutral-950 border border-neutral-800 p-6 space-y-4 font-mono text-xs max-w-3xl mx-auto">
          <div className="border-b border-neutral-900 pb-3">
            <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
              <Upload className="w-4 h-4 text-red-600" />
              <span>Bulk Content Library Catalog Import & Export</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black border border-neutral-800 p-5 text-center space-y-3">
              <Upload className="w-8 h-8 text-red-600 mx-auto" />
              <div className="text-white font-bold">Import Catalog CSV / JSON</div>
              <p className="text-neutral-500 text-[10px]">
                Bulk load vendor publishers, canonical software products, and alias mapping definitions.
              </p>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase">
                Upload Catalog File
              </button>
            </div>

            <div className="bg-black border border-neutral-800 p-5 text-center space-y-3">
              <Download className="w-8 h-8 text-neutral-400 mx-auto" />
              <div className="text-white font-bold">Export Catalog Package</div>
              <p className="text-neutral-500 text-[10px]">
                Download tenant-extended canonical catalog and alias mappings as JSON.
              </p>
              <button className="px-4 py-2 bg-neutral-900 border border-neutral-700 text-white font-bold uppercase hover:border-neutral-500">
                Export JSON Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

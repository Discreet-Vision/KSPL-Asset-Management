import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, AlertCircle, Clock, BookOpen, Layers, 
  Search, ArrowRight, ShieldCheck, Database, RefreshCw, Cpu, Tag, Filter, Check, X,
  FileSpreadsheet, HelpCircle
} from 'lucide-react';

interface CatalogEntry {
  canonicalId: string;
  canonicalName: string;
  publisher: string;
  productFamily: string;
  edition: string;
  category: string;
  licenseModel: string;
  aliases: string[];
}

interface ReviewItem {
  id: string;
  rawName: string;
  rawPublisher: string;
  source: string;
  topCandidate: string;
  canonicalId: string;
  confidence: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const SoftwareNormalizationModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tester' | 'catalog' | 'queue' | 'aliases' | 'metrics'>('tester');
  
  // Interactive Live Normalizer State
  const [rawInput, setRawInput] = useState('MSFT OFC 365 E3');
  const [rawPublisherInput, setRawPublisherInput] = useState('Microsoft Corporation');
  const [normalizedResult, setNormalizedResult] = useState<any>({
    rawName: 'MSFT OFC 365 E3',
    canonicalId: 'SW-MSFT-365-E3',
    canonicalName: 'Microsoft 365 E3',
    publisher: 'Microsoft',
    productFamily: 'Microsoft 365',
    edition: 'E3',
    category: 'SaaS / Productivity',
    licenseModel: 'Subscription',
    confidence: 0.98,
    method: 'alias_match',
    modelVersion: '1.2.0-ml',
    status: 'MATCHED',
    fromCache: false,
    candidates: [
      { name: 'Microsoft 365 E3', confidence: 0.98 },
      { name: 'Microsoft 365 E5', confidence: 0.82 },
      { name: 'Microsoft Office Professional Plus', confidence: 0.64 }
    ]
  });

  // Reference Catalog State (Technopedia-Lite)
  const [catalog] = useState<CatalogEntry[]>([
    {
      canonicalId: 'SW-MSFT-365-E3',
      canonicalName: 'Microsoft 365 E3',
      publisher: 'Microsoft',
      productFamily: 'Microsoft 365',
      edition: 'E3',
      category: 'SaaS / Productivity',
      licenseModel: 'Subscription',
      aliases: ['MSFT OFC 365 E3', 'Microsoft Office 365 E3', 'Office365-E3', 'Microsoft 365 Apps for enterprise']
    },
    {
      canonicalId: 'SW-ADOBE-ACROBAT-PRO',
      canonicalName: 'Adobe Acrobat Pro',
      publisher: 'Adobe',
      productFamily: 'Acrobat',
      edition: 'Pro',
      category: 'Document Management',
      licenseModel: 'Per User / Subscription',
      aliases: ['Adobe Acro Pro', 'Adobe Acrobat DC Pro', 'Acrobat Professional', 'Adobe Acrobat Pro DC']
    },
    {
      canonicalId: 'SW-GOOGLE-CHROME',
      canonicalName: 'Google Chrome',
      publisher: 'Google',
      productFamily: 'Chrome',
      edition: 'Enterprise',
      category: 'Web Browser',
      licenseModel: 'Freeware',
      aliases: ['Google Chrome Enterprise', 'chrome-stable', 'Google Chrome x64']
    },
    {
      canonicalId: 'SW-DOCKER-DESKTOP',
      canonicalName: 'Docker Desktop',
      publisher: 'Docker Inc.',
      productFamily: 'Docker',
      edition: 'Business / Pro',
      category: 'Developer Tools',
      licenseModel: 'Per User Subscription',
      aliases: ['Docker Desktop / Engine', 'docker-ce', 'Docker Engine Community']
    },
    {
      canonicalId: 'SW-POSTGRESQL-SERVER',
      canonicalName: 'PostgreSQL',
      publisher: 'PostgreSQL Global Development Group',
      productFamily: 'PostgreSQL',
      edition: 'Server',
      category: 'Database',
      licenseModel: 'Open Source',
      aliases: ['postgresql15-server', 'PostgreSQL Database Server', 'postgres-server']
    }
  ]);

  // Review Queue State
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([
    {
      id: 'REV-9912A',
      rawName: 'Adobe Acro Reader DC x64',
      rawPublisher: 'Adobe Systems',
      source: 'WMI Scanner',
      topCandidate: 'Adobe Acrobat Reader',
      canonicalId: 'SW-ADOBE-READER',
      confidence: 0.88,
      status: 'PENDING'
    },
    {
      id: 'REV-8843B',
      rawName: 'MS Office ProPlus 2021 Volume',
      rawPublisher: 'Microsoft Corp',
      source: 'Agentless SSH',
      topCandidate: 'Microsoft Office Professional Plus',
      canonicalId: 'SW-MSFT-OFFICE-PROPLUS',
      confidence: 0.84,
      status: 'PENDING'
    }
  ]);

  const handleTestNormalize = () => {
    // Simulate real-time 7-stage ML normalization call
    const clean = rawInput.toLowerCase();
    let res: any = {
      rawName: rawInput,
      rawPublisher: rawPublisherInput,
      modelVersion: '1.2.0-ml',
      fromCache: false
    };

    if (clean.includes('acro') || clean.includes('adobe')) {
      res = {
        ...res,
        canonicalId: 'SW-ADOBE-ACROBAT-PRO',
        canonicalName: 'Adobe Acrobat Pro',
        publisher: 'Adobe',
        productFamily: 'Acrobat',
        edition: 'Pro',
        category: 'Document Management',
        licenseModel: 'Subscription',
        confidence: 0.94,
        method: 'ml_scikit_spacy_match',
        status: 'MATCHED',
        candidates: [
          { name: 'Adobe Acrobat Pro', confidence: 0.94 },
          { name: 'Adobe Acrobat Reader', confidence: 0.76 }
        ]
      };
    } else if (clean.includes('postgres') || clean.includes('sql')) {
      res = {
        ...res,
        canonicalId: 'SW-POSTGRESQL-SERVER',
        canonicalName: 'PostgreSQL',
        publisher: 'PostgreSQL Global Development Group',
        productFamily: 'PostgreSQL',
        edition: 'Server',
        category: 'Database',
        licenseModel: 'Open Source',
        confidence: 0.99,
        method: 'alias_match',
        status: 'MATCHED',
        candidates: [
          { name: 'PostgreSQL', confidence: 0.99 }
        ]
      };
    } else {
      res = {
        ...res,
        canonicalId: 'SW-MSFT-365-E3',
        canonicalName: 'Microsoft 365 E3',
        publisher: 'Microsoft',
        productFamily: 'Microsoft 365',
        edition: 'E3',
        category: 'SaaS / Productivity',
        licenseModel: 'Subscription',
        confidence: 0.98,
        method: 'alias_match',
        status: 'MATCHED',
        candidates: [
          { name: 'Microsoft 365 E3', confidence: 0.98 },
          { name: 'Microsoft 365 E5', confidence: 0.82 }
        ]
      };
    }

    setNormalizedResult(res);
  };

  const handleApproveReview = (id: string) => {
    setReviewQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'APPROVED' } : item));
  };

  return (
    <div className="p-6 bg-slate-900 text-slate-100 min-h-screen font-sans border border-slate-800 rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Software Normalization & ML Matching Subsystem
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Technopedia-Lite Reference Catalog • scikit-learn TF-IDF & spaCy NLP Pipeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-3.5 h-3.5" />
            Model v1.2.0-ml Active
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mt-6 space-x-8">
        {[
          { id: 'tester', label: 'Live Normalizer Pipeline', icon: Sparkles },
          { id: 'catalog', label: 'Technopedia-Lite Catalog', icon: BookOpen },
          { id: 'queue', label: 'Human Review Queue', icon: AlertCircle },
          { id: 'aliases', label: 'Alias Dictionary', icon: Tag },
          { id: 'metrics', label: 'Model Metrics & Settings', icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                active 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'queue' && reviewQueue.filter(r => r.status === 'PENDING').length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[10px] rounded-full font-bold">
                  {reviewQueue.filter(r => r.status === 'PENDING').length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {/* LIVE NORMALIZER TESTER TAB */}
        {activeTab === 'tester' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-5 p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-400" />
                Raw Software String Input
              </h3>
              
              <div>
                <label className="text-xs text-slate-400 block mb-1">Discovered Software Title</label>
                <input 
                  type="text" 
                  value={rawInput}
                  onChange={e => setRawInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. MSFT OFC 365 E3"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Discovered Publisher (Optional Signal)</label>
                <input 
                  type="text" 
                  value={rawPublisherInput}
                  onChange={e => setRawPublisherInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Microsoft Corporation"
                />
              </div>

              <div className="pt-2">
                <p className="text-[11px] text-slate-400 mb-3">Quick Presets from Discovery Agents:</p>
                <div className="flex flex-wrap gap-2">
                  {['MSFT OFC 365 E3', 'Adobe Acro Pro DC', 'postgresql15-server', 'Docker Desktop / Engine'].map(preset => (
                    <button
                      key={preset}
                      onClick={() => setRawInput(preset)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono text-slate-300"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleTestNormalize}
                className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Execute 7-Stage Normalization
              </button>
            </div>

            {/* Output Display */}
            <div className="lg:col-span-7 p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Canonical Normalization Output
                </h3>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Confidence: {(normalizedResult.confidence * 100).toFixed(0)}%
                </span>
              </div>

              {/* Transformation visual */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs">
                <div className="text-slate-400">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Raw Discovered String</span>
                  <span className="text-amber-300 font-semibold">{normalizedResult.rawName}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Canonical Catalog Entity</span>
                  <span className="text-emerald-400 font-bold">{normalizedResult.canonicalName}</span>
                </div>
              </div>

              {/* Metadata Attributes Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded">
                  <span className="text-slate-400 block text-[10px]">Canonical ID</span>
                  <span className="font-mono text-indigo-300 font-semibold">{normalizedResult.canonicalId}</span>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded">
                  <span className="text-slate-400 block text-[10px]">Publisher / Family</span>
                  <span className="text-slate-200">{normalizedResult.publisher} • {normalizedResult.productFamily}</span>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded">
                  <span className="text-slate-400 block text-[10px]">Matching Stage / Method</span>
                  <span className="text-slate-200 font-mono capitalize">{normalizedResult.method?.replace(/_/g, ' ')}</span>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded">
                  <span className="text-slate-400 block text-[10px]">SAM License Model</span>
                  <span className="text-slate-200">{normalizedResult.licenseModel}</span>
                </div>
              </div>

              {/* Candidates list */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">ML Candidate Vector Scores</h4>
                <div className="space-y-1.5 font-mono text-xs">
                  {normalizedResult.candidates?.map((cand: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-900 rounded border border-slate-800/60">
                      <span className="text-slate-300">{cand.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full rounded-full" 
                            style={{ width: `${cand.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-indigo-400 text-[11px]">{(cand.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TECHNOPEDIA-LITE CATALOG TAB */}
        {activeTab === 'catalog' && (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">Technopedia-Lite Reference Catalog</h3>
                <p className="text-xs text-slate-400">Canonical software products, editions, and registered aliases</p>
              </div>
            </div>
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Canonical ID</th>
                  <th className="px-4 py-3">Canonical Product Name</th>
                  <th className="px-4 py-3">Publisher</th>
                  <th className="px-4 py-3">Edition</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Known Aliases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {catalog.map(entry => (
                  <tr key={entry.canonicalId} className="hover:bg-slate-900/50">
                    <td className="px-4 py-3 font-mono text-xs text-indigo-400 font-semibold">{entry.canonicalId}</td>
                    <td className="px-4 py-3 font-medium text-white">{entry.canonicalName}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{entry.publisher}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-400">{entry.edition}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{entry.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {entry.aliases.map((a, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-slate-400">
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* HUMAN REVIEW QUEUE TAB */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">Human-in-the-Loop Review Queue</h3>
                <p className="text-xs text-slate-400">Approve uncertain software matches to automatically retrain and learn reusable aliases.</p>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Review ID</th>
                    <th className="px-4 py-3">Raw Discovered Name</th>
                    <th className="px-4 py-3">Discovery Source</th>
                    <th className="px-4 py-3">Top ML Candidate</th>
                    <th className="px-4 py-3">Confidence</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reviewQueue.map(item => (
                    <tr key={item.id} className="hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-mono text-xs text-amber-400">{item.id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-200">{item.rawName}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{item.source}</td>
                      <td className="px-4 py-3 text-xs font-medium text-white">{item.topCandidate}</td>
                      <td className="px-4 py-3 font-mono text-xs text-indigo-400">{(item.confidence * 100).toFixed(0)}%</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.status === 'PENDING' ? (
                          <button 
                            onClick={() => handleApproveReview(item.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors"
                          >
                            Approve Match & Learn Alias
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Alias Learned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALIAS DICTIONARY TAB */}
        {activeTab === 'aliases' && (
          <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-white">Global & Tenant Alias Rules</h3>
            <p className="text-xs text-slate-400">Pre-processing expansions applied during Stage 3 normalization.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              {[
                { raw: 'MSFT', exp: 'Microsoft' },
                { raw: 'OFC', exp: 'Office' },
                { raw: 'O365', exp: 'Office 365' },
                { raw: 'M365', exp: 'Microsoft 365' },
                { raw: 'ACRO', exp: 'Acrobat' },
                { raw: 'CORP', exp: 'Corporation' }
              ].map((alias, idx) => (
                <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                  <span className="text-amber-400 font-bold">{alias.raw}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-emerald-400">{alias.exp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ML METRICS TAB */}
        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Model Artifact</span>
              <p className="text-sm font-bold text-white">software-normalizer-tfidf-spacy</p>
              <p className="text-slate-400 font-mono">Version: 1.2.0-ml</p>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Configured Thresholds</span>
              <p className="text-sm font-bold text-emerald-400">≥ 95% Auto-Match</p>
              <p className="text-amber-400 font-mono">80% – 94% Review Recommended</p>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Exact Cache Engine</span>
              <p className="text-sm font-bold text-indigo-400">Active (24h TTL)</p>
              <p className="text-slate-400 font-mono">Hits: 1,482 / Misses: 24</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SoftwareNormalizationModule;

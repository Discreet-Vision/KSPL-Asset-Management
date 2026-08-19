import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfigurationItem, CIRelationship, CIClassCategory } from '../../types';
import { AssetQrCodeModal } from '../common/AssetQrCodeModal';
import { BulkAssetImportModal } from '../common/BulkAssetImportModal';
import { CmdbGraphModule } from './CmdbGraphModule';
import { CiHierarchyModule } from '../../ci_hierarchy/CiHierarchyModule';
import { CiRelationshipDashboardModule } from '../../ci_relationships/CiRelationshipDashboardModule';
import { EnterpriseCmdbDataModelDashboardModule } from '../../enterprise_cmdb_datamodel/EnterpriseCmdbDataModelDashboardModule';
import { CmdbFederationModule } from './CmdbFederationModule';
import { AiCiRelationshipSuggester } from '../cmdb/AiCiRelationshipSuggester';
import {
  Database,
  Plus,
  Trash2,
  Edit,
  GitFork,
  Activity,
  Layers,
  Search,
  ShieldAlert,
  ArrowRight,
  Server,
  Laptop,
  Network,
  Cloud,
  AppWindow,
  X,
  FileText,
  QrCode,
  FileSpreadsheet,
  GitMerge,
  Workflow,
  Share2,
  Sparkles
} from 'lucide-react';

export const CmdbModule: React.FC = () => {
  const [cmdbMasterTab, setCmdbMasterTab] = useState<
    'inventory' | 'graph_topology' | 'class_registry' | 'relationships' | 'enterprise_model' | 'federation' | 'ai_suggester'
  >('inventory');

  const {
    configurationItems,
    ciRelationships,
    ciClasses,
    addConfigurationItem,
    deleteConfigurationItem,
    addRelationship,
    deleteRelationship,
    locations,
    departments,
    clearAllDemoData,
  } = useApp();

  const [selectedCi, setSelectedCi] = useState<ConfigurationItem | null>(configurationItems[0] || null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddCiModalOpen, setIsAddCiModalOpen] = useState(false);
  const [isAddRelModalOpen, setIsAddRelModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrTargetCi, setQrTargetCi] = useState<ConfigurationItem | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // New CI Form State
  const [newCiName, setNewCiName] = useState('');
  const [newCiClassId, setNewCiClassId] = useState(ciClasses[0]?.id || '');
  const [newCiAssetTag, setNewCiAssetTag] = useState('');
  const [newCiSerial, setNewCiSerial] = useState('');
  const [newCiManufacturer, setNewCiManufacturer] = useState('');
  const [newCiModel, setNewCiModel] = useState('');
  const [newCiIp, setNewCiIp] = useState('');

  // New Relationship Form State
  const [relTargetCiId, setRelTargetCiId] = useState('');
  const [relType, setRelType] = useState<CIRelationship['type']>('depends_on');

  const filteredCis = (configurationItems || []).filter((ci) => {
    if (!ci) return false;
    if (filterCategory !== 'all' && ci.category !== filterCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        (ci.name || '').toLowerCase().includes(q) ||
        (ci.assetTag || '').toLowerCase().includes(q) ||
        (ci.serialNumber || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate Blast Radius Impact for selected CI
  const safeRels = ciRelationships || [];
  const safeCis = configurationItems || [];

  const targetRelationships = safeRels.filter(
    (r) => r.sourceCiId === selectedCi?.id || r.targetCiId === selectedCi?.id
  );

  const downstreamCis = safeRels
    .filter((r) => r.sourceCiId === selectedCi?.id)
    .map((r) => safeCis.find((c) => c.id === r.targetCiId))
    .filter(Boolean) as ConfigurationItem[];

  const upstreamCis = safeRels
    .filter((r) => r.targetCiId === selectedCi?.id)
    .map((r) => safeCis.find((c) => c.id === r.sourceCiId))
    .filter(Boolean) as ConfigurationItem[];

  const handleCreateCi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCiName || !newCiAssetTag) return;
    const selectedClass = ciClasses.find((c) => c.id === newCiClassId) || ciClasses[0];

    addConfigurationItem({
      name: newCiName,
      ciClassId: selectedClass?.id || 'class-server',
      ciClassName: selectedClass?.name || 'Enterprise Server',
      category: selectedClass?.category || 'Hardware',
      assetTag: newCiAssetTag,
      serialNumber: newCiSerial || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      manufacturer: newCiManufacturer || 'Generic Enterprise',
      model: newCiModel || 'Standard Issue',
      ipAddress: newCiIp || undefined,
      locationId: locations[0]?.id || 'loc-nyc-dc',
      locationName: locations[0]?.name || 'NYC Primary Datacenter',
      departmentId: departments[0]?.id || 'dept-infra',
      departmentName: departments[0]?.name || 'Enterprise Infrastructure',
      lifecycleState: 'Deployed',
      discoverySource: 'Manual',
      dataClassification: 'Confidential',
      costCenterId: 'cc-101',
      customAttributes: {},
      tenantId: 'tenant-1',
    });

    setIsAddCiModalOpen(false);
    setNewCiName('');
    setNewCiAssetTag('');
  };

  const handleCreateRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCi || !relTargetCiId) return;
    const target = configurationItems.find((c) => c.id === relTargetCiId);
    if (!target) return;

    addRelationship({
      sourceCiId: selectedCi.id,
      sourceCiName: selectedCi.name,
      targetCiId: target.id,
      targetCiName: target.name,
      type: relType,
      discoverySource: 'Manual Operator',
      confidence: 100,
    });

    setIsAddRelModalOpen(false);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 text-white font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-3 sm:p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <Database className="w-5 h-5 text-red-500 shrink-0" />
            <span>ENTERPRISE CMDB HUB & TOPOLOGY ENGINE</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Configuration Items (CIs), Directional Relationships, Graph Topology, Class Hierarchy & Multi-Source Federation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCmdbMasterTab('ai_suggester')}
            className="bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-200 text-xs font-bold font-mono px-3 py-2 rounded flex items-center space-x-1.5 shadow transition-colors cursor-pointer"
            title="Launch AI Relationship Suggester to analyze server naming patterns and subnet proximity"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>AI Suggest Relationships</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all demo data? This will remove all demo CIs and relationships from database storage.')) {
                clearAllDemoData();
                setSelectedCi(null);
              }
            }}
            className="bg-zinc-900 hover:bg-red-950 text-zinc-300 hover:text-red-400 text-xs font-bold font-mono px-3 py-2 rounded flex items-center space-x-1.5 border border-zinc-800 shadow transition-colors cursor-pointer"
            title="Remove all demo data and start with an empty live database"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Clear Demo Data</span>
          </button>
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="bg-black hover:bg-zinc-900 text-white text-xs font-bold font-mono px-3 py-2 rounded flex items-center space-x-1.5 border border-zinc-800 shadow transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-red-500" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            onClick={() => setIsAddCiModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono px-4 py-2 rounded flex items-center space-x-2 border border-red-500 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New CI</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex overflow-x-auto bg-zinc-950 p-1 border border-zinc-800 rounded-lg gap-1 text-xs font-mono custom-scrollbar">
        <button
          onClick={() => setCmdbMasterTab('inventory')}
          className={`px-3 py-2 rounded font-bold flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
            cmdbMasterTab === 'inventory' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>System of Record & Inventory</span>
        </button>
        <button
          onClick={() => setCmdbMasterTab('graph_topology')}
          className={`px-3 py-2 rounded font-bold flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
            cmdbMasterTab === 'graph_topology' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Graph Topology & SPOFs</span>
        </button>
        <button
          onClick={() => setCmdbMasterTab('class_registry')}
          className={`px-3 py-2 rounded font-bold flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
            cmdbMasterTab === 'class_registry' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-green-400" />
          <span>CI Class Hierarchy</span>
        </button>
        <button
          onClick={() => setCmdbMasterTab('relationships')}
          className={`px-3 py-2 rounded font-bold flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
            cmdbMasterTab === 'relationships' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <GitFork className="w-3.5 h-3.5 text-purple-400" />
          <span>Relationship Rules Engine</span>
        </button>
        <button
          onClick={() => setCmdbMasterTab('enterprise_model')}
          className={`px-3 py-2 rounded font-bold flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
            cmdbMasterTab === 'enterprise_model' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <Workflow className="w-3.5 h-3.5 text-amber-400" />
          <span>Data Model & Licenses</span>
        </button>
        <button
          onClick={() => setCmdbMasterTab('federation')}
          className={`px-3 py-2 rounded font-bold flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
            cmdbMasterTab === 'federation' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
          }`}
        >
          <GitMerge className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multi-Source Federation</span>
        </button>
        <button
          onClick={() => setCmdbMasterTab('ai_suggester')}
          className={`px-3 py-2 rounded font-bold flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-all ${
            cmdbMasterTab === 'ai_suggester'
              ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-950'
              : 'text-red-400 hover:bg-red-950/40 hover:text-red-300 border border-red-900/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-red-300 animate-pulse" />
          <span>AI Relationship Suggester</span>
        </button>
      </div>

      {/* Render Selected View */}
      {cmdbMasterTab === 'graph_topology' && <CmdbGraphModule />}
      {cmdbMasterTab === 'class_registry' && <CiHierarchyModule />}
      {cmdbMasterTab === 'relationships' && <CiRelationshipDashboardModule />}
      {cmdbMasterTab === 'enterprise_model' && <EnterpriseCmdbDataModelDashboardModule />}
      {cmdbMasterTab === 'federation' && <CmdbFederationModule />}
      {cmdbMasterTab === 'ai_suggester' && (
        <AiCiRelationshipSuggester onNavigateToGraph={() => setCmdbMasterTab('graph_topology')} />
      )}

      {cmdbMasterTab === 'inventory' && (
      <>
      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: CI Inventory Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filters & Search */}
          <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2 flex-1 min-w-[200px] bg-black border border-zinc-800 rounded px-2.5 py-1.5">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search CI Name, Tag, Serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-white placeholder-zinc-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-zinc-500">Category:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-black text-white border border-zinc-800 rounded px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Cloud">Cloud</option>
                <option value="Service">Service</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
          </div>

          {/* CI List Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 font-mono text-xs text-zinc-400 flex justify-between items-center">
              <span>CONFIGURATION ITEMS ({filteredCis.length})</span>
              <span className="text-[10px]">Click item to inspect blast-radius topology</span>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-zinc-900 text-zinc-400 border-b border-zinc-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">CI Name</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Asset Tag</th>
                    <th className="p-3">Lifecycle</th>
                    <th className="p-3">Health</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {filteredCis.map((ci) => {
                    const isSelected = selectedCi?.id === ci.id;
                    return (
                      <tr
                        key={ci.id}
                        onClick={() => setSelectedCi(ci)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-red-600/20 border-l-4 border-red-600 text-white font-bold' : 'hover:bg-zinc-900'
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-bold text-white truncate max-w-[180px]">{ci.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{ci.manufacturer} {ci.model}</div>
                        </td>
                        <td className="p-3 text-zinc-400">{ci.ciClassName}</td>
                        <td className="p-3">
                          <span className="bg-black border border-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded text-[10px]">
                            {ci.assetTag}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-black border border-red-500 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded">
                            {ci.lifecycleState}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-white">{ci.healthScore}%</span>
                        </td>
                        <td className="p-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setQrTargetCi(ci);
                              setIsQrModalOpen(true);
                            }}
                            className="p-1 hover:bg-zinc-800 rounded text-red-500 hover:text-white transition-colors cursor-pointer"
                            title="Generate QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteConfigurationItem(ci.id)}
                            className="p-1 hover:bg-red-600 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Delete CI"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Selected CI Inspector & Interactive Topology (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedCi ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
              {/* Selected CI Card Header */}
              <div className="border-b border-zinc-800 pb-3 flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-wider">
                    {selectedCi.ciClassName} ({selectedCi.category})
                  </div>
                  <h2 className="text-lg font-black text-white">{selectedCi.name}</h2>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">
                    Asset Tag: <span className="text-white">{selectedCi.assetTag}</span> | Serial: <span className="text-white">{selectedCi.serialNumber}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => {
                      setQrTargetCi(selectedCi);
                      setIsQrModalOpen(true);
                    }}
                    className="bg-black hover:bg-zinc-900 border border-zinc-800 text-white text-[10px] font-mono px-2.5 py-1.5 rounded flex items-center space-x-1 cursor-pointer"
                    title="Generate QR Tag"
                  >
                    <QrCode className="w-3.5 h-3.5 text-red-500" />
                    <span>QR Code</span>
                  </button>
                  <button
                    onClick={() => setIsAddRelModalOpen(true)}
                    className="bg-black hover:bg-zinc-900 border border-zinc-800 text-white text-[10px] font-mono px-2.5 py-1.5 rounded flex items-center space-x-1 cursor-pointer"
                  >
                    <GitFork className="w-3.5 h-3.5 text-red-500" />
                    <span>Map Relationship</span>
                  </button>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black p-3 border border-zinc-800 rounded">
                <div>
                  <span className="text-zinc-500 block">IP Address:</span>
                  <span className="font-bold text-white">{selectedCi.ipAddress || '10.100.12.45'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Location:</span>
                  <span className="font-bold text-white">{selectedCi.locationName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Department:</span>
                  <span className="font-bold text-white">{selectedCi.departmentName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Discovery Source:</span>
                  <span className="font-bold text-red-400">{selectedCi.discoverySource}</span>
                </div>
              </div>

              {/* Blast-Radius & Topology Visualizer */}
              <div className="border border-zinc-800 bg-black rounded p-3 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-white font-mono flex items-center space-x-1.5 uppercase">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <span>Blast-Radius & Dependency Graph</span>
                  </span>
                  <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                    Risk Score: {selectedCi.riskScore}/100
                  </span>
                </div>

                {/* Upstream Dependents */}
                <div>
                  <div className="text-[10px] text-zinc-400 font-mono mb-1 uppercase">
                    Upstream Dependents (Services / Apps Affected if Down):
                  </div>
                  {upstreamCis.length === 0 ? (
                    <div className="text-xs text-zinc-600 font-mono italic">No upstream dependencies mapped</div>
                  ) : (
                    <div className="space-y-1">
                      {upstreamCis.map((up) => (
                        <div
                          key={up.id}
                          className="bg-zinc-900 border border-zinc-800 p-2 rounded text-xs font-mono flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-red-500 font-bold">↑</span>
                            <span className="font-bold text-white">{up.name}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">{up.ciClassName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Center Node Indicator */}
                <div className="p-2 bg-red-600 text-white font-bold text-xs text-center rounded border border-red-500 font-mono uppercase tracking-wider">
                  [ Selected Target: {selectedCi.name} ]
                </div>

                {/* Downstream Infrastructure */}
                <div>
                  <div className="text-[10px] text-zinc-400 font-mono mb-1 uppercase">
                    Downstream Infrastructure (Depends On):
                  </div>
                  {downstreamCis.length === 0 ? (
                    <div className="text-xs text-zinc-600 font-mono italic">No downstream CIs mapped</div>
                  ) : (
                    <div className="space-y-1">
                      {downstreamCis.map((down) => (
                        <div
                          key={down.id}
                          className="bg-zinc-900 border border-zinc-800 p-2 rounded text-xs font-mono flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-bold">↓</span>
                            <span className="font-bold text-white">{down.name}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">{down.ciClassName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mapped Relationships List with Delete Action */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-400 font-mono uppercase">
                  Active Direct Relationships ({targetRelationships.length}):
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                  {targetRelationships.map((r) => (
                    <div
                      key={r.id}
                      className="p-2 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono flex items-center justify-between"
                    >
                      <div>
                        <span className="text-white font-bold">{r.sourceCiName}</span>
                        <span className="text-red-500 font-bold mx-1.5">--[{r.type}]--&gt;</span>
                        <span className="text-white font-bold">{r.targetCiName}</span>
                      </div>
                      <button
                        onClick={() => deleteRelationship(r.id)}
                        className="p-1 text-zinc-500 hover:text-red-500 cursor-pointer"
                        title="Remove Relationship"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500 font-mono text-xs">
              Select a Configuration Item from the table to inspect topology.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Provision New CI */}
      {isAddCiModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-lg shadow-2xl overflow-hidden font-mono text-xs">
            <div className="p-4 bg-black border-b border-zinc-800 flex justify-between items-center text-white font-bold">
              <span>PROVISION NEW CONFIGURATION ITEM</span>
              <button onClick={() => setIsAddCiModalOpen(false)} className="cursor-pointer hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCi} className="p-4 space-y-3">
              <div>
                <label className="text-zinc-400 block mb-1">CI Name / Hostname *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. prod-app-node-03.dc1.internal"
                  value={newCiName}
                  onChange={(e) => setNewCiName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">CI Class *</label>
                  <select
                    value={newCiClassId}
                    onChange={(e) => setNewCiClassId(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none cursor-pointer"
                  >
                    {ciClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Asset Tag *</label>
                  <input
                    type="text"
                    required
                    placeholder="TAG-SRV-9099"
                    value={newCiAssetTag}
                    onChange={(e) => setNewCiAssetTag(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="Dell Technologies"
                    value={newCiManufacturer}
                    onChange={(e) => setNewCiManufacturer(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="PowerEdge R750"
                    value={newCiModel}
                    onChange={(e) => setNewCiModel(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">IP Address</label>
                <input
                  type="text"
                  placeholder="10.100.12.99"
                  value={newCiIp}
                  onChange={(e) => setNewCiIp(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddCiModalOpen(false)}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded border border-red-500 cursor-pointer"
                >
                  Save CI to CMDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Map Relationship */}
      {isAddRelModalOpen && selectedCi && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-black border-b border-zinc-800 flex justify-between items-center text-white font-bold">
              <span>MAP RELATIONSHIP FOR {selectedCi.name}</span>
              <button onClick={() => setIsAddRelModalOpen(false)} className="cursor-pointer hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateRelationship} className="p-4 space-y-3">
              <div>
                <label className="text-zinc-400 block mb-1">Relationship Type *</label>
                <select
                  value={relType}
                  onChange={(e) => setRelType(e.target.value as any)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none cursor-pointer"
                >
                  <option value="depends_on">depends_on (Source depends on Target)</option>
                  <option value="runs_on">runs_on (Source runs on Target)</option>
                  <option value="hosted_by">hosted_by (Source is hosted on Target)</option>
                  <option value="connects_to">connects_to (Source connects to Target)</option>
                  <option value="installed_on">installed_on (Source installed on Target)</option>
                  <option value="supports">supports (Source supports Target Service)</option>
                  <option value="communicates_with">communicates_with (Network traffic)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Target Configuration Item *</label>
                <select
                  value={relTargetCiId}
                  onChange={(e) => setRelTargetCiId(e.target.value)}
                  required
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none cursor-pointer"
                >
                  <option value="">Select Target CI...</option>
                  {configurationItems
                    .filter((c) => c.id !== selectedCi.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.ciClassName})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddRelModalOpen(false)}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded border border-red-500 cursor-pointer"
                >
                  Add Relationship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}

      {/* QR Code Generator Modal */}
      <AssetQrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        asset={qrTargetCi}
        allAssets={filteredCis}
        onSelectAsset={(c) => setQrTargetCi(c)}
      />

      {/* Bulk CSV Import Modal */}
      <BulkAssetImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />
    </div>
  );
};

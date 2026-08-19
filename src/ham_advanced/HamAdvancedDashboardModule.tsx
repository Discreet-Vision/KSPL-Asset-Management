import React, { useState } from 'react';
import { 
  Server, ShieldCheck, AlertTriangle, FileText, CheckCircle2, RefreshCw, 
  Search, Cpu, Lock, Layers, Download, Package, ArrowRight, Truck, Trash2, Box
} from 'lucide-react';
import { 
  HardwareAsset, 
  StockroomInventory, 
  DataDestructionRecord, 
  ChainOfCustodyEvent, 
  HamSummaryStats,
  HardwareLifecycleState,
  DataDestructionMethod
} from './types';
import { hamAdvancedEngine } from './hamEngine';

export const HamAdvancedDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'lifecycle' | 'stockroom' | 'data_destruction' | 'chain_of_custody'
  >('lifecycle');

  const [assets, setAssets] = useState<HardwareAsset[]>(hamAdvancedEngine.getAssets());
  const [stockrooms, setStockrooms] = useState<StockroomInventory[]>(hamAdvancedEngine.getStockrooms());
  const [destructionRecords, setDestructionRecords] = useState<DataDestructionRecord[]>(hamAdvancedEngine.getDestructionRecords());
  const [chainOfCustodyEvents, setChainOfCustodyEvents] = useState<ChainOfCustodyEvent[]>(hamAdvancedEngine.getChainOfCustodyEvents());
  const [stats, setStats] = useState<HamSummaryStats>(hamAdvancedEngine.getSummaryStats());

  const [newDestructTag, setNewDestructTag] = useState('AST-LPT-881');
  const [newDestructSerial, setNewDestructSerial] = useState('PF-39A2019');
  const [newDestructMethod, setNewDestructMethod] = useState<DataDestructionMethod>('Certified Data Wipe');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleTransitionState = (assetId: string, newState: HardwareLifecycleState) => {
    hamAdvancedEngine.transitionAssetState(assetId, newState);
    setAssets([...hamAdvancedEngine.getAssets()]);
    setChainOfCustodyEvents([...hamAdvancedEngine.getChainOfCustodyEvents()]);
    setStats(hamAdvancedEngine.getSummaryStats());
    setSuccessMsg(`Transitioned asset '${assetId}' state to '${newState}'.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleExecuteDataDestruction = () => {
    const cert = hamAdvancedEngine.recordDataDestruction(
      newDestructTag,
      newDestructSerial,
      newDestructMethod,
      'SecOps - Authorized Technician'
    );
    setDestructionRecords([...hamAdvancedEngine.getDestructionRecords()]);
    setStats(hamAdvancedEngine.getSummaryStats());
    setSuccessMsg(`Recorded verified data destruction. Certificate ID: ${cert.certificateId}`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Hardware Asset Management (HAM) Advanced Engine
            </h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Procure-to-Retire v2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Procure-to-Retire Workflow • Stockroom Bin Management • Certified Data Destruction & Immutable Chain of Custody
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950 font-mono text-xs">
          {(
            [
              ['lifecycle', `Procure-To-Retire (${assets.length})`],
              ['stockroom', `Stockroom Bins (${stockrooms.length})`],
              ['data_destruction', `Data Destruction (${destructionRecords.length})`],
              ['chain_of_custody', `Chain of Custody (${chainOfCustodyEvents.length})`]
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 uppercase tracking-wider transition-colors ${
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

      {successMsg && (
        <div className="p-3 bg-red-950 border border-red-700 text-red-200 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-red-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 font-mono text-xs">
        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Total Assets</span>
          <div className="text-xl font-bold text-white mt-1">{stats.totalHardwareAssets}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">In Stockroom</span>
          <div className="text-xl font-bold text-white mt-1">{stats.inStockCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Deployed / Assigned</span>
          <div className="text-xl font-bold text-red-500 mt-1">{stats.deployedCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">In Repair</span>
          <div className="text-xl font-bold text-neutral-300 mt-1">{stats.inRepairCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Pending Disposal</span>
          <div className="text-xl font-bold text-red-400 mt-1">{stats.pendingDisposalCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Reorder Alerts</span>
          <div className="text-xl font-bold text-red-500 mt-1">{stats.reorderAlertsCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Data Destruction Wipes</span>
          <div className="text-xl font-bold text-white mt-1">{stats.verifiedDataDestructionsCount}</div>
        </div>
      </div>

      {/* TAB 1: PROCURE-TO-RETIRE WORKFLOW */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white flex justify-between items-center">
              <span>Hardware Lifecycle Directory & Transition Controls</span>
              <span className="text-[10px] text-neutral-500 font-normal">State Machine Tracker</span>
            </div>

            <div className="space-y-3">
              {assets.map(asset => (
                <div key={asset.assetId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-red-500 uppercase font-bold">{asset.assetTag}</span>
                        <span className="text-[10px] text-neutral-500">SN: {asset.serialNumber}</span>
                      </div>
                      <h3 className="font-bold text-white text-sm">{asset.manufacturer} {asset.model}</h3>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase">
                      State: {asset.currentState}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Category / Cost</span>
                      <span className="text-white font-bold">{asset.category} (${asset.cost})</span>
                    </div>

                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Physical Location</span>
                      <span className="text-white font-bold">
                        {asset.stockroomLocation 
                          ? `${asset.stockroomLocation.stockroomName} (${asset.stockroomLocation.bin})` 
                          : asset.assignedToUser || 'Deployed'}
                      </span>
                    </div>

                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Condition</span>
                      <span className="text-white font-bold">{asset.condition}</span>
                    </div>

                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">PO & Warranty</span>
                      <span className="text-neutral-300 text-[9px]">{asset.purchaseOrderRef || 'N/A'} (Exp: {asset.warrantyEndDate})</span>
                    </div>
                  </div>

                  {/* Transition Action Buttons */}
                  <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-900">
                    <button
                      onClick={() => handleTransitionState(asset.assetId, 'Stockroom')}
                      className="px-2 py-1 bg-neutral-900 border border-neutral-800 hover:border-white text-white font-bold text-[9px] uppercase"
                    >
                      Move to Stockroom
                    </button>
                    <button
                      onClick={() => handleTransitionState(asset.assetId, 'Assigned')}
                      className="px-2 py-1 bg-neutral-900 border border-neutral-800 hover:border-white text-white font-bold text-[9px] uppercase"
                    >
                      Assign to User
                    </button>
                    <button
                      onClick={() => handleTransitionState(asset.assetId, 'In Repair')}
                      className="px-2 py-1 bg-neutral-900 border border-neutral-800 hover:border-white text-white font-bold text-[9px] uppercase"
                    >
                      Send for Repair
                    </button>
                    <button
                      onClick={() => handleTransitionState(asset.assetId, 'Pending Disposal')}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] uppercase"
                    >
                      Retire & Mark for Disposal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STOCKROOM & BIN MANAGEMENT */}
      {activeTab === 'stockroom' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Stockroom Inventory, Rack/Shelf/Bin Coordinates & Reorder Alerts
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stockrooms.map(stk => (
                <div key={stk.stockroomId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{stk.stockroomName}</h3>
                      <span className="text-[10px] text-neutral-500">{stk.location}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                      stk.status !== 'Normal'
                        ? 'bg-red-950 text-red-500 border-red-900'
                        : 'bg-black text-white border-neutral-800'
                    }`}>
                      {stk.status}
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 space-y-1">
                    <div className="text-[10px] text-red-500 font-bold uppercase">Hardware Model: {stk.model}</div>
                    <div className="text-[9px] text-neutral-400">
                      Coordinates: <span className="text-white">{stk.zone} • {stk.rack} • {stk.shelf} • {stk.bin}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Available</span>
                      <span className="text-white font-bold text-sm">{stk.availableQuantity}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Reserved</span>
                      <span className="text-neutral-300 font-bold text-sm">{stk.reservedQuantity}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Reorder Point</span>
                      <span className="text-red-400 font-bold text-sm">{stk.reorderPoint}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATA DESTRUCTION & CERTIFICATES */}
      {activeTab === 'data_destruction' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Record Wipe Action Panel */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Execute Certified Data Destruction & Drive Sanitization
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Asset Tag</label>
                <input
                  type="text"
                  value={newDestructTag}
                  onChange={(e) => setNewDestructTag(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Serial Number</label>
                <input
                  type="text"
                  value={newDestructSerial}
                  onChange={(e) => setNewDestructSerial(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Destruction Method</label>
                <select
                  value={newDestructMethod}
                  onChange={(e) => setNewDestructMethod(e.target.value as DataDestructionMethod)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                >
                  <option value="Certified Data Wipe">Certified Data Wipe (DoD 5220.22-M)</option>
                  <option value="Secure Erase">Cryptographic NVMe Secure Erase</option>
                  <option value="Physical Destruction">Physical Drive Shredding</option>
                </select>
              </div>

              <button
                onClick={handleExecuteDataDestruction}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-[10px]"
              >
                Perform Sanitization & Issue Cert
              </button>
            </div>
          </div>

          {/* Destruction Logs */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Verified Data Destruction Records & Certificates
            </div>

            <div className="space-y-3">
              {destructionRecords.map(rec => (
                <div key={rec.recordId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{rec.certificateId}</span>
                        <span className="text-[10px] text-red-500 uppercase font-bold">[{rec.method}]</span>
                      </div>
                      <span className="text-[10px] text-neutral-500">Asset: {rec.assetTag} (SN: {rec.serialNumber})</span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase">
                      Verification: {rec.verificationResult} ({rec.status})
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 text-[10px] text-neutral-300">
                    <p className="font-bold text-white mb-1">Sanitization Notes:</p>
                    <p>{rec.evidenceNotes}</p>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-neutral-500 pt-2 border-t border-neutral-900">
                    <span>Performed By: {rec.performedBy} • Witness: {rec.witnessName}</span>
                    <button className="px-3 py-1 bg-black border border-neutral-800 hover:border-white text-white font-bold text-[9px] uppercase flex items-center space-x-1">
                      <Download className="w-3 h-3 text-red-500" />
                      <span>Download Certified Certificate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IMMUTABLE CHAIN OF CUSTODY */}
      {activeTab === 'chain_of_custody' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Immutable Chain of Custody Audit Log
            </div>

            <div className="space-y-3">
              {chainOfCustodyEvents.map(evt => (
                <div key={evt.eventId} className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-500 font-bold text-[10px]">{evt.eventId}</span>
                      <span className="text-white font-bold">{evt.assetTag}</span>
                    </div>
                    <span className="text-[9px] text-neutral-500">{evt.transferDate}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px]">
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">From Custodian</span>
                      <span className="text-white font-bold">{evt.fromCustodian}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">To Custodian</span>
                      <span className="text-red-400 font-bold">{evt.toCustodian}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 border border-neutral-900">
                      <span className="text-neutral-500 uppercase block">Location & Reason</span>
                      <span className="text-neutral-300 text-[9px]">{evt.location} ({evt.reason})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

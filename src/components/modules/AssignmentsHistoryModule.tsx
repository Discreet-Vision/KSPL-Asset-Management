import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  HardDrive,
  User,
  ArrowRightLeft,
  RotateCcw,
  Clock,
  Search,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Building,
  MapPin,
  Calendar,
} from 'lucide-react';

export const AssignmentsHistoryModule: React.FC = () => {
  const {
    configurationItems,
    allUsers,
    checkOutAsset,
    checkInAsset,
    transferAsset,
    auditLogs,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ledger' | 'checkout' | 'history'>('ledger');
  const [searchQuery, setSearchQuery] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState('All');

  // Modals
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // Safe array aliases
  const safeCis = configurationItems || [];
  const safeUsers = allUsers || [];
  const safeLogs = auditLogs || [];

  // Form states
  const [targetUserId, setTargetUserId] = useState(safeUsers[0]?.id || '');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState('Excellent');
  const [transferNotes, setTransferNotes] = useState('');

  // Filtering
  const assignedAssets = safeCis.filter((ci) => {
    if (!ci) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (ci.name && ci.name.toLowerCase().includes(q)) ||
      (ci.assetTag && ci.assetTag.toLowerCase().includes(q)) ||
      (ci.ownerUserName && ci.ownerUserName.toLowerCase().includes(q)) ||
      (ci.departmentName && ci.departmentName.toLowerCase().includes(q));

    const matchesState =
      lifecycleFilter === 'All' || ci.lifecycleState === lifecycleFilter;

    return matchesSearch && matchesState;
  });

  const inStockAssets = safeCis.filter((ci) => ci && ci.lifecycleState === 'In Stock');
  const assignedCount = safeCis.filter((ci) => ci && (ci.lifecycleState === 'Assigned' || ci.lifecycleState === 'Deployed')).length;

  const assignmentAuditLogs = safeLogs.filter(
    (log) =>
      log &&
      (log.action === 'ASSIGN' ||
        log.action === 'UNASSIGN' ||
        log.action === 'CREATE' ||
        log.action === 'UPDATE')
  );

  const handleCheckOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !targetUserId) return;
    checkOutAsset(selectedAsset.id, targetUserId, checkoutNotes);
    setIsCheckOutModalOpen(false);
    setSelectedAsset(null);
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    checkInAsset(selectedAsset.id, returnCondition, checkoutNotes);
    setIsCheckInModalOpen(false);
    setSelectedAsset(null);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !targetUserId) return;
    transferAsset(selectedAsset.id, targetUserId, transferNotes);
    setIsTransferModalOpen(false);
    setSelectedAsset(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-red-500" />
            <span>ASSET ASSIGNMENTS & LIFECYCLE HISTORY</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            User Asset Ledger, Digital Check-In / Check-Out, Transfers & Immutable Custody Audit Trail
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-black p-1 border border-zinc-800 rounded font-mono text-xs">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'ledger' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Assignments Ledger ({assignedAssets.length})
          </button>
          <button
            onClick={() => {
              if (inStockAssets.length > 0) {
                setSelectedAsset(inStockAssets[0]);
              }
              setIsCheckOutModalOpen(true);
            }}
            className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-red-400 font-bold flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Check-Out Asset</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'history' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Custody Audit Trail
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-xs uppercase font-bold">Total Active Assignments</div>
          <div className="text-2xl font-black text-white mt-1">{assignedCount} Assets</div>
          <div className="text-[11px] text-emerald-400 mt-1">Custody verified in CMDB</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-xs uppercase font-bold">Assets In Stockroom</div>
          <div className="text-2xl font-black text-red-500 mt-1">{inStockAssets.length} Unassigned</div>
          <div className="text-[11px] text-zinc-400 mt-1">Ready for check-out</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-xs uppercase font-bold">Total Corporate Users</div>
          <div className="text-2xl font-black text-white mt-1">{allUsers.length} Employees</div>
          <div className="text-[11px] text-zinc-400 mt-1">Across 4 departments</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-xs uppercase font-bold">Audit Custody Events</div>
          <div className="text-2xl font-black text-white mt-1">{assignmentAuditLogs.length} Records</div>
          <div className="text-[11px] text-emerald-400 mt-1">Immutable SHA-256 logs</div>
        </div>
      </div>

      {/* TAB 1: ASSIGNMENTS LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 p-3 border border-zinc-800 rounded-lg font-mono text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search asset, tag, assigned user, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded pl-9 pr-3 py-1.5 text-white placeholder-zinc-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-zinc-400">Filter Status:</span>
              <select
                value={lifecycleFilter}
                onChange={(e) => setLifecycleFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white"
              >
                <option value="All">All States</option>
                <option value="Assigned">Assigned</option>
                <option value="Deployed">Deployed</option>
                <option value="In Stock">In Stock</option>
                <option value="In Repair">In Repair</option>
              </select>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Asset Tag / CI Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Current Assigned Owner</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Custody Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {assignedAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-zinc-900">
                    <td className="p-3">
                      <div className="font-bold text-white">{asset.name}</div>
                      <div className="text-[10px] text-red-400">{asset.assetTag}</div>
                    </td>
                    <td className="p-3 text-zinc-400">{asset.ciClassName}</td>
                    <td className="p-3">
                      {asset.ownerUserName ? (
                        <div className="flex items-center space-x-1.5 text-white font-bold">
                          <User className="w-3.5 h-3.5 text-red-500" />
                          <span>{asset.ownerUserName}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">Unassigned (In Stock)</span>
                      )}
                    </td>
                    <td className="p-3 text-zinc-400">{asset.departmentName}</td>
                    <td className="p-3 text-zinc-400">{asset.locationName}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        asset.lifecycleState === 'Assigned' || asset.lifecycleState === 'Deployed'
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                          : asset.lifecycleState === 'In Stock'
                          ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {asset.lifecycleState}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {asset.ownerUserName ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsTransferModalOpen(true);
                            }}
                            className="text-[11px] font-bold text-zinc-300 hover:text-white bg-zinc-900 px-2 py-1 rounded cursor-pointer"
                          >
                            Transfer
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsCheckInModalOpen(true);
                            }}
                            className="text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-950/40 border border-red-800/40 px-2 py-1 rounded cursor-pointer"
                          >
                            Check-In
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            setIsCheckOutModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded cursor-pointer"
                        >
                          Check-Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT TRAIL */}
      {activeTab === 'history' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="font-bold text-zinc-300">IMMUTABLE CUSTODY AUDIT TRAIL LOGS</span>
            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(assignmentAuditLogs, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `assignment_audit_trail_${Date.now()}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit JSON</span>
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor / Admin</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Asset CI Name</th>
                  <th className="p-3">Custody Change Details</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {assignmentAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900">
                    <td className="p-3 text-zinc-400">{log.timestamp}</td>
                    <td className="p-3 font-bold text-white">{log.actorName} ({log.actorRole})</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        log.action === 'ASSIGN'
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                          : log.action === 'UNASSIGN'
                          ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-red-400">{log.entityName}</td>
                    <td className="p-3 text-zinc-300">
                      {log.fieldChanges ? (
                        log.fieldChanges.map((fc, i) => (
                          <div key={i}>
                            <span className="text-zinc-500">{fc.field}:</span>{' '}
                            <span className="line-through text-zinc-500">{fc.oldVal}</span> →{' '}
                            <span className="text-emerald-400 font-bold">{fc.newVal}</span>
                          </div>
                        ))
                      ) : (
                        <span>Asset Custody Event Logged</span>
                      )}
                    </td>
                    <td className="p-3 text-zinc-500">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHECK OUT MODAL */}
      {isCheckOutModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <span>Check-Out Asset to Employee</span>
              </h3>
              <button onClick={() => setIsCheckOutModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckOutSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 mb-1">Select Asset to Check Out</label>
                <select
                  value={selectedAsset?.id || ''}
                  onChange={(e) => setSelectedAsset(configurationItems.find((c) => c.id === e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                >
                  {configurationItems.map((ci) => (
                    <option key={ci.id} value={ci.id}>
                      {ci.name} ({ci.assetTag}) - State: {ci.lifecycleState}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Assign to Employee</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Check-Out Notes / Purpose</label>
                <textarea
                  rows={2}
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder="Primary laptop assignment for remote work..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCheckOutModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded cursor-pointer"
                >
                  Confirm Check-Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHECK IN MODAL */}
      {isCheckInModalOpen && selectedAsset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <span>Check-In Asset: {selectedAsset.name}</span>
              </h3>
              <button onClick={() => setIsCheckInModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <p className="text-zinc-400">Current Owner: <span className="text-white font-bold">{selectedAsset.ownerUserName}</span></p>
                <p className="text-zinc-400">Asset Tag: <span className="text-red-400 font-bold">{selectedAsset.assetTag}</span></p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Return Hardware Condition</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                >
                  <option value="Excellent">Excellent (Like New)</option>
                  <option value="Good">Good (Minor Wear)</option>
                  <option value="Fair">Fair (Scratch / Needs Wipe)</option>
                  <option value="Needs Repair">Needs Repair / Damaged</option>
                </select>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded cursor-pointer"
                >
                  Confirm Return to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {isTransferModalOpen && selectedAsset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                <span>Transfer Custody: {selectedAsset.name}</span>
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <p className="text-zinc-400">Current Owner: <span className="text-white font-bold">{selectedAsset.ownerUserName}</span></p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Transfer To User</label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Transfer Reason / Authorization</label>
                <textarea
                  rows={2}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="Team role change or department transfer..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded cursor-pointer"
                >
                  Transfer Custody
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

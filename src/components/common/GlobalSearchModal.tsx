import React, { useState, useEffect } from 'react';
import { useApp, ModuleView } from '../../context/AppContext';
import { Search, X, Database, HardDrive, KeyRound, FileText, Bug, User, ShieldAlert } from 'lucide-react';

export const GlobalSearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const {
    configurationItems,
    softwareLicenses,
    contracts,
    vulnerabilities,
    allUsers,
    setActiveModule,
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          /* Handled in parent */
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const safeCis = configurationItems || [];
  const safeLicenses = softwareLicenses || [];
  const safeContracts = contracts || [];
  const safeVulns = vulnerabilities || [];

  const q = (query || '').toLowerCase().trim();

  const matchingCis = q
    ? safeCis.filter(
        (ci) =>
          (ci.name || '').toLowerCase().includes(q) ||
          (ci.assetTag || '').toLowerCase().includes(q) ||
          (ci.serialNumber || '').toLowerCase().includes(q) ||
          (ci.hostname && ci.hostname.toLowerCase().includes(q)) ||
          (ci.ipAddress && ci.ipAddress.includes(q))
      )
    : safeCis.slice(0, 4);

  const matchingLicenses = q
    ? safeLicenses.filter(
        (l) =>
          (l.productName || '').toLowerCase().includes(q) ||
          (l.publisher || '').toLowerCase().includes(q)
      )
    : safeLicenses.slice(0, 3);

  const matchingContracts = q
    ? safeContracts.filter(
        (c) =>
          (c.title || '').toLowerCase().includes(q) ||
          (c.contractNumber || '').toLowerCase().includes(q) ||
          (c.vendorName || '').toLowerCase().includes(q)
      )
    : safeContracts.slice(0, 2);

  const matchingVulns = q
    ? safeVulns.filter(
        (v) =>
          (v.cveId || '').toLowerCase().includes(q) ||
          (v.title || '').toLowerCase().includes(q) ||
          (v.affectedProduct || '').toLowerCase().includes(q)
      )
    : safeVulns.slice(0, 2);

  const navigateTo = (mod: ModuleView) => {
    setActiveModule(mod);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-3 border-b border-zinc-800 flex items-center space-x-3 bg-black">
          <Search className="w-5 h-5 text-red-500" />
          <input
            type="text"
            placeholder="Search CMDB CIs, Asset Tags, Serials, IP, Software, Contracts, CVEs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none"
          />
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-6 custom-scrollbar text-xs">
          {/* Configuration Items */}
          <div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px] font-mono mb-2 uppercase">
              <span className="flex items-center space-x-1.5 text-red-400 font-bold">
                <Database className="w-3.5 h-3.5" />
                <span>Configuration Items ({matchingCis.length})</span>
              </span>
              <button onClick={() => navigateTo('cmdb')} className="hover:text-white underline cursor-pointer">
                View CMDB →
              </button>
            </div>
            <div className="space-y-1">
              {matchingCis.length === 0 ? (
                <div className="text-zinc-600 p-2 italic">No CIs matching query</div>
              ) : (
                matchingCis.map((ci) => (
                  <div
                    key={ci.id}
                    onClick={() => navigateTo('cmdb')}
                    className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center space-x-2">
                        <span>{ci.name}</span>
                        <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-1.5 py-0.5 rounded">
                          {ci.assetTag}
                        </span>
                      </div>
                      <div className="text-zinc-400 text-[11px] font-mono mt-0.5">
                        Class: {ci.ciClassName} | Serial: {ci.serialNumber} | IP: {ci.ipAddress || 'N/A'}
                      </div>
                    </div>
                    <span className="bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      {ci.lifecycleState}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Software Licenses */}
          <div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px] font-mono mb-2 uppercase">
              <span className="flex items-center space-x-1.5 text-white font-bold">
                <KeyRound className="w-3.5 h-3.5 text-red-500" />
                <span>Software Licenses ({matchingLicenses.length})</span>
              </span>
              <button onClick={() => navigateTo('licenses')} className="hover:text-white underline cursor-pointer">
                View Licenses →
              </button>
            </div>
            <div className="space-y-1">
              {matchingLicenses.map((lic) => (
                <div
                  key={lic.id}
                  onClick={() => navigateTo('licenses')}
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-bold text-white">{lic.productName}</div>
                    <div className="text-zinc-400 text-[11px] font-mono">
                      Publisher: {lic.publisher} | Purchased: {lic.purchasedEntitlements} | Consumed: {lic.consumedEntitlements}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      lic.complianceStatus === 'Under-Licensed'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-black text-zinc-300 border-zinc-700'
                    }`}
                  >
                    {lic.complianceStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vulnerabilities CVE */}
          <div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px] font-mono mb-2 uppercase">
              <span className="flex items-center space-x-1.5 text-red-500 font-bold">
                <Bug className="w-3.5 h-3.5" />
                <span>Vulnerabilities & CVEs</span>
              </span>
              <button onClick={() => navigateTo('vulnerabilities')} className="hover:text-white underline cursor-pointer">
                View CVEs →
              </button>
            </div>
            <div className="space-y-1">
              {matchingVulns.map((v) => (
                <div
                  key={v.cveId}
                  onClick={() => navigateTo('vulnerabilities')}
                  className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-bold text-red-400 flex items-center space-x-2">
                      <span>{v.cveId}</span>
                      <span className="text-white text-xs font-normal">({v.title})</span>
                    </div>
                    <div className="text-zinc-400 text-[11px] font-mono">
                      Product: {v.affectedProduct} | CVSS Score: {v.cvssScore}
                    </div>
                  </div>
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {v.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-2.5 bg-black border-t border-zinc-800 text-[11px] text-zinc-500 font-mono flex justify-between items-center">
          <span>Press ESC or click X to close global command search</span>
          <span>KSPL ITAM Index Engine Active</span>
        </div>
      </div>
    </div>
  );
};

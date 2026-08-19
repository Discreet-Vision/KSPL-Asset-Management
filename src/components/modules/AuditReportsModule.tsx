import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Download,
  History,
  CheckCircle2,
  Filter,
  BarChart2,
  PieChart,
  Search,
} from 'lucide-react';

export const AuditReportsModule: React.FC = () => {
  const { auditLogs } = useApp();

  const [activeTab, setActiveTab] = useState<'reports' | 'audit'>('reports');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(
    (l) =>
      !searchTerm ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.targetEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.performedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <FileText className="w-5 h-5 text-red-500" />
            <span>EXECUTIVE REPORTING & IMMUTABLE AUDIT TRAIL LOGS</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Compliance Report Generator, PDF/CSV Export Engine, Field-Level Audit Diff Tracker
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 bg-black p-1 border border-zinc-800 rounded font-mono text-xs">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'reports' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Report Generator
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'audit' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Audit Trail Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* TAB 1: REPORTS GENERATOR */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="font-bold text-white text-sm border-b border-zinc-800 pb-2">
              SAM Effective License Position Report
            </div>
            <p className="text-zinc-400">
              Generates executive PDF breakdown of software entitlements vs consumed seats, gap analysis, and financial liability.
            </p>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded flex items-center justify-center space-x-2 border border-red-500 cursor-pointer">
              <Download className="w-4 h-4" />
              <span>Export PDF / Excel</span>
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="font-bold text-white text-sm border-b border-zinc-800 pb-2">
              CMDB Health & Completeness Audit
            </div>
            <p className="text-zinc-400">
              Scans all CIs for missing serial numbers, owner assignments, unmapped relationships, and stale discovery timestamps.
            </p>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded flex items-center justify-center space-x-2 border border-red-500 cursor-pointer">
              <Download className="w-4 h-4" />
              <span>Export Audit Report</span>
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="font-bold text-white text-sm border-b border-zinc-800 pb-2">
              Hardware Asset Depreciation & Valuation
            </div>
            <p className="text-zinc-400">
              Calculates straight-line remaining book value across all deployed workstations, servers, and network devices.
            </p>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded flex items-center justify-center space-x-2 border border-red-500 cursor-pointer">
              <Download className="w-4 h-4" />
              <span>Export Valuation Report</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: IMMUTABLE AUDIT TRAIL LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 max-w-md bg-black border border-zinc-800 rounded px-2.5 py-1.5">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search Action, Entity, Performed By..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-white placeholder-zinc-500 focus:outline-none w-full"
              />
            </div>
            <span className="text-zinc-400">{filteredLogs.length} Audit Events Logged</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Performed By</th>
                  <th className="p-3">IP / Channel</th>
                  <th className="p-3">Changes / Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900">
                    <td className="p-3 text-zinc-400">{log.timestamp}</td>
                    <td className="p-3 font-bold text-white">{log.action}</td>
                    <td className="p-3 text-red-400 font-bold">{log.targetEntity}</td>
                    <td className="p-3 text-white">{log.performedBy}</td>
                    <td className="p-3 text-zinc-400">{log.ipAddress}</td>
                    <td className="p-3 text-zinc-400 font-mono max-w-xs truncate">
                      {JSON.stringify(log.diff)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

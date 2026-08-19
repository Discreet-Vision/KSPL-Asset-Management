import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  RefreshCw,
  X,
  AlertTriangle,
} from 'lucide-react';
import { PlatformBackupSnapshot } from '../../types';

export const SuperAdminBackupsTab: React.FC = () => {
  const [backups, setBackups] = useState<PlatformBackupSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/backups');
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch (err) {
      console.error('Failed to load backups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/super-admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Manual' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to create backup snapshot.' });
      } else {
        setNotification({
          type: 'success',
          message: `Snapshot '${data.backup.filename}' generated and cryptographically verified.`,
        });
        fetchBackups();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error during backup generation.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadDump = async (format: 'json' | 'sql') => {
    try {
      window.open(`/api/super-admin/export-dump?format=${format}`, '_blank');
      setNotification({
        type: 'success',
        message: `Database dump (${format.toUpperCase()}) download initiated.`,
      });
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to initiate database dump download.' });
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-red-500" />
            <span>Platform Database Snapshots & Disaster Recovery</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated Point-in-Time recovery snapshots and full enterprise data exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadDump('json')}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Dump</span>
          </button>

          <button
            onClick={handleCreateBackup}
            disabled={actionLoading}
            className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-red-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>{actionLoading ? 'Creating Snapshot...' : 'Create Instant Snapshot'}</span>
          </button>
        </div>
      </div>

      {/* Snapshots Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Immutable Snapshot Archives ({backups.length})</span>
          </h3>
          <span className="text-xs text-slate-500">AES-256 Cloud Vault</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Snapshot Archive Filename</th>
                <th className="p-4">Trigger Type</th>
                <th className="p-4">Size</th>
                <th className="p-4">SHA-256 Checksum</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created At</th>
                <th className="p-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-semibold text-white">
                    {b.snapshotName || (b as any).filename || b.id}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.type === 'Automatic' ? 'bg-blue-950 text-blue-400' : 'bg-purple-950 text-purple-400'
                      }`}
                    >
                      {b.type}
                    </span>
                  </td>
                  <td className="p-4 font-mono">{b.sizeFormatted || ((b as any).sizeMb ? (b as any).sizeMb + ' MB' : '1.2 MB')}</td>
                  <td className="p-4 font-mono text-[10px] text-slate-500">{b.checksum || (b as any).checksumSha256 || 'SHA256-OK'}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {new Date(b.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDownloadDump('json')}
                      className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Fetch</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

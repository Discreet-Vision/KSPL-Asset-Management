import React, { useState, useEffect } from 'react';
import {
  Plug,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Zap,
  ExternalLink,
  Shield,
  Layers,
  X,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { PlatformIntegrationConnector } from '../../types';

export const SuperAdminIntegrationsTab: React.FC = () => {
  const [integrations, setIntegrations] = useState<PlatformIntegrationConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<{ id: string; message: string; success: boolean } | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/integrations');
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations || []);
      }
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await fetch(`/api/super-admin/integrations/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !currentEnabled }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: `Connector '${id}' ${!currentEnabled ? 'Enabled' : 'Disabled'}.`,
        });
        fetchIntegrations();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to toggle connector.' });
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await fetch(`/api/super-admin/integrations/${id}/test`, {
        method: 'POST',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ id, message: data.message, success: true });
        fetchIntegrations();
      } else {
        setTestResult({ id, message: data.message || 'Connection test failed.', success: false });
      }
    } catch (err) {
      setTestResult({ id, message: 'Network error during heartbeat ping.', success: false });
    } finally {
      setTestingId(null);
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
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plug className="w-5 h-5 text-red-500" />
            <span>Platform Integration Connectors & Enterprise Bus</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Bi-directional synchronization connectors for ITSM, HRIS, Cloud, MDM, SIEM, and SSO.
          </p>
        </div>

        <button
          onClick={fetchIntegrations}
          className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Connectors</span>
        </button>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{item.name}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-blue-400 font-mono text-[10px] border border-slate-800">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{item.description}</p>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  item.status === 'Connected'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : item.status === 'Configured'
                    ? 'bg-blue-950 text-blue-400 border-blue-800'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Endpoint:</span>
                <span className="font-mono text-slate-300 text-[11px] truncate max-w-[240px]" title={item.endpointUrl}>
                  {item.endpointUrl}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Credentials:</span>
                <span className="font-mono text-slate-400 text-[11px]">{item.maskedApiKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Synchronized:</span>
                <span className="text-slate-300">
                  {item.lastSyncedAt ? new Date(item.lastSyncedAt).toLocaleTimeString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sync Stats:</span>
                <span className="text-emerald-400 font-semibold">
                  {item.syncRecordsCount} items ({item.syncLatencyMs || 0}ms latency)
                </span>
              </div>
            </div>

            {testResult && testResult.id === item.id && (
              <div
                className={`p-3 rounded-xl text-xs border ${
                  testResult.success
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-red-950/60 border-red-800 text-red-300'
                }`}
              >
                {testResult.message}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(item.id, item.isEnabled)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold ${
                    item.isEnabled
                      ? 'bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800'
                      : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {item.isEnabled ? 'Disable Connector' : 'Enable Connector'}
                </button>
              </div>

              <button
                onClick={() => handleTest(item.id)}
                disabled={testingId === item.id}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Play className={`w-3.5 h-3.5 ${testingId === item.id ? 'animate-spin' : ''}`} />
                <span>{testingId === item.id ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

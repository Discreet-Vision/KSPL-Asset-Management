import React, { useState, useEffect } from 'react';
import {
  Code,
  Plus,
  Trash2,
  Copy,
  Check,
  Globe,
  Radio,
  Send,
  X,
  AlertTriangle,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { PlatformApiKey, PlatformWebhook, OrganizationTenant } from '../../types';

interface SuperAdminApiWebhooksTabProps {
  tenants: OrganizationTenant[];
}

export const SuperAdminApiWebhooksTab: React.FC<SuperAdminApiWebhooksTabProps> = ({ tenants }) => {
  const [apiKeys, setApiKeys] = useState<PlatformApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<PlatformWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [generatedFullKey, setGeneratedFullKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Key form
  const [keyLabel, setKeyLabel] = useState('');
  const [keyTenantId, setKeyTenantId] = useState('tenant-client-1');
  const [keyScopes, setKeyScopes] = useState('assets.read,cmdb.write,discovery.ingest');
  const [keyExpiry, setKeyExpiry] = useState(90);

  // Webhook form
  const [whUrl, setWhUrl] = useState('');
  const [whTenantId, setWhTenantId] = useState('tenant-client-1');
  const [whTriggers, setWhTriggers] = useState('asset.created,ci.drift_detected');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [keysRes, whRes] = await Promise.all([
        fetch('/api/super-admin/api-keys'),
        fetch('/api/super-admin/webhooks'),
      ]);

      if (keysRes.ok) {
        const data = await keysRes.json();
        setApiKeys(data.keys || []);
      }
      if (whRes.ok) {
        const data = await whRes.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (err) {
      console.error('Failed to load API keys & webhooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/super-admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: keyLabel,
          tenantId: keyTenantId,
          scopes: keyScopes.split(',').map((s) => s.trim()),
          expiresInDays: keyExpiry,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to create API key.' });
      } else {
        setGeneratedFullKey(data.fullSecret);
        setKeyLabel('');
        fetchData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error while creating API key.' });
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to permanently revoke this API key?')) return;
    try {
      const res = await fetch(`/api/super-admin/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setNotification({ type: 'success', message: 'API Key revoked successfully.' });
        fetchData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to revoke API key.' });
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/super-admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: whUrl,
          tenantId: whTenantId,
          eventTriggers: whTriggers.split(',').map((t) => t.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to create webhook.' });
      } else {
        setNotification({ type: 'success', message: 'Webhook endpoint registered successfully.' });
        setIsWebhookModalOpen(false);
        setWhUrl('');
        fetchData();
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error while registering webhook.' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
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

      {/* API Keys Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-red-500" />
              <span>Platform Developer REST API Keys</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate scoped, tenant-bound authentication tokens for external microservices and scripts.
            </p>
          </div>

          <button
            onClick={() => {
              setGeneratedFullKey(null);
              setIsKeyModalOpen(true);
            }}
            className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-red-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New API Key</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Label</th>
                <th className="p-3">Key Token Prefix</th>
                <th className="p-3">Tenant Scope</th>
                <th className="p-3">Scopes</th>
                <th className="p-3">Last Used</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {apiKeys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-white">{k.label}</td>
                  <td className="p-3 font-mono text-red-400">{k.keyPrefix}</td>
                  <td className="p-3 text-slate-300">{k.tenantName}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-slate-400">
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleRevokeApiKey(k.id)}
                      className="py-1 px-2.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-xs font-semibold"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-400" />
              <span>Event-Driven Outbound Webhooks</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Stream live ITAM and CMDB event notifications to external SIEM, Slack, or webhook endpoints.
            </p>
          </div>

          <button
            onClick={() => setIsWebhookModalOpen(true)}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register Webhook</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Destination URL</th>
                <th className="p-3">Event Triggers</th>
                <th className="p-3">Signing Secret</th>
                <th className="p-3">Delivery Rate</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {webhooks.map((wh) => (
                <tr key={wh.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-slate-200 max-w-xs truncate" title={wh.targetUrl}>
                    {wh.targetUrl}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {wh.eventTriggers.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-slate-950 text-blue-400 text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-500">{wh.secretMasked}</td>
                  <td className="p-3 font-semibold text-emerald-400">{wh.successRatePct}%</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {wh.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE API KEY MODAL */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Generate Developer API Key</h3>
              <button onClick={() => setIsKeyModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            {generatedFullKey ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-amber-950/60 border border-amber-800 rounded-xl space-y-2">
                  <span className="text-amber-300 font-bold block">Save Your Secret Key Now</span>
                  <p className="text-amber-200/80 text-[11px]">
                    This secret token will only be shown once. If lost, you will need to regenerate a new key.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedFullKey}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedFullKey)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg shrink-0"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsKeyModalOpen(false)}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Key Label *</label>
                  <input
                    type="text"
                    required
                    value={keyLabel}
                    onChange={(e) => setKeyLabel(e.target.value)}
                    placeholder="e.g. CI Reconciliation Service"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tenant Organization *</label>
                  <select
                    value={keyTenantId}
                    onChange={(e) => setKeyTenantId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  >
                    {(tenants || []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">OAuth Scopes (comma separated)</label>
                  <input
                    type="text"
                    value={keyScopes}
                    onChange={(e) => setKeyScopes(e.target.value)}
                    placeholder="assets.read, cmdb.write, discovery.ingest"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold shadow-lg shadow-red-900/30"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* REGISTER WEBHOOK MODAL */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Register Event Webhook</h3>
              <button onClick={() => setIsWebhookModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Endpoint URL (HTTPS) *</label>
                <input
                  type="url"
                  required
                  value={whUrl}
                  onChange={(e) => setWhUrl(e.target.value)}
                  placeholder="https://api.enterprise.com/webhooks/itam-events"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Event Triggers (comma separated)</label>
                <input
                  type="text"
                  value={whTriggers}
                  onChange={(e) => setWhTriggers(e.target.value)}
                  placeholder="asset.created, ci.drift_detected, license.deficit_alert"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsWebhookModalOpen(false)}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold"
                >
                  Register Endpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

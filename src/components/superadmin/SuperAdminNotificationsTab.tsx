import React, { useState } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  Radio,
  Building2,
  Clock,
  Trash2,
  Filter,
  Megaphone,
  ShieldAlert,
  Server,
  RefreshCw,
  Mail,
  Smartphone,
  Check,
} from 'lucide-react';
import { OrganizationTenant } from '../../types';

interface SuperAdminNotificationsTabProps {
  tenants?: OrganizationTenant[];
}

interface BroadcastNotice {
  id: string;
  title: string;
  message: string;
  type: 'Info' | 'Warning' | 'Critical' | 'Maintenance';
  scope: 'All Tenants' | 'Selected Tenant' | 'Super Admins Only';
  targetTenantCode?: string;
  channel: ('In-App Banner' | 'Email' | 'Webhook')[];
  createdAt: string;
  sentBy: string;
  status: 'Delivered' | 'Active' | 'Scheduled';
}

export const SuperAdminNotificationsTab: React.FC<SuperAdminNotificationsTabProps> = ({
  tenants = [],
}) => {
  const [notifications, setNotifications] = useState<BroadcastNotice[]>([
    {
      id: 'notif-1',
      title: 'Scheduled Core CMDB Maintenance Window',
      message: 'CMDB indexing and database schema updates will run on Sunday from 02:00 UTC to 03:30 UTC. Discovery engine will temporarily pause queue processing.',
      type: 'Maintenance',
      scope: 'All Tenants',
      channel: ['In-App Banner', 'Email'],
      createdAt: '2026-08-16 14:30:00',
      sentBy: 'jitin@ucliktechnologies.com',
      status: 'Active',
    },
    {
      id: 'notif-2',
      title: 'Critical CVE Advisory: Apache Log4j v2.17 Mitigation',
      message: 'Automated vulnerability signature patch deployed across all tenant discovery meshes. Verify server inventory compliance.',
      type: 'Critical',
      scope: 'All Tenants',
      channel: ['In-App Banner', 'Email', 'Webhook'],
      createdAt: '2026-08-15 09:15:00',
      sentBy: 'Security Operations Center',
      status: 'Delivered',
    },
    {
      id: 'notif-3',
      title: 'Quarterly SaaS License Renewal Notice',
      message: 'Microsoft 365 Enterprise agreement renewal window is open. Audit unassigned licenses in Software Asset Management.',
      type: 'Info',
      scope: 'Selected Tenant',
      targetTenantCode: 'ACME',
      channel: ['Email'],
      createdAt: '2026-08-14 11:00:00',
      sentBy: 'Procurement AI Agent',
      status: 'Delivered',
    },
  ]);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'Info' | 'Warning' | 'Critical' | 'Maintenance'>('Info');
  const [scope, setScope] = useState<'All Tenants' | 'Selected Tenant' | 'Super Admins Only'>('All Tenants');
  const [selectedTenant, setSelectedTenant] = useState(tenants[0]?.code || 'ACME');
  const [channels, setChannels] = useState<('In-App Banner' | 'Email' | 'Webhook')[]>(['In-App Banner']);
  const [sentAlert, setSentAlert] = useState(false);

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newNotice: BroadcastNotice = {
      id: `notif-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      type,
      scope,
      targetTenantCode: scope === 'Selected Tenant' ? selectedTenant : undefined,
      channel: channels,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sentBy: 'jitin@ucliktechnologies.com',
      status: 'Active',
    };

    setNotifications([newNotice, ...notifications]);
    setTitle('');
    setMessage('');
    setSentAlert(true);
    setTimeout(() => setSentAlert(false), 3500);
  };

  const toggleChannel = (ch: 'In-App Banner' | 'Email' | 'Webhook') => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                Item 21 • Platform Management
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Global Incident & Broadcast Engine</span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
              Platform Notifications & Broadcast Center
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-full font-mono text-[11px]">
            {notifications.length} Active Broadcasts
          </span>
        </div>
      </div>

      {sentAlert && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Notification broadcast successfully dispatched to all target channels and tenant portals.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Compose Broadcast Notice */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-red-400" />
              <span>Broadcast Announcement</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Omnichannel</span>
          </div>

          <form onSubmit={handleSendNotice} className="space-y-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Notice Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Infrastructure Maintenance"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-red-500 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Notice Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Detailed instructions or alert details for tenant administrators..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-red-500 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Severity / Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 text-xs"
                >
                  <option value="Info">Information (Blue)</option>
                  <option value="Warning">Warning (Amber)</option>
                  <option value="Critical">Critical Alert (Red)</option>
                  <option value="Maintenance">Maintenance (Purple)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Audience Scope</label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 text-xs"
                >
                  <option value="All Tenants">All Tenants (Global)</option>
                  <option value="Selected Tenant">Single Client Tenant</option>
                  <option value="Super Admins Only">Super Admins Only</option>
                </select>
              </div>
            </div>

            {scope === 'Selected Tenant' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Target Client Organization</label>
                <select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500 text-xs font-mono"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.code}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Dispatch Channels</label>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {(['In-App Banner', 'Email', 'Webhook'] as const).map((ch) => (
                  <button
                    type="button"
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                      channels.includes(ch)
                        ? 'bg-red-600/20 border-red-500 text-red-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {channels.includes(ch) ? <Check className="w-3 h-3 text-red-400" /> : null}
                    <span>{ch}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-all mt-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Notice Now</span>
            </button>
          </form>
        </div>

        {/* Right: Broadcast Feed & History */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:col-span-2 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Live Broadcast Feed & Alert History</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time active notifications displayed on tenant login screens and operational dashboards.
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Auto-sync enabled
            </span>
          </div>

          <div className="space-y-3">
            {notifications.map((n) => {
              const borderBadge =
                n.type === 'Critical'
                  ? 'border-red-600/50 bg-red-950/30 text-red-300'
                  : n.type === 'Warning'
                  ? 'border-amber-600/50 bg-amber-950/30 text-amber-300'
                  : n.type === 'Maintenance'
                  ? 'border-purple-600/50 bg-purple-950/30 text-purple-300'
                  : 'border-blue-600/50 bg-blue-950/30 text-blue-300';

              return (
                <div
                  key={n.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 relative group hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${borderBadge}`}>
                        {n.type}
                      </span>
                      <h4 className="font-bold text-white text-xs">{n.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {n.createdAt}
                      </span>
                      <button
                        onClick={() => setNotifications(notifications.filter((x) => x.id !== n.id))}
                        className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Archive Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Scope:</span>
                      <span className="font-semibold text-slate-200">
                        {n.scope} {n.targetTenantCode ? `(${n.targetTenantCode})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Channels:</span>
                      {n.channel.map((c) => (
                        <span
                          key={c}
                          className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[9px]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    <span className="text-slate-500 font-mono">Sent by: {n.sentBy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

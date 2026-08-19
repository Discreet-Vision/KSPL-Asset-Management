import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Bug,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Filter,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';
import { PlatformSecurityEvent, OrganizationTenant } from '../../types';

interface SuperAdminSecurityTabProps {
  tenants: OrganizationTenant[];
}

export const SuperAdminSecurityTab: React.FC<SuperAdminSecurityTabProps> = ({ tenants }) => {
  const [events, setEvents] = useState<PlatformSecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [tenantFilter, setTenantFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<PlatformSecurityEvent | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [severityFilter, eventTypeFilter, tenantFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (severityFilter !== 'ALL') params.append('severity', severityFilter);
      if (eventTypeFilter !== 'ALL') params.append('eventType', eventTypeFilter);
      if (tenantFilter !== 'ALL') params.append('tenantId', tenantFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/super-admin/security-events?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to fetch security events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = (events || []).filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (e.description || '').toLowerCase().includes(q) ||
      (e.actorEmail || '').toLowerCase().includes(q) ||
      (e.tenantName || '').toLowerCase().includes(q) ||
      (e.ipAddress || '').includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Threat & Security KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Failed Logins (24h)</span>
            <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">3</div>
          <span className="text-[11px] text-emerald-400 block mt-1">Blocked by rate limiter</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical CVE Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-600/10 text-amber-400 flex items-center justify-center">
              <Bug className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400">1</div>
          <span className="text-[11px] text-slate-400 block mt-1">CVE-2025-21298 (CVSS 9.8)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Suspicious Lockouts</span>
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">0</div>
          <span className="text-[11px] text-slate-400 block mt-1">Zero active lockouts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Platform Posture</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">SOC 2 / ISO</div>
          <span className="text-[11px] text-emerald-400 block mt-1">100% Compliant</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search security logs by actor, IP, message..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Info">Info</option>
          </select>

          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="FAILED_LOGIN">Failed Logins</option>
            <option value="MFA_RESET">MFA Reset Actions</option>
            <option value="CRITICAL_CVE">CVE Vulnerability Alerts</option>
            <option value="PERMISSION_CHANGE">RBAC Changes</option>
            <option value="CLIENT_SUSPENDED">Client Lifecycle</option>
          </select>

          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Organizations</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchEvents}
          className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Security Events Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>Platform Security Signals & Telemetry Log ({filteredEvents.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Immutable Event Bus</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Event Type</th>
                <th className="p-4">Actor / Origin</th>
                <th className="p-4">Tenant Scope</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    {new Date(evt.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        evt.severity === 'Critical'
                          ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                          : evt.severity === 'High'
                          ? 'bg-orange-950 text-orange-400 border-orange-800'
                          : evt.severity === 'Medium'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-slate-200 text-[11px] font-semibold">{evt.eventType}</span>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-medium">{evt.actorName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{evt.ipAddress}</div>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-300 font-medium">{evt.tenantName}</span>
                  </td>
                  <td className="p-4 max-w-xs truncate text-slate-400" title={evt.description}>
                    {evt.description}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        evt.status === 'Resolved'
                          ? 'bg-emerald-950 text-emerald-400'
                          : evt.status === 'Investigating'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-red-950 text-red-400'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedEvent(evt)}
                      className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <span>Security Event Telemetry</span>
              </h3>
              <button onClick={() => setSelectedEvent(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Description:</span>
                <p className="text-slate-200 font-medium">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Event Type:</span>
                  <span className="font-mono text-slate-200">{selectedEvent.eventType}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Severity:</span>
                  <span className="font-bold text-red-400">{selectedEvent.severity}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Actor:</span>
                  <span className="text-slate-200">{selectedEvent.actorEmail}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">IP Address:</span>
                  <span className="font-mono text-slate-200">{selectedEvent.ipAddress}</span>
                </div>
              </div>

              {selectedEvent.userAgent && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">User Agent:</span>
                  <span className="font-mono text-[11px] text-slate-400 break-all">{selectedEvent.userAgent}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-800 pt-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Shield,
  Clock,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Database,
  X,
  Server,
} from 'lucide-react';
import { PlatformSystemSettings } from '../../types';

export const SuperAdminSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch('/api/super-admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.error || 'Failed to update settings.' });
      } else {
        setNotification({ type: 'success', message: 'Platform global configuration saved successfully.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error while updating configuration.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading platform configuration...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 text-xs">
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          <span>{notification.message}</span>
          <button type="button" onClick={() => setNotification(null)}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-500" />
            <span>Platform System Settings & Security Governance</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure global authentication policies, maintenance mode, and backup cycles across all tenants.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-2 px-5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-red-900/30"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Identity & Support */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Identity & Platform Support</span>
          </h4>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Platform Brand Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Global Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">SMTP Notification Server</label>
            <input
              type="text"
              value={settings.smtpServer}
              onChange={(e) => setSettings({ ...settings, smtpServer: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">SMTP Sender Address</label>
            <input
              type="email"
              value={settings.smtpSenderEmail}
              onChange={(e) => setSettings({ ...settings, smtpSenderEmail: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Security & Authentication Policies */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Authentication & Lockout Policy</span>
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Session Inactivity (Min)</label>
              <input
                type="number"
                value={settings.sessionTimeoutMinutes}
                onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Max Failed Logins</label>
              <input
                type="number"
                value={settings.maxFailedLoginAttempts}
                onChange={(e) => setSettings({ ...settings, maxFailedLoginAttempts: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Lockout Duration (Min)</label>
              <input
                type="number"
                value={settings.lockoutDurationMinutes}
                onChange={(e) => setSettings({ ...settings, lockoutDurationMinutes: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Min Password Length</label>
              <input
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) || 8 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-850">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reqMfaSuper"
                checked={settings.requireMfaForSuperAdmin}
                onChange={(e) => setSettings({ ...settings, requireMfaForSuperAdmin: e.target.checked })}
                className="rounded border-slate-700 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="reqMfaSuper" className="text-slate-300 cursor-pointer">
                Strictly Enforce MFA for Software Super Admins
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reqMfaClient"
                checked={settings.requireMfaForClientAdmin}
                onChange={(e) => setSettings({ ...settings, requireMfaForClientAdmin: e.target.checked })}
                className="rounded border-slate-700 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="reqMfaClient" className="text-slate-300 cursor-pointer">
                Strictly Enforce MFA for Client Organization Admins
              </label>
            </div>
          </div>
        </div>

        {/* Maintenance Mode & Operations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 md:col-span-2">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Maintenance Mode & Data Automation</span>
          </h4>

          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="font-bold text-white block">Platform Maintenance Mode</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                When enabled, non-Super Admin users will receive a maintenance banner and API requests will be paused.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-5 h-5 rounded border-slate-700 text-red-600 focus:ring-red-500 cursor-pointer"
            />
          </div>

          {settings.maintenanceMode && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Maintenance Banner Notice</label>
              <input
                type="text"
                value={settings.bannerMessage || ''}
                onChange={(e) => setSettings({ ...settings, bannerMessage: e.target.value })}
                placeholder="Scheduled database maintenance in progress. Expected restoration in 30 minutes."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

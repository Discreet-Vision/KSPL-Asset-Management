import React, { useState } from 'react';
import { X, Building2, Globe2, DollarSign, Clock, ShieldCheck, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { OrganizationTenant } from '../../types';
import { useApp } from '../../context/AppContext';

interface OrganizationSettingsModalProps {
  tenant: OrganizationTenant;
  onClose: () => void;
  onUpdateTenant: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export const OrganizationSettingsModal: React.FC<OrganizationSettingsModalProps> = ({
  tenant,
  onClose,
  onUpdateTenant,
}) => {
  const { setShowUserManagementModal, currentUser } = useApp();
  const [name, setName] = useState(tenant?.name || '');
  const [code, setCode] = useState(tenant?.code || '');
  const [region, setRegion] = useState(tenant?.region || 'US');
  const [currency, setCurrency] = useState('USD ($)');
  const [timezone, setTimezone] = useState('America/New_York (UTC-5)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await onUpdateTenant({
        tenantId: tenant.id,
        companyName: name,
        region,
        currency,
        timezone,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update organization profile.');
      } else {
        setSuccessMsg('Organization profile and tenant settings updated.');
      }
    } catch (err: any) {
      setErrorMsg('Error saving organization settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans selection:bg-red-600 selection:text-white">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-black p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center text-red-500 font-bold font-mono">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">ORGANIZATION PROFILE & TENANT SETTINGS</h2>
              <p className="text-[10px] text-zinc-400 font-mono">TENANT ID: {tenant.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div className="bg-red-950/80 border border-red-800 text-red-300 p-3 rounded text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3 rounded text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold text-zinc-300 mb-1 uppercase">Organization / Company Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold text-zinc-300 mb-1 uppercase">Tenant Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-zinc-300 mb-1 uppercase">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
              >
                <option value="US">US East / West</option>
                <option value="EU">EU (Frankfurt / Ireland)</option>
                <option value="APAC">APAC (Singapore / Tokyo)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold text-zinc-300 mb-1 uppercase">Reporting Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="INR (₹)">INR (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-zinc-300 mb-1 uppercase">System Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="bg-black/60 p-3 border border-zinc-800 rounded text-[11px] font-mono text-zinc-400 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TENANT SECURITY & DATA ISOLATION ENFORCED</span>
              </div>
              {currentUser &&
                (currentUser.role === 'SOFTWARE_SUPER_ADMIN' ||
                  currentUser.role === 'Software Super Admin' ||
                  currentUser.role === 'CLIENT_ADMIN' ||
                  currentUser.role === 'Client Admin' ||
                  currentUser.role === 'CLIENT_SUPER_ADMIN' ||
                  currentUser.role === 'Super Admin' ||
                  (currentUser as any).isAdmin === true ||
                  (currentUser as any).isSuperAdmin === true) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setShowUserManagementModal(true);
                    }}
                    className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 hover:text-white px-2 py-1 rounded flex items-center space-x-1 cursor-pointer font-bold"
                  >
                    <Users className="w-3 h-3 text-amber-400" />
                    <span>Manage Users & Roles</span>
                  </button>
                )}
            </div>
            <p>Tenant ID Boundary: <code className="text-white">{tenant.id}</code></p>
            <p>Field-Level Encryption & Rest APIs: Active</p>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-bold text-zinc-400 hover:text-white cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-mono font-bold text-white bg-red-600 hover:bg-red-500 rounded cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'SAVING...' : 'SAVE TENANT SETTINGS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

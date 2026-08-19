import React, { useState } from 'react';
import { ShieldCheck, Smartphone, Key, RefreshCw, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { User } from '../../types';
import { MfaSetupModal } from './MfaSetupModal';

interface MfaSecuritySettingsModuleProps {
  currentUser: User;
  onUserUpdated?: (user: User) => void;
}

export const MfaSecuritySettingsModule: React.FC<MfaSecuritySettingsModuleProps> = ({
  currentUser,
  onUserUpdated,
}) => {
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegenerateRecoveryCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCode || currentCode.length !== 6) {
      setError('Please enter your current 6-digit MFA passcode to regenerate recovery codes.');
      return;
    }

    setRegenerating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/mfa/regenerate-recovery-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, currentCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to regenerate recovery codes.');
        setRegenerating(false);
        return;
      }

      setNewRecoveryCodes(data.recoveryCodes);
      setSuccessMsg('New recovery codes generated successfully. Previous recovery codes are now invalidated.');
      setCurrentCode('');
    } catch (err) {
      setError('Network error during recovery code regeneration.');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-slate-100">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-red-500" />
            <span>Multi-Factor Authentication & Security</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure TOTP two-factor authentication (Google Authenticator / Microsoft Authenticator) and backup security codes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser.mfaEnabled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 border border-emerald-800 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              MFA Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950 border border-amber-800 text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              MFA Not Configured
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-800 rounded-xl text-xs text-emerald-300">
          {successMsg}
        </div>
      )}

      {/* Primary MFA Config Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Authenticator Application (TOTP)</h3>
              <p className="text-xs text-slate-400">
                Use Google Authenticator or Microsoft Authenticator for time-based one-time passcodes (RFC 6238).
              </p>
            </div>
          </div>
          <button
            onClick={() => setSetupModalOpen(true)}
            className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-600/20 transition-all"
          >
            {currentUser.mfaEnabled ? 'Re-enroll Authenticator' : 'Set Up MFA'}
          </button>
        </div>

        {currentUser.mfaEnabled && (
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Target Authenticator</span>
              <span className="text-white font-medium capitalize">
                {currentUser.mfaMethod === 'microsoft_authenticator' ? 'Microsoft Authenticator' : 'Google Authenticator'}
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Algorithm & Security</span>
              <span className="text-white font-medium">HMAC-SHA1 (6 Digits, 30s Window)</span>
            </div>
          </div>
        )}
      </div>

      {/* Recovery Codes Card */}
      {currentUser.mfaEnabled && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-semibold text-white">Single-Use Recovery Codes</h3>
              <p className="text-xs text-slate-400">
                Regenerate a new set of 10 backup codes if you have exhausted your previous list.
              </p>
            </div>
          </div>

          <form onSubmit={handleRegenerateRecoveryCodes} className="flex gap-2 items-center pt-2">
            <input
              type="text"
              maxLength={6}
              placeholder="Enter current 6-digit code"
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value.replace(/\D/g, ''))}
              className="py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono outline-none focus:border-red-500 w-48"
            />
            <button
              type="submit"
              disabled={regenerating || currentCode.length !== 6}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate Codes</span>
            </button>
          </form>

          {newRecoveryCodes && (
            <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <p className="text-xs text-amber-400 font-semibold">Your New Backup Recovery Codes:</p>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs text-slate-200">
                {newRecoveryCodes.map((code, idx) => (
                  <div key={idx} className="p-1.5 bg-slate-900 border border-slate-800 rounded text-center">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MFA Setup Modal Component */}
      <MfaSetupModal
        userId={currentUser.id}
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onComplete={(method) => {
          if (onUserUpdated) {
            onUserUpdated({
              ...currentUser,
              mfaEnabled: true,
              mfaMethod: method || 'google_authenticator',
            });
          }
          setSuccessMsg('Multi-Factor Authentication configured and activated successfully.');
        }}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Copy, Check, Download, AlertTriangle, ArrowRight, Smartphone, Key } from 'lucide-react';
import { MfaMethod } from '../../types';

interface MfaSetupModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (method?: MfaMethod) => void;
}

export const MfaSetupModal: React.FC<MfaSetupModalProps> = ({ userId, isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mfaMethod, setMfaMethod] = useState<MfaMethod>('google_authenticator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string>('');
  const [otpauthUrl, setOtpauthUrl] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [savedCheckbox, setSavedCheckbox] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setLoading(false);
      setError(null);
      setSecret('');
      setOtpauthUrl('');
      setVerificationCode('');
      setRecoveryCodes([]);
      setCopiedCodes(false);
      setCopiedSecret(false);
      setSavedCheckbox(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartSetup = async (selectedMethod: MfaMethod) => {
    setMfaMethod(selectedMethod);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/mfa/setup/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, mfaMethod: selectedMethod }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to initialize MFA setup.');
        setLoading(false);
        return;
      }

      setSecret(data.secret);
      setOtpauthUrl(data.otpauthUrl);
      setStep(2);
    } catch (err) {
      setError('Network error during MFA setup initialization.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/mfa/setup/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: verificationCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Verification code invalid.');
        setLoading(false);
        return;
      }

      setRecoveryCodes(data.recoveryCodes || []);
      setStep(4);
    } catch (err) {
      setError('Network error during code confirmation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleDownloadCodes = () => {
    const element = document.createElement('a');
    const file = new Blob([`KSPL ITAM - MFA RECOVERY CODES\n============================\n${recoveryCodes.join('\n')}\n`], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'KSPL_MFA_Recovery_Codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-hidden text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Enable Multi-Factor Authentication</h3>
              <p className="text-xs text-slate-400">Step {step} of 4: Setup Authenticator App</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 rounded-xl flex items-center gap-3 text-red-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Select Authenticator App */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">Select your preferred authenticator application:</p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleStartSetup('google_authenticator')}
                disabled={loading}
                className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-red-500/50 rounded-xl flex items-center gap-4 text-left transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Google Authenticator</h4>
                  <p className="text-xs text-slate-400">Standard RFC 6238 TOTP for Android, iOS & Workspace</p>
                </div>
              </button>

              <button
                onClick={() => handleStartSetup('microsoft_authenticator')}
                disabled={loading}
                className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-red-500/50 rounded-xl flex items-center gap-4 text-left transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Microsoft Authenticator</h4>
                  <p className="text-xs text-slate-400">Supported for Azure AD & Enterprise MFA workflows</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Scan QR Code */}
        {step === 2 && (
          <div className="space-y-5 text-center">
            <p className="text-xs text-slate-300">
              Open your <strong>{mfaMethod === 'google_authenticator' ? 'Google Authenticator' : 'Microsoft Authenticator'}</strong> app and scan the QR code below:
            </p>

            <div className="inline-block p-4 bg-white rounded-2xl shadow-xl border border-slate-700">
              <QRCodeSVG value={otpauthUrl} size={180} />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                Unable to scan? Manual Entry Key:
              </span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-red-400 font-bold tracking-wider">{secret}</code>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                >
                  {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <span>Next: Verify Passcode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: Confirm 6-Digit Code */}
        {step === 3 && (
          <div className="space-y-5">
            <p className="text-xs text-slate-300 text-center">
              Enter the current 6-digit passcode generated by your authenticator app to complete pairing:
            </p>

            <div>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                className="w-full py-3 text-center text-3xl font-mono tracking-widest bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-red-500"
              />
            </div>

            <button
              onClick={handleConfirmSetup}
              disabled={loading || verificationCode.length !== 6}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>Verify & Activate MFA</span>
              )}
            </button>
          </div>
        )}

        {/* STEP 4: Backup Recovery Codes */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl flex items-start gap-3 text-amber-200 text-xs">
              <Key className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Save Your Recovery Codes!</p>
                <p className="text-[11px] text-amber-200/80">
                  These 10 single-use recovery codes allow you to log in if you lose your phone. They will <strong>NOT</strong> be displayed again.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-center text-slate-200">
              {recoveryCodes.map((code, idx) => (
                <div key={idx} className="p-1.5 bg-slate-900 border border-slate-800 rounded">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyCodes}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg flex items-center justify-center gap-1.5"
              >
                {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Codes</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCodes}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .TXT</span>
              </button>
            </div>

            <label className="flex items-center gap-2 pt-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={savedCheckbox}
                onChange={(e) => setSavedCheckbox(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-red-600 focus:ring-0"
              />
              <span>I have safely backed up these recovery codes.</span>
            </label>

            <button
              onClick={() => {
                onComplete(mfaMethod);
                onClose();
              }}
              disabled={!savedCheckbox}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs transition-all disabled:opacity-50"
            >
              Finish Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

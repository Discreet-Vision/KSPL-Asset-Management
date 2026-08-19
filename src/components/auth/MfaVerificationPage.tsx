import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, KeyRound, AlertTriangle, ArrowRight, HelpCircle, Copy, Check, Lock, Smartphone, Download, Key } from 'lucide-react';
import { MfaMethod, User, OrganizationTenant } from '../../types';

interface MfaVerificationPageProps {
  tempToken: string;
  mfaMethod?: MfaMethod;
  userEmail?: string;
  mfaSetupRequired?: boolean;
  onVerified: (user: User, tenant: OrganizationTenant, token: string) => void;
  onCancel: () => void;
}

export const MfaVerificationPage: React.FC<MfaVerificationPageProps> = ({
  tempToken,
  mfaMethod: initialMfaMethod = 'google_authenticator',
  userEmail,
  mfaSetupRequired = false,
  onVerified,
  onCancel,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Enrollment / Setup Flow State (for mfaSetupRequired = true or transition)
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(1);
  const [mfaMethod, setMfaMethod] = useState<MfaMethod>(initialMfaMethod);
  const [secret, setSecret] = useState<string>('');
  const [otpauthUrl, setOtpauthUrl] = useState<string>('');
  const [setupCode, setSetupCode] = useState<string>('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [savedCheckbox, setSavedCheckbox] = useState(false);
  const [loginUserData, setLoginUserData] = useState<{ user: User; tenant: OrganizationTenant; token: string } | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!mfaSetupRequired && !useRecoveryCode && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [useRecoveryCode, mfaSetupRequired]);

  const handleStartSetup = async (selectedMethod: MfaMethod) => {
    setMfaMethod(selectedMethod);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/mfa/setup/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempToken, mfaMethod: selectedMethod }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to initialize MFA setup.');
        setLoading(false);
        return;
      }

      setSecret(data.secret || '');
      setOtpauthUrl(data.otpauthUrl || '');
      setSetupStep(2);
    } catch (err) {
      setError('Network error during MFA setup initialization.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSetup = async () => {
    if (!setupCode || setupCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/mfa/setup/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempToken, code: setupCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Verification code invalid.');
        setLoading(false);
        return;
      }

      setRecoveryCodes(data.recoveryCodes || []);
      if (data.user && data.tenant && data.token) {
        setLoginUserData({ user: data.user, tenant: data.tenant, token: data.token });
      }
      setSetupStep(4);
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

  useEffect(() => {
    if (!useRecoveryCode && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [useRecoveryCode]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError(null);

    // Auto-advance to next input box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when 6 digits are typed
    if (value && index === 5 && newDigits.every((d) => d !== '')) {
      handleVerifyCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      handleVerifyCode(pasted);
    }
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const code = codeToVerify || digits.join('');
    if (code.length !== 6) {
      setError('Please enter a complete 6-digit code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Verification failed. Please check your code.');
        setLoading(false);
        return;
      }

      onVerified(data.user, data.tenant, data.token);
    } catch (err) {
      setError('Network or server error during MFA verification.');
      setLoading(false);
    }
  };

  const handleVerifyRecoveryCode = async () => {
    const cleanCode = recoveryCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter a valid recovery code (e.g. XXXX-XXXX).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/mfa/verify-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, recoveryCode: cleanCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid recovery code.');
        setLoading(false);
        return;
      }

      onVerified(data.user, data.tenant, data.token);
    } catch (err) {
      setError('Network error during recovery code verification.');
      setLoading(false);
    }
  };

  const handleSubmitResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      setError('User email unavailable for MFA reset.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/mfa/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, reason: resetReason }),
      });
      const data = await res.json();
      setResetSubmitted(true);
    } catch (err) {
      setError('Failed to submit reset request.');
    } finally {
      setResetLoading(false);
    }
  };

  const isGoogle = mfaMethod === 'google_authenticator';

  if (mfaSetupRequired) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Set Up Two-Factor Authentication</h2>
            <p className="text-slate-400 text-xs mt-1">
              Multi-factor authentication is mandatory for your account policy ({userEmail}).
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-950/50 border border-red-800/50 rounded-xl flex items-start gap-3 text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Choose Authenticator App */}
          {setupStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 text-center font-medium">
                Select your preferred TOTP authenticator application:
              </p>

              <button
                type="button"
                onClick={() => handleStartSetup('google_authenticator')}
                disabled={loading}
                className="w-full p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                      Google Authenticator
                    </span>
                    <span className="block text-[11px] text-slate-400">RFC 6238 Standard Time-based OTP</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleStartSetup('microsoft_authenticator')}
                disabled={loading}
                className="w-full p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                      Microsoft Authenticator
                    </span>
                    <span className="block text-[11px] text-slate-400">Enterprise Cloud MFA Backup Compatible</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full py-2 text-xs text-slate-500 hover:text-slate-400 transition-colors text-center"
                >
                  Cancel and Return to Sign In
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Scan QR Code Element */}
          {setupStep === 2 && (
            <div className="space-y-5 text-center">
              <p className="text-xs text-slate-300">
                Open your <strong>{isGoogle ? 'Google Authenticator' : 'Microsoft Authenticator'}</strong> app and scan the QR code below:
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
                type="button"
                onClick={() => setSetupStep(3)}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <span>Next: Enter Verification Passcode</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Enter Verification Passcode */}
          {setupStep === 3 && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-300">
                Enter the 6-digit verification passcode generated by your authenticator app to activate MFA:
              </p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
                className="w-full py-3 px-4 bg-slate-950 border border-slate-700 rounded-xl text-white text-center text-2xl font-mono tracking-widest outline-none focus:border-red-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSetupStep(2)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSetup}
                  disabled={loading || setupCode.length !== 6}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Activate'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Recovery Codes & Complete Login */}
          {setupStep === 4 && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Save these single-use recovery codes in a secure secret manager. If you lose your phone, recovery codes are your only access method.
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-red-400 grid grid-cols-2 gap-2 text-center">
                {recoveryCodes.map((code, idx) => (
                  <div key={idx} className="bg-slate-900 py-1.5 rounded border border-slate-800/80">
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
                  <span>Download TXT</span>
                </button>
              </div>

              <label className="flex items-center gap-2 pt-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedCheckbox}
                  onChange={(e) => setSavedCheckbox(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-red-600 focus:ring-0"
                />
                <span>I have safely stored these recovery codes.</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  if (loginUserData) {
                    onVerified(loginUserData.user, loginUserData.tenant, loginUserData.token);
                  } else {
                    onCancel();
                  }
                }}
                disabled={!savedCheckbox}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs transition-all disabled:opacity-50"
              >
                Complete Sign In & Open Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Two-Factor Authentication</h2>
          <p className="text-slate-400 text-sm mt-1">
            {useRecoveryCode
              ? 'Enter one of your 8-character single-use recovery codes.'
              : `Enter the 6-digit passcode generated by your ${isGoogle ? 'Google Authenticator' : 'Microsoft Authenticator'} app.`}
          </p>
        </div>

        {/* Authenticator App Method Badge */}
        <div className="flex items-center justify-center gap-2 mb-6 bg-slate-800/60 border border-slate-700/50 rounded-lg py-2 px-3 text-xs text-slate-300">
          <Lock className="w-3.5 h-3.5 text-red-400" />
          <span>
            Target Method: <strong className="text-white">{isGoogle ? 'Google Authenticator' : 'Microsoft Authenticator'}</strong>
          </span>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/50 border border-red-800/50 rounded-xl flex items-start gap-3 text-red-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!useRecoveryCode ? (
          <div>
            {/* 6-Digit Code Inputs */}
            <div className="flex justify-between gap-2 mb-6" onPaste={handlePaste}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={loading}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-950 border border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl text-white outline-none transition-all"
                />
              ))}
            </div>

            <button
              onClick={() => handleVerifyCode()}
              disabled={loading || digits.some((d) => !d)}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Verify Identity</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div>
            {/* Recovery Code Input */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Single-Use Recovery Code</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. A1B2-C3D4"
                  value={recoveryCodeInput}
                  onChange={(e) => setRecoveryCodeInput(e.target.value.toUpperCase())}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-slate-950 border border-slate-700 rounded-xl text-white text-center font-mono tracking-widest outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 uppercase"
                />
                <KeyRound className="absolute right-3 top-3.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <button
              onClick={handleVerifyRecoveryCode}
              disabled={loading || !recoveryCodeInput.trim()}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>Verify Recovery Code</span>
              )}
            </button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col gap-2.5 text-center text-xs">
          <button
            type="button"
            onClick={() => {
              setUseRecoveryCode(!useRecoveryCode);
              setError(null);
            }}
            className="text-red-400 hover:text-red-300 transition-colors font-medium"
          >
            {useRecoveryCode ? '← Use Authenticator App Code' : 'Lost your phone? Use a Recovery Code'}
          </button>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Request MFA Reset from Platform Super Admin
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-400 transition-colors mt-2"
          >
            Cancel and Return to Sign In
          </button>
        </div>
      </div>

      {/* MFA Reset Request Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Request MFA Reset</h3>
            <p className="text-xs text-slate-400 mb-4">
              If you have lost access to your authenticator app and recovery codes, submit a reset request to your Software Super Admin.
            </p>

            {resetSubmitted ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-300 text-xs text-center space-y-3">
                <p className="font-semibold text-emerald-200">Request Dispatched Successfully</p>
                <p>
                  Your MFA reset request has been sent to the Software Super Admin queue. Once approved, you will be required to re-enroll MFA on your next sign-in.
                </p>
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setResetSubmitted(false);
                  }}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded-lg"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitResetRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">User Email Address</label>
                  <input
                    type="text"
                    readOnly
                    value={userEmail || ''}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Reason for Reset Request</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Lost mobile device or upgraded phone without migrating authenticator keys..."
                    value={resetReason}
                    onChange={(e) => setResetReason(e.target.value)}
                    required
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading || !resetReason.trim()}
                    className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    {resetLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

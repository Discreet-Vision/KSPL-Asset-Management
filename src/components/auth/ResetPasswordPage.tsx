import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

interface ResetPasswordPageProps {
  initialToken?: string;
  onResetPassword: (token: string, newPassword: string, confirmPassword?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  onNavigateToLogin: () => void;
  onNavigateToLanding: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  initialToken = '',
  onResetPassword,
  onNavigateToLogin,
  onNavigateToLanding,
}) => {
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const pwd = newPassword || '';
  const passwordCriteria = {
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!token.trim()) {
      setErrorMessage('Reset token is required.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('New password does not meet requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onResetPassword(token.trim(), newPassword, confirmPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Password reset failed.');
      } else {
        setSuccessMessage(res.message || 'Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          onNavigateToLogin();
        }, 2000);
      }
    } catch (err: any) {
      setErrorMessage('Network error during password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between font-sans selection:bg-red-600 selection:text-white">
      <header className="border-b border-zinc-800 bg-black/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <button onClick={onNavigateToLanding} className="flex items-center space-x-3 cursor-pointer">
          <div className="bg-red-600 text-white p-2 rounded font-black font-mono tracking-wider text-sm shadow-md">
            KSPL
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white block">
              KSPL ITAM Enterprise
            </span>
            <span className="text-[10px] text-zinc-400 font-mono block -mt-0.5">
              PASSWORD RESET
            </span>
          </div>
        </button>

        <button
          onClick={onNavigateToLogin}
          className="text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          ← SIGN IN
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-950/80 border border-red-800 rounded-xl flex items-center justify-center text-red-500 mx-auto mb-3 shadow-lg shadow-red-950/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Set New Password
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Provide your token and choose a strong password for your account
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 bg-red-950/80 border border-red-800/80 text-red-200 p-3 rounded-lg text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-300">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 p-3 rounded-lg text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="font-bold">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Reset Token <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="kspl_reset_..."
                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono"
                />
              </div>
            </div>

            {/* Password Criteria */}
            <div className="bg-black/60 border border-zinc-800 rounded-lg p-3 text-[11px] font-mono grid grid-cols-2 gap-2">
              <div className={`flex items-center space-x-1.5 ${passwordCriteria.length ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {passwordCriteria.length ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>8+ Characters</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${passwordCriteria.uppercase ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {passwordCriteria.uppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Uppercase (A-Z)</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${passwordCriteria.lowercase ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {passwordCriteria.lowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Lowercase (a-z)</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${passwordCriteria.number ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {passwordCriteria.number ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Number (0-9)</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${passwordCriteria.special ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {passwordCriteria.special ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Special (!@#$)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 text-xs font-bold font-mono tracking-wider text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-950/50 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>UPDATING PASSWORD...</span>
              ) : (
                <>
                  <span>CONFIRM NEW PASSWORD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="border-t border-zinc-900 py-4 px-6 text-center text-[11px] font-mono text-zinc-400">
        © {new Date().getFullYear()} KSPL ITAM Enterprise SaaS Platform.
      </footer>
    </div>
  );
};

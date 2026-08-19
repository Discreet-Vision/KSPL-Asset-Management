import React, { useState } from 'react';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

interface ForgotPasswordPageProps {
  onRequestReset: (email: string) => Promise<{ success: boolean; message: string; resetToken?: string }>;
  onNavigateToLogin: () => void;
  onNavigateToResetWithToken: (token: string) => void;
  onNavigateToLanding: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onRequestReset,
  onNavigateToLogin,
  onNavigateToResetWithToken,
  onNavigateToLanding,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ message: string; resetToken?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfo(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your registered work email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onRequestReset(email.trim());
      setSuccessInfo({ message: res.message, resetToken: res.resetToken });
    } catch (err: any) {
      setErrorMessage('Failed to send reset request due to a network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between font-sans selection:bg-red-600 selection:text-white">
      {/* Top Bar */}
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
              PASSWORD RECOVERY
            </span>
          </div>
        </button>

        <button
          onClick={onNavigateToLogin}
          className="text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          ← BACK TO SIGN IN
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-950/80 border border-red-800 rounded-xl flex items-center justify-center text-red-500 mx-auto mb-3 shadow-lg shadow-red-950/40">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Reset Your Password
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Enter your work email address and we will dispatch a secure time-limited reset link.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 bg-red-950/80 border border-red-800/80 text-red-200 p-3 rounded-lg text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-300">{errorMessage}</p>
            </div>
          )}

          {successInfo ? (
            <div className="space-y-4">
              <div className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 p-4 rounded-lg text-xs space-y-2">
                <div className="flex items-center space-x-2 font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Password Reset Request Received</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-200">
                  {successInfo.message}
                </p>
              </div>

              {/* Dev Testing Reset Token Shortcuts */}
              {successInfo.resetToken && (
                <div className="bg-black border border-zinc-800 p-3 rounded text-[11px] font-mono">
                  <span className="text-zinc-500 block uppercase font-bold text-[10px] mb-1">
                    DEVELOPMENT RESET TOKEN GENERATED
                  </span>
                  <div className="bg-zinc-900 p-2 rounded text-red-400 break-all select-all">
                    {successInfo.resetToken}
                  </div>
                  <button
                    onClick={() => onNavigateToResetWithToken(successInfo.resetToken!)}
                    className="mt-3 w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-xs transition-all cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>USE THIS TOKEN NOW →</span>
                  </button>
                </div>
              )}

              <button
                onClick={onNavigateToLogin}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-mono text-xs font-bold rounded transition-all cursor-pointer"
              >
                RETURN TO SIGN IN
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Work Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexander.w@gecorp.com"
                    className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 text-xs font-bold font-mono tracking-wider text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-950/50 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>DISPATCHING RESET REQUEST...</span>
                ) : (
                  <>
                    <span>SEND RESET INSTRUCTIONS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-900 py-4 px-6 text-center text-[11px] font-mono text-zinc-400">
        © {new Date().getFullYear()} KSPL ITAM Enterprise SaaS Platform.
      </footer>
    </div>
  );
};

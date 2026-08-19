import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  onNavigateToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onNavigateToRegister,
  onNavigateToForgotPassword,
  onNavigateToLanding,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your work email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onLogin(email.trim(), password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid email address or password.');
      } else {
        setSuccessMessage('Authentication successful. Redirecting to dashboard...');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed due to a network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillSuperAdmin = () => {
    setEmail('jitin@ucliktechnologies.com');
    setPassword('Password123!');
    setErrorMessage('');
  };

  const fillClientAdmin = () => {
    setEmail('clientadmin@enterprise.com');
    setPassword('Password123!');
    setErrorMessage('');
  };

  const fillFinanceUser = () => {
    setEmail('finance@enterprise.com');
    setPassword('Password123!');
    setErrorMessage('');
  };

  const fillItamAdmin = () => {
    setEmail('itamadmin@enterprise.com');
    setPassword('Password123!');
    setErrorMessage('');
  };

  const fillCmdbAdmin = () => {
    setEmail('cmdbadmin@enterprise.com');
    setPassword('Password123!');
    setErrorMessage('');
  };

  const fillSecurityUser = () => {
    setEmail('security@enterprise.com');
    setPassword('Password123!');
    setErrorMessage('');
  };

  const fillEmployeeUser = () => {
    setEmail('employee@enterprise.com');
    setPassword('Password123!');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between font-sans selection:bg-red-600 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-zinc-800 bg-black/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <button
          onClick={onNavigateToLanding}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="bg-red-600 text-white p-2 rounded font-black font-mono tracking-wider text-sm shadow-md">
            KSPL
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white block group-hover:text-red-400 transition-colors">
              KSPL ITAM Enterprise Portal
            </span>
            <span className="text-[10px] text-zinc-400 font-mono block -mt-0.5">
              SYSTEM OF RECORD
            </span>
          </div>
        </button>

        <button
          onClick={onNavigateToLanding}
          className="text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          ← BACK TO PUBLIC SITE
        </button>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-950/80 border border-red-800 rounded-xl flex items-center justify-center text-red-500 mx-auto mb-3 shadow-lg shadow-red-950/40">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Sign In to KSPL ITAM
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Enter your enterprise credentials to access your tenant portal
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 bg-red-950/80 border border-red-800/80 text-red-200 p-3 rounded-lg text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Error</p>
                <p className="text-[11px] text-red-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 p-3 rounded-lg text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="font-bold">{successMessage}</p>
            </div>
          )}

          {/* Login Form */}
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
                  placeholder="jitin@ucliktechnologies.com or clientadmin@enterprise.com"
                  className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={onNavigateToForgotPassword}
                  className="text-[11px] font-mono font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono transition-all"
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-black border-zinc-700 text-red-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs font-mono text-zinc-400">Remember session for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 text-xs font-bold font-mono tracking-wider text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-950/50 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <span>SIGN IN TO TENANT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access for All Roles */}
          <div className="mt-6 pt-5 border-t border-zinc-800 space-y-2 text-center">
            <p className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
              Quick Role-Based Credentials (Click to Autofill)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-left">
              <button
                type="button"
                onClick={fillFinanceUser}
                className="py-1.5 px-2 bg-teal-950/40 hover:bg-teal-900/60 border border-teal-800/80 hover:border-teal-500 text-teal-200 hover:text-white rounded text-[10px] font-mono font-bold transition-all cursor-pointer truncate"
              >
                💰 Finance User
              </button>
              <button
                type="button"
                onClick={fillItamAdmin}
                className="py-1.5 px-2 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/80 hover:border-blue-500 text-blue-200 hover:text-white rounded text-[10px] font-mono font-bold transition-all cursor-pointer truncate"
              >
                💻 ITAM Admin
              </button>
              <button
                type="button"
                onClick={fillCmdbAdmin}
                className="py-1.5 px-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/80 hover:border-emerald-500 text-emerald-200 hover:text-white rounded text-[10px] font-mono font-bold transition-all cursor-pointer truncate"
              >
                🌐 CMDB Admin
              </button>
              <button
                type="button"
                onClick={fillSecurityUser}
                className="py-1.5 px-2 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/80 hover:border-purple-500 text-purple-200 hover:text-white rounded text-[10px] font-mono font-bold transition-all cursor-pointer truncate"
              >
                🛡️ Security Lead
              </button>
              <button
                type="button"
                onClick={fillEmployeeUser}
                className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded text-[10px] font-mono font-bold transition-all cursor-pointer truncate"
              >
                👤 Employee
              </button>
              <button
                type="button"
                onClick={fillSuperAdmin}
                className="py-1.5 px-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/80 hover:border-red-500 text-red-200 hover:text-white rounded text-[10px] font-mono font-bold transition-all cursor-pointer truncate"
              >
                👑 Super Admin
              </button>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={fillClientAdmin}
                className="w-full py-1.5 px-2 bg-amber-950/30 hover:bg-amber-900/50 border border-amber-800/70 hover:border-amber-500 text-amber-200 hover:text-white rounded text-[10px] font-mono font-bold transition-all cursor-pointer text-center"
              >
                🏢 Client Organization Admin (Full Tenant Access)
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-zinc-400">
            Don't have an enterprise account?{' '}
            <button
              onClick={onNavigateToRegister}
              className="text-red-400 hover:text-red-300 font-bold font-mono transition-colors cursor-pointer"
            >
              Get Started / Register Organization
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-4 px-6 text-center text-[11px] font-mono text-zinc-400">
        © {new Date().getFullYear()} KSPL ITAM SaaS Platform. All authentication activity is audited.
      </footer>
    </div>
  );
};

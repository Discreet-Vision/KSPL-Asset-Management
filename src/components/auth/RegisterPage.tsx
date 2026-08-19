import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  Globe2,
  Briefcase,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface RegisterPageProps {
  onRegister: (formData: any) => Promise<{ success: boolean; error?: string }>;
  onNavigateToLogin: () => void;
  onNavigateToLanding: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegister,
  onNavigateToLogin,
  onNavigateToLanding,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    jobTitle: 'IT Asset Director',
    phone: '',
    country: 'United States',
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password Strength Check
  const pwd = formData.password || '';
  const passwordCriteria = {
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage('First and Last Name are required.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Work Email is required.');
      return;
    }
    if (!formData.companyName.trim()) {
      setErrorMessage('Company / Organization Name is required.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Password does not meet the security policy requirements.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }
    if (!formData.termsAccepted) {
      setErrorMessage('You must accept the Terms & Conditions to register your organization.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onRegister(formData);
      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed. Please check your inputs.');
      } else {
        setSuccessMessage('Organization account created successfully! Launching onboarding...');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Server error during tenant registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between font-sans selection:bg-red-600 selection:text-white">
      {/* Top Header */}
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
              ORGANIZATION REGISTRATION
            </span>
          </div>
        </button>

        <button
          onClick={onNavigateToLogin}
          className="text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          ALREADY HAVE AN ACCOUNT? <span className="text-red-400 underline ml-1">SIGN IN</span>
        </button>
      </header>

      {/* Main Registration Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-10">
        <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-950/80 border border-red-800 rounded-xl flex items-center justify-center text-red-500 mx-auto mb-3 shadow-lg shadow-red-950/40">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Create Enterprise ITAM Organization Account
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Setup a dedicated multi-tenant IT Asset Management & CMDB workspace for your organization
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 bg-red-950/80 border border-red-800/80 text-red-200 p-3 rounded-lg text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Registration Validation Alert</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Alexander"
                    className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Wright"
                    className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Email & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Work Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="alexander.w@company.com"
                    className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Company / Organization <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Acme Global Industries"
                    className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Job Title, Phone, Country */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Job Title
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    placeholder="IT Asset Manager"
                    className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 019-2831"
                    className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Country
                </label>
                <div className="relative">
                  <Globe2 className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <select
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="India">India</option>
                    <option value="Australia">Australia</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Passwords Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
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
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Live Password Strength Criteria Checklist */}
            <div className="bg-black/60 border border-zinc-800 rounded-lg p-3 text-[11px] font-mono grid grid-cols-2 sm:grid-cols-3 gap-2">
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

            {/* Terms & Conditions Acceptance */}
            <div className="pt-2">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.termsAccepted}
                  onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded bg-black border-zinc-700 text-red-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-zinc-400 leading-relaxed font-mono">
                  I agree to the <span className="text-white underline">Terms of Service</span> and <span className="text-white underline">Privacy Policy</span>. I certify I am registering on behalf of my organization.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 text-xs font-bold font-mono tracking-wider text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-950/50 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <span>CREATING ORGANIZATION TENANT...</span>
              ) : (
                <>
                  <span>REGISTER ORGANIZATION & LAUNCH</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-400 border-t border-zinc-800 pt-4">
            Already have an active account?{' '}
            <button
              onClick={onNavigateToLogin}
              className="text-red-400 hover:text-red-300 font-bold font-mono transition-colors cursor-pointer"
            >
              Sign In to Tenant Portal
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-900 py-4 px-6 text-center text-[11px] font-mono text-zinc-400">
        © {new Date().getFullYear()} KSPL ITAM Enterprise SaaS Platform. All rights reserved.
      </footer>
    </div>
  );
};

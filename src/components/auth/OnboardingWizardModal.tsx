import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  ArrowRight,
  X,
  Sparkles,
  Globe2,
  DollarSign,
  Clock,
  Layers,
} from 'lucide-react';

interface OnboardingWizardModalProps {
  organizationName: string;
  onComplete: (data: any) => void;
  onSkip: () => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  organizationName,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  const [stepData, setStepData] = useState({
    companyName: organizationName || 'My Enterprise Corp',
    region: 'US',
    currency: 'USD ($)',
    timezone: 'America/New_York (UTC-5)',
    primaryLocationName: 'HQ Data Center & Office',
    primaryLocationCity: 'New York',
    departmentName: 'Enterprise Infrastructure & Cloud',
    inviteEmails: 'colleague@enterprise.com',
    enableDiscovery: true,
  });

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(stepData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans selection:bg-red-600 selection:text-white">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-black p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 text-white p-2 rounded font-black font-mono tracking-wider text-xs">
              KSPL
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                FIRST-TIME TENANT ONBOARDING WIZARD
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono">
                STEP {currentStep} OF 7 — {getStepTitle(currentStep)}
              </p>
            </div>
          </div>

          <button
            onClick={onSkip}
            className="text-xs font-mono font-bold text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
          >
            SKIP ONBOARDING
          </button>
        </div>

        {/* Step Progress Indicator Bar */}
        <div className="w-full bg-zinc-900 h-1.5 flex">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div
              key={step}
              className={`flex-1 h-full transition-all ${
                step <= currentStep ? 'bg-red-600' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-red-500 mb-2">
                <Building2 className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Organization Profile</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Confirm your enterprise tenant details to configure default reporting currency and time zone settings.
              </p>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={stepData.companyName}
                  onChange={(e) => setStepData({ ...stepData, companyName: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">
                    Operating Currency
                  </label>
                  <select
                    value={stepData.currency}
                    onChange={(e) => setStepData({ ...stepData, currency: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="INR (₹)">INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">
                    System Time Zone
                  </label>
                  <input
                    type="text"
                    value={stepData.timezone}
                    onChange={(e) => setStepData({ ...stepData, timezone: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-red-500 mb-2">
                <Layers className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">ITAM & CMDB Configuration</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Select default asset tags and auto-reconciliation preferences.
              </p>

              <div className="bg-black border border-zinc-800 p-4 rounded space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-red-600 bg-black border-zinc-700 rounded"
                  />
                  <span className="text-xs text-white font-mono">Auto-generate QR / Barcode Asset Tags for hardware</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-red-600 bg-black border-zinc-700 rounded"
                  />
                  <span className="text-xs text-white font-mono">Enable automatic Software Normalization catalog mapping</span>
                </label>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-red-500 mb-2">
                <MapPin className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Add Primary Location / Data Center</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Assets and configuration items require physical or cloud locations.
              </p>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  value={stepData.primaryLocationName}
                  onChange={(e) => setStepData({ ...stepData, primaryLocationName: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">
                  City / Region
                </label>
                <input
                  type="text"
                  value={stepData.primaryLocationCity}
                  onChange={(e) => setStepData({ ...stepData, primaryLocationCity: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-red-500 mb-2">
                <Building2 className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Add Initial Department</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Assign cost centers and asset ownership to departments.
              </p>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={stepData.departmentName}
                  onChange={(e) => setStepData({ ...stepData, departmentName: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-red-500 mb-2">
                <Users className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Invite Team Members</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Invite IT Asset Managers, Field Technicians, and Auditors to your tenant.
              </p>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 mb-1">
                  Work Email Addresses (comma separated)
                </label>
                <textarea
                  rows={3}
                  value={stepData.inviteEmails}
                  onChange={(e) => setStepData({ ...stepData, inviteEmails: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded p-3 text-xs text-white font-mono"
                />
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-red-500 mb-2">
                <Search className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Discovery & Agent Setup</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Enable automated agentless discovery scans and endpoint agent registration.
              </p>

              <div className="bg-black border border-zinc-800 p-4 rounded space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stepData.enableDiscovery}
                    onChange={(e) => setStepData({ ...stepData, enableDiscovery: e.target.checked })}
                    className="w-4 h-4 text-red-600 bg-black border-zinc-700 rounded"
                  />
                  <span className="text-xs text-white font-mono">
                    Schedule initial Subnet Discovery Scan (10.100.0.0/24) upon portal entry
                  </span>
                </label>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-red-950/80 border border-red-800 rounded-full flex items-center justify-center text-red-500 mx-auto shadow-xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Tenant Onboarding Complete!</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Your organization workspace <span className="text-white font-bold font-mono">{stepData.companyName}</span> is configured and ready for production IT asset management.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-black p-4 border-t border-zinc-800 flex items-center justify-between">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-4 py-2 text-xs font-mono font-bold text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            ← PREVIOUS
          </button>

          <div className="flex items-center space-x-3">
            {currentStep < 7 && (
              <button
                onClick={handleNext}
                className="px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
              >
                Skip This Step
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-6 py-2 text-xs font-bold font-mono tracking-wider text-white bg-red-600 hover:bg-red-500 rounded shadow-md cursor-pointer flex items-center space-x-1.5"
            >
              <span>{currentStep === 7 ? 'LAUNCH DASHBOARD' : 'CONTINUE →'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return 'ORGANIZATION SETUP';
    case 2:
      return 'ITAM CONFIGURATION';
    case 3:
      return 'LOCATION SETUP';
    case 4:
      return 'DEPARTMENT SETUP';
    case 5:
      return 'INVITE TEAM MEMBERS';
    case 6:
      return 'DISCOVERY & AGENT';
    case 7:
      return 'FINISH';
    default:
      return '';
  }
}

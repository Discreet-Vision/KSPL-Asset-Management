import React, { useState } from 'react';
import { 
  Flag, ToggleLeft, ToggleRight, Sliders, Shield, RefreshCw, 
  CheckCircle2, AlertTriangle, Activity, Server, ArrowRight,
  Layers, Lock, Users, Building, Percent, Clock, RotateCcw
} from 'lucide-react';
import { featureFlagClient } from './FeatureFlagClient';
import { FeatureFlag, BlueGreenStatus, ReleaseAuditLog, FlagProvider } from './types';

export const FeatureDeliveryDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flags' | 'bluegreen' | 'audits' | 'providers'>('flags');
  const [flags, setFlags] = useState<FeatureFlag[]>(featureFlagClient.getAllFlags());
  const [provider, setProvider] = useState<FlagProvider>(featureFlagClient.getProvider());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [blueGreen, setBlueGreen] = useState<BlueGreenStatus>({
    activeEnvironment: 'BLUE',
    blueVersion: '2026.8.0-stable',
    blueReplicas: 5,
    blueHealth: 'Healthy',
    greenVersion: '2026.8.1-rc2',
    greenReplicas: 5,
    greenHealth: 'Healthy',
    trafficSplitRatio: { blue: 90, green: 10 },
    autoRollbackTriggered: false,
    lastTrafficSwitchAt: '2026-08-11 05:45:10 UTC'
  });

  const [auditLogs, setAuditLogs] = useState<ReleaseAuditLog[]>([
    {
      id: 'audit-101',
      timestamp: '10 mins ago',
      action: 'TRAFFIC_SWITCHED',
      actor: 'DevOps Release Manager',
      targetKey: 'production-ingress',
      details: 'Shifted 10% production traffic to GREEN (2026.8.1-rc2)',
      environment: 'production'
    },
    {
      id: 'audit-100',
      timestamp: '1 hour ago',
      action: 'FLAG_TOGGLED',
      actor: 'SecOps Team',
      targetKey: 'new_cmdb_dashboard',
      details: 'Enabled tenant-targeted rollout for tenant-kspl-global',
      environment: 'production'
    },
    {
      id: 'audit-099',
      timestamp: '3 hours ago',
      action: 'TARGETING_UPDATED',
      actor: 'Product Lead',
      targetKey: 'new_discovery_engine',
      details: 'Increased percentage rollout from 10% to 25%',
      environment: 'production'
    }
  ]);

  const toggleFlag = (flagKey: string) => {
    const flag = flags.find(f => f.key === flagKey);
    if (!flag) return;

    const updated = featureFlagClient.updateFlag(flagKey, { enabled: !flag.enabled });
    if (updated) {
      setFlags(featureFlagClient.getAllFlags());
      const newAudit: ReleaseAuditLog = {
        id: `audit-${Date.now()}`,
        timestamp: 'Just now',
        action: 'FLAG_TOGGLED',
        actor: 'Admin Operator',
        targetKey: flagKey,
        details: `Toggled flag status to ${!flag.enabled ? 'ENABLED' : 'DISABLED'}`,
        environment: flag.environment
      };
      setAuditLogs([newAudit, ...auditLogs]);
      showNotification(`Feature flag '${flagKey}' is now ${!flag.enabled ? 'ENABLED' : 'DISABLED'}.`);
    }
  };

  const updateRolloutPercentage = (flagKey: string, newPercentage: number) => {
    const updated = featureFlagClient.updateFlag(flagKey, { rolloutPercentage: newPercentage });
    if (updated) {
      setFlags(featureFlagClient.getAllFlags());
      showNotification(`Rollout percentage for '${flagKey}' updated to ${newPercentage}%.`);
    }
  };

  const switchTrafficToGreen = () => {
    setBlueGreen(prev => ({
      ...prev,
      activeEnvironment: 'GREEN',
      trafficSplitRatio: { blue: 0, green: 100 },
      lastTrafficSwitchAt: 'Just now'
    }));
    const newAudit: ReleaseAuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: 'Just now',
      action: 'TRAFFIC_SWITCHED',
      actor: 'Release Coordinator',
      targetKey: 'production-router',
      details: 'Switched 100% production traffic from BLUE to GREEN environment',
      environment: 'production'
    };
    setAuditLogs([newAudit, ...auditLogs]);
    showNotification('Zero-Downtime Traffic Switch completed: 100% traffic directed to GREEN release.');
  };

  const executeInstantRollback = () => {
    setBlueGreen(prev => ({
      ...prev,
      activeEnvironment: 'BLUE',
      trafficSplitRatio: { blue: 100, green: 0 },
      autoRollbackTriggered: true,
      rollbackReason: 'Operator initiated instant zero-downtime rollback',
      lastTrafficSwitchAt: 'Just now'
    }));
    const newAudit: ReleaseAuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: 'Just now',
      action: 'BLUE_GREEN_ROLLBACK',
      actor: 'SecOps Automated Safeguard',
      targetKey: 'production-router',
      details: 'Executed emergency rollback: 100% traffic restored to BLUE stable baseline',
      environment: 'production'
    };
    setAuditLogs([newAudit, ...auditLogs]);
    showNotification('EMERGENCY ROLLBACK COMPLETED: Production traffic restored to BLUE baseline.');
  };

  const changeProvider = (newProvider: FlagProvider) => {
    featureFlagClient.setProvider(newProvider);
    setProvider(newProvider);
    showNotification(`Feature flag management provider switched to ${newProvider}.`);
  };

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 rounded-none shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900/60 pb-4 mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 rounded-none animate-pulse" />
            <h1 className="text-xl font-bold tracking-wider uppercase text-white">Feature Delivery & Release Management</h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 uppercase font-mono">
              Provider: {provider}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Zero-Downtime Blue-Green Deployment Control • Granular Tenant/Role Feature Flags • Fail-Safe Rollbacks
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950">
          {(['flags', 'bluegreen', 'audits', 'providers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {tab === 'flags' ? 'Feature Flags' : tab === 'bluegreen' ? 'Blue-Green Router' : tab === 'audits' ? 'Release Audit' : 'Providers'}
            </button>
          ))}
        </div>
      </div>

      {/* Status Message Notification */}
      {statusMessage && (
        <div className="mb-6 p-3 bg-red-950/80 border border-red-700 text-red-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-red-500" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Tab 1: Feature Flags Management */}
      {activeTab === 'flags' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
              <Flag className="w-4 h-4 text-red-600" />
              <span>Targeted Feature Flag Registry</span>
            </h2>
            <span className="text-neutral-400 text-[10px]">Environment: Production</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {flags.map((flag) => (
              <div key={flag.key} className="bg-neutral-950 border border-neutral-800 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{flag.name}</span>
                      <span className="text-[10px] bg-black text-neutral-400 px-2 py-0.5 border border-neutral-800">
                        {flag.key}
                      </span>
                      <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 border border-red-900">
                        Type: {flag.type}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-[11px] mt-1">{flag.description}</p>
                  </div>

                  <button
                    onClick={() => toggleFlag(flag.key)}
                    className={`flex items-center space-x-2 px-4 py-2 border text-xs font-bold uppercase transition-colors ${
                      flag.enabled
                        ? 'bg-red-600 border-red-500 text-white hover:bg-red-700'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {flag.enabled ? <ToggleRight className="w-5 h-5 text-white" /> : <ToggleLeft className="w-5 h-5 text-neutral-500" />}
                    <span>{flag.enabled ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {/* Tenant Targeting */}
                  <div className="bg-black border border-neutral-800 p-3">
                    <div className="text-neutral-400 text-[10px] uppercase flex items-center space-x-1 mb-1">
                      <Building className="w-3 h-3 text-red-500" />
                      <span>Targeted Enterprise Tenants</span>
                    </div>
                    <div className="text-white text-[11px]">
                      {flag.enabledTenants.length > 0 ? flag.enabledTenants.join(', ') : 'All Tenants (Default)'}
                    </div>
                  </div>

                  {/* Role Targeting */}
                  <div className="bg-black border border-neutral-800 p-3">
                    <div className="text-neutral-400 text-[10px] uppercase flex items-center space-x-1 mb-1">
                      <Users className="w-3 h-3 text-white" />
                      <span>Role Availability</span>
                    </div>
                    <div className="text-white text-[11px]">
                      {flag.enabledRoles.length > 0 ? flag.enabledRoles.join(', ') : 'All RBAC Roles'}
                    </div>
                  </div>

                  {/* Rollout Percentage Slider */}
                  <div className="bg-black border border-neutral-800 p-3">
                    <div className="flex justify-between items-center text-neutral-400 text-[10px] uppercase mb-1">
                      <span className="flex items-center space-x-1">
                        <Percent className="w-3 h-3 text-red-500" />
                        <span>Gradual Rollout Ratio</span>
                      </span>
                      <span className="text-white font-bold">{flag.rolloutPercentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={flag.rolloutPercentage}
                      onChange={(e) => updateRolloutPercentage(flag.key, parseInt(e.target.value))}
                      className="w-full accent-red-600 bg-neutral-900 h-1.5 rounded-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Blue-Green Deployment Router */}
      {activeTab === 'bluegreen' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
              <Server className="w-4 h-4 text-red-600" />
              <span>Blue-Green Zero-Downtime Traffic Controller</span>
            </h2>
            <span className="text-neutral-400 text-[10px]">Last Switch: {blueGreen.lastTrafficSwitchAt}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blue Environment Card */}
            <div className={`p-5 border ${blueGreen.activeEnvironment === 'BLUE' ? 'bg-neutral-950 border-red-600' : 'bg-black border-neutral-800'}`}>
              <div className="flex justify-between items-center mb-3 border-b border-neutral-800 pb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 ${blueGreen.activeEnvironment === 'BLUE' ? 'bg-red-600' : 'bg-neutral-600'}`} />
                  <span className="font-bold text-sm text-white">BLUE ENVIRONMENT (Stable)</span>
                </div>
                <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-neutral-300">
                  Traffic: {blueGreen.trafficSplitRatio.blue}%
                </span>
              </div>

              <div className="space-y-2 text-neutral-300">
                <div><span className="text-neutral-500">Image Version:</span> <span className="text-white font-bold">{blueGreen.blueVersion}</span></div>
                <div><span className="text-neutral-500">Active Pod Replicas:</span> <span className="text-white">{blueGreen.blueReplicas}</span></div>
                <div><span className="text-neutral-500">Cluster Health Status:</span> <span className="text-white">{blueGreen.blueHealth}</span></div>
              </div>
            </div>

            {/* Green Environment Card */}
            <div className={`p-5 border ${blueGreen.activeEnvironment === 'GREEN' ? 'bg-neutral-950 border-red-600' : 'bg-black border-neutral-800'}`}>
              <div className="flex justify-between items-center mb-3 border-b border-neutral-800 pb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 ${blueGreen.activeEnvironment === 'GREEN' ? 'bg-red-600' : 'bg-neutral-600'}`} />
                  <span className="font-bold text-sm text-white">GREEN ENVIRONMENT (New Release)</span>
                </div>
                <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-neutral-300">
                  Traffic: {blueGreen.trafficSplitRatio.green}%
                </span>
              </div>

              <div className="space-y-2 text-neutral-300">
                <div><span className="text-neutral-500">Image Version:</span> <span className="text-white font-bold">{blueGreen.greenVersion}</span></div>
                <div><span className="text-neutral-500">Active Pod Replicas:</span> <span className="text-white">{blueGreen.greenReplicas}</span></div>
                <div><span className="text-neutral-500">Cluster Health Status:</span> <span className="text-white">{blueGreen.greenHealth}</span></div>
              </div>
            </div>
          </div>

          {/* Traffic Switch Actions */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-white font-bold text-sm">Traffic Orchestration Actions</div>
              <div className="text-neutral-400 text-[11px] mt-0.5">
                Switching traffic redirects ingress routing without dropping active user TCP connections.
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={switchTrafficToGreen}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase transition-colors"
              >
                Promote 100% Traffic to Green
              </button>
              <button
                onClick={executeInstantRollback}
                className="px-4 py-2 bg-black border border-red-700 text-red-400 hover:bg-red-950 font-bold uppercase transition-colors flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                <span>Instant Rollback to Blue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Release Audit Logs */}
      {activeTab === 'audits' && (
        <div className="space-y-4 font-mono text-xs">
          <h2 className="text-sm font-bold uppercase text-white mb-3">Release & Feature Delivery Audit Trail</h2>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-neutral-950 border border-neutral-800 p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="text-[10px] bg-black text-neutral-400 border border-neutral-800 px-1.5 py-0.5">
                      {log.targetKey}
                    </span>
                    <span className="text-[10px] text-neutral-500">{log.environment}</span>
                  </div>
                  <div className="text-neutral-300 text-[11px] mt-1">{log.details}</div>
                </div>

                <div className="text-right text-[10px] text-neutral-500">
                  <div>{log.actor}</div>
                  <div>{log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Provider Selection */}
      {activeTab === 'providers' && (
        <div className="space-y-4 font-mono text-xs">
          <h2 className="text-sm font-bold uppercase text-white mb-3">Feature Flag Provider Engine Abstraction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => changeProvider('LaunchDarkly')}
              className={`p-5 border cursor-pointer ${
                provider === 'LaunchDarkly' ? 'bg-neutral-950 border-red-600' : 'bg-black border-neutral-800'
              }`}
            >
              <div className="text-white font-bold text-sm mb-1">LaunchDarkly Provider</div>
              <div className="text-neutral-400 text-[11px]">
                Enterprise LaunchDarkly SDK wrapper with server-side streaming and local memory fallbacks.
              </div>
            </div>

            <div
              onClick={() => changeProvider('Unleash')}
              className={`p-5 border cursor-pointer ${
                provider === 'Unleash' ? 'bg-neutral-950 border-red-600' : 'bg-black border-neutral-800'
              }`}
            >
              <div className="text-white font-bold text-sm mb-1">Unleash Provider</div>
              <div className="text-neutral-400 text-[11px]">
                Open-source Unleash Edge proxy integration with tenant-aware sticky targeting strategy.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

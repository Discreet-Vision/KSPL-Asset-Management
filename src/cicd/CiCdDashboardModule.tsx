import React, { useState } from 'react';
import { 
  GitBranch, RefreshCw, CheckCircle2, AlertTriangle, 
  Layers, ShieldCheck, Terminal, Activity, RotateCcw, 
  Server, Clock, ArrowUpRight
} from 'lucide-react';

interface BuildRun {
  id: string;
  commit: string;
  author: string;
  branch: string;
  status: 'SUCCESS' | 'RUNNING' | 'FAILED';
  duration: string;
  timestamp: string;
  pipeline: 'GitHub Actions' | 'GitLab CI';
}

interface ArgoApp {
  name: string;
  environment: string;
  syncStatus: 'Synced' | 'OutOfSync' | 'Syncing';
  healthStatus: 'Healthy' | 'Progressing' | 'Degraded';
  revision: string;
  canaryStep: string;
}

export const CiCdDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pipelines' | 'argocd' | 'dora'>('overview');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const builds: BuildRun[] = [
    { id: 'build-#8492', commit: '3a8f912', author: 'DevOps Bot', branch: 'main', status: 'SUCCESS', duration: '2m 14s', timestamp: '10 mins ago', pipeline: 'GitHub Actions' },
    { id: 'build-#8491', commit: '81b7e41', author: 'Lead Arch', branch: 'release/2026.8', status: 'SUCCESS', duration: '3m 05s', timestamp: '1 hour ago', pipeline: 'GitHub Actions' },
    { id: 'build-#8490', commit: 'f901c22', author: 'SecOps Team', branch: 'patch/cve-scan', status: 'FAILED', duration: '1m 45s', timestamp: '3 hours ago', pipeline: 'GitLab CI' },
    { id: 'build-#8489', commit: '0092da1', author: 'DevOps Bot', branch: 'develop', status: 'SUCCESS', duration: '2m 30s', timestamp: '5 hours ago', pipeline: 'GitHub Actions' }
  ];

  const argoApps: ArgoApp[] = [
    { name: 'itam-dev', environment: 'Development', syncStatus: 'Synced', healthStatus: 'Healthy', revision: '3a8f912', canaryStep: 'N/A' },
    { name: 'itam-staging', environment: 'Staging', syncStatus: 'Synced', healthStatus: 'Healthy', revision: '3a8f912', canaryStep: 'N/A' },
    { name: 'itam-production', environment: 'Production', syncStatus: 'Synced', healthStatus: 'Healthy', revision: '81b7e41', canaryStep: 'Canary 25% Traffic' }
  ];

  const triggerArgoSync = (appName: string) => {
    setIsSyncing(true);
    setSyncMessage(`Initiating GitOps reconciliation for ${appName}...`);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage(`Reconciliation completed. ${appName} synchronized with Git source of truth.`);
      setTimeout(() => setSyncMessage(null), 4000);
    }, 1800);
  };

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 rounded-none shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900/60 pb-4 mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 rounded-none animate-pulse" />
            <h1 className="text-xl font-bold tracking-wider uppercase text-white">CI/CD & GitOps Control Hub</h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 uppercase font-mono">
              Argo CD + GitHub Actions
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Automated Builds • Vulnerability Scans • Progressive Canary Rollouts • Infrastructure Reconciliation
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950">
          {(['overview', 'pipelines', 'argocd', 'dora'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {syncMessage && (
        <div className="mb-6 p-3 bg-red-950/80 border border-red-700 text-red-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RefreshCw className={`w-4 h-4 text-red-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{syncMessage}</span>
          </div>
        </div>
      )}

      {/* DORA Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-950 border border-neutral-800 p-4">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-mono mb-1">
            <span>DEPLOYMENT FREQUENCY</span>
            <Activity className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">14.2 / day</div>
          <div className="text-[10px] text-red-500 font-mono mt-1">High Performing Elite</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-4">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-mono mb-1">
            <span>LEAD TIME FOR CHANGES</span>
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">18 mins</div>
          <div className="text-[10px] text-neutral-400 font-mono mt-1">Commit to Pod Ready</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-4">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-mono mb-1">
            <span>CHANGE FAILURE RATE</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-500">0.8%</div>
          <div className="text-[10px] text-neutral-400 font-mono mt-1">Auto Canary Rollback Protected</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-4">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-mono mb-1">
            <span>MEAN TIME TO RECOVER</span>
            <RotateCcw className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">&lt; 2 mins</div>
          <div className="text-[10px] text-neutral-400 font-mono mt-1">Instant Argo CD Rollback</div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Argo CD Cluster Applications */}
          <div className="bg-neutral-950 border border-neutral-800 p-5">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-red-600" />
                <h2 className="text-sm font-bold font-mono uppercase text-white">GitOps Target Environments</h2>
              </div>
              <span className="text-[10px] bg-neutral-900 text-neutral-400 px-2 py-0.5 border border-neutral-800 font-mono">
                Source: gitops/environments/
              </span>
            </div>

            <div className="space-y-3">
              {argoApps.map((app) => (
                <div key={app.name} className="bg-black border border-neutral-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-bold text-white">{app.name}</span>
                      <span className="text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 font-mono">
                        {app.environment}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-neutral-400 mt-1">
                      Revision: <span className="text-white">{app.revision}</span> • Strategy: <span className="text-red-400">{app.canaryStep}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right font-mono">
                      <div className="text-xs text-white font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500 inline" />
                        <span>{app.syncStatus}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500">{app.healthStatus}</div>
                    </div>
                    <button
                      onClick={() => triggerArgoSync(app.name)}
                      disabled={isSyncing}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase transition-colors"
                    >
                      Sync Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent CI Pipeline Runs */}
          <div className="bg-neutral-950 border border-neutral-800 p-5">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-red-600" />
                <h2 className="text-sm font-bold font-mono uppercase text-white">Recent Build Runs</h2>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">GitHub Actions / GitLab</span>
            </div>

            <div className="space-y-3">
              {builds.map((b) => (
                <div key={b.id} className="bg-black border border-neutral-800 p-3.5 flex items-center justify-between font-mono text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{b.id}</span>
                      <span className="text-[10px] text-neutral-400 bg-neutral-900 px-1.5 py-0.5 border border-neutral-800">{b.branch}</span>
                      <span className="text-[10px] text-neutral-500">{b.commit}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-1">
                      {b.pipeline} • {b.author} • {b.duration}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {b.status === 'SUCCESS' ? (
                      <span className="bg-neutral-900 text-white border border-neutral-700 px-2 py-0.5 text-[10px] font-bold">
                        PASSED
                      </span>
                    ) : (
                      <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 text-[10px] font-bold">
                        FAILED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pipelines' && (
        <div className="bg-neutral-950 border border-neutral-800 p-5 font-mono text-xs">
          <h2 className="text-sm font-bold uppercase text-white mb-3">CI Pipeline Execution Steps</h2>
          <p className="text-neutral-400 mb-4">
            Workflow: <span className="text-red-400">.github/workflows/ci.yml</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { step: '1. Code Checkout', detail: 'actions/checkout@v4' },
              { step: '2. Node.js & Python Setup', detail: 'npm ci / pip install' },
              { step: '3. ESLint & Static Audit', detail: 'npm run lint && npm audit' },
              { step: '4. Service Unit Testing', detail: 'python3 -m unittest' },
              { step: '5. Helm Chart Linting', detail: 'helm lint ./helm/itam' },
              { step: '6. Docker Multi-Stage Build', detail: 'docker build & scan' },
              { step: '7. Container Security Scan', detail: 'Trivy / Snyk Scan' },
              { step: '8. Push to Registry', detail: 'ghcr.io image tag' },
              { step: '9. GitOps Release Commit', detail: 'gitops/values.yaml update' }
            ].map((st, i) => (
              <div key={i} className="bg-black border border-neutral-800 p-3 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">{st.step}</div>
                  <div className="text-[10px] text-neutral-500">{st.detail}</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-red-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'argocd' && (
        <div className="bg-neutral-950 border border-neutral-800 p-5 font-mono text-xs">
          <h2 className="text-sm font-bold uppercase text-white mb-3">Argo CD GitOps Reconciler</h2>
          <div className="bg-black border border-neutral-800 p-4 text-neutral-300 space-y-2">
            <div><span className="text-red-500">Repository URL:</span> https://github.com/enterprise-org/itam-saas.git</div>
            <div><span className="text-red-500">GitOps Manifest Directory:</span> /gitops/environments/production</div>
            <div><span className="text-red-500">Rollout Strategy:</span> Argo Rollouts Progressive Canary (10% -&gt; 25% -&gt; 50% -&gt; 100%)</div>
            <div><span className="text-red-500">Auto Self-Healing:</span> Enabled</div>
            <div><span className="text-red-500">Prune Outdated Objects:</span> Safeguarded for Production</div>
          </div>
        </div>
      )}

      {activeTab === 'dora' && (
        <div className="bg-neutral-950 border border-neutral-800 p-5 font-mono text-xs text-neutral-300 space-y-3">
          <h2 className="text-sm font-bold uppercase text-white">DevOps DORA Performance Metrics</h2>
          <p>
            Metrics collected automatically from GitHub Actions pipeline events and Argo CD deployment webhooks.
          </p>
          <div className="bg-black border border-neutral-800 p-4">
            <div className="text-white font-bold mb-1">Status: Elite Performance Standard</div>
            <div className="text-neutral-400">
              All 4 DORA metrics fall in the top 5th percentile of enterprise SaaS deployments.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

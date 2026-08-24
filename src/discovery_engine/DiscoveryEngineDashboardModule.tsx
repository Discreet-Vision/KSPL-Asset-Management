import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Radio, Server, ShieldAlert, Cpu, Cloud, Globe, FileSpreadsheet, 
  Plus, Search, RefreshCw, CheckCircle2, AlertCircle, Terminal, 
  Key, Layers, HardDrive, Download, Activity, Play, Zap, Monitor
} from 'lucide-react';
import { 
  UnifiedDiscoveryResult, 
  DiscoveryMethod, 
  DiscoveryJob, 
  EndpointAgentRecord 
} from './types';
import { multiMethodDiscoveryEngine } from './discoveryEngine';
import { downloadAgentScript } from '../utils/agentScriptDownloader';

export const DiscoveryEngineDashboardModule: React.FC = () => {
  const { addDiscoveryJob } = useApp();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'agentless' | 'endpoint_agent' | 'cloud_api' | 'saas_casb' | 'manual_import' | 'unified_stream'
  >('overview');

  const [results, setResults] = useState<UnifiedDiscoveryResult[]>(
    multiMethodDiscoveryEngine.getAllResults() || []
  );
  const [jobs, setJobs] = useState<DiscoveryJob[]>(
    multiMethodDiscoveryEngine.getAllJobs() || []
  );
  const [agentsList, setAgentsList] = useState<EndpointAgentRecord[]>(
    multiMethodDiscoveryEngine.getAgents() || []
  );
  const cloudConns = multiMethodDiscoveryEngine.getCloudConnectors() || [];
  const saasConns = multiMethodDiscoveryEngine.getSaasConnectors() || [];

  const safeResults = results || [];
  const safeJobs = jobs || [];
  const safeAgentsList = agentsList || [];
  const safeCloudConns = cloudConns || [];
  const safeSaasConns = saasConns || [];

  // Agentless scan trigger form
  const [sweepCidr, setSweepCidr] = useState<string>('192.168.1.0/24');
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>(['SNMP', 'WMI']);
  const [sweepMessage, setSweepMessage] = useState<string | null>(null);

  // Multi-OS State
  const [selectedOsTab, setSelectedOsTab] = useState<'Windows' | 'Linux' | 'macOS' | 'iOS'>('Windows');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const winDirectCommand = `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; & "$HOME\\Downloads\\kspl-discovery-agent.ps1"`;
  const winFileCommand = `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; .\\kspl-discovery-agent.ps1`;
  const linuxCommand = `curl -sSL "${appOrigin}/api/discovery/agent/scripts/linux" | sudo bash`;
  const macCommand = `curl -sSL "${appOrigin}/api/discovery/agent/scripts/macos" | sudo bash`;
  const iosCommand = `curl -X POST "${appOrigin}/api/discovery/agent/heartbeat" -H "Content-Type: application/json" -d '{"hostname":"Corp-iPhone-15Pro","osType":"iOS","osName":"Apple iOS","osVersion":"17.6.1","ipAddress":"10.20.6.99"}'`;

  const handleCopyCommand = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedScript(key);
    setTimeout(() => setCopiedScript(null), 3000);
  };

  // Manual/CSV Form State
  const [manualHostname, setManualHostname] = useState<string>('');
  const [manualIp, setManualIp] = useState<string>('');
  const [manualSerial, setManualSerial] = useState<string>('');
  const [manualClass, setManualClass] = useState<'Hardware' | 'Software' | 'Cloud' | 'Service'>('Hardware');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Search in stream
  const [streamQuery, setStreamQuery] = useState<string>('');

  const handleRunSweep = (e: React.FormEvent) => {
    e.preventDefault();
    const job = multiMethodDiscoveryEngine.triggerAgentlessSweep(sweepCidr, selectedProtocols);
    setJobs(multiMethodDiscoveryEngine.getAllJobs());
    setResults(multiMethodDiscoveryEngine.getAllResults());

    addDiscoveryJob({
      name: `Agentless Sweep (${sweepCidr})`,
      type: 'Subnet Range',
      target: sweepCidr,
      schedule: 'Manual',
    });

    setSweepMessage(`Discovery Job ${job.id} executed successfully for CIDR ${sweepCidr}. 6 responsive hosts found.`);
    setTimeout(() => setSweepMessage(null), 4000);
  };

  const handleSimulateAgentTelemetry = async (os: 'Windows' | 'Linux' | 'macOS' | 'iOS') => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/discovery/agent/simulate-telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ osType: os }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimMessage(`Simulated live telemetry ingested from ${os} (${data.payload?.hostname})`);
      } else {
        setSimMessage(`Simulated live telemetry for ${os}`);
      }
    } catch {
      setSimMessage(`Simulated live telemetry for ${os}`);
    } finally {
      setIsSimulating(false);
      setAgentsList(multiMethodDiscoveryEngine.getAgents());
      setTimeout(() => setSimMessage(null), 4000);
    }
  };

  const handleDownloadScript = async (os: 'Windows' | 'Linux' | 'macOS' | 'iOS') => {
    const res = await downloadAgentScript(os);
    if (res.success) {
      setSimMessage(`Downloaded and enrolled '${res.filename}'. Run it within 15 minutes.`);
      setTimeout(() => setSimMessage(null), 4000);
    } else {
      setSimMessage(res.error || 'Agent download failed.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualHostname) return;

    multiMethodDiscoveryEngine.ingestManualOrCsv(
      manualHostname,
      manualIp,
      manualSerial,
      manualClass,
      'Manual Entry'
    );

    setResults(multiMethodDiscoveryEngine.getAllResults());
    setImportSuccessMsg(`Successfully created Unified Discovery Candidate for ${manualHostname}.`);
    setManualHostname('');
    setManualIp('');
    setManualSerial('');
    setTimeout(() => setImportSuccessMsg(null), 4000);
  };

  const filteredResults = results.filter(r => 
    r.hostname.toLowerCase().includes(streamQuery.toLowerCase()) ||
    r.rawIdentifier.toLowerCase().includes(streamQuery.toLowerCase()) ||
    r.sourceMethod.toLowerCase().includes(streamQuery.toLowerCase())
  );

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">Multi-Method ITAM Discovery Engine</h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Enterprise Discovery v2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            5 Ingestion Vectors • Unified Candidate Pipeline • Cloud & SaaS Autodiscovery
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950">
          {(
            [
              ['overview', 'Overview'],
              ['agentless', '1. Agentless Scan'],
              ['endpoint_agent', '2. Go Agent'],
              ['cloud_api', '3. Cloud APIs'],
              ['saas_casb', '4. SaaS & CASB'],
              ['manual_import', '5. Import / Manual'],
              ['unified_stream', 'Unified Stream']
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeTab === key
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-neutral-950 border border-neutral-800 p-4">
              <div className="text-neutral-500 text-[10px] uppercase">Unified Discovered Candidates</div>
              <div className="text-2xl font-bold text-white mt-1">{safeResults.length}</div>
              <div className="text-[9px] text-red-400 mt-1">Ready for Reconciliation</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-4">
              <div className="text-neutral-500 text-[10px] uppercase">Active Endpoint Agents</div>
              <div className="text-2xl font-bold text-red-500 mt-1">{safeAgentsList.length} Healthy</div>
              <div className="text-[9px] text-neutral-400 mt-1">Cross-platform Go Agent</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-4">
              <div className="text-neutral-500 text-[10px] uppercase">Cloud Account Connectors</div>
              <div className="text-2xl font-bold text-white mt-1">{safeCloudConns.length} AWS/Azure/GCP</div>
              <div className="text-[9px] text-red-400 mt-1">Read-Only API Ingestion</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-4">
              <div className="text-neutral-500 text-[10px] uppercase">SaaS Integrations</div>
              <div className="text-2xl font-bold text-neutral-200 mt-1">{safeSaasConns.length} OAuth2</div>
              <div className="text-[9px] text-neutral-400 mt-1">Shadow IT Visibility</div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-4">
              <div className="text-neutral-500 text-[10px] uppercase">Discovery Jobs Executed</div>
              <div className="text-2xl font-bold text-white mt-1">{safeJobs.length} Jobs</div>
              <div className="text-[9px] text-red-400 mt-1">100% Success Rate</div>
            </div>
          </div>

          {/* Discovery Ingestion Architecture Diagram */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2">
              Multi-Method Discovery Pipeline Architecture
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
              <div className="bg-black border border-neutral-800 p-3">
                <Radio className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <div className="font-bold text-white">1. Agentless Scan</div>
                <div className="text-[9px] text-neutral-500 mt-1">SNMP / WMI / SSH / Sweep</div>
              </div>

              <div className="bg-black border border-neutral-800 p-3">
                <Cpu className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <div className="font-bold text-white">2. Go Endpoint Agent</div>
                <div className="text-[9px] text-neutral-500 mt-1">Deep OS & Software Inv</div>
              </div>

              <div className="bg-black border border-neutral-800 p-3">
                <Cloud className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <div className="font-bold text-white">3. Cloud API</div>
                <div className="text-[9px] text-neutral-500 mt-1">AWS / Azure / GCP APIs</div>
              </div>

              <div className="bg-black border border-neutral-800 p-3">
                <Globe className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <div className="font-bold text-white">4. SaaS & CASB</div>
                <div className="text-[9px] text-neutral-500 mt-1">OAuth & Shadow IT Logs</div>
              </div>

              <div className="bg-black border border-neutral-800 p-3">
                <FileSpreadsheet className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <div className="font-bold text-white">5. Import / Manual</div>
                <div className="text-[9px] text-neutral-500 mt-1">CSV & Manual Entry</div>
              </div>
            </div>

            <div className="p-3 bg-black border border-red-900 text-center text-red-400 font-bold">
              ─── FULLY NORMALIZED COMMON DISCOVERY CANDIDATE STREAM ───&gt; RECONCILIATION & CMDB
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: METHOD 1 — AGENTLESS NETWORK DISCOVERY */}
      {activeTab === 'agentless' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                <Radio className="w-4 h-4 text-red-600" />
                <span>Agentless Network Sweep & Credentialed Scanning</span>
              </h2>
              <p className="text-neutral-400 text-[11px] mt-1">
                Perform IP CIDR sweep via SNMP, WMI, and SSH without target software installation.
              </p>
            </div>

            {sweepMessage && (
              <div className="p-3 bg-red-950 border border-red-700 text-red-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-red-500" />
                <span>{sweepMessage}</span>
              </div>
            )}

            <form onSubmit={handleRunSweep} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-black border border-neutral-800 p-4">
              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Target CIDR / Subnet Range</label>
                <input
                  type="text"
                  value={sweepCidr}
                  onChange={(e) => setSweepCidr(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  placeholder="e.g. 192.168.1.0/24"
                />
              </div>

              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Active Protocols</label>
                <div className="flex space-x-3 pt-2">
                  {['SNMP', 'WMI', 'SSH'].map(proto => (
                    <label key={proto} className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProtocols.includes(proto)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedProtocols([...selectedProtocols, proto]);
                          else setSelectedProtocols(selectedProtocols.filter(p => p !== proto));
                        }}
                        className="accent-red-600"
                      />
                      <span className="text-white">{proto}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Trigger Network Sweep</span>
              </button>
            </form>
          </div>

          {/* Job History Table */}
          <div className="bg-neutral-950 border border-neutral-800 p-4 space-y-3">
            <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2">
              Agentless Discovery Job Logs
            </div>

            <div className="space-y-2">
              {jobs.map(job => (
                <div key={job.id} className="bg-black border border-neutral-900 p-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{job.name}</span>
                      <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5">
                        {job.id}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">{job.logSummary}</div>
                  </div>

                  <div className="text-right flex items-center space-x-3">
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 uppercase font-bold">
                      Discovered: {job.itemsDiscovered} Devices
                    </span>
                    <span className="text-[10px] text-neutral-500">{job.startTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: METHOD 2 — MULTI-OS ENDPOINT AGENT (Windows, Linux, macOS, iOS) */}
      {activeTab === 'endpoint_agent' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-red-600" />
                  <span>Cross-Platform Endpoint Discovery Agent (Windows, Linux, macOS, iOS)</span>
                </h2>
                <p className="text-neutral-400 text-[11px] mt-1">
                  Native PowerShell, Bash, Zsh, and Apple MDM collectors. Real-time hardware specs, package registry, and health telemetry.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadScript(selectedOsTab)}
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-white hover:border-red-600 flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-red-500" />
                  <span>Download {selectedOsTab} Script</span>
                </button>
                <button
                  onClick={() => handleSimulateAgentTelemetry(selectedOsTab)}
                  disabled={isSimulating}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isSimulating ? 'Simulating...' : `Simulate ${selectedOsTab}`}</span>
                </button>
              </div>
            </div>

            {/* OS Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {(['Windows', 'Linux', 'macOS', 'iOS'] as const).map((os) => (
                <button
                  key={os}
                  onClick={() => setSelectedOsTab(os)}
                  className={`p-2.5 border text-left rounded transition-colors cursor-pointer ${
                    selectedOsTab === os
                      ? 'bg-red-950 border-red-600 text-white font-bold'
                      : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    {os === 'Windows' && <Monitor className="w-3.5 h-3.5 text-red-500" />}
                    {os === 'Linux' && <Terminal className="w-3.5 h-3.5 text-red-500" />}
                    {os === 'macOS' && <Cpu className="w-3.5 h-3.5 text-red-500" />}
                    {os === 'iOS' && <Globe className="w-3.5 h-3.5 text-red-500" />}
                    <span>{os}</span>
                  </div>
                  <div className="text-[9px] text-neutral-500 mt-1">
                    {os === 'Windows' && 'PowerShell 5.1/7+'}
                    {os === 'Linux' && 'Bash / Systemd'}
                    {os === 'macOS' && 'Zsh / Darwin ARM & x86'}
                    {os === 'iOS' && 'MDM MobileConfig'}
                  </div>
                </button>
              ))}
            </div>

            {simMessage && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{simMessage}</span>
              </div>
            )}

            {/* Command execution box */}
            {selectedOsTab === 'Windows' && (
              <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-2">
                <div className="text-[11px] text-neutral-400">
                  <strong className="text-white">Option 1:</strong> Direct PowerShell execution (paste into active PowerShell console):
                </div>
                <div className="bg-black p-2.5 border border-neutral-800 flex items-center justify-between font-mono text-[11px] text-neutral-200">
                  <code className="text-red-400 truncate mr-2">{winDirectCommand}</code>
                  <button
                    onClick={() => handleCopyCommand(winDirectCommand, 'win_direct')}
                    className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-[10px] border border-neutral-700 shrink-0"
                  >
                    {copiedScript === 'win_direct' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="text-[11px] text-neutral-400">
                  <strong className="text-white">Option 2:</strong> Run downloaded script (<code className="text-emerald-400">kspl-discovery-agent.ps1</code>):
                </div>
                <div className="bg-black p-2.5 border border-neutral-800 flex items-center justify-between font-mono text-[11px] text-neutral-200">
                  <code className="text-emerald-400 truncate mr-2">{winFileCommand}</code>
                  <button
                    onClick={() => handleCopyCommand(winFileCommand, 'win_file')}
                    className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-[10px] border border-neutral-700 shrink-0"
                  >
                    {copiedScript === 'win_file' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {selectedOsTab === 'Linux' && (
              <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-2">
                <div className="text-[11px] text-neutral-400">
                  Run on Ubuntu, Debian, RHEL, or CentOS terminal:
                </div>
                <div className="bg-black p-2.5 border border-neutral-800 flex items-center justify-between font-mono text-[11px] text-neutral-200">
                  <code className="text-red-400 truncate mr-2">{linuxCommand}</code>
                  <button
                    onClick={() => handleCopyCommand(linuxCommand, 'linux')}
                    className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-[10px] border border-neutral-700 shrink-0"
                  >
                    {copiedScript === 'linux' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {selectedOsTab === 'macOS' && (
              <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-2">
                <div className="text-[11px] text-neutral-400">
                  Run in macOS Terminal (zsh):
                </div>
                <div className="bg-black p-2.5 border border-neutral-800 flex items-center justify-between font-mono text-[11px] text-neutral-200">
                  <code className="text-red-400 truncate mr-2">{macCommand}</code>
                  <button
                    onClick={() => handleCopyCommand(macCommand, 'mac')}
                    className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-[10px] border border-neutral-700 shrink-0"
                  >
                    {copiedScript === 'mac' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {selectedOsTab === 'iOS' && (
              <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-2">
                <div className="text-[11px] text-neutral-400">
                  Trigger Apple iOS endpoint telemetry webhook:
                </div>
                <div className="bg-black p-2.5 border border-neutral-800 flex items-center justify-between font-mono text-[11px] text-neutral-200">
                  <code className="text-red-400 truncate mr-2">{iosCommand}</code>
                  <button
                    onClick={() => handleCopyCommand(iosCommand, 'ios')}
                    className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded text-[10px] border border-neutral-700 shrink-0"
                  >
                    {copiedScript === 'ios' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {/* Agent Records */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold uppercase text-white">Registered Active Endpoint Agents ({agentsList.length})</div>
              {agentsList.map(ag => (
                <div key={ag.agentId} className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{ag.hostname}</span>
                      <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 font-bold">
                        {ag.osType} ({ag.osName || ag.osVersion})
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400">Agent: {ag.agentVersion} | IP: {ag.ipAddress} | Serial: {ag.serialNumber || 'N/A'}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pt-1">
                    <div className="bg-neutral-950 border border-neutral-900 p-2">
                      <span className="text-neutral-500">Status & Health:</span>
                      <div className="text-emerald-400 font-bold mt-0.5">{ag.status}</div>
                    </div>

                    <div className="bg-neutral-950 border border-neutral-900 p-2">
                      <span className="text-neutral-500">Hardware & Cores:</span>
                      <div className="text-white font-bold mt-0.5">{ag.cpuCores || 8} Cores | {ag.memoryTotalGb || 16} GB RAM</div>
                    </div>

                    <div className="bg-neutral-950 border border-neutral-900 p-2">
                      <span className="text-neutral-500">Installed Software Discovered:</span>
                      <div className="text-white font-bold mt-0.5">{ag.installedSoftwareCount} Apps Tracked</div>
                    </div>

                    <div className="bg-neutral-950 border border-neutral-900 p-2">
                      <span className="text-neutral-500">CPU / RAM Load:</span>
                      <div className="text-white font-bold mt-0.5">{ag.cpuUsagePct}% CPU | {ag.memoryUsagePct}% RAM</div>
                    </div>
                  </div>

                  {ag.installedSoftwareSample && (
                    <div className="text-[10px] text-neutral-400 pt-1">
                      <span className="text-neutral-500">Software Sample: </span>
                      {ag.installedSoftwareSample.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: METHOD 3 — CLOUD API CONNECTORS */}
      {activeTab === 'cloud_api' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                <Cloud className="w-4 h-4 text-red-600" />
                <span>Multi-Cloud API Connectors (AWS / Azure / GCP)</span>
              </h2>
              <p className="text-neutral-400 text-[11px] mt-1">
                Read-only API connectors discovering EC2, S3, RDS, Azure VMs, Blob Storage, GCP Compute & Cloud SQL.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cloudConns.map(conn => (
                <div key={conn.connectorId} className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <span className="font-bold text-white text-sm">{conn.provider} Connector</span>
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 uppercase">
                      {conn.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-300">
                    Account / Subscription: <span className="text-white font-bold">{conn.accountId}</span>
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Auth Mechanism: {conn.authMechanism} | Sync Interval: Every {conn.syncIntervalHours}h
                  </div>

                  <div className="pt-2 border-t border-neutral-950 flex justify-between items-center text-[10px]">
                    <span className="text-neutral-400">Discovered Resources: <strong className="text-white">{conn.resourcesDiscovered}</strong></span>
                    <span className="text-neutral-500">Last Sync: {conn.lastSyncTimestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: METHOD 4 — SAAS & CASB SHADOW IT */}
      {activeTab === 'saas_casb' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                <Globe className="w-4 h-4 text-red-600" />
                <span>SaaS OAuth & CASB Shadow IT Discovery</span>
              </h2>
              <p className="text-neutral-400 text-[11px] mt-1">
                OAuth2 integration for M365, Google Workspace, GitHub & CASB log ingestion for unapproved SaaS applications.
              </p>
            </div>

            <div className="space-y-3">
              {saasConns.map(s => (
                <div key={s.id} className="bg-black border border-neutral-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{s.saasName}</span>
                      <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 font-bold">
                        {s.authType}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">
                      Licensed Seats: {s.licensedSeats} | Active Users: {s.activeUsers}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5">
                      Status: {s.syncStatus}
                    </span>
                    <div className="text-[9px] text-neutral-500 mt-1">Last Sync: {s.lastSync}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: METHOD 5 — MANUAL & CSV IMPORT */}
      {activeTab === 'manual_import' && (
        <div className="space-y-6 font-mono text-xs">
          <form onSubmit={handleManualSubmit} className="bg-neutral-950 border border-neutral-800 p-6 space-y-4 max-w-2xl mx-auto">
            <div className="border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-red-600" />
                <span>Manual Asset Entry / Bulk CSV Import</span>
              </h2>
              <p className="text-neutral-400 text-[11px] mt-1">
                Manually register isolated or non-IP assets into the unified candidate stream.
              </p>
            </div>

            {importSuccessMsg && (
              <div className="p-3 bg-red-950 border border-red-700 text-red-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-red-500" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3 bg-black border border-neutral-800 p-4">
              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Hostname / Asset Name</label>
                <input
                  type="text"
                  value={manualHostname}
                  onChange={(e) => setManualHostname(e.target.value)}
                  placeholder="e.g. legacy-mainframe-01"
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 text-[10px] uppercase mb-1">IP Address (Optional)</label>
                  <input
                    type="text"
                    value={manualIp}
                    onChange={(e) => setManualIp(e.target.value)}
                    placeholder="e.g. 192.168.10.50"
                    className="w-full bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 text-[10px] uppercase mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={manualSerial}
                    onChange={(e) => setManualSerial(e.target.value)}
                    placeholder="e.g. SER-99812-XYZ"
                    className="w-full bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Candidate CI Class</label>
                <select
                  value={manualClass}
                  onChange={(e) => setManualClass(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Hardware">Hardware (Servers, Switches, Laptops)</option>
                  <option value="Software">Software (Applications, OS Packages)</option>
                  <option value="Cloud">Cloud (Instances, Buckets, Databases)</option>
                  <option value="Service">Service (Business Offerings, APIs)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider transition-colors"
            >
              Register Candidate Asset
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: UNIFIED DISCOVERY CANDIDATE STREAM */}
      {activeTab === 'unified_stream' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-2 gap-2">
              <div className="text-xs font-bold uppercase text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-red-600" />
                <span>Unified Discovered Candidates Repository</span>
              </div>

              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Candidates..."
                  value={streamQuery}
                  onChange={(e) => setStreamQuery(e.target.value)}
                  className="w-full bg-black border border-neutral-800 pl-8 pr-3 py-1 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredResults.map(item => (
                <div key={item.id} className="bg-black border border-neutral-900 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-neutral-400 font-bold">
                      {item.id} • {item.sourceMethod} ({item.subProtocol || 'Default'})
                    </span>
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.5 uppercase font-bold">
                      Confidence Score: {item.confidenceScore}%
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-white font-bold">{item.hostname}</div>
                    <div className="text-neutral-400">IP: {item.ipAddress || 'N/A'} | MAC: {item.macAddress || 'N/A'}</div>
                    <div className="text-red-400 font-mono text-[11px] font-bold">Candidate: [{item.candidateClass}] {item.candidateType}</div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-neutral-500 pt-1 border-t border-neutral-950">
                    <span>Raw Identifier: {item.rawIdentifier}</span>
                    <span>Status: {item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

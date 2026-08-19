import React, { useState } from 'react';
import { 
  Network, Shield, Cpu, Terminal, RefreshCw, Plus, CheckCircle2, 
  AlertTriangle, Play, Server, HardDrive, Key, Lock, Search, Sliders, Globe
} from 'lucide-react';

interface DiscoveryJob {
  id: string;
  targetRange: string;
  profile: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  hostsScanned: number;
  hostsFound: number;
  startTime: string;
  duration: string;
}

interface DiscoveredDevice {
  ip: string;
  hostname: string;
  protocol: 'SNMP' | 'WMI' | 'SSH';
  deviceType: string;
  os: string;
  manufacturer: string;
  model: string;
  status: string;
}

export const AgentlessDiscoveryModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'ranges' | 'profiles' | 'credentials' | 'devices'>('jobs');
  const [targetRangeInput, setTargetRangeInput] = useState('10.0.0.0/24');
  const [profileInput, setProfileInput] = useState('Enterprise Servers & Switches');
  
  const [jobs, setJobs] = useState<DiscoveryJob[]>([
    {
      id: 'JOB-AGL-9A82B',
      targetRange: '10.0.0.0/24',
      profile: 'Enterprise Core Switches (SNMPv3)',
      status: 'Completed',
      hostsScanned: 254,
      hostsFound: 18,
      startTime: '2026-08-11 05:30:12',
      duration: '42s'
    },
    {
      id: 'JOB-AGL-11F04',
      targetRange: '172.16.10.0/22',
      profile: 'Windows Datacenter Clusters (WMI)',
      status: 'Completed',
      hostsScanned: 1024,
      hostsFound: 45,
      startTime: '2026-08-11 04:15:00',
      duration: '2m 10s'
    }
  ]);

  const [discoveredDevices] = useState<DiscoveredDevice[]>([
    {
      ip: '10.0.0.15',
      hostname: 'switch-core-01.internal',
      protocol: 'SNMP',
      deviceType: 'Network Switch',
      os: 'Cisco IOS-XE 17.06',
      manufacturer: 'Cisco Systems, Inc.',
      model: 'Catalyst 9300-48P',
      status: 'Authenticated'
    },
    {
      ip: '10.0.0.42',
      hostname: 'WIN-SRV-DC01.corp.local',
      protocol: 'WMI',
      deviceType: 'Windows Server',
      os: 'Windows Server 2022 Datacenter',
      manufacturer: 'Dell Inc.',
      model: 'PowerEdge R650',
      status: 'Authenticated'
    },
    {
      ip: '10.0.0.88',
      hostname: 'rhel-prod-db01.node.internal',
      protocol: 'SSH',
      deviceType: 'Linux Server',
      os: 'Red Hat Enterprise Linux 9.4',
      manufacturer: 'VMware Virtual Platform',
      model: 'ESXi Node 04',
      status: 'Authenticated'
    }
  ]);

  const [credentials, setCredentials] = useState([
    { id: 'CRED-SNMP-V3', type: 'SNMPv3', name: 'Datacenter Switches Key', user: 'snmp_admin_v3', status: 'Encrypted & Active' },
    { id: 'CRED-WMI-WIN', type: 'WMI / WinRM', name: 'Domain Infra Admin', user: 'CORP\\Svc-ITAM-Discovery', status: 'Encrypted & Active' },
    { id: 'CRED-SSH-KEY', type: 'SSH Key', name: 'Linux Fleet Ed25519 Key', user: 'itam_scanner', status: 'Encrypted & Active' }
  ]);

  const handleLaunchScan = () => {
    const newJob: DiscoveryJob = {
      id: `JOB-AGL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      targetRange: targetRangeInput,
      profile: profileInput,
      status: 'Running',
      hostsScanned: 0,
      hostsFound: 0,
      startTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      duration: 'In Progress...'
    };

    setJobs([newJob, ...jobs]);

    setTimeout(() => {
      setJobs(prev => prev.map(j => j.id === newJob.id ? {
        ...j,
        status: 'Completed',
        hostsScanned: 254,
        hostsFound: 3,
        duration: '18s'
      } : j));
    }, 2500);
  };

  return (
    <div className="p-6 bg-slate-900 text-slate-100 min-h-screen font-sans border border-slate-800 rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">Agentless Discovery Subsystem</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Isolated Python Microservice • Nmap, PySNMP, Impacket WMI, Paramiko SSH
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Microservice Active
          </span>
          <button 
            onClick={handleLaunchScan}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            Launch Instant Discovery
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mt-6 space-x-8">
        {[
          { id: 'jobs', label: 'Discovery Jobs', icon: Sliders },
          { id: 'devices', label: 'Discovered Devices', icon: Server },
          { id: 'ranges', label: 'Network Ranges', icon: Globe },
          { id: 'profiles', label: 'Discovery Profiles', icon: Cpu },
          { id: 'credentials', label: 'Encrypted Vault', icon: Lock },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                active 
                  ? 'border-emerald-500 text-emerald-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Areas */}
      <div className="mt-6">
        {/* DISCOVERY JOBS TAB */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* Scan launcher bar */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Target Network Range (CIDR / Single IP)</label>
                  <input 
                    type="text" 
                    value={targetRangeInput} 
                    onChange={e => setTargetRangeInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Discovery Profile</label>
                  <select 
                    value={profileInput}
                    onChange={e => setProfileInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option>Enterprise Servers & Switches</option>
                    <option>Core Network Infrastructure (SNMP)</option>
                    <option>Windows Fleet (WMI / WinRM)</option>
                    <option>Linux Workstations (SSH)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Job ID</th>
                    <th className="px-4 py-3">Target Range</th>
                    <th className="px-4 py-3">Profile</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Hosts Found / Scanned</th>
                    <th className="px-4 py-3">Started</th>
                    <th className="px-4 py-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {jobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-mono text-xs text-emerald-400 font-semibold">{job.id}</td>
                      <td className="px-4 py-3 font-mono text-xs">{job.targetRange}</td>
                      <td className="px-4 py-3 text-slate-200">{job.profile}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          job.status === 'Running' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {job.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                          {job.status === 'Running' && <RefreshCw className="w-3 h-3 animate-spin" />}
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <span className="text-emerald-400 font-bold">{job.hostsFound}</span> / {job.hostsScanned}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{job.startTime}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{job.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DISCOVERED DEVICES TAB */}
        {activeTab === 'devices' && (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Hostname</th>
                  <th className="px-4 py-3">Discovery Protocol</th>
                  <th className="px-4 py-3">Device Type</th>
                  <th className="px-4 py-3">Manufacturer & Model</th>
                  <th className="px-4 py-3">Operating System</th>
                  <th className="px-4 py-3">Auth Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {discoveredDevices.map(device => (
                  <tr key={device.ip} className="hover:bg-slate-900/50">
                    <td className="px-4 py-3 font-mono text-xs text-emerald-400">{device.ip}</td>
                    <td className="px-4 py-3 font-medium text-white">{device.hostname}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                        device.protocol === 'SNMP' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        device.protocol === 'WMI' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {device.protocol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{device.deviceType}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{device.manufacturer} - {device.model}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{device.os}</td>
                    <td className="px-4 py-3 text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {device.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* NETWORK RANGES TAB */}
        {activeTab === 'ranges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-white">Authorized Network CIDR Ranges</h3>
                <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  Target Control Enabled
                </span>
              </div>
              <ul className="space-y-2 text-xs font-mono">
                <li className="p-2.5 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                  <span>10.0.0.0/8 (Enterprise Datacenter Subnets)</span>
                  <span className="text-emerald-400">Approved</span>
                </li>
                <li className="p-2.5 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                  <span>172.16.0.0/12 (Internal VPC & Branch Networks)</span>
                  <span className="text-emerald-400">Approved</span>
                </li>
                <li className="p-2.5 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                  <span>192.168.0.0/16 (Office LAN Segments)</span>
                  <span className="text-emerald-400">Approved</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <h3 className="text-sm font-semibold text-white mb-2">Safety & Anti-Exfiltration Rules</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Agentless scans strictly validate target IP ranges prior to running Nmap or socket connection attempts.
                Internet-wide scanning is prohibited by default.
              </p>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Scanning non-authorized public IP addresses will trigger immediate rejection and security audit events.</span>
              </div>
            </div>
          </div>
        )}

        {/* PROFILES TAB */}
        {activeTab === 'profiles' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Core Switch Discovery', proto: 'PySNMP v2c/v3', desc: 'Discovers switches, routers, firewalls, MAC tables, and port statuses.' },
              { title: 'Windows Datacenter Fleet', proto: 'Impacket WMI', desc: 'Collects OS builds, hardware UUIDs, active services, and installed software.' },
              { title: 'Linux Infrastructure', proto: 'Paramiko SSH', desc: 'Collects kernel versions, CPU specs, RAM utilization, and system packages.' }
            ].map((p, idx) => (
              <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-white">{p.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">{p.proto}</span>
                </div>
                <p className="text-xs text-slate-400">{p.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* CREDENTIALS TAB */}
        {activeTab === 'credentials' && (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">Encrypted Credential Vault</h3>
                <p className="text-xs text-slate-400">Stored using AES-256 Fernet key derivation with PBKDF2HMAC salt</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Add New Credential
              </button>
            </div>
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Credential ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">User / Account</th>
                  <th className="px-4 py-3">Vault Encryption Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {credentials.map(c => (
                  <tr key={c.id} className="hover:bg-slate-900/50">
                    <td className="px-4 py-3 font-mono text-xs text-emerald-400">{c.id}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{c.type}</td>
                    <td className="px-4 py-3 text-xs font-medium text-white">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{c.user}</td>
                    <td className="px-4 py-3 text-xs text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {c.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AgentlessDiscoveryModule;

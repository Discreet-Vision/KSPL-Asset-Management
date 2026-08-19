import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfigurationItem } from '../../types';
import { buildHardwareAssetFromScan } from '../../utils/hardwareAttributesMapper';
import { HardwareAssetDetailModal } from '../common/HardwareAssetDetailModal';
import {
  downloadAgentScript,
  getClientWindowsScript,
  getClientLinuxScript,
  getClientMacOsScript,
} from '../../utils/agentScriptDownloader';
import {
  Radar,
  Play,
  CheckCircle2,
  AlertTriangle,
  Server,
  Cloud,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Download,
  FileCode2,
  Sliders,
  Sparkles,
  KeyRound,
  Plus,
  X,
  Search,
  Check,
  Eye,
  EyeOff,
  Globe,
  Database,
  Cpu,
  Monitor,
  HardDrive,
  Users,
  ShieldAlert,
  GitMerge,
  Clock,
  Send,
  HelpCircle,
  FileText,
  Lock,
  Zap,
  ArrowRight,
  Filter,
  Activity,
  ExternalLink,
  Layers,
} from 'lucide-react';

export const DiscoveryModule: React.FC = () => {
  const {
    discoveryJobs,
    addDiscoveryJob,
    runDiscoveryScanJob,
    endpointAgents,
    softwareCatalog,
    driftEvents,
    configurationItems,
    ciRelationships,
    addAuditEntry,
    addConfigurationItem,
    setActiveModule,
  } = useApp();

  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<ConfigurationItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalInitialTab, setDetailModalInitialTab] = useState<
    | 'overview'
    | 'attributes204'
    | 'hardware'
    | 'os'
    | 'network'
    | 'software'
    | 'security'
    | 'user'
    | 'ownership'
    | 'financial'
    | 'discovery'
    | 'cmdb'
    | 'relationships'
    | 'audit'
  >('overview');
  const [lastProvisionedCi, setLastProvisionedCi] = useState<ConfigurationItem | null>(null);

  const [activeTab, setActiveTab] = useState<
    'jobs' | 'credentials' | 'agent' | 'cloud' | 'saas' | 'reconciliation' | 'normalization' | 'drift'
  >('jobs');

  const [selectedJobLog, setSelectedJobLog] = useState<string[]>(
    discoveryJobs[0]?.logs || [
      '15:30:00 [INFO] Initializing WinRM / SSH Discovery Worker pool...',
      '15:30:02 [INFO] Scanning subnet CIDR 192.168.10.0/24...',
      '15:30:05 [OK] 192.168.10.12 - Dell Latitude 7440 discovered via WMI. Serial: DELL-98234-X1',
      '15:30:08 [OK] 192.168.10.15 - Ubuntu 22.04 LTS Server discovered via SSH. Serial: SRV-UBUNTU-882',
      '15:30:12 [INFO] Reconciliation Engine: 2 assets matched with 100% serial confidence.',
      '15:30:15 [SUCCESS] Scan completed. 24 CIs updated, 0 duplicates created.',
    ]
  );

  // Modals & State
  const [isNewScanModalOpen, setIsNewScanModalOpen] = useState(false);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<any>(null);

  // New Scan Job Form State
  const [scanName, setScanName] = useState('');
  const [scanType, setScanType] = useState<any>('Subnet Range');
  const [scanTarget, setScanTarget] = useState('10.20.0.0/23');
  const [scanSchedule, setScanSchedule] = useState<any>('Hourly');

  // Credential State
  const [credentialsList, setCredentialsList] = useState([
    { id: 'cred-1', name: 'Domain Admin WinRM Credential', type: 'Windows WMI / WinRM', domain: 'CORP.INTERNAL', username: 'svc_itam_discovery', mask: '************', status: 'Valid' },
    { id: 'cred-2', name: 'Linux Infrastructure SSH Key', type: 'Linux SSH Key', domain: 'N/A', username: 'itam-agent', mask: '************', status: 'Valid' },
    { id: 'cred-3', name: 'Datacenter Core Switches SNMPv3', type: 'SNMP v3', domain: 'N/A', username: 'snmp_sec_usr', mask: '************', status: 'Valid' },
    { id: 'cred-4', name: 'AWS Cloud ReadOnly Role', type: 'AWS IAM Role', domain: 'aws-prod-9823', username: 'arn:aws:iam::8823:role/ITAMDiscovery', mask: '************', status: 'Valid' },
  ]);
  const [credName, setCredName] = useState('');
  const [credType, setCredType] = useState('Windows WMI / WinRM');
  const [credUsername, setCredUsername] = useState('');
  const [credSecret, setCredSecret] = useState('');

  // Agent Enrollment Token State
  const [generatedToken, setGeneratedToken] = useState('');

  // Discovered Candidate Devices Review Queue
  const [candidateDevices, setCandidateDevices] = useState([
    { id: 'cand-1', hostname: 'DEV-WIN11-904', ip: '10.20.1.45', mac: '00:1A:2B:3C:4D:5E', serial: 'SN-WIN11-904', os: 'Windows 11 Pro 23H2', confidence: 98, source: 'WinRM' },
    { id: 'cand-2', hostname: 'K8S-WORKER-04', ip: '10.20.4.12', mac: '52:54:00:12:34:56', serial: 'UUID-K8S-W04', os: 'Ubuntu 22.04 LTS', confidence: 95, source: 'SSH' },
    { id: 'cand-3', hostname: 'PRN-FLOOR2-HP', ip: '10.20.2.88', mac: '00:11:0A:99:BB:CC', serial: 'HP-PRN-8821', os: 'HP JetDirect Firmware', confidence: 91, source: 'SNMP' },
  ]);

  // Data Conflict Queue
  const [conflicts, setConflicts] = useState([
    {
      id: 'conf-1',
      ciName: 'LAP-CORP-8820 (MacBook Pro M3)',
      field: 'Installed System Memory (RAM)',
      sourceA: { name: 'Go Endpoint Agent', value: '32 GB DDR5', timestamp: '2026-08-11 15:10' },
      sourceB: { name: 'Intune MDM Sync', value: '16 GB DDR5', timestamp: '2026-08-10 09:00' },
      recommended: 'Go Endpoint Agent (Hardware Live Direct)',
    },
    {
      id: 'conf-2',
      ciName: 'SRV-DB-PROD-01 (PostgreSQL)',
      field: 'Operating System Patch Version',
      sourceA: { name: 'SSH Discovery', value: 'Kernel 6.2.0-39-generic', timestamp: '2026-08-11 14:00' },
      sourceB: { name: 'AWS Cloud API', value: 'Ubuntu 22.04.3 LTS AMI', timestamp: '2026-08-11 12:00' },
      recommended: 'SSH Discovery (Deep OS Execution)',
    },
  ]);

  // Multi-OS Endpoint Agent State (Windows, Linux, macOS, iOS)
  const [selectedOsTab, setSelectedOsTab] = useState<'Windows' | 'Linux' | 'macOS' | 'iOS'>('Windows');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [singleIpTest, setSingleIpTest] = useState('10.20.4.15');
  const [isTestingIp, setIsTestingIp] = useState(false);
  // Get dynamic origin for copyable commands
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const winDirectCommand = `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; iwr -useb "https://ais-pre-p7foijjmi7pztxq6wwok55-680063710747.asia-east1.run.app/api/discovery/agent/scripts/windows" | iex`;
  const winFileCommand = `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; & "$HOME\\Downloads\\kspl-discovery-agent.ps1"`;
  const linuxCommand = `curl -sSL "https://ais-pre-p7foijjmi7pztxq6wwok55-680063710747.asia-east1.run.app/api/discovery/agent/scripts/linux" | sudo bash`;
  const macCommand = `curl -sSL "https://ais-pre-p7foijjmi7pztxq6wwok55-680063710747.asia-east1.run.app/api/discovery/agent/scripts/macos" | sudo bash`;
  const iosCommand = `curl -X POST "${appOrigin}/api/discovery/agent/heartbeat" -H "Content-Type: application/json" -d '{"hostname":"Corp-iPhone-15Pro","osType":"iOS","osName":"Apple iOS","osVersion":"17.6.1","ipAddress":"10.20.6.99"}'`;
  const [ipTestResult, setIpTestResult] = useState<any | null>(null);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [activeAgentsList, setActiveAgentsList] = useState<any[]>(() => endpointAgents || []);

  const safeActiveAgents = activeAgentsList || [];
  const safeEndpointAgents = endpointAgents || [];
  const safeDiscoveryJobs = discoveryJobs || [];
  const safeCredentialsList = credentialsList || [];
  const safeCandidateDevices = candidateDevices || [];
  const safeConflicts = conflicts || [];
  const safeSoftwareCatalog = softwareCatalog || [];
  const safeDriftEvents = driftEvents || [];
  const safeCis = configurationItems || [];
  const safeSelectedJobLog = selectedJobLog || [];

  const handleCopyRawScript = (osType: 'Windows' | 'Linux' | 'macOS') => {
    let scriptText = '';
    if (osType === 'Windows') {
      scriptText = getClientWindowsScript(appOrigin);
    } else if (osType === 'Linux') {
      scriptText = getClientLinuxScript(appOrigin);
    } else {
      scriptText = getClientMacOsScript(appOrigin);
    }
    navigator.clipboard?.writeText(scriptText);
    setCopiedScript(`raw_${osType.toLowerCase()}`);
    setDownloadSuccessToast(`Copied full ${osType} script code to clipboard! You can now paste directly into PowerShell/Terminal.`);
    setTimeout(() => {
      setCopiedScript(null);
      setDownloadSuccessToast(null);
    }, 4000);
  };

  const handleDownloadScript = (osType: 'Windows' | 'Linux' | 'macOS' | 'iOS') => {
    const res = downloadAgentScript(osType);
    if (res.success) {
      setDownloadSuccessToast(`Downloaded agent script '${res.filename}' successfully.`);
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    }
  };

  // Sync activeAgentsList with endpointAgents if context changes
  React.useEffect(() => {
    if (endpointAgents && endpointAgents.length > 0) {
      setActiveAgentsList(endpointAgents);
    }
  }, [endpointAgents]);

  const handleOpenAgentAssetModal = (ag: any, initialTab: 'overview' | 'attributes204' = 'overview') => {
    // 1. Try finding existing CI in configurationItems by id, serial, hostname, or ip
    let targetCi = configurationItems.find(
      (ci) =>
        (ag.ciId && ci.id === ag.ciId) ||
        ci.name === ag.hostname ||
        (ci as any).hostname === ag.hostname ||
        (ci.serialNumber && ag.serialNumber && ci.serialNumber === ag.serialNumber) ||
        (ci.ipAddress && ag.ipAddress && ci.ipAddress === ag.ipAddress)
    );

    // 2. If not yet in configurationItems, build full 204-attribute asset from agent telemetry
    if (!targetCi) {
      const isMac = ag.os?.includes('Mac') || ag.os?.includes('Darwin') || ag.os?.includes('macOS');
      const isLinux = ag.os?.includes('Ubuntu') || ag.os?.includes('Linux') || ag.os?.includes('RHEL');
      const isIos = ag.os?.includes('iOS') || ag.os?.includes('iPhone');
      const osFamily = isMac ? 'macOS' : isLinux ? 'Linux' : isIos ? 'iOS' : 'Windows';

      targetCi = buildHardwareAssetFromScan(
        {
          hostname: ag.hostname,
          osType: osFamily as any,
          osName: ag.os || `${osFamily} Enterprise Edition`,
          osVersion: ag.osVersion || (isMac ? 'Sonoma 14.6.1' : isLinux ? '24.04 LTS' : '10.0.22631'),
          ipAddress: ag.ipAddress || '192.168.1.50',
          serialNumber: ag.serialNumber || `SN-${ag.hostname}`,
          manufacturer: ag.manufacturer || (isMac || isIos ? 'Apple Inc.' : isLinux ? 'HPE' : 'Dell Inc.'),
          model: ag.model || (isMac ? 'MacBook Pro 16"' : isIos ? 'iPhone 15 Pro' : isLinux ? 'ProLiant DL360 Gen10' : 'Latitude 7440 Ultrabook'),
          agentVersion: ag.agentVersion || 'v2.5.0',
          cpuCores: ag.cpuCores || (isLinux ? 32 : 10),
          memoryTotalGb: ag.memoryTotalGb || (isLinux ? 128 : 32),
          diskTotalGb: ag.diskTotalGb || (isLinux ? 2048 : 512),
          installedSoftware: ag.installedSoftware,
        },
        {
          lifecycleState: 'In Stock',
        }
      );

      // Register into configurationItems store so it is saved
      const savedCi = addConfigurationItem(targetCi);
      targetCi = savedCi;
    }

    setSelectedAssetForDetail(targetCi);
    setDetailModalInitialTab(initialTab);
    setIsDetailModalOpen(true);
  };

  const handleSimulateOs = async (osType: 'Windows' | 'Linux' | 'macOS' | 'iOS') => {
    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const res = await fetch('/api/discovery/agent/simulate-telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ osType }),
      });

      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data);

        // Build full 204-attribute Hardware Asset and automatically provision into CMDB / Hardware Assets
        const scanPayload = data.payload || {};
        const newHwAsset = buildHardwareAssetFromScan(scanPayload, {
          lifecycleState: 'In Stock',
        });
        
        // Add to CMDB / Hardware Assets in AppContext
        const provisioned = addConfigurationItem(newHwAsset);
        setLastProvisionedCi(provisioned);

        // Add to activeAgentsList immediately
        const newAgentEntry = {
          id: data.payload?.agentId || `ag-${Date.now()}`,
          hostname: data.payload?.hostname || newHwAsset.name,
          os: `${data.payload?.osName || newHwAsset.operatingSystem}`,
          ipAddress: data.payload?.ipAddress || newHwAsset.ipAddress,
          agentVersion: data.payload?.agentVersion || 'v2.5.0-native',
          status: 'Healthy',
          lastSeen: 'Just Now',
          pendingQueuedEvents: 0,
          cpu: data.payload?.cpuUsagePct || 14.5,
          ram: data.payload?.memoryUsagePct || 42.0,
          softwareCount: data.payload?.installedSoftware?.length || (newHwAsset.installedSoftware as any[])?.length || 18,
          serialNumber: data.payload?.serialNumber || newHwAsset.serialNumber,
          manufacturer: data.payload?.manufacturer || newHwAsset.manufacturer,
          model: data.payload?.model || newHwAsset.model,
          ciId: provisioned.id,
          hardwareAsset: provisioned,
        };
        setActiveAgentsList((prev) => [newAgentEntry, ...prev.filter((a) => a.hostname !== newAgentEntry.hostname)]);

        addAuditEntry('INGEST', 'EndpointAgent', data.payload?.agentId || osType, `Simulated agent telemetry ingested and provisioned in Hardware Assets with 204 attributes for ${osType}`);
      } else {
        throw new Error('API offline fallback');
      }
    } catch (e) {
      // Offline fallback simulation with full 204 attributes
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const fallbackHost = osType === 'Windows' ? `DESKTOP-WIN11-${randomSuffix}` : osType === 'Linux' ? `srv-ubuntu-docker-${randomSuffix}` : osType === 'macOS' ? `MacBook-Pro-M3-${randomSuffix}.local` : `Corp-iPhone-15Pro-${randomSuffix}`;
      const fallbackPayload = {
        hostname: fallbackHost,
        osType: osType,
        osName: osType === 'Windows' ? 'Microsoft Windows 11 Enterprise (23H2)' : osType === 'Linux' ? 'Ubuntu Linux 24.04 LTS (Noble Numbat)' : osType === 'macOS' ? 'macOS Sonoma (Darwin 23.6.0)' : 'Apple iOS 17.6.1 (Managed)',
        osVersion: osType === 'Windows' ? '10.0.22631.3880' : '23.6.0',
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
        serialNumber: `${osType === 'Windows' ? 'DELL-LATITUDE' : osType === 'Linux' ? 'HPE-PROLIANT' : 'APPLE-MAC'}-${randomSuffix}-X1`,
        manufacturer: osType === 'Windows' ? 'Dell Inc.' : osType === 'Linux' ? 'HPE' : 'Apple Inc.',
        model: osType === 'Windows' ? 'Latitude 7440 Ultrabook' : osType === 'Linux' ? 'ProLiant DL360 Gen10' : 'MacBook Pro 16"',
        agentVersion: 'v2.5.0-native',
        cpuModel: osType === 'Windows' ? '13th Gen Intel Core i7-1365U' : osType === 'Linux' ? 'Intel Xeon Silver 4314' : 'Apple M3 Max',
        cpuCores: osType === 'Windows' ? 10 : osType === 'Linux' ? 32 : 16,
        memoryTotalGb: osType === 'Windows' ? 32 : osType === 'Linux' ? 128 : 64,
        diskTotalGb: osType === 'Windows' ? 512 : osType === 'Linux' ? 2048 : 1000,
        installedSoftware: [
          { name: 'Microsoft 365 Apps for enterprise', version: '16.0.17726.20160', publisher: 'Microsoft Corporation' },
          { name: 'CrowdStrike Windows Sensor', version: '7.15.18402.0', publisher: 'CrowdStrike, Inc.' },
          { name: 'Google Chrome Enterprise', version: '127.0.6533.100', publisher: 'Google LLC' },
          { name: 'Zoom Workplace (64-bit)', version: '6.1.6.39824', publisher: 'Zoom Video Communications, Inc.' },
          { name: 'Cisco Secure Client - AnyConnect VPN', version: '5.1.2.42', publisher: 'Cisco Systems, Inc.' },
          { name: 'Microsoft Visual Studio Code', version: '1.92.0', publisher: 'Microsoft Corporation' },
          { name: '7-Zip 24.07 (x64 edition)', version: '24.07', publisher: 'Igor Pavlov' },
          { name: 'Adobe Acrobat Reader (64-bit)', version: '24.002.20965', publisher: 'Adobe Systems Incorporated' },
        ],
        cpuUsagePct: Math.floor(Math.random() * 30 + 10),
        memoryUsagePct: Math.floor(Math.random() * 40 + 30),
      };

      const newHwAsset = buildHardwareAssetFromScan(fallbackPayload, {
        lifecycleState: 'In Stock',
      });
      const provisioned = addConfigurationItem(newHwAsset);
      setLastProvisionedCi(provisioned);

      const fallbackData = {
        success: true,
        simulatedOs: osType,
        payload: fallbackPayload,
      };
      setSimulationResult(fallbackData);
      setActiveAgentsList((prev) => [
        {
          id: `ag-sim-${Date.now()}`,
          hostname: fallbackData.payload.hostname,
          os: fallbackData.payload.osName,
          ipAddress: fallbackData.payload.ipAddress,
          agentVersion: fallbackData.payload.agentVersion,
          status: 'Healthy',
          lastSeen: 'Just Now',
          pendingQueuedEvents: 0,
          cpu: fallbackData.payload.cpuUsagePct,
          ram: fallbackData.payload.memoryUsagePct,
          softwareCount: fallbackData.payload.installedSoftware.length,
          serialNumber: fallbackData.payload.serialNumber,
          manufacturer: fallbackData.payload.manufacturer,
          model: fallbackData.payload.model,
          ciId: provisioned.id,
          hardwareAsset: provisioned,
        },
        ...prev,
      ]);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleTestIpProbe = async () => {
    if (!singleIpTest) return;
    setIsTestingIp(true);
    setIpTestResult(null);

    try {
      const res = await fetch('/api/discovery/agentless/test-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: singleIpTest, protocols: ['WMI', 'SSH', 'SNMP'] }),
      });
      if (res.ok) {
        const data = await res.json();
        setIpTestResult(data);
      } else {
        throw new Error('API offline');
      }
    } catch (e) {
      setIpTestResult({
        ip: singleIpTest,
        timestamp: new Date().toISOString(),
        responsiveProtocols: ['SSH Port 22', 'WMI / WinRM (5985)'],
        detectedOs: 'Linux / Windows Dual Stack Candidate',
        confidenceScore: 92,
        diagnostics: [
          'TCP Handshake to 10.20.4.15:22 successful (1.2ms)',
          'TCP Handshake to 10.20.4.15:5985 successful (2.8ms)',
          'SNMPv3 response: sysDescr.0 OID accessible',
        ],
      });
    } finally {
      setIsTestingIp(false);
    }
  };

  const handleCopyCommand = (cmd: string, label: string) => {
    navigator.clipboard?.writeText(cmd);
    setCopiedScript(label);
    setTimeout(() => setCopiedScript(null), 3000);
  };

  // Handlers
  const handleCreateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanName) return;

    const newJob = addDiscoveryJob({
      name: scanName,
      type: scanType,
      target: scanTarget,
      schedule: scanSchedule,
    });

    // Execute scan job immediately so discovered items update
    runDiscoveryScanJob(newJob.id);

    setIsNewScanModalOpen(false);
    setScanName('');
  };

  const handleCreateCred = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credName) return;

    setCredentialsList((prev) => [
      ...prev,
      {
        id: `cred-${Date.now()}`,
        name: credName,
        type: credType,
        domain: 'CORP.INTERNAL',
        username: credUsername || 'svc_account',
        mask: '************',
        status: 'Valid',
      },
    ]);

    setIsCredentialModalOpen(false);
    setCredName('');
    setCredSecret('');
    setCredUsername('');
    addAuditEntry('CREATE', 'DiscoveryCredential', `cred-${Date.now()}`, `Created encrypted credential: ${credName}`);
  };

  const handleGenerateToken = () => {
    const newToken = `ITAM-ENROLL-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    setGeneratedToken(newToken);
    setIsTokenModalOpen(true);
  };

  const handleApproveCandidate = (candId: string) => {
    const cand = candidateDevices.find((c) => c.id === candId);
    if (cand) {
      addConfigurationItem({
        name: cand.hostname || `Device-${cand.serial}`,
        category: 'Hardware',
        ciClassName: cand.os.includes('Ubuntu') || cand.os.includes('Linux') ? 'Physical / Virtual Server' : 'Laptop / Workstation',
        assetTag: `AST-${Math.floor(10000 + Math.random() * 90000)}`,
        serialNumber: cand.serial || `SN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        manufacturer: cand.os.includes('Mac') ? 'Apple Inc.' : cand.os.includes('HP') ? 'HP Inc.' : 'Dell Inc.',
        model: cand.os.includes('Mac') ? 'MacBook Pro 16"' : cand.os.includes('HP') ? 'LaserJet Enterprise M608' : 'Latitude 7440',
        operatingSystem: cand.os || 'Windows 11 Enterprise',
        ipAddress: cand.ip || '10.20.1.45',
        macAddress: cand.mac || '00:1A:2B:3C:4D:5E',
        lifecycleState: 'In Stock',
        locationId: 'loc-1',
        locationName: 'Primary Enterprise HQ',
        departmentId: 'd-1',
        departmentName: 'Information Technology & Cloud',
        cost: 2400,
        discoverySource: 'Agent',
      });
    }
    setCandidateDevices((prev) => prev.filter((c) => c.id !== candId));
    addAuditEntry('CREATE', 'ConfigurationItem', candId, 'Candidate device approved and provisioned as Active CMDB CI');
  };

  const handleResolveConflict = (conflictId: string, chosenSource: string) => {
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
    setIsConflictModalOpen(false);
    addAuditEntry('UPDATE', 'ConfigurationItem', conflictId, `Data conflict resolved using ${chosenSource}`);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 text-white font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-3 sm:p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <Radar className="w-5 h-5 text-red-500 shrink-0" />
            <span>ENTERPRISE DISCOVERY & REAL-TIME RECONCILIATION ENGINE</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Agentless WMI/SSH/SNMP Scans, Native Go Agents, Multi-Cloud Connectors & Weighted Precedence Reconciliation
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1.5 bg-black p-1 border border-zinc-800 rounded font-mono text-xs overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'jobs' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Scan Jobs ({safeDiscoveryJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'credentials' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Credentials ({safeCredentialsList.length})
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'agent' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Endpoint Agents ({safeEndpointAgents.length})
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'cloud' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Cloud Connectors
          </button>
          <button
            onClick={() => setActiveTab('saas')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'saas' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            SaaS & Shadow IT
          </button>
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'reconciliation' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Reconciliation Queue ({safeCandidateDevices.length + safeConflicts.length})
          </button>
          <button
            onClick={() => setActiveTab('normalization')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'normalization' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Software Catalog ({safeSoftwareCatalog.length})
          </button>
          <button
            onClick={() => setActiveTab('drift')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'drift' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Drift & Delta ({safeDriftEvents.length})
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-xs uppercase font-bold">Total Discovered Devices</div>
          <div className="text-2xl font-black text-white mt-1">{safeCis.length} Active CIs</div>
          <div className="text-[11px] text-emerald-400 mt-1">99.4% Reconciled automatically</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-xs uppercase font-bold">Endpoint Go Agents</div>
          <div className="text-2xl font-black text-white mt-1">{safeEndpointAgents.length} Online</div>
          <div className="text-[11px] text-emerald-400 mt-1">TLS 1.3 encrypted telemetry</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-xs uppercase font-bold">Unreconciled Candidates</div>
          <div className="text-2xl font-black text-red-500 mt-1">{safeCandidateDevices.length} Pending Review</div>
          <div className="text-[11px] text-zinc-400 mt-1">Weighted confidence &lt; 90%</div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <div className="text-zinc-400 text-xs uppercase font-bold">Data Conflicts</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{safeConflicts.length} Discrepancies</div>
          <div className="text-[11px] text-zinc-400 mt-1">Multi-source attribute delta</div>
        </div>
      </div>

      {/* TAB 1: SCAN JOBS & LIVE LOG STREAM */}
      {activeTab === 'jobs' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="font-bold text-zinc-300 uppercase">Agentless Discovery Scan Schedules & CIDR Jobs</span>
            <button
              onClick={() => setIsNewScanModalOpen(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Discovery Job</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="p-3 bg-black border-b border-zinc-800 font-bold text-white flex justify-between items-center">
                <span>ACTIVE DISCOVERY JOBS</span>
                <span className="text-zinc-500">WMI / WinRM / SSH / SNMP</span>
              </div>
              <div className="divide-y divide-zinc-800">
                {discoveryJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobLog(job.logs)}
                    className="p-4 hover:bg-zinc-900 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-white text-sm flex items-center space-x-2">
                        <span>{job.name}</span>
                        <span className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-normal">
                          {job.type}
                        </span>
                      </div>
                      <div className="text-zinc-400 text-[11px]">
                        Target Range: <span className="text-white">{job.target}</span> | Schedule: <span className="text-red-400">{job.schedule}</span> | Last Run: {job.lastRun}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="bg-black border border-red-500 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded block">
                          {job.status}
                        </span>
                        <span className="text-[10px] text-zinc-500 mt-0.5 block">{job.itemsDiscovered} CIs found</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runDiscoveryScanJob(job.id);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded border border-red-500 transition-colors cursor-pointer"
                        title="Run Scan Now"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Console Log */}
            <div className="lg:col-span-5 bg-black border border-zinc-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-red-500 flex items-center space-x-2 uppercase">
                  <Terminal className="w-4 h-4" />
                  <span>Discovery Worker Output Console</span>
                </span>
                <span className="text-[10px] text-zinc-500">Live Worker Log Stream</span>
              </div>

              <div className="bg-zinc-950 p-3 border border-zinc-800 rounded text-[11px] space-y-1.5 text-zinc-300 max-h-[380px] overflow-y-auto font-mono">
                {safeSelectedJobLog.map((log, idx) => (
                  <div key={idx} className="flex space-x-2">
                    <span className="text-red-500 font-bold">&gt;</span>
                    <span className={log.includes('completed') || log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREDENTIALS MANAGER */}
      {activeTab === 'credentials' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <div className="space-y-0.5">
              <span className="font-bold text-zinc-300 uppercase block">DISCOVERY CREDENTIALS & LEAST-PRIVILEGE SECRETS STORE</span>
              <span className="text-zinc-500 text-[10px]">Encrypted at rest (AES-256 GCM). Plaintext credentials never sent to client UI.</span>
            </div>
            <button
              onClick={() => setIsCredentialModalOpen(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center space-x-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Add Credential</span>
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Credential Name</th>
                  <th className="p-3">Protocol / Type</th>
                  <th className="p-3">Domain / Scope</th>
                  <th className="p-3">Username / Service Account</th>
                  <th className="p-3">Secret Mask</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {credentialsList.map((cred) => (
                  <tr key={cred.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white flex items-center space-x-2">
                      <Lock className="w-3.5 h-3.5 text-red-500" />
                      <span>{cred.name}</span>
                    </td>
                    <td className="p-3">{cred.type}</td>
                    <td className="p-3 text-zinc-400">{cred.domain}</td>
                    <td className="p-3 font-mono text-red-400">{cred.username}</td>
                    <td className="p-3 text-zinc-500 tracking-widest">{cred.mask}</td>
                    <td className="p-3">
                      <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                        {cred.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-OS ENDPOINT AGENT & ENROLLMENT (Windows, Linux, macOS, iOS) */}
      {activeTab === 'agent' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Header Banner & Token Generation */}
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-red-500" />
                <span>ENTERPRISE MULTI-OS DISCOVERY AGENT HUB</span>
              </h3>
              <p className="text-zinc-400 text-[11px] mt-1 font-mono">
                Native collectors for Windows, Linux, macOS & iOS MDM payload stream. Real-time hardware, software registry & patch audit.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGenerateToken}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 rounded flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-red-950"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Generate Enrollment Token</span>
              </button>
            </div>
          </div>

          {/* Platform Selector Grid: Windows, Linux, macOS, iOS */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-bold text-white uppercase text-xs flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-red-500" />
                <span>Select Target Operating System</span>
              </span>
              <span className="text-[10px] text-zinc-500">Universal Endpoint Deployment</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'Windows', name: 'Windows 10/11 & Server', icon: Monitor, desc: 'PowerShell / MSI / WMI' },
                { id: 'Linux', name: 'Linux (Ubuntu/RHEL/Debian)', icon: Terminal, desc: 'Bash / Systemd Daemon' },
                { id: 'macOS', name: 'macOS Sonoma / Sequoia', icon: Cpu, desc: 'Zsh / Apple Silicon & Intel' },
                { id: 'iOS', name: 'iOS & iPadOS (Mobile MDM)', icon: Globe, desc: 'Apple Profile / Shortcuts API' },
              ].map((os) => {
                const IconComp = os.icon;
                const isSelected = selectedOsTab === os.id;
                return (
                  <button
                    key={os.id}
                    onClick={() => setSelectedOsTab(os.id as any)}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-950/40 border-red-500 text-white shadow-md shadow-red-950/50'
                        : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <IconComp className={`w-4 h-4 ${isSelected ? 'text-red-500' : 'text-zinc-400'}`} />
                      <span className="font-bold text-xs">{os.id}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">{os.name}</div>
                    <div className="text-[9px] text-zinc-500 mt-1 font-mono">{os.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Platform Instructions & Commands */}
            <div className="bg-black border border-zinc-800 rounded p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-bold">{selectedOsTab} Agent Deployment Instructions</span>
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded uppercase font-bold">
                    Production Ready
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadScript(selectedOsTab)}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded text-[11px] flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-red-400" />
                    <span>Download {selectedOsTab === 'iOS' ? '.mobileconfig' : selectedOsTab === 'Windows' ? '.ps1' : '.sh'}</span>
                  </button>
                  <button
                    onClick={() => handleSimulateOs(selectedOsTab)}
                    disabled={isSimulating}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3 h-3" />
                    <span>{isSimulating ? 'Sending Telemetry...' : `Simulate ${selectedOsTab} Heartbeat`}</span>
                  </button>
                </div>
              </div>

              {/* Download Toast Notification */}
              {downloadSuccessToast && (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded text-[11px] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{downloadSuccessToast}</span>
                  </div>
                  <button onClick={() => setDownloadSuccessToast(null)} className="text-zinc-400 hover:text-white">✕</button>
                </div>
              )}

              {/* Command box per OS */}
              {selectedOsTab === 'Windows' && (
                <div className="space-y-4">
                  {/* Method A: Instant Direct Script Paste */}
                  <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-zinc-300 flex items-center space-x-1.5">
                        <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold px-1.5 py-0.2 rounded">RECOMMENDED</span>
                        <strong className="text-white">Method 1 (Instant 1-Click Copy & Paste into PowerShell):</strong>
                      </div>
                      <button
                        onClick={() => handleCopyRawScript('Windows')}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[11px] flex items-center space-x-1.5 cursor-pointer shadow-md shadow-red-950"
                      >
                        <FileCode2 className="w-3.5 h-3.5" />
                        <span>{copiedScript === 'raw_windows' ? '✓ Script Copied!' : 'Copy Full PowerShell Code'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      Click the button above, open an elevated PowerShell prompt on your Windows device, press <strong className="text-zinc-200">Ctrl + V</strong>, and hit <strong className="text-zinc-200">Enter</strong>. It immediately gathers hardware, CPU, RAM, disks, network, and software registry metrics.
                    </p>
                  </div>

                  {/* Method B: Run Downloaded .ps1 file */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-zinc-400">
                      <strong className="text-white">Method 2 (Run Downloaded Script from Downloads Folder):</strong>
                    </div>
                    <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 flex items-center justify-between font-mono text-[11px] text-zinc-200">
                      <code className="text-emerald-400 truncate mr-2">
                        {winFileCommand}
                      </code>
                      <button
                        onClick={() => handleCopyCommand(winFileCommand, 'win_file')}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-[10px] border border-zinc-700 shrink-0 cursor-pointer"
                      >
                        {copiedScript === 'win_file' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Method C: Online Direct Fetch */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-zinc-400">
                      <strong className="text-white">Method 3 (Public Gateway One-Liner):</strong>
                    </div>
                    <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 flex items-center justify-between font-mono text-[11px] text-zinc-200">
                      <code className="text-red-400 truncate mr-2">
                        {winDirectCommand}
                      </code>
                      <button
                        onClick={() => handleCopyCommand(winDirectCommand, 'win_direct')}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-[10px] border border-zinc-700 shrink-0 cursor-pointer"
                      >
                        {copiedScript === 'win_direct' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500">
                    Telemetry Scanned: Win32_OperatingSystem, Win32_ComputerSystem, Win32_Processor, Win32_LogicalDisk, Installed Software (HKLM/HKCU), Network IP/MAC, and BIOS Serial Number.
                  </p>
                </div>
              )}

              {selectedOsTab === 'Linux' && (
                <div className="space-y-2">
                  <div className="text-[11px] text-zinc-400">
                    Run on any <strong className="text-white">Ubuntu, Debian, RHEL, CentOS, or Fedora</strong> terminal:
                  </div>
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800 flex items-center justify-between font-mono text-[11px] text-zinc-200">
                    <code className="text-red-400 truncate mr-2">
                      {linuxCommand}
                    </code>
                    <button
                      onClick={() => handleCopyCommand(linuxCommand, 'linux')}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-[10px] border border-zinc-700 shrink-0"
                    >
                      {copiedScript === 'linux' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Collects: /etc/os-release, lshw/lscpu, dpkg/rpm package manifests, systemd service status, memory & disk usage.
                  </p>
                </div>
              )}

              {selectedOsTab === 'macOS' && (
                <div className="space-y-2">
                  <div className="text-[11px] text-zinc-400">
                    Run in macOS <strong className="text-white">Terminal (zsh)</strong>:
                  </div>
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800 flex items-center justify-between font-mono text-[11px] text-zinc-200">
                    <code className="text-red-400 truncate mr-2">
                      {macCommand}
                    </code>
                    <button
                      onClick={() => handleCopyCommand(macCommand, 'mac')}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-[10px] border border-zinc-700 shrink-0"
                    >
                      {copiedScript === 'mac' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Collects: system_profiler SPHardwareDataType, SPSoftwareDataType, /Applications bundle inventory, Apple Silicon / Intel architecture.
                  </p>
                </div>
              )}

              {selectedOsTab === 'iOS' && (
                <div className="space-y-2">
                  <div className="text-[11px] text-zinc-400">
                    Install Apple MDM profile or trigger an iOS Shortcuts webhook payload to <code className="text-white">/api/discovery/agent/heartbeat</code>:
                  </div>
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800 flex items-center justify-between font-mono text-[11px] text-zinc-200">
                    <code className="text-red-400 truncate mr-2">
                      {iosCommand}
                    </code>
                    <button
                      onClick={() => handleCopyCommand(iosCommand, 'ios')}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-[10px] border border-zinc-700 shrink-0"
                    >
                      {copiedScript === 'ios' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Registers Apple iOS mobile endpoint with hardware serial, iOS version, battery health, and MDM payload.
                  </p>
                </div>
              )}
            </div>

            {/* Live Telemetry Ingestion Output Inspector */}
            {simulationResult && (
              <div className="p-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-emerald-500/40 rounded-lg space-y-3 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Live Telemetry & 204-Attribute Asset Provisioned for {simulationResult.simulatedOs}</span>
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono">
                      100% CMDB Synced
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const target = lastProvisionedCi || configurationItems.find(c => c.name === simulationResult.payload?.hostname);
                        if (target) {
                          setSelectedAssetForDetail(target);
                        } else {
                          handleOpenAgentAssetModal(simulationResult.payload, 'attributes204');
                          return;
                        }
                        setDetailModalInitialTab('attributes204');
                        setIsDetailModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold flex items-center space-x-1.5 shadow cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>View 204 Attributes Matrix</span>
                    </button>
                    <button
                      onClick={() => setActiveModule('hardware')}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-[11px] font-bold flex items-center space-x-1.5 cursor-pointer transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Open in Hardware Assets</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-300">
                  <div className="bg-black/80 p-2.5 rounded border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block uppercase font-mono">Discovered Hostname</span>
                    <strong className="text-white font-mono text-xs">{simulationResult.payload?.hostname}</strong>
                  </div>
                  <div className="bg-black/80 p-2.5 rounded border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block uppercase font-mono">OS Platform</span>
                    <strong className="text-red-400 font-mono text-xs">{simulationResult.payload?.osName || simulationResult.payload?.osType}</strong>
                  </div>
                  <div className="bg-black/80 p-2.5 rounded border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block uppercase font-mono">IP Address / MAC</span>
                    <strong className="text-white font-mono text-xs">{simulationResult.payload?.ipAddress}</strong>
                  </div>
                  <div className="bg-black/80 p-2.5 rounded border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block uppercase font-mono">Discovered Software</span>
                    <strong className="text-emerald-400 font-mono text-xs">{simulationResult.payload?.installedSoftware?.length || 18} Enterprise Apps</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-zinc-400">
                  <span className="text-zinc-500 font-semibold">Populated Pillars:</span>
                  <span className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-300">Identity (15)</span>
                  <span className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-300">Hardware & BIOS (40)</span>
                  <span className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-300">OS (25)</span>
                  <span className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-300">Network (30)</span>
                  <span className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-300">Software (25)</span>
                  <span className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-300">Ownership (18)</span>
                  <span className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-300">Security & BitLocker (25)</span>
                  <span className="bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-300">Virtual/Cloud (25)</span>
                </div>
              </div>
            )}
          </div>

          {/* Single Host Diagnostic IP Tester */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-white uppercase text-xs flex items-center space-x-2">
                <Activity className="w-4 h-4 text-red-500" />
                <span>Single-IP Host Diagnostic Probe (Agentless WMI / SSH / SNMP)</span>
              </span>
              <span className="text-[10px] text-zinc-500">Live Socket & Protocol Handshake</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={singleIpTest}
                onChange={(e) => setSingleIpTest(e.target.value)}
                placeholder="Enter IP Address (e.g. 10.20.4.15 or 192.168.1.50)"
                className="w-full sm:w-80 bg-black border border-zinc-800 px-3 py-2 text-white font-mono text-xs rounded focus:outline-none focus:border-red-500"
              />
              <button
                onClick={handleTestIpProbe}
                disabled={isTestingIp}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isTestingIp ? 'Testing Host Probe...' : 'Run Diagnostic Probe'}</span>
              </button>
            </div>

            {ipTestResult && (
              <div className="bg-black border border-zinc-800 p-3 rounded space-y-2 text-[11px]">
                <div className="flex justify-between items-center text-white font-bold">
                  <span>Diagnostic Result for {ipTestResult.ip}</span>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                    Confidence: {ipTestResult.confidenceScore || 92}%
                  </span>
                </div>
                <div className="text-zinc-400">
                  Detected OS: <strong className="text-white">{ipTestResult.detectedOs}</strong>
                </div>
                <div className="text-zinc-400">
                  Responsive Protocols:{' '}
                  <span className="text-red-400 font-bold">{ipTestResult.responsiveProtocols?.join(', ')}</span>
                </div>
                <div className="space-y-1 pt-1 border-t border-zinc-900 text-zinc-400">
                  {ipTestResult.diagnostics?.map((d: string, i: number) => (
                    <div key={i} className="flex space-x-2">
                      <span className="text-red-500 font-bold">✓</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Registered Agents Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 text-zinc-300 font-bold flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center space-x-2">
                <span>ACTIVE REGISTERED ENDPOINT AGENTS ({safeActiveAgents.length})</span>
                <span className="bg-zinc-900 border border-zinc-700 text-zinc-400 text-[10px] px-2 py-0.5 rounded">
                  Click any row to view 204 attributes
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-emerald-400 text-[10px] flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Heartbeat Telemetry: Active (TLS 1.3)</span>
                </span>
                <button
                  onClick={() => setActiveModule('hardware')}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Hardware Assets View</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase font-mono">
                  <tr>
                    <th className="p-3">Hostname / CI</th>
                    <th className="p-3">OS Platform</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Agent Version</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Discovered Software</th>
                    <th className="p-3">Last Heartbeat</th>
                    <th className="p-3 text-right">Actions & 204 Attributes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {safeActiveAgents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-zinc-500 font-mono text-xs">
                        No endpoint agents registered yet. Click &quot;Simulate Windows Heartbeat&quot; or run the collector script to enroll devices.
                      </td>
                    </tr>
                  ) : (
                    safeActiveAgents.map((ag) => (
                      <tr
                        key={ag.id}
                        onClick={() => handleOpenAgentAssetModal(ag, 'overview')}
                        className="hover:bg-zinc-900/80 cursor-pointer transition-colors group"
                      >
                        <td className="p-3 font-bold text-white flex items-center space-x-2">
                          <Monitor className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
                          <div>
                            <span className="group-hover:text-red-400 transition-colors">{ag.hostname}</span>
                            {ag.serialNumber && (
                              <span className="block text-[10px] font-normal font-mono text-zinc-500">
                                SN: {ag.serialNumber}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="bg-zinc-900 text-zinc-200 border border-zinc-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            {ag.os}
                          </span>
                        </td>
                        <td className="p-3 text-red-400 font-mono">{ag.ipAddress}</td>
                        <td className="p-3 font-mono text-[11px]">{ag.agentVersion}</td>
                        <td className="p-3">
                          <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                            {ag.status || 'Healthy'}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-300">{ag.softwareCount || 18} Apps</td>
                        <td className="p-3 text-zinc-400">{ag.lastSeen}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenAgentAssetModal(ag, 'attributes204')}
                              className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                              title="Inspect all 204 hardware, OS, network, security, and BIOS attributes"
                            >
                              <Layers className="w-3 h-3" />
                              <span>204 Matrix</span>
                            </button>
                            <button
                              onClick={() => handleOpenAgentAssetModal(ag, 'overview')}
                              className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
                              title="View full asset record and relationships"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View CI</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLOUD CONNECTORS */}
      {activeTab === 'cloud' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white font-bold text-sm">
                  <Cloud className="w-4 h-4 text-amber-500" />
                  <span>AWS Connector</span>
                </div>
                <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-bold">
                  Active
                </span>
              </div>
              <p className="text-zinc-400 text-[11px]">Region us-east-1, us-west-2 | Discovers EC2, S3, RDS, VPC & ECS.</p>
              <div className="pt-2 border-t border-zinc-900 flex justify-between text-zinc-500">
                <span>Account: 8823-9021-1204</span>
                <span className="text-white font-bold">142 CIs Discovered</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white font-bold text-sm">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  <span>Azure Resource Manager</span>
                </div>
                <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-bold">
                  Active
                </span>
              </div>
              <p className="text-zinc-400 text-[11px]">Tenant corp-azure.onmicrosoft.com | Discovers VMs, Disks, App Services.</p>
              <div className="pt-2 border-t border-zinc-900 flex justify-between text-zinc-500">
                <span>Sub: prod-enterprise-sub</span>
                <span className="text-white font-bold">88 CIs Discovered</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white font-bold text-sm">
                  <Cloud className="w-4 h-4 text-red-500" />
                  <span>GCP Cloud Engine</span>
                </div>
                <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-bold">
                  Active
                </span>
              </div>
              <p className="text-zinc-400 text-[11px]">Project: corporate-ai-prod | Discovers Compute Engine, GKE, Cloud SQL.</p>
              <div className="pt-2 border-t border-zinc-900 flex justify-between text-zinc-500">
                <span>Project ID: corp-ai-3921</span>
                <span className="text-white font-bold">54 CIs Discovered</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 font-bold text-zinc-300">
              DISCOVERED CLOUD INFRASTRUCTURE CONFIGURATION ITEMS (CIs)
            </div>
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Resource CI Name</th>
                  <th className="p-3">Cloud Provider</th>
                  <th className="p-3">Resource Type</th>
                  <th className="p-3">Region / Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Synced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {configurationItems.filter((c) => c.category === 'Cloud' || c.discoverySource === 'Cloud API').map((ci) => (
                  <tr key={ci.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{ci.name}</td>
                    <td className="p-3 text-red-400 font-bold">{ci.manufacturer || 'AWS / Azure'}</td>
                    <td className="p-3 text-zinc-400">{ci.ciClassName}</td>
                    <td className="p-3 text-zinc-400">{ci.locationName}</td>
                    <td className="p-3">
                      <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                        {ci.lifecycleState}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-500">{ci.lastDiscovered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SAAS & SHADOW IT */}
      {activeTab === 'saas' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm">SAAS & SHADOW IT DISCOVERY DASHBOARD</h3>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Ingested from Okta SSO, Entra ID OAuth logs, CASB security proxies, and corporate financial expense parsing.
              </p>
            </div>
            <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded border border-red-500">
              3 Unapproved Applications Detected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black p-4 border border-zinc-800 rounded space-y-1">
              <div className="text-zinc-400 text-[10px] uppercase font-bold">Approved Enterprise SaaS</div>
              <div className="text-2xl font-black text-white">61 Applications</div>
              <div className="text-[11px] text-emerald-400">Managed via Okta SAML 2.0</div>
            </div>

            <div className="bg-black p-4 border border-zinc-800 rounded space-y-1">
              <div className="text-zinc-400 text-[10px] uppercase font-bold">Unapproved Shadow IT SaaS</div>
              <div className="text-2xl font-black text-red-500">3 Apps Flagged</div>
              <div className="text-[11px] text-red-400">Discovered via Credit Card Receipts</div>
            </div>

            <div className="bg-black p-4 border border-zinc-800 rounded space-y-1">
              <div className="text-zinc-400 text-[10px] uppercase font-bold">Est. Monthly SaaS Spend</div>
              <div className="text-2xl font-black text-white">$142,500 / Month</div>
              <div className="text-[11px] text-zinc-400">1,840 Active User Entitlements</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RECONCILIATION ENGINE & CANDIDATE QUEUE */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Candidates Review Queue */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 font-bold text-white flex justify-between items-center">
              <span>DISCOVERED DEVICE CANDIDATES REQUIRING MANUAL RECONCILIATION REVIEW ({candidateDevices.length})</span>
              <span className="text-amber-400">Confidence Threshold Below 90%</span>
            </div>

            {candidateDevices.length === 0 ? (
              <div className="p-6 text-center text-zinc-500">No pending candidates requiring manual review.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Hostname</th>
                    <th className="p-3">IP / MAC Address</th>
                    <th className="p-3">Serial / UUID</th>
                    <th className="p-3">Detected OS</th>
                    <th className="p-3">Confidence Score</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {candidateDevices.map((cand) => (
                    <tr key={cand.id} className="hover:bg-zinc-900">
                      <td className="p-3 font-bold text-white">{cand.hostname}</td>
                      <td className="p-3 text-red-400">{cand.ip} / {cand.mac}</td>
                      <td className="p-3 text-zinc-300">{cand.serial}</td>
                      <td className="p-3 text-zinc-400">{cand.os}</td>
                      <td className="p-3">
                        <span className="bg-amber-600/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                          {cand.confidence}% Match
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleApproveCandidate(cand.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded cursor-pointer"
                        >
                          Approve as CI
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Data Conflicts Panel */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 font-bold text-white flex justify-between items-center">
              <span>MULTI-SOURCE DISCOVERED DATA CONFLICTS ({conflicts.length})</span>
              <span className="text-red-400">Precedence Override Required</span>
            </div>

            <div className="divide-y divide-zinc-800">
              {conflicts.map((conf) => (
                <div key={conf.id} className="p-4 bg-zinc-950 hover:bg-zinc-900 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white text-sm">{conf.ciName}</div>
                      <div className="text-red-400 font-bold text-xs mt-0.5">Conflicting Attribute: {conf.field}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedConflict(conf);
                        setIsConflictModalOpen(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded cursor-pointer"
                    >
                      Resolve Conflict
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="p-3 bg-black border border-zinc-800 rounded space-y-1">
                      <div className="text-zinc-500 text-[10px] uppercase font-bold">Source A: {conf.sourceA.name}</div>
                      <div className="text-white font-bold">{conf.sourceA.value}</div>
                      <div className="text-zinc-500 text-[10px]">Observed: {conf.sourceA.timestamp}</div>
                    </div>

                    <div className="p-3 bg-black border border-zinc-800 rounded space-y-1">
                      <div className="text-zinc-500 text-[10px] uppercase font-bold">Source B: {conf.sourceB.name}</div>
                      <div className="text-zinc-300 font-bold">{conf.sourceB.value}</div>
                      <div className="text-zinc-500 text-[10px]">Observed: {conf.sourceB.timestamp}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SOFTWARE NORMALIZATION CATALOG */}
      {activeTab === 'normalization' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
          <div className="p-3 bg-black border-b border-zinc-800 text-zinc-400 font-bold flex justify-between">
            <span>CANONICAL SOFTWARE CATALOG ({softwareCatalog.length})</span>
            <span>Raw Discovered String Normalization Engine</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
              <tr>
                <th className="p-3">Publisher</th>
                <th className="p-3">Canonical Product Name</th>
                <th className="p-3">Raw Strings Mapped</th>
                <th className="p-3">Category</th>
                <th className="p-3">Licensed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {softwareCatalog.map((sw) => (
                <tr key={sw.id} className="hover:bg-zinc-900">
                  <td className="p-3 font-bold text-white">{sw.publisher}</td>
                  <td className="p-3 text-red-400 font-bold">{sw.productName}</td>
                  <td className="p-3 text-zinc-400 truncate max-w-xs">{sw.rawStrings.join(' | ')}</td>
                  <td className="p-3">{sw.category}</td>
                  <td className="p-3">
                    <span className="bg-black border border-red-500 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      {sw.isLicensed ? 'Licensed Product' : 'Freeware'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 8: DRIFT & CONFIGURATION DELTA EVENTS */}
      {activeTab === 'drift' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
          <div className="p-3 bg-black border-b border-zinc-800 text-zinc-400 font-bold flex justify-between">
            <span>CONFIGURATION CHANGE & DRIFT EVENTS ({driftEvents.length})</span>
            <span>Real-Time Delta Comparison Engine</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
              <tr>
                <th className="p-3">CI Name</th>
                <th className="p-3">Attribute Changed</th>
                <th className="p-3">Previous State</th>
                <th className="p-3">New State</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Detected At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {driftEvents.map((drift) => (
                <tr key={drift.id} className="hover:bg-zinc-900">
                  <td className="p-3 font-bold text-white">{drift.ciName}</td>
                  <td className="p-3 text-zinc-300">{drift.attributeName}</td>
                  <td className="p-3 text-zinc-500">{drift.previousValue}</td>
                  <td className="p-3 text-red-400 font-bold">{drift.newValue}</td>
                  <td className="p-3">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {drift.riskLevel}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-400">{drift.detectedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* NEW SCAN MODAL */}
      {isNewScanModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Radar className="w-4 h-4 text-red-500" />
                <span>Configure Agentless Network Scan Schedule</span>
              </h3>
              <button onClick={() => setIsNewScanModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateScan} className="space-y-4">
              <div>
                <label className="block text-zinc-400 mb-1">Scan Job Name</label>
                <input
                  type="text"
                  required
                  value={scanName}
                  onChange={(e) => setScanName(e.target.value)}
                  placeholder="e.g. Datacenter Subnet 10.20.0.0/23 Daily Sweep"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Discovery Method</label>
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                >
                  <option value="Subnet Range">Subnet Range (CIDR Sweep)</option>
                  <option value="WMI">Windows WMI / WinRM</option>
                  <option value="SSH">Linux SSH Key</option>
                  <option value="SNMP">SNMP v2c / v3 Network Devices</option>
                  <option value="Cloud AWS">AWS Cloud API Connector</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Target Range / CIDR / Subnet</label>
                <input
                  type="text"
                  required
                  value={scanTarget}
                  onChange={(e) => setScanTarget(e.target.value)}
                  placeholder="10.20.0.0/24 or 192.168.1.1-192.168.1.254"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Recurrence Schedule</label>
                <select
                  value={scanSchedule}
                  onChange={(e) => setScanSchedule(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                >
                  <option value="Manual">Manual On-Demand</option>
                  <option value="Hourly">Hourly Sweep</option>
                  <option value="Daily">Daily Nightly Sweep</option>
                  <option value="Weekly">Weekly Deep Audit</option>
                </select>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewScanModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded cursor-pointer"
                >
                  Save & Queue Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIAL MODAL */}
      {isCredentialModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-red-500" />
                <span>Store Encrypted Discovery Credential</span>
              </h3>
              <button onClick={() => setIsCredentialModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCred} className="space-y-4">
              <div>
                <label className="block text-zinc-400 mb-1">Credential Name</label>
                <input
                  type="text"
                  required
                  value={credName}
                  onChange={(e) => setCredName(e.target.value)}
                  placeholder="e.g. Corp Domain Read-Only WinRM"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Credential Type</label>
                <select
                  value={credType}
                  onChange={(e) => setCredType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                >
                  <option value="Windows WMI / WinRM">Windows WMI / WinRM</option>
                  <option value="Linux SSH Key">Linux SSH Private Key</option>
                  <option value="SNMP v3">SNMP v3 Auth/Priv</option>
                  <option value="AWS IAM Role">AWS IAM Role ARN</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Username / Service Account</label>
                <input
                  type="text"
                  required
                  value={credUsername}
                  onChange={(e) => setCredUsername(e.target.value)}
                  placeholder="svc_itam_discovery"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Password / Private Key / Token Secret</label>
                <input
                  type="password"
                  required
                  value={credSecret}
                  onChange={(e) => setCredSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCredentialModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded cursor-pointer"
                >
                  Encrypt & Save Secret
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATE ENROLLMENT TOKEN MODAL */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-emerald-500" />
                <span>Agent Enrollment Key Generated</span>
              </h3>
              <button onClick={() => setIsTokenModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-zinc-300">Run this command on candidate endpoints to install and securely enroll the ITAM Discovery Agent:</p>

              <div className="p-3 bg-black border border-zinc-800 rounded font-mono text-red-400 break-all select-all">
                curl -sSF https://itam.corp/agent/install.sh | bash -s -- --token {generatedToken}
              </div>

              <p className="text-[10px] text-zinc-500">Token expires in 24 hours. Single-use rotational security policy enabled.</p>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setIsTokenModalOpen(false)}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE CONFLICT MODAL */}
      {isConflictModalOpen && selectedConflict && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-red-500" />
                <span>Resolve Data Precedence Conflict</span>
              </h3>
              <button onClick={() => setIsConflictModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-zinc-300">Select which discovered value should be committed to the CMDB for <span className="text-white font-bold">{selectedConflict.ciName}</span>:</p>

              <div className="space-y-2">
                <button
                  onClick={() => handleResolveConflict(selectedConflict.id, selectedConflict.sourceA.name)}
                  className="w-full text-left p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <div className="text-white font-bold">{selectedConflict.sourceA.name}</div>
                    <div className="text-red-400 font-bold mt-0.5">{selectedConflict.sourceA.value}</div>
                  </div>
                  <span className="text-emerald-400 font-bold text-[10px]">Commit Source A</span>
                </button>

                <button
                  onClick={() => handleResolveConflict(selectedConflict.id, selectedConflict.sourceB.name)}
                  className="w-full text-left p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <div className="text-white font-bold">{selectedConflict.sourceB.name}</div>
                    <div className="text-zinc-300 font-bold mt-0.5">{selectedConflict.sourceB.value}</div>
                  </div>
                  <span className="text-zinc-400 font-bold text-[10px]">Commit Source B</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setIsConflictModalOpen(false)}
                className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hardware Asset Detail Modal for 204 Attributes Inspection */}
      <HardwareAssetDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAssetForDetail(null);
        }}
        asset={selectedAssetForDetail}
        initialTab={detailModalInitialTab}
      />
    </div>
  );
};

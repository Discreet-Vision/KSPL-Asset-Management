import { 
  UnifiedDiscoveryResult, 
  DiscoveryMethod, 
  AgentlessSweepConfig, 
  EndpointAgentRecord, 
  CloudConnectorConfig, 
  SaasConnectorRecord, 
  DiscoveryJob 
} from './types';

export class MultiMethodDiscoveryEngine {
  private results: Map<string, UnifiedDiscoveryResult> = new Map();
  private jobs: Map<string, DiscoveryJob> = new Map();
  private agentlessConfigs: Map<string, AgentlessSweepConfig> = new Map();
  private agentRecords: Map<string, EndpointAgentRecord> = new Map();
  private cloudConnectors: Map<string, CloudConnectorConfig> = new Map();
  private saasConnectors: Map<string, SaasConnectorRecord> = new Map();

  constructor() {
    this.seedInitialDiscoveryData();
  }

  private seedInitialDiscoveryData() {
    // 1. Initial Discovery Results
    const initialResults: UnifiedDiscoveryResult[] = [
      {
        id: 'disc-101',
        sourceMethod: 'Agentless Network',
        subProtocol: 'SNMP',
        tenantId: 'tenant-kspl-global',
        timestamp: '2026-08-11 10:00:00',
        confidenceScore: 88,
        rawIdentifier: 'SNMP-MAC-00:1A:2B:3C:4D:5E',
        hostname: 'core-sw-rack01.internal',
        ipAddress: '10.10.1.1',
        macAddress: '00:1A:2B:3C:4D:5E',
        serialNumber: 'SN-SW-881902',
        manufacturer: 'Cisco Systems',
        model: 'Catalyst 9300',
        candidateClass: 'Hardware',
        candidateType: 'Network Switch',
        status: 'Pending Reconciliation',
        rawAttributes: { firmware: '17.3.4', uptimeDays: 142, portsTotal: 48 }
      },
      {
        id: 'disc-102',
        sourceMethod: 'Endpoint Agent',
        subProtocol: 'Go-Agent-v2.4',
        tenantId: 'tenant-kspl-global',
        timestamp: '2026-08-11 10:15:00',
        confidenceScore: 98,
        rawIdentifier: 'UUID-9A8B-7C6D-5E4F',
        hostname: 'prod-cmdb-master-01',
        ipAddress: '10.10.4.15',
        macAddress: '02:42:AC:11:00:02',
        serialNumber: 'VMware-42 1b 88 9a',
        manufacturer: 'VMware Inc',
        model: 'Virtual Machine',
        osName: 'Ubuntu Linux',
        osVersion: '22.04 LTS',
        installedSoftwareCount: 42,
        candidateClass: 'Hardware',
        candidateType: 'Database Server',
        status: 'Reconciled',
        rawAttributes: { cpuCores: 16, ramGb: 64, kernel: '5.15.0-88-generic' }
      },
      {
        id: 'disc-103',
        sourceMethod: 'Cloud API',
        subProtocol: 'AWS EC2 API',
        tenantId: 'tenant-kspl-global',
        timestamp: '2026-08-11 10:20:00',
        confidenceScore: 95,
        rawIdentifier: 'i-0a8f9c2d1e3b4a5c6',
        hostname: 'aws-ec2-api-gateway-prod',
        ipAddress: '54.210.12.88',
        cloudResourceId: 'i-0a8f9c2d1e3b4a5c6',
        cloudProvider: 'AWS',
        candidateClass: 'Cloud',
        candidateType: 'Cloud Compute Instance',
        status: 'Reconciled',
        rawAttributes: { instanceType: 't3.large', region: 'us-east-1', vpcId: 'vpc-01829' }
      },
      {
        id: 'disc-104',
        sourceMethod: 'SaaS OAuth',
        subProtocol: 'Microsoft Graph OAuth',
        tenantId: 'tenant-kspl-global',
        timestamp: '2026-08-11 09:30:00',
        confidenceScore: 92,
        rawIdentifier: 'SAAS-MS365-TENANT-991',
        hostname: 'microsoft365.com',
        saasAppName: 'Microsoft 365 Enterprise E5',
        saasActiveUsers: 1450,
        candidateClass: 'Software',
        candidateType: 'SaaS Application',
        status: 'Reconciled',
        rawAttributes: { licensedSeats: 1500, activeUsers: 1450, tier: 'E5 Enterprise' }
      }
    ];

    initialResults.forEach(r => this.results.set(r.id, r));

    // 2. Initial Network Sweep Configs
    this.agentlessConfigs.set('sweep-01', {
      jobId: 'sweep-01',
      targetCidr: '10.10.0.0/24',
      protocols: ['SNMP', 'WMI', 'SSH'],
      credentialsProfile: 'Corp-Internal-Creds-V2',
      concurrencyLimit: 32,
      timeoutSeconds: 5,
      status: 'Idle',
      devicesFound: 14,
      lastRunTimestamp: '2026-08-11 08:00:00'
    });

    // 3. Initial Endpoint Agents for Windows, Linux, macOS, and iOS
    this.agentRecords.set('ag-win-01', {
      agentId: 'AGT-WIN11-9821',
      deviceId: 'DEV-WIN-PROD-01',
      hostname: 'CORP-WIN11-EXEC',
      osType: 'Windows',
      osName: 'Microsoft Windows 11 Enterprise (23H2)',
      osVersion: '10.0.22631.3880',
      agentVersion: 'v2.4.2-win64',
      status: 'Healthy',
      lastSeen: '2026-08-17 06:15:00',
      ipAddress: '10.20.4.12',
      macAddress: '00:15:5D:82:11:4A',
      serialNumber: 'DELL-LAT-9440-X1',
      manufacturer: 'Dell Inc.',
      model: 'Latitude 9440 2-in-1',
      installedSoftwareCount: 48,
      installedSoftwareSample: ['Microsoft 365 Apps', 'CrowdStrike Falcon Sensor', 'Google Chrome Enterprise', 'Zoom Workplace', 'Docker Desktop'],
      missingPatchCount: 1,
      cpuUsagePct: 18.5,
      memoryUsagePct: 44.2,
      cpuModel: '13th Gen Intel Core i7-1365U',
      cpuCores: 10,
      memoryTotalGb: 32,
      diskTotalGb: 512,
      diskFreeGb: 320,
    });

    this.agentRecords.set('ag-lin-01', {
      agentId: 'AGT-LIN-2204',
      deviceId: 'DEV-UBUNTU-DB01',
      hostname: 'srv-db-cluster-01',
      osType: 'Linux',
      osName: 'Ubuntu Linux 24.04 LTS (Noble Numbat)',
      osVersion: 'Linux 6.8.0-39-generic',
      agentVersion: 'v2.4.2-linux64',
      status: 'Healthy',
      lastSeen: '2026-08-17 06:18:00',
      ipAddress: '10.20.4.15',
      macAddress: '52:54:00:AB:CD:01',
      serialNumber: 'SRV-HPE-PROLIANT-DL380',
      manufacturer: 'HPE',
      model: 'ProLiant DL380 Gen10 Plus',
      installedSoftwareCount: 64,
      installedSoftwareSample: ['PostgreSQL 16.2', 'Redis Server 7.2', 'OpenSSL 3.0.13', 'Prometheus Node Exporter', 'Nginx 1.26'],
      missingPatchCount: 0,
      cpuUsagePct: 32.1,
      memoryUsagePct: 68.7,
      cpuModel: 'Intel Xeon Silver 4314 (32 Cores)',
      cpuCores: 32,
      memoryTotalGb: 128,
      diskTotalGb: 2048,
      diskFreeGb: 1420,
    });

    this.agentRecords.set('ag-mac-01', {
      agentId: 'AGT-MAC-M3PRO',
      deviceId: 'DEV-MACBOOK-ENG04',
      hostname: 'dev-macbook-pro-m3.local',
      osType: 'macOS',
      osName: 'macOS Sonoma (Darwin 23.6.0)',
      osVersion: '14.6.1 (Build 23G93)',
      agentVersion: 'v2.4.2-darwin-arm64',
      status: 'Healthy',
      lastSeen: '2026-08-17 06:19:00',
      ipAddress: '10.20.4.28',
      macAddress: 'F0:18:98:AA:BB:CC',
      serialNumber: 'C02G80X0MD6R',
      manufacturer: 'Apple Inc.',
      model: 'MacBook Pro 16-inch (M3 Max, 64GB)',
      installedSoftwareCount: 52,
      installedSoftwareSample: ['Xcode 15.4', 'Visual Studio Code', 'Node.js v20.14.0', 'Slack', '1Password', 'Docker Desktop'],
      missingPatchCount: 0,
      cpuUsagePct: 12.0,
      memoryUsagePct: 51.3,
      cpuModel: 'Apple M3 Max (16-core CPU, 40-core GPU)',
      cpuCores: 16,
      memoryTotalGb: 64,
      diskTotalGb: 1000,
      diskFreeGb: 580,
    });

    this.agentRecords.set('ag-ios-01', {
      agentId: 'AGT-IOS-MDM-101',
      deviceId: 'DEV-IPHONE15-CORP01',
      hostname: 'Corp-iPhone-15Pro-Field',
      osType: 'iOS',
      osName: 'Apple iOS (Managed Device)',
      osVersion: 'iOS 17.6.1 (Build 21G93)',
      agentVersion: 'v2.4.2-apple-mdm',
      status: 'Healthy',
      lastSeen: '2026-08-17 06:20:00',
      ipAddress: '10.20.6.99',
      macAddress: 'DC:A9:04:11:22:33',
      serialNumber: 'F2LXK990M29',
      manufacturer: 'Apple Inc.',
      model: 'iPhone 15 Pro (256GB, Titanium)',
      installedSoftwareCount: 16,
      installedSoftwareSample: ['Microsoft Outlook iOS', 'Microsoft Authenticator', 'Salesforce Mobile', 'Zscaler Client Connector', 'Slack iOS'],
      missingPatchCount: 0,
      cpuUsagePct: 5.4,
      memoryUsagePct: 38.0,
      cpuModel: 'Apple A17 Pro (6-core CPU)',
      cpuCores: 6,
      memoryTotalGb: 8,
      diskTotalGb: 256,
      diskFreeGb: 184,
    });

    // 4. Initial Cloud Connectors
    this.cloudConnectors.set('conn-aws-01', {
      connectorId: 'conn-aws-01',
      provider: 'AWS',
      accountId: '881029384712 (US-East)',
      authMechanism: 'IAM Role',
      syncIntervalHours: 1,
      status: 'Active',
      lastSyncTimestamp: '2026-08-11 10:00:00',
      resourcesDiscovered: 128
    });

    this.cloudConnectors.set('conn-azure-01', {
      connectorId: 'conn-azure-01',
      provider: 'Azure',
      accountId: 'sub-3901-prod-corp',
      authMechanism: 'Workload Identity',
      syncIntervalHours: 2,
      status: 'Active',
      lastSyncTimestamp: '2026-08-11 09:30:00',
      resourcesDiscovered: 84
    });

    // 5. Initial SaaS Connectors
    this.saasConnectors.set('saas-01', {
      id: 'saas-01',
      saasName: 'Microsoft 365 Enterprise',
      provider: 'Microsoft',
      authType: 'OAuth2',
      licensedSeats: 1500,
      activeUsers: 1450,
      syncStatus: 'Synced',
      lastSync: '2026-08-11 09:30:00'
    });

    // 6. Discovery Jobs History
    this.jobs.set('job-901', {
      id: 'job-901',
      name: 'Automated Subnet 10.10.0.0/24 SNMP Sweep',
      method: 'Agentless Network',
      tenantId: 'tenant-kspl-global',
      startTime: '2026-08-11 08:00:00',
      endTime: '2026-08-11 08:04:12',
      status: 'SUCCESS',
      itemsDiscovered: 14,
      newCis: 2,
      updatedCis: 12,
      errorsCount: 0,
      logSummary: 'Scanned 254 IP addresses across 10.10.0.0/24. Discovered 14 SNMP/WMI hosts successfully.'
    });
  }

  /**
   * Execute Agentless Network Sweep
   */
  public triggerAgentlessSweep(cidr: string, protocols: string[]): DiscoveryJob {
    const jobId = `job-${Date.now()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newJob: DiscoveryJob = {
      id: jobId,
      name: `On-Demand Scan for ${cidr}`,
      method: 'Agentless Network',
      tenantId: 'tenant-kspl-global',
      startTime: timestamp,
      endTime: timestamp,
      status: 'SUCCESS',
      itemsDiscovered: 6,
      newCis: 1,
      updatedCis: 5,
      errorsCount: 0,
      logSummary: `Completed sweep on range ${cidr} via ${protocols.join(', ')}. Discovered 6 responsive devices.`
    };

    this.jobs.set(jobId, newJob);

    // Inject discovered result candidate
    const newResult: UnifiedDiscoveryResult = {
      id: `disc-${Date.now()}`,
      sourceMethod: 'Agentless Network',
      subProtocol: protocols[0] || 'SNMP',
      tenantId: 'tenant-kspl-global',
      timestamp,
      confidenceScore: 85,
      rawIdentifier: `SWEEP-${cidr}-${Date.now()}`,
      hostname: `discovered-host-${Math.floor(Math.random() * 100)}.internal`,
      ipAddress: cidr.replace('/24', '.45'),
      macAddress: '00:50:56:A1:B2:C3',
      manufacturer: 'Dell Inc.',
      model: 'PowerEdge R740',
      candidateClass: 'Hardware',
      candidateType: 'Physical Server',
      status: 'Pending Reconciliation',
      rawAttributes: { scanRange: cidr, responseTimeMs: 12 }
    };

    this.results.set(newResult.id, newResult);
    return newJob;
  }

  /**
   * Ingest CSV / Manual Discovery Payload
   */
  public ingestManualOrCsv(
    hostname: string, 
    ip: string, 
    serial: string, 
    candidateClass: 'Hardware' | 'Software' | 'Cloud' | 'Service',
    method: 'Manual Entry' | 'CSV Import'
  ): UnifiedDiscoveryResult {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const result: UnifiedDiscoveryResult = {
      id: `disc-${Date.now()}`,
      sourceMethod: method,
      subProtocol: method === 'CSV Import' ? 'Bulk CSV Adapter' : 'Web Console Form',
      tenantId: 'tenant-kspl-global',
      timestamp,
      confidenceScore: method === 'Manual Entry' ? 100 : 90,
      rawIdentifier: serial ? `SER-${serial}` : `MANUAL-${hostname}`,
      hostname,
      ipAddress: ip || '127.0.0.1',
      serialNumber: serial || `MAN-${Date.now()}`,
      candidateClass,
      candidateType: candidateClass === 'Hardware' ? 'Isolated Equipment' : 'Enterprise Software',
      status: 'Pending Reconciliation',
      rawAttributes: { ingestedBy: 'ITAM Administrator', method }
    };

    this.results.set(result.id, result);
    return result;
  }

  public getAllResults(): UnifiedDiscoveryResult[] {
    return Array.from(this.results.values());
  }

  public getAllJobs(): DiscoveryJob[] {
    return Array.from(this.jobs.values());
  }

  public getAgents(): EndpointAgentRecord[] {
    return Array.from(this.agentRecords.values());
  }

  public getCloudConnectors(): CloudConnectorConfig[] {
    return Array.from(this.cloudConnectors.values());
  }

  public getSaasConnectors(): SaasConnectorRecord[] {
    return Array.from(this.saasConnectors.values());
  }
}

export const multiMethodDiscoveryEngine = new MultiMethodDiscoveryEngine();

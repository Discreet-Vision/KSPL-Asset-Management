import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Award,
  KeyRound,
  FileText,
  Calculator,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Sliders,
  Plus,
  Play,
  Zap,
  Building,
  Users,
  HardDrive,
  Cpu,
  Download,
  Eye,
  Check,
  X,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Briefcase,
  Terminal,
  BookOpen,
  ArrowUpRight,
  Lock,
} from 'lucide-react';
import {
  LicenseEntitlement,
  LicenseConsumptionRecord,
  EffectiveLicensePositionItem,
  LicenseRule,
  AuditScenario,
  AuditFinding,
  ComplianceException,
  ComplianceStatus,
  LicenseMetricType,
} from '../../types';

export const SoftwareComplianceModule: React.FC = () => {
  const { currentTenant, currentUser, addAuditEntry } = useApp();

  // Sub-tab navigation
  const [activeTab, setActiveTab] = useState<
    'overview' | 'elp' | 'entitlements' | 'consumption' | 'rules' | 'simulator' | 'exceptions' | 'evidence' | 'audit_log'
  >('overview');

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPublisherFilter, setSelectedPublisherFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Selected item for Drill-down / Modal
  const [selectedElpItem, setSelectedElpItem] = useState<EffectiveLicensePositionItem | null>(null);
  const [isDrillDownModalOpen, setIsDrillDownModalOpen] = useState(false);

  // Modal for New Entitlement
  const [isAddEntitlementOpen, setIsAddEntitlementOpen] = useState(false);
  const [newEntSoftware, setNewEntSoftware] = useState('');
  const [newEntPublisher, setNewEntPublisher] = useState('Microsoft');
  const [newEntMetric, setNewEntMetric] = useState<LicenseMetricType>('Per User');
  const [newEntQty, setNewEntQty] = useState<number>(100);
  const [newEntContract, setNewEntContract] = useState('CON-8820');

  // Modal for New Exception
  const [isAddExceptionOpen, setIsAddExceptionOpen] = useState(false);
  const [newExSoftware, setNewExSoftware] = useState('');
  const [newExTitle, setNewExTitle] = useState('');
  const [newExReason, setNewExReason] = useState('');

  // What-If Simulator state
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario-1');
  const [whatIfLicenseDelta, setWhatIfLicenseDelta] = useState<number>(0);
  const [whatIfUserDelta, setWhatIfUserDelta] = useState<number>(0);

  // 1. INITIAL ENTITLEMENTS DATA
  const [entitlements, setEntitlements] = useState<LicenseEntitlement[]>([
    {
      id: 'ent-101',
      softwareName: 'Microsoft 365 E3 Enterprise',
      publisher: 'Microsoft',
      vendorProfile: 'Microsoft',
      metric: 'Per User',
      ownedQuantity: 500,
      purchaseDate: '2026-01-01',
      expirationDate: '2027-01-01',
      status: 'Active',
      contractNumber: 'CON-10025',
      contractType: 'Enterprise Agreement (EA)',
      source: 'ERP',
      costCenter: 'CC-9082',
      allocatedDept: 'Global Workforce',
      unitCost: 384.00,
      tenantId: currentTenant.id,
    },
    {
      id: 'ent-102',
      softwareName: 'Oracle Database Enterprise Edition 19c',
      publisher: 'Oracle',
      vendorProfile: 'Oracle',
      metric: 'Per Core',
      ownedQuantity: 64,
      purchaseDate: '2025-06-15',
      expirationDate: '2028-06-15',
      status: 'Active',
      contractNumber: 'ORCL-PERP-88',
      contractType: 'Perpetual + Software Update & Support',
      source: 'Contract Management',
      costCenter: 'CC-1004',
      allocatedDept: 'Database Engineering',
      unitCost: 4750.00,
      tenantId: currentTenant.id,
    },
    {
      id: 'ent-103',
      softwareName: 'SAP S/4HANA Professional User',
      publisher: 'SAP',
      vendorProfile: 'SAP',
      metric: 'Per Named User',
      ownedQuantity: 150,
      purchaseDate: '2024-03-01',
      expirationDate: '2026-08-31',
      status: 'Expiring Soon',
      contractNumber: 'SAP-S4-9912',
      contractType: 'Cloud Subscription',
      source: 'Procurement',
      costCenter: 'CC-3021',
      allocatedDept: 'Finance & Supply Chain',
      unitCost: 2100.00,
      tenantId: currentTenant.id,
    },
    {
      id: 'ent-104',
      softwareName: 'Adobe Creative Cloud All Apps',
      publisher: 'Adobe',
      vendorProfile: 'Adobe',
      metric: 'Subscription',
      ownedQuantity: 80,
      purchaseDate: '2025-11-01',
      expirationDate: '2026-11-01',
      status: 'Active',
      contractNumber: 'ADBE-VIP-4401',
      contractType: 'VIP Enterprise',
      source: 'Vendor Agreement',
      costCenter: 'CC-7001',
      allocatedDept: 'Marketing & Design',
      unitCost: 960.00,
      tenantId: currentTenant.id,
    },
  ]);

  // 2. EFFECTIVE LICENSE POSITION (ELP) ITEMS
  const [elpItems, setElpItems] = useState<EffectiveLicensePositionItem[]>([
    {
      id: 'elp-1',
      softwareName: 'Microsoft 365 E3 Enterprise',
      publisher: 'Microsoft',
      metric: 'Per User',
      entitlementsOwned: 500,
      licensesConsumed: 525,
      availableLicenses: 0,
      shortfall: 25,
      elpNumber: -25,
      status: 'NON-COMPLIANT',
      contractNumber: 'CON-10025',
      expirationDate: '2027-01-01',
      estimatedFinancialRisk: 9600, // $ ESTIMATE
      calculationBreakdown: {
        inputData: '562 Intune + Active Directory assigned users discovered across endpoints.',
        ruleApplied: 'Microsoft Single-User Multi-Device Entitlement Rule (Max 5 devices per entitled user).',
        includedCount: 525,
        excludedCount: 37,
        exclusionReason: '37 duplicate device installs mapped to already entitled primary user identities.',
        resultSummary: 'Over-deployed by 25 users. Shortfall calculation: 500 Owned - 525 Consumed = -25 ELP.',
      },
      tenantId: currentTenant.id,
    },
    {
      id: 'elp-2',
      softwareName: 'Oracle Database Enterprise Edition 19c',
      publisher: 'Oracle',
      vendorProfile: 'Oracle',
      metric: 'Per Core',
      entitlementsOwned: 64,
      licensesConsumed: 72,
      availableLicenses: 0,
      shortfall: 8,
      elpNumber: -8,
      status: 'NON-COMPLIANT',
      contractNumber: 'ORCL-PERP-88',
      expirationDate: '2028-06-15',
      estimatedFinancialRisk: 38000, // $ ESTIMATE
      calculationBreakdown: {
        inputData: '9 physical DB host servers identified with 144 physical cores total.',
        ruleApplied: 'Oracle Core Factor Table (x0.5 Intel x86 Multi-core multiplier applied).',
        includedCount: 72,
        excludedCount: 0,
        exclusionReason: 'All active cores on production Oracle DB host clusters counted.',
        resultSummary: 'Required Cores = 72. Entitlements = 64. Net Core Shortfall = -8 Cores.',
      },
      tenantId: currentTenant.id,
    },
    {
      id: 'elp-3',
      softwareName: 'SAP S/4HANA Professional User',
      publisher: 'SAP',
      metric: 'Per Named User',
      entitlementsOwned: 150,
      licensesConsumed: 142,
      availableLicenses: 8,
      shortfall: 0,
      elpNumber: 8,
      status: 'AT RISK',
      contractNumber: 'SAP-S4-9912',
      expirationDate: '2026-08-31',
      estimatedFinancialRisk: 0,
      calculationBreakdown: {
        inputData: '142 active user accounts logged into SAP S/4HANA client within last 30 days.',
        ruleApplied: 'SAP Professional User Classification Rule.',
        includedCount: 142,
        excludedCount: 8,
        exclusionReason: '8 accounts flagged as Developer or Indirect RFC interface accounts (separate licensing).',
        resultSummary: '142/150 Consumed. Compliant but contract expires in < 30 days (AT RISK).',
      },
      tenantId: currentTenant.id,
    },
    {
      id: 'elp-4',
      softwareName: 'Adobe Creative Cloud All Apps',
      publisher: 'Adobe',
      metric: 'Subscription',
      entitlementsOwned: 80,
      licensesConsumed: 62,
      availableLicenses: 18,
      shortfall: 0,
      elpNumber: 18,
      status: 'COMPLIANT',
      contractNumber: 'ADBE-VIP-4401',
      expirationDate: '2026-11-01',
      estimatedFinancialRisk: 0,
      calculationBreakdown: {
        inputData: '62 active Adobe Admin Console assigned user profiles.',
        ruleApplied: 'Adobe Named User Cloud Subscription Policy.',
        includedCount: 62,
        excludedCount: 0,
        exclusionReason: 'None.',
        resultSummary: '80 Owned - 62 Consumed = +18 Available Licenses. High under-utilization rate.',
      },
      tenantId: currentTenant.id,
    },
  ]);

  // 3. VENDOR LICENSE RULES
  const [licenseRules] = useState<LicenseRule[]>([
    {
      id: 'rule-1',
      vendorName: 'Microsoft',
      productName: 'Microsoft 365 / Office 365',
      metric: 'Per User',
      ruleDescription: 'Entitled user may activate software on up to 5 concurrent personal/work devices without additional license consumption.',
      deDuplicateUsers: true,
      tenantId: currentTenant.id,
    },
    {
      id: 'rule-2',
      vendorName: 'Oracle',
      productName: 'Oracle Database Enterprise Edition',
      metric: 'Per Core',
      ruleDescription: 'Physical x86 Intel/AMD cores multiplied by Oracle Core Factor of 0.50. Soft-partitioning (VMware vSphere) requires licensing entire cluster.',
      coreFactor: 0.5,
      virtualizationMultiplier: 1.0,
      tenantId: currentTenant.id,
    },
    {
      id: 'rule-3',
      vendorName: 'SAP',
      productName: 'SAP S/4HANA Enterprise',
      metric: 'Per Named User',
      ruleDescription: 'User classifications defined by operational role (Professional, Functional, Productivity). Indirect API/RFC interface usage evaluated separately.',
      tenantId: currentTenant.id,
    },
    {
      id: 'rule-4',
      vendorName: 'Adobe',
      productName: 'Adobe Creative Cloud',
      metric: 'Subscription',
      ruleDescription: 'Single Named User deployment across 2 devices (1 desktop + 1 laptop). Simultaneous usage strictly prohibited.',
      deDuplicateUsers: true,
      tenantId: currentTenant.id,
    },
  ]);

  // 4. AUDIT SCENARIOS (WHAT-IF SIMULATOR)
  const [auditScenarios, setAuditScenarios] = useState<AuditScenario[]>([
    {
      id: 'scenario-1',
      name: 'Microsoft FY2026 Vendor True-Up Audit',
      vendor: 'Microsoft',
      auditDate: '2026-12-01',
      status: 'Simulated',
      includedProducts: ['Microsoft 365 E3', 'SQL Server Enterprise', 'Windows Server Datacenter'],
      baselineEntitlements: 500,
      baselineConsumed: 525,
      simulatedEntitlements: 500,
      simulatedConsumed: 525,
      simulatedElp: -25,
      estimatedRiskAmount: 9600,
      auditReadinessScore: 88,
      tenantId: currentTenant.id,
    },
    {
      id: 'scenario-2',
      name: 'Oracle Core Factor & Virtualization Audit',
      vendor: 'Oracle',
      auditDate: '2026-10-15',
      status: 'Draft',
      includedProducts: ['Oracle Database EE 19c', 'Oracle WebLogic Server'],
      baselineEntitlements: 64,
      baselineConsumed: 72,
      simulatedEntitlements: 64,
      simulatedConsumed: 72,
      simulatedElp: -8,
      estimatedRiskAmount: 38000,
      auditReadinessScore: 74,
      tenantId: currentTenant.id,
    },
  ]);

  // 5. AUDIT FINDINGS
  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([
    {
      id: 'find-1',
      scenarioId: 'scenario-1',
      findingTitle: 'Microsoft 365 E3 License Over-deployment Shortfall',
      severity: 'HIGH',
      softwareName: 'Microsoft 365 E3 Enterprise',
      vendor: 'Microsoft',
      metric: 'Per User',
      expectedEntitlement: 500,
      actualConsumption: 525,
      shortfall: 25,
      evidenceReference: 'EVIDENCE-MSFT-2026-0811.PDF',
      recommendation: 'Reclaim 30 inactive user profiles (0 logons in 90 days) to convert ELP from -25 to +5 without purchasing additional licenses.',
      status: 'Open',
      tenantId: currentTenant.id,
    },
    {
      id: 'find-2',
      scenarioId: 'scenario-2',
      findingTitle: 'Unlicensed Oracle Database Host Cores on VMware Cluster',
      severity: 'CRITICAL',
      softwareName: 'Oracle Database Enterprise Edition 19c',
      vendor: 'Oracle',
      metric: 'Per Core',
      expectedEntitlement: 64,
      actualConsumption: 72,
      shortfall: 8,
      evidenceReference: 'EVIDENCE-ORCL-CORE-MAPPING.JSON',
      recommendation: 'Migrate Oracle DB VMs to dedicated hard-partitioned host cluster (LPAR/KVM) to reduce licensed core boundary from 72 to 56 cores.',
      status: 'Under Review',
      tenantId: currentTenant.id,
    },
  ]);

  // 6. COMPLIANCE EXCEPTIONS
  const [exceptions, setExceptions] = useState<ComplianceException[]>([
    {
      id: 'ex-101',
      softwareName: 'Microsoft 365 E3 Enterprise',
      exceptionTitle: 'Temporary Migration Overflow Approval for Acquired Entity',
      approvedBy: 'Director of IT Compliance (Sarah Jenkins)',
      validUntil: '2026-10-31',
      reason: '30-day temporary migration window granted during Merger & Acquisition onboarding.',
      status: 'Active',
      tenantId: currentTenant.id,
    },
  ]);

  // HANDLERS
  const handleAddEntitlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntSoftware) return;

    const newEnt: LicenseEntitlement = {
      id: `ent-${Date.now()}`,
      softwareName: newEntSoftware,
      publisher: newEntPublisher,
      vendorProfile: (['Microsoft', 'Oracle', 'SAP', 'Adobe'].includes(newEntPublisher)
        ? newEntPublisher
        : 'Other') as any,
      metric: newEntMetric,
      ownedQuantity: Number(newEntQty),
      purchaseDate: new Date().toISOString().slice(0, 10),
      expirationDate: '2027-12-31',
      status: 'Active',
      contractNumber: newEntContract || 'CON-NEW',
      contractType: 'Volume License',
      source: 'Procurement',
      costCenter: 'CC-1001',
      allocatedDept: 'IT Corporate',
      unitCost: 150.00,
      tenantId: currentTenant.id,
    };

    setEntitlements((prev) => [newEnt, ...prev]);

    // Also update or add to ELP items
    const existingElp = elpItems.find((e) => e.softwareName === newEntSoftware);
    if (existingElp) {
      setElpItems((prev) =>
        prev.map((item) => {
          if (item.softwareName === newEntSoftware) {
            const newOwned = item.entitlementsOwned + newEnt.ownedQuantity;
            const newElp = newOwned - item.licensesConsumed;
            return {
              ...item,
              entitlementsOwned: newOwned,
              elpNumber: newElp,
              shortfall: newElp < 0 ? Math.abs(newElp) : 0,
              availableLicenses: newElp > 0 ? newElp : 0,
              status: newElp >= 0 ? 'COMPLIANT' : 'NON-COMPLIANT',
            };
          }
          return item;
        })
      );
    }

    setIsAddEntitlementOpen(false);
    setNewEntSoftware('');
    addAuditEntry('CREATE', 'LicenseEntitlement', newEnt.id, `Created entitlement for: ${newEnt.softwareName}`);
  };

  const handleAddException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExSoftware || !newExTitle) return;

    const newEx: ComplianceException = {
      id: `ex-${Date.now()}`,
      softwareName: newExSoftware,
      exceptionTitle: newExTitle,
      approvedBy: currentUser.name || 'System Admin',
      validUntil: '2026-12-31',
      reason: newExReason || 'Approved compliance exception.',
      status: 'Active',
      tenantId: currentTenant.id,
    };

    setExceptions((prev) => [newEx, ...prev]);
    setIsAddExceptionOpen(false);
    setNewExSoftware('');
    setNewExTitle('');
    setNewExReason('');
    addAuditEntry('CREATE', 'ComplianceException', newEx.id, `Granted exception for: ${newEx.softwareName}`);
  };

  const handleApplyWhatIfSimulation = () => {
    const activeScen = auditScenarios.find((s) => s.id === activeScenarioId);
    if (!activeScen) return;

    const updatedEnt = activeScen.baselineEntitlements + Number(whatIfLicenseDelta);
    const updatedCons = activeScen.baselineConsumed + Number(whatIfUserDelta);
    const updatedElp = updatedEnt - updatedCons;

    setAuditScenarios((prev) =>
      prev.map((s) => {
        if (s.id === activeScenarioId) {
          return {
            ...s,
            simulatedEntitlements: updatedEnt,
            simulatedConsumed: updatedCons,
            simulatedElp: updatedElp,
            status: 'Simulated',
            estimatedRiskAmount: updatedElp < 0 ? Math.abs(updatedElp) * 384 : 0,
          };
        }
        return s;
      })
    );

    addAuditEntry('UPDATE', 'AuditScenario', activeScenarioId, `Applied What-If simulation to scenario: ${activeScen.name}`);
  };

  // CALCULATED METRICS
  const totalProducts = elpItems.length;
  const totalEntitlements = elpItems.reduce((acc, curr) => acc + curr.entitlementsOwned, 0);
  const totalConsumed = elpItems.reduce((acc, curr) => acc + curr.licensesConsumed, 0);
  const totalAvailable = elpItems.reduce((acc, curr) => acc + curr.availableLicenses, 0);
  const totalOverDeployed = elpItems.reduce((acc, curr) => acc + curr.shortfall, 0);
  const nonCompliantCount = elpItems.filter((e) => e.status === 'NON-COMPLIANT').length;
  const totalFinancialRisk = elpItems.reduce((acc, curr) => acc + curr.estimatedFinancialRisk, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans selection:bg-red-600 selection:text-white">
      {/* Header Banner - RED / BLACK / WHITE UI Theme */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <Award className="w-5 h-5 text-red-600" />
            <span>SOFTWARE LICENSE COMPLIANCE & AUDIT TRUE-UP ENGINE</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Authoritative Effective License Position (ELP), Metric Rule Engine & What-If Audit Simulator
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded flex items-center space-x-1.5">
            <Lock className="w-4 h-4 text-white" />
            <span>Tenant Isolation: {currentTenant.name}</span>
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-black p-1 border border-zinc-800 rounded font-mono text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'overview' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Executive Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('elp')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'elp' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Effective License Position ({elpItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('entitlements')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'entitlements' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Entitlements Registry ({entitlements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'rules' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Vendor Rule Profiles</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'simulator' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Audit & True-Up Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('exceptions')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'exceptions' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Exceptions ({exceptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'evidence' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Evidence Package</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_log')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'audit_log' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE COMPLIANCE DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Executive Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Licensed Products Evaluated</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-white">{totalProducts}</span>
                <span className="text-[10px] text-zinc-400">Products Tracked</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Total Owned Entitlements</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-white">{totalEntitlements.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-400">Purchased Units</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Consumed Licenses</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-white">{totalConsumed.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-400">Discovery Mapped</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-red-900/60 p-4 rounded-lg space-y-2 bg-red-950/10">
              <span className="text-red-400 text-[10px] uppercase font-bold block">Potential Financial Exposure</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-red-500">${totalFinancialRisk.toLocaleString()}</span>
                <span className="text-[10px] text-red-400 font-bold">ESTIMATE</span>
              </div>
            </div>
          </div>

          {/* Secondary Metric Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Non-Compliant Products</span>
                <span className="text-xl font-black text-red-500">{nonCompliantCount} Products</span>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Available Unused Licenses</span>
                <span className="text-xl font-black text-white">{totalAvailable} Licenses</span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Over-Deployed Shortfall</span>
                <span className="text-xl font-black text-red-400">-{totalOverDeployed} Units</span>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {/* Compliance Status Overview Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden space-y-3 p-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="font-bold text-white text-sm">SUMMARY EFFECTIVE LICENSE POSITIONS</span>
              <button
                onClick={() => setActiveTab('elp')}
                className="text-red-400 hover:text-red-300 font-bold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <span>View Full ELP Matrix</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {elpItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-black border border-zinc-800 p-3.5 rounded flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{item.softwareName}</span>
                      <span className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] px-2 py-0.5 rounded font-bold">
                        {item.publisher}
                      </span>
                    </div>
                    <div className="text-zinc-400 text-[11px] flex items-center space-x-3">
                      <span>Metric: {item.metric}</span>
                      <span>•</span>
                      <span>Contract: {item.contractNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 font-mono text-xs">
                    <div className="text-right">
                      <span className="text-zinc-500 text-[10px] block uppercase">Owned vs Consumed</span>
                      <span className="text-white font-bold">
                        {item.entitlementsOwned} / {item.licensesConsumed}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-zinc-500 text-[10px] block uppercase">ELP Position</span>
                      <span
                        className={`font-black ${
                          item.elpNumber < 0 ? 'text-red-500' : 'text-white'
                        }`}
                      >
                        {item.elpNumber > 0 ? `+${item.elpNumber}` : item.elpNumber}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`px-3 py-1 rounded text-[10px] font-bold border ${
                          item.status === 'COMPLIANT'
                            ? 'bg-zinc-900 text-white border-zinc-700'
                            : item.status === 'NON-COMPLIANT'
                            ? 'bg-red-600/20 text-red-500 border-red-500'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EFFECTIVE LICENSE POSITION (ELP) GRID */}
      {activeTab === 'elp' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search ELP software..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black border border-zinc-800 rounded p-1.5 text-white focus:outline-none"
              />
              <select
                value={selectedPublisherFilter}
                onChange={(e) => setSelectedPublisherFilter(e.target.value)}
                className="bg-black border border-zinc-800 rounded p-1.5 text-white"
              >
                <option value="ALL">All Publishers</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Oracle">Oracle</option>
                <option value="SAP">SAP</option>
                <option value="Adobe">Adobe</option>
              </select>
            </div>

            <span className="text-zinc-400 text-[10px]">
              Click any product to inspect mathematical rule derivation & transparent audit logic.
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Software Product</th>
                  <th className="p-3">Publisher</th>
                  <th className="p-3">License Metric</th>
                  <th className="p-3">Owned</th>
                  <th className="p-3">Consumed</th>
                  <th className="p-3">Available</th>
                  <th className="p-3">Shortfall</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {elpItems
                  .filter((item) =>
                    selectedPublisherFilter === 'ALL' ? true : item.publisher === selectedPublisherFilter
                  )
                  .filter((item) =>
                    searchQuery ? item.softwareName.toLowerCase().includes(searchQuery.toLowerCase()) : true
                  )
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900">
                      <td className="p-3 font-bold text-white">{item.softwareName}</td>
                      <td className="p-3 text-zinc-400">{item.publisher}</td>
                      <td className="p-3 text-red-400 font-bold">{item.metric}</td>
                      <td className="p-3 font-bold text-white">{item.entitlementsOwned}</td>
                      <td className="p-3 font-bold text-white">{item.licensesConsumed}</td>
                      <td className="p-3 text-white">{item.availableLicenses}</td>
                      <td className="p-3 font-bold text-red-500">{item.shortfall > 0 ? `-${item.shortfall}` : '0'}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            item.status === 'COMPLIANT'
                              ? 'bg-zinc-900 text-white border-zinc-700'
                              : 'bg-red-600/20 text-red-500 border-red-500'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedElpItem(item);
                            setIsDrillDownModalOpen(true);
                          }}
                          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-[10px] px-2.5 py-1 rounded cursor-pointer font-bold"
                        >
                          Drill Down
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ENTITLEMENTS REGISTRY */}
      {activeTab === 'entitlements' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="text-white font-bold">PURCHASED LICENSE ENTITLEMENTS REGISTRY</span>
            <button
              onClick={() => setIsAddEntitlementOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Entitlement</span>
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Software Product</th>
                  <th className="p-3">Publisher</th>
                  <th className="p-3">Metric</th>
                  <th className="p-3">Owned Quantity</th>
                  <th className="p-3">Contract Ref</th>
                  <th className="p-3">Data Source</th>
                  <th className="p-3">Expiration Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {entitlements.map((ent) => (
                  <tr key={ent.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{ent.softwareName}</td>
                    <td className="p-3 text-zinc-400">{ent.publisher}</td>
                    <td className="p-3 text-red-400 font-bold">{ent.metric}</td>
                    <td className="p-3 font-bold text-white">{ent.ownedQuantity.toLocaleString()}</td>
                    <td className="p-3 text-zinc-300 font-mono">{ent.contractNumber}</td>
                    <td className="p-3 font-bold text-zinc-400">{ent.source}</td>
                    <td className="p-3 text-zinc-500">{ent.expirationDate}</td>
                    <td className="p-3">
                      <span className="bg-zinc-900 text-white border border-zinc-700 text-[10px] px-2 py-0.5 rounded font-bold">
                        {ent.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: VENDOR RULE PROFILES */}
      {activeTab === 'rules' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-4">
            <div className="font-bold text-white text-sm border-b border-zinc-800 pb-2">
              VENDOR SPECIFIC LICENSE METRIC & RULE ENGINE PROFILES
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {licenseRules.map((rule) => (
                <div key={rule.id} className="bg-black border border-zinc-800 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-red-500 font-bold uppercase text-[10px] block">{rule.vendorName} PROFILE</span>
                      <span className="text-white font-black text-sm">{rule.productName}</span>
                    </div>
                    <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                      {rule.metric}
                    </span>
                  </div>

                  <p className="text-zinc-300 text-[11px] leading-relaxed bg-zinc-950 p-2.5 border border-zinc-900 rounded">
                    {rule.ruleDescription}
                  </p>

                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {rule.coreFactor && (
                      <span className="bg-zinc-900 text-red-400 border border-zinc-800 px-2 py-0.5 rounded font-bold">
                        Core Factor: {rule.coreFactor}x
                      </span>
                    )}
                    {rule.deDuplicateUsers && (
                      <span className="bg-zinc-900 text-white border border-zinc-800 px-2 py-0.5 rounded font-bold">
                        User De-duplication: Enabled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT & TRUE-UP SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg space-y-4">
            <div className="space-y-1">
              <h3 className="text-white font-bold text-sm flex items-center space-x-2">
                <Zap className="w-4 h-4 text-red-500" />
                <span>VENDOR AUDIT & TRUE-UP SIMULATOR (READ-ONLY SCENARIOS)</span>
              </h3>
              <p className="text-zinc-400 text-[11px]">
                Simulate vendor true-up negotiations and audit outcomes without modifying production CMDB or inventory data.
              </p>
            </div>

            {/* Scenario Selection & Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-black border border-zinc-800 p-3 rounded space-y-2">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Active Scenario</span>
                <select
                  value={activeScenarioId}
                  onChange={(e) => setActiveScenarioId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white font-bold"
                >
                  {auditScenarios.map((scen) => (
                    <option key={scen.id} value={scen.id}>
                      {scen.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-black border border-zinc-800 p-3 rounded space-y-2">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">What-If Entitlement Adjustment</span>
                <input
                  type="number"
                  value={whatIfLicenseDelta}
                  onChange={(e) => setWhatIfLicenseDelta(Number(e.target.value))}
                  placeholder="e.g. +50 or -20 licenses"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-white font-bold"
                />
              </div>

              <div className="bg-black border border-zinc-800 p-3 rounded space-y-2">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">What-If User De-allocation</span>
                <input
                  type="number"
                  value={whatIfUserDelta}
                  onChange={(e) => setWhatIfUserDelta(Number(e.target.value))}
                  placeholder="e.g. -30 inactive users"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-white font-bold"
                />
              </div>
            </div>

            <button
              onClick={handleApplyWhatIfSimulation}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded cursor-pointer flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Recalculate What-If Simulation</span>
            </button>
          </div>

          {/* Active Simulation Results Display */}
          {auditScenarios.find((s) => s.id === activeScenarioId) && (
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg space-y-4">
              <div className="text-white font-bold text-sm border-b border-zinc-800 pb-2 flex justify-between items-center">
                <span>SIMULATED OUTCOME FOR: {auditScenarios.find((s) => s.id === activeScenarioId)?.name}</span>
                <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] px-2.5 py-1 rounded">
                  Audit Readiness Score:{' '}
                  <strong className="text-white">
                    {auditScenarios.find((s) => s.id === activeScenarioId)?.auditReadinessScore}%
                  </strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-black border border-zinc-800 rounded text-center space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase block">Simulated Entitlements</span>
                  <span className="text-xl font-bold text-white">
                    {auditScenarios.find((s) => s.id === activeScenarioId)?.simulatedEntitlements}
                  </span>
                </div>

                <div className="p-3 bg-black border border-zinc-800 rounded text-center space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase block">Simulated Consumed</span>
                  <span className="text-xl font-bold text-white">
                    {auditScenarios.find((s) => s.id === activeScenarioId)?.simulatedConsumed}
                  </span>
                </div>

                <div className="p-3 bg-black border border-zinc-800 rounded text-center space-y-1">
                  <span className="text-zinc-500 text-[10px] uppercase block">Simulated Net ELP</span>
                  <span
                    className={`text-xl font-bold ${
                      (auditScenarios.find((s) => s.id === activeScenarioId)?.simulatedElp || 0) < 0
                        ? 'text-red-500'
                        : 'text-white'
                    }`}
                  >
                    {auditScenarios.find((s) => s.id === activeScenarioId)?.simulatedElp}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Simulated Audit Findings List */}
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
            <span className="text-white font-bold text-sm block">SIMULATED AUDIT FINDINGS & RECOMMENDATIONS</span>

            <div className="space-y-3">
              {auditFindings.map((find) => (
                <div key={find.id} className="bg-black border border-zinc-800 p-4 rounded space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-red-500 font-bold text-[10px] uppercase block">
                        [{find.severity} SEVERITY] AUDIT FINDING
                      </span>
                      <span className="text-white font-bold text-sm">{find.findingTitle}</span>
                    </div>
                    <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                      Shortfall: -{find.shortfall}
                    </span>
                  </div>

                  <p className="text-zinc-300 text-[11px] leading-relaxed bg-zinc-950 p-2.5 border border-zinc-900 rounded">
                    <strong>Actionable Recommendation:</strong> {find.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: COMPLIANCE EXCEPTIONS */}
      {activeTab === 'exceptions' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="text-white font-bold">COMPLIANCE EXCEPTIONS & WAIVERS</span>
            <button
              onClick={() => setIsAddExceptionOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Grant Exception Waiver</span>
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Software Product</th>
                  <th className="p-3">Exception Title</th>
                  <th className="p-3">Approved By</th>
                  <th className="p-3">Valid Until</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {exceptions.map((ex) => (
                  <tr key={ex.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{ex.softwareName}</td>
                    <td className="p-3 text-red-400 font-bold">{ex.exceptionTitle}</td>
                    <td className="p-3 text-zinc-300">{ex.approvedBy}</td>
                    <td className="p-3 text-zinc-500">{ex.validUntil}</td>
                    <td className="p-3 text-zinc-400">{ex.reason}</td>
                    <td className="p-3">
                      <span className="bg-zinc-900 text-white border border-zinc-700 text-[10px] px-2 py-0.5 rounded font-bold">
                        {ex.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: EVIDENCE PACKAGE */}
      {activeTab === 'evidence' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg space-y-4">
            <div className="font-bold text-white text-sm border-b border-zinc-800 pb-2">
              AUDIT EVIDENCE PACKAGE & COMPLIANCE REPORT EXPORT
            </div>

            <p className="text-zinc-400 text-[11px]">
              Generate signed, timestamped audit evidence bundles containing contract references, hardware inventory logs, user discovery mappings, and mathematical ELP derivations.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded flex items-center space-x-2 cursor-pointer">
                <Download className="w-4 h-4" />
                <span>Export Executive Compliance Report (PDF)</span>
              </button>

              <button className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold px-4 py-2 rounded flex items-center space-x-2 cursor-pointer">
                <FileText className="w-4 h-4" />
                <span>Generate Vendor Evidence Bundle (JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT TRAIL */}
      {activeTab === 'audit_log' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
            <div className="font-bold text-white text-sm border-b border-zinc-800 pb-2">
              IMMUTABLE COMPLIANCE ENGINE AUDIT TRAIL
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-black border border-zinc-800 rounded flex justify-between items-center">
                <div>
                  <span className="text-white font-bold block">ELP Calculation Engine Executed</span>
                  <span className="text-zinc-400 text-[10px]">Evaluated 4 active vendor software products against 525 discovery records.</span>
                </div>
                <span className="text-zinc-500 text-[10px]">Today at 04:26</span>
              </div>

              <div className="p-3 bg-black border border-zinc-800 rounded flex justify-between items-center">
                <div>
                  <span className="text-white font-bold block">Compliance Exception Waiver Created</span>
                  <span className="text-zinc-400 text-[10px]">Granted temporary M&A waiver for Microsoft 365 E3 overflow.</span>
                </div>
                <span className="text-zinc-500 text-[10px]">Today at 03:10</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRANSPARENT CALCULATION DRILL DOWN */}
      {isDrillDownModalOpen && selectedElpItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-2xl w-full p-6 space-y-4 font-mono text-xs text-white">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <span className="text-red-500 font-bold uppercase text-[10px] block">TRANSPARENT AUDIT DERIVATION</span>
                <span className="text-white font-black text-base">{selectedElpItem.softwareName}</span>
              </div>
              <button
                onClick={() => setIsDrillDownModalOpen(false)}
                className="text-zinc-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-black p-3 border border-zinc-800 rounded space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Discovered Input Data</span>
                <p className="text-zinc-300 text-[11px]">{selectedElpItem.calculationBreakdown.inputData}</p>
              </div>

              <div className="bg-black p-3 border border-zinc-800 rounded space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">License Rule Applied</span>
                <p className="text-zinc-300 text-[11px]">{selectedElpItem.calculationBreakdown.ruleApplied}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black p-3 border border-zinc-800 rounded">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold block">Included Count</span>
                  <span className="text-white font-bold text-sm">{selectedElpItem.calculationBreakdown.includedCount}</span>
                </div>

                <div className="bg-black p-3 border border-zinc-800 rounded">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold block">Excluded Count</span>
                  <span className="text-white font-bold text-sm">{selectedElpItem.calculationBreakdown.excludedCount}</span>
                </div>
              </div>

              <div className="bg-black p-3 border border-zinc-800 rounded space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold block">Exclusion Reason</span>
                <p className="text-zinc-300 text-[11px]">{selectedElpItem.calculationBreakdown.exclusionReason}</p>
              </div>

              <div className="bg-zinc-900 p-3 border border-zinc-700 rounded space-y-1">
                <span className="text-red-500 text-[10px] uppercase font-bold block">Final ELP Derivation</span>
                <p className="text-white font-bold text-xs">{selectedElpItem.calculationBreakdown.resultSummary}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDrillDownModalOpen(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD NEW ENTITLEMENT */}
      {isAddEntitlementOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-md w-full p-6 space-y-4 font-mono text-xs text-white">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-white font-bold text-sm">RECORD PURCHASED LICENSE ENTITLEMENT</span>
              <button
                onClick={() => setIsAddEntitlementOpen(false)}
                className="text-zinc-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEntitlement} className="space-y-3">
              <div>
                <label className="text-zinc-400 text-[10px] uppercase font-bold block mb-1">Software Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microsoft 365 E5"
                  value={newEntSoftware}
                  onChange={(e) => setNewEntSoftware(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 text-[10px] uppercase font-bold block mb-1">Publisher</label>
                  <select
                    value={newEntPublisher}
                    onChange={(e) => setNewEntPublisher(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  >
                    <option value="Microsoft">Microsoft</option>
                    <option value="Oracle">Oracle</option>
                    <option value="SAP">SAP</option>
                    <option value="Adobe">Adobe</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 text-[10px] uppercase font-bold block mb-1">License Metric</label>
                  <select
                    value={newEntMetric}
                    onChange={(e) => setNewEntMetric(e.target.value as any)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  >
                    <option value="Per User">Per User</option>
                    <option value="Per Device">Per Device</option>
                    <option value="Per Core">Per Core</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Per Named User">Per Named User</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 text-[10px] uppercase font-bold block mb-1">Owned Quantity</label>
                  <input
                    type="number"
                    required
                    value={newEntQty}
                    onChange={(e) => setNewEntQty(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 text-[10px] uppercase font-bold block mb-1">Contract Ref</label>
                  <input
                    type="text"
                    value={newEntContract}
                    onChange={(e) => setNewEntContract(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddEntitlementOpen(false)}
                  className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold px-3 py-2 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded cursor-pointer"
                >
                  Save Entitlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GRANT COMPLIANCE EXCEPTION */}
      {isAddExceptionOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-md w-full p-6 space-y-4 font-mono text-xs text-white">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-white font-bold text-sm">GRANT COMPLIANCE EXCEPTION WAIVER</span>
              <button
                onClick={() => setIsAddExceptionOpen(false)}
                className="text-zinc-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddException} className="space-y-3">
              <div>
                <label className="text-zinc-400 text-[10px] uppercase font-bold block mb-1">Software Product</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microsoft 365 E3"
                  value={newExSoftware}
                  onChange={(e) => setNewExSoftware(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-[10px] uppercase font-bold block mb-1">Exception Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Migration Grace Period Waiver"
                  value={newExTitle}
                  onChange={(e) => setNewExTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-[10px] uppercase font-bold block mb-1">Justification Reason</label>
                <textarea
                  rows={3}
                  value={newExReason}
                  onChange={(e) => setNewExReason(e.target.value)}
                  placeholder="Provide audit justification..."
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddExceptionOpen(false)}
                  className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold px-3 py-2 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded cursor-pointer"
                >
                  Grant Waiver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

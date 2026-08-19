import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GitMerge,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Network,
  GitCommit,
  Globe,
  FileCode2,
  Database,
  Layers,
  Box,
  DollarSign,
  Workflow,
  Bot,
  BarChart3,
  History,
  Check,
  X,
  ArrowRight,
  Filter,
  Plus,
  RotateCcw,
  Play,
  Lock,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Terminal,
  Cpu,
  Server,
  Cloud,
  FileText,
  Building,
} from 'lucide-react';
import {
  ReconRawSoftwareItem,
  ReconSoftwareCatalogItem,
  ReconSoftwareAlias,
  ReconNormalizationRule,
  ReconSoftwareReviewItem,
  ReconCiSourceRecord,
  ReconFieldProvenance,
  ReconIdentityConflict,
  ReconMergeHistoryItem,
  ReconAuditLog,
} from '../../types';

import { ReconciliationDashboardModule } from '../../reconciliation_engine/ReconciliationDashboardModule';
import { NormalizationCatalogDashboardModule } from '../../normalization_catalog/NormalizationCatalogDashboardModule';
import { DataQualityDashboardModule } from '../../data_quality_engine/DataQualityDashboardModule';
import { ImpactMappingDashboardModule } from '../../impact_mapping/ImpactMappingDashboardModule';
import { ChangeDetectionDashboardModule } from '../../change_detection/ChangeDetectionDashboardModule';
import { FederationDashboardModule } from '../../federation/FederationDashboardModule';
import { SamAdvancedDashboardModule } from '../../sam_advanced/SamAdvancedDashboardModule';
import { HamAdvancedDashboardModule } from '../../ham_advanced/HamAdvancedDashboardModule';
import { FinancialAdvancedDashboardModule } from '../../financial_advanced/FinancialAdvancedDashboardModule';
import { GovernanceItsmDashboardModule } from '../../governance_itsm_advanced/GovernanceItsmDashboardModule';
import { AiAnalyticsDashboardModule } from '../../ai_analytics_fabric/AiAnalyticsDashboardModule';
import { ExecutiveReportingMobileNonItDashboardModule } from '../../executive_reporting_mobile_nonit/ExecutiveReportingMobileNonItDashboardModule';
import { EnterpriseCmdbDataModelDashboardModule } from '../../enterprise_cmdb_datamodel/EnterpriseCmdbDataModelDashboardModule';
import { EnterpriseIntegrationDashboardModule } from '../../enterprise_integration_fabric/EnterpriseIntegrationDashboardModule';
import { EnterpriseSecurityDashboardModule } from '../../enterprise_security_governance/EnterpriseSecurityDashboardModule';

export const ReconciliationModule: React.FC = () => {
  const { currentTenant, currentUser, addAuditEntry } = useApp();

  // Navigation Subsections
  const [activeSubTab, setActiveSubTab] = useState<
    'configurable_engine' | 'impact_mapping' | 'change_detection_drift' | 'cmdb_federation' | 'sam_advanced_engine' | 'ham_advanced_engine' | 'financial_advanced_engine' | 'governance_itsm_advanced_engine' | 'ai_analytics_fabric_engine' | 'executive_reporting_mobile_nonit_engine' | 'enterprise_cmdb_datamodel_engine' | 'enterprise_integration_fabric_engine' | 'enterprise_security_governance_engine' | 'data_quality_scoring' | 'normalization_catalog' | 'overview' | 'software' | 'identity' | 'review' | 'conflicts' | 'catalog' | 'rules' | 'history'
  >('configurable_engine');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pipeline Simulator States
  const [pipelineInput, setPipelineInput] = useState('MSFT OFC 365 E3 (v16.0)');
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [isProcessingPipeline, setIsProcessingPipeline] = useState(false);

  // 1. Initial State: Raw Software Items
  const [rawSoftwareItems, setRawSoftwareItems] = useState<ReconRawSoftwareItem[]>([
    {
      id: 'sw-raw-1',
      rawName: 'MSFT OFC 365 E3',
      normalizedName: 'Microsoft Office 365 E3',
      canonicalName: 'Microsoft 365 E3',
      publisher: 'Microsoft',
      version: '16.0.1423',
      edition: 'Enterprise E3',
      source: 'Intune MDM',
      confidence: 98,
      firstSeen: '2026-08-01 09:12',
      lastSeen: '2026-08-11 14:00',
      tenantId: currentTenant.id,
      status: 'Normalized',
    },
    {
      id: 'sw-raw-2',
      rawName: 'Office365-E3-x64-en-us',
      normalizedName: 'Microsoft Office 365 E3',
      canonicalName: 'Microsoft 365 E3',
      publisher: 'Microsoft',
      version: '16.0.1425',
      edition: 'Enterprise E3',
      source: 'Endpoint Agent',
      confidence: 98,
      firstSeen: '2026-08-02 11:30',
      lastSeen: '2026-08-11 14:15',
      tenantId: currentTenant.id,
      status: 'Normalized',
    },
    {
      id: 'sw-raw-3',
      rawName: 'MS Office Pro Plus 2021 LTSC',
      normalizedName: 'Microsoft Office Professional Plus 2021',
      canonicalName: 'Microsoft Office LTSC Professional Plus 2021',
      publisher: 'Microsoft',
      version: '21.0.9810',
      edition: 'LTSC Pro Plus',
      source: 'WMI Discovery',
      confidence: 74,
      firstSeen: '2026-08-05 15:40',
      lastSeen: '2026-08-11 10:20',
      tenantId: currentTenant.id,
      status: 'Needs Review',
    },
    {
      id: 'sw-raw-4',
      rawName: 'ADB Photoshop CC 2024 (v25.2)',
      normalizedName: 'Adobe Photoshop 2024',
      canonicalName: 'Adobe Photoshop 2024',
      publisher: 'Adobe Inc.',
      version: '25.2.0',
      edition: 'Creative Cloud',
      source: 'Go Endpoint Agent',
      confidence: 95,
      firstSeen: '2026-08-06 08:22',
      lastSeen: '2026-08-11 13:50',
      tenantId: currentTenant.id,
      status: 'Normalized',
    },
    {
      id: 'sw-raw-5',
      rawName: 'CRWDSTK Falcon Sensor v7.12',
      normalizedName: 'CrowdStrike Falcon Sensor',
      canonicalName: 'CrowdStrike Falcon Endpoint Security',
      publisher: 'CrowdStrike',
      version: '7.12.1802',
      edition: 'Sensor Agent',
      source: 'SSH Script',
      confidence: 92,
      firstSeen: '2026-08-08 12:00',
      lastSeen: '2026-08-11 14:05',
      tenantId: currentTenant.id,
      status: 'Normalized',
    },
  ]);

  // 2. Software Catalog
  const [softwareCatalog, setSoftwareCatalog] = useState<ReconSoftwareCatalogItem[]>([
    {
      id: 'cat-sw-1',
      canonicalName: 'Microsoft 365 E3',
      publisher: 'Microsoft',
      productFamily: 'Microsoft 365',
      edition: 'E3',
      approvedAliases: ['MSFT OFC 365 E3', 'Office365-E3', 'Microsoft Office 365 E3', 'M365 E3'],
      rawCount: 1420,
      category: 'Productivity Suite',
      tenantId: currentTenant.id,
    },
    {
      id: 'cat-sw-2',
      canonicalName: 'Microsoft Office LTSC Professional Plus 2021',
      publisher: 'Microsoft',
      productFamily: 'Office',
      edition: 'LTSC Pro Plus',
      approvedAliases: ['MS Office Pro Plus 2021', 'Microsoft Office Professional Plus 2021'],
      rawCount: 380,
      category: 'Productivity Suite',
      tenantId: currentTenant.id,
    },
    {
      id: 'cat-sw-3',
      canonicalName: 'Adobe Photoshop 2024',
      publisher: 'Adobe Inc.',
      productFamily: 'Creative Cloud',
      edition: 'Pro Suite',
      approvedAliases: ['ADB Photoshop CC 2024', 'Adobe Photoshop CC v25'],
      rawCount: 210,
      category: 'Graphics & Design',
      tenantId: currentTenant.id,
    },
    {
      id: 'cat-sw-4',
      canonicalName: 'CrowdStrike Falcon Endpoint Security',
      publisher: 'CrowdStrike',
      productFamily: 'Falcon Platform',
      edition: 'Enterprise EDR',
      approvedAliases: ['CRWDSTK Falcon Sensor', 'FalconSensor.exe'],
      rawCount: 890,
      category: 'Cybersecurity EDR',
      tenantId: currentTenant.id,
    },
  ]);

  // 3. Software Normalization Review Items
  const [softwareReviewQueue, setSoftwareReviewQueue] = useState<ReconSoftwareReviewItem[]>([
    {
      id: 'rev-sw-1',
      rawName: 'MS Office Pro Plus 2021 LTSC',
      suggestedCanonicalName: 'Microsoft Office LTSC Professional Plus 2021',
      confidence: 74,
      source: 'WMI Discovery',
      detectedAt: '2026-08-11 10:20',
      status: 'Needs Review',
      tenantId: currentTenant.id,
    },
    {
      id: 'rev-sw-2',
      rawName: 'Oracle Java SE Runtime Dev Kit 17.0.9',
      suggestedCanonicalName: 'Oracle Java SE Development Kit 17',
      confidence: 78,
      source: 'Linux SSH Sweep',
      detectedAt: '2026-08-11 11:45',
      status: 'Needs Review',
      tenantId: currentTenant.id,
    },
    {
      id: 'rev-sw-3',
      rawName: 'VMware Workstation Pro v17.5.0',
      suggestedCanonicalName: 'Broadcom VMware Workstation Pro 17',
      confidence: 71,
      source: 'Endpoint Agent',
      detectedAt: '2026-08-11 12:30',
      status: 'Needs Review',
      tenantId: currentTenant.id,
    },
  ]);

  // 4. Normalization Rules
  const [normalizationRules, setNormalizationRules] = useState<ReconNormalizationRule[]>([
    {
      id: 'rule-1',
      ruleType: 'Vendor Normalization',
      pattern: '^MSFT|^MS',
      replacement: 'Microsoft',
      targetCanonicalName: 'Vendor Brand Mapping',
      createdBy: 'System Engine',
      isEnabled: true,
      tenantId: currentTenant.id,
    },
    {
      id: 'rule-2',
      ruleType: 'Prefix Removal',
      pattern: '^ADB|^ADB_INC',
      replacement: 'Adobe',
      targetCanonicalName: 'Vendor Brand Mapping',
      createdBy: 'System Engine',
      isEnabled: true,
      tenantId: currentTenant.id,
    },
    {
      id: 'rule-3',
      ruleType: 'Edition Standardization',
      pattern: 'OFC 365|Office365|M365',
      replacement: 'Microsoft 365',
      targetCanonicalName: 'Microsoft 365 E3',
      createdBy: 'Admin User',
      isEnabled: true,
      tenantId: currentTenant.id,
    },
  ]);

  // 5. CI Multi-Source Records & Identity Reconciliation
  const [ciSourceRecords, setCiSourceRecords] = useState<ReconCiSourceRecord[]>([
    {
      id: 'src-rec-101',
      canonicalCiId: 'CI-10025',
      sourceType: 'Endpoint Agent',
      rawHostname: 'LAP-CORP-8820',
      rawSerial: 'DELL-SN-8820-X1',
      rawUuid: 'UUID-DELL-8820-998',
      rawMac: '00:1A:2B:3C:4D:5E',
      rawIp: '10.20.1.45',
      manufacturer: 'Dell Inc.',
      model: 'Latitude 7450',
      os: 'Windows 11 Pro 23H2',
      observedAt: '2026-08-11 14:22',
      tenantId: currentTenant.id,
    },
    {
      id: 'src-rec-102',
      canonicalCiId: 'CI-10025',
      sourceType: 'WMI',
      rawHostname: 'LAP-CORP-8820.corp.internal',
      rawSerial: 'DELL-SN-8820-X1',
      rawUuid: 'UUID-DELL-8820-998',
      rawMac: '00:1A:2B:3C:4D:5E',
      rawIp: '10.20.1.45',
      manufacturer: 'Dell Computer Corp',
      model: 'Latitude 7450 Enterprise',
      os: 'Microsoft Windows 11 Pro',
      observedAt: '2026-08-11 12:00',
      tenantId: currentTenant.id,
    },
    {
      id: 'src-rec-103',
      canonicalCiId: 'CI-10025',
      sourceType: 'Intune',
      rawHostname: 'LAP-CORP-8820',
      rawSerial: 'DELL-SN-8820-X1',
      rawUuid: 'UUID-DELL-8820-998',
      rawMac: '00:1A:2B:3C:4D:5E',
      rawIp: '10.20.1.45',
      manufacturer: 'Dell',
      model: 'Latitude 7450',
      os: 'Windows 11 Enterprise',
      observedAt: '2026-08-10 18:00',
      tenantId: currentTenant.id,
    },
    {
      id: 'src-rec-201',
      canonicalCiId: 'CI-10088',
      sourceType: 'SSH',
      rawHostname: 'SRV-DB-PROD-01',
      rawSerial: 'UUID-KVM-9821-441',
      rawUuid: 'UUID-KVM-9821-441',
      rawMac: '52:54:00:88:22:11',
      rawIp: '10.20.4.12',
      manufacturer: 'QEMU KVM',
      model: 'Standard PC (Q35 + ICH9)',
      os: 'Ubuntu 22.04.3 LTS (Kernel 6.2)',
      observedAt: '2026-08-11 14:10',
      tenantId: currentTenant.id,
    },
    {
      id: 'src-rec-202',
      canonicalCiId: 'CI-10088',
      sourceType: 'AWS',
      rawHostname: 'ip-10-20-4-12.ec2.internal',
      rawSerial: 'i-089a81c2f901238',
      rawUuid: 'UUID-KVM-9821-441',
      rawMac: '52:54:00:88:22:11',
      rawIp: '10.20.4.12',
      manufacturer: 'Amazon EC2',
      model: 'm6i.xlarge',
      os: 'Ubuntu 22.04 LTS AMI',
      observedAt: '2026-08-11 13:00',
      tenantId: currentTenant.id,
    },
  ]);

  // 6. Field Provenance
  const [fieldProvenanceList] = useState<ReconFieldProvenance[]>([
    {
      id: 'prov-1',
      ciId: 'CI-10025',
      fieldName: 'Installed System Memory (RAM)',
      value: '32 GB DDR5',
      source: 'Endpoint Agent',
      sourceRecordId: 'src-rec-101',
      observedAt: '2026-08-11 14:22',
      confidence: 99,
    },
    {
      id: 'prov-2',
      ciId: 'CI-10025',
      fieldName: 'Serial Number',
      value: 'DELL-SN-8820-X1',
      source: 'Endpoint Agent',
      sourceRecordId: 'src-rec-101',
      observedAt: '2026-08-11 14:22',
      confidence: 100,
    },
    {
      id: 'prov-3',
      ciId: 'CI-10025',
      fieldName: 'Operating System',
      value: 'Windows 11 Enterprise 23H2',
      source: 'Intune MDM',
      sourceRecordId: 'src-rec-103',
      observedAt: '2026-08-10 18:00',
      confidence: 95,
    },
  ]);

  // 7. Identity Conflicts Queue
  const [identityConflicts, setIdentityConflicts] = useState<ReconIdentityConflict[]>([
    {
      id: 'conf-rec-1',
      ciId: 'CI-10025',
      ciName: 'LAP-CORP-8820 (Dell Latitude 7450)',
      fieldName: 'Installed System Memory (RAM)',
      sourceAName: 'Endpoint Agent',
      sourceAValue: '32 GB DDR5',
      sourceAObserved: '2026-08-11 14:22',
      sourceBName: 'WMI Discovery',
      sourceBValue: '16 GB DDR5',
      sourceBObserved: '2026-08-11 12:00',
      status: 'Open',
      tenantId: currentTenant.id,
    },
    {
      id: 'conf-rec-2',
      ciId: 'CI-10088',
      ciName: 'SRV-DB-PROD-01 (PostgreSQL DB Server)',
      fieldName: 'Operating System Kernel Patch',
      sourceAName: 'SSH Live Execution',
      sourceAValue: 'Linux Kernel 6.2.0-39-generic',
      sourceAObserved: '2026-08-11 14:10',
      sourceBName: 'AWS EC2 API',
      sourceBValue: 'Ubuntu 22.04.3 LTS AMI Base',
      sourceBObserved: '2026-08-11 13:00',
      status: 'Open',
      tenantId: currentTenant.id,
    },
  ]);

  // 8. Merge History
  const [mergeHistory, setMergeHistory] = useState<ReconMergeHistoryItem[]>([
    {
      id: 'merge-hist-1',
      mergedCiId: 'CI-10099',
      mergedCiName: 'LAPTOP-DELL-8820-ALT',
      targetCiId: 'CI-10025',
      targetCiName: 'LAP-CORP-8820',
      mergedBy: currentUser.fullName || 'Admin User',
      mergedAt: '2026-08-09 16:30',
      snapshotData: { serial: 'DELL-SN-8820-X1', mac: '00:1A:2B:3C:4D:5E' },
      status: 'Active',
      tenantId: currentTenant.id,
    },
  ]);

  // 9. Reconciliation Audit Logs
  const [reconAuditLogs, setReconAuditLogs] = useState<ReconAuditLog[]>([
    {
      id: 'recon-audit-1',
      user: currentUser.fullName || 'System Automated Engine',
      action: 'Normalization',
      beforeState: 'Raw: MSFT OFC 365 E3',
      afterState: 'Canonical: Microsoft 365 E3',
      reason: 'Approved Alias Rule #3 Applied',
      confidence: 98,
      source: 'Intune MDM Connector',
      timestamp: '2026-08-11 14:00',
      tenantId: currentTenant.id,
    },
    {
      id: 'recon-audit-2',
      user: currentUser.fullName || 'Admin User',
      action: 'CI Merge',
      beforeState: 'CI-10099 (Unreconciled Duplicate)',
      afterState: 'Merged into CI-10025 (Canonical Dell Latitude 7450)',
      reason: 'Exact Serial Match DELL-SN-8820-X1',
      confidence: 100,
      source: 'Endpoint Agent + WMI',
      timestamp: '2026-08-09 16:30',
      tenantId: currentTenant.id,
    },
  ]);

  // Modal Control States
  const [isNewCatalogModalOpen, setIsNewCatalogModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatPublisher, setNewCatPublisher] = useState('');
  const [newCatFamily, setNewCatFamily] = useState('');

  const [isNewRuleModalOpen, setIsNewRuleModalOpen] = useState(false);
  const [newRuleType, setNewRuleType] = useState<any>('Vendor Normalization');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleReplacement, setNewRuleReplacement] = useState('');

  // Configurable Weights State
  const [identityWeights, setIdentityWeights] = useState({
    serialNumber: 100,
    systemUuid: 100,
    cloudResourceId: 100,
    assetTag: 90,
    macAddress: 80,
    hostname: 50,
    fqdn: 45,
    manufacturerModel: 20,
    ipAddress: 10,
  });

  const [confidenceThreshold, setConfidenceThreshold] = useState(80);

  // PIPELINE SIMULATOR RUNNER
  const handleRunPipelineTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineInput.trim()) return;

    setIsProcessingPipeline(true);
    setTimeout(() => {
      const inputTrimmed = pipelineInput.trim();
      const inputLower = inputTrimmed.toLowerCase();

      // Step-by-step pipeline execution
      let normStep1 = inputTrimmed;
      let normStep2 = inputLower;
      let normStep3 = normStep2.replace(/[\(\)\[\]\-_]/g, ' ');
      let normStep4 = normStep3.replace(/\s+/g, ' ');
      let vendorNorm = normStep4.replace(/^msft|^ms/, 'microsoft').replace(/^adb/, 'adobe');

      // Alias lookup
      let matchedCanonical = 'Unknown / Needs Review';
      let matchType = 'Candidate Fuzzy Match';
      let confidence = 75;

      if (vendorNorm.includes('365') || vendorNorm.includes('office')) {
        matchedCanonical = 'Microsoft 365 E3';
        matchType = 'Exact Approved Alias';
        confidence = 98;
      } else if (vendorNorm.includes('photoshop')) {
        matchedCanonical = 'Adobe Photoshop 2024';
        matchType = 'Strong Normalized Rule';
        confidence = 95;
      } else if (vendorNorm.includes('falcon') || vendorNorm.includes('crowdstrike')) {
        matchedCanonical = 'CrowdStrike Falcon Endpoint Security';
        matchType = 'Catalog Match';
        confidence = 92;
      }

      setPipelineResult({
        rawInput: pipelineInput,
        step1Trim: normStep1,
        step2Case: normStep2,
        step3Punctuation: normStep3,
        step4Separators: normStep4,
        step5VendorNorm: vendorNorm,
        matchedCanonical,
        matchType,
        confidence,
        passesThreshold: confidence >= confidenceThreshold,
      });

      setIsProcessingPipeline(false);
      addAuditEntry('NORMALIZE', 'SoftwareNormalization', `sim-${Date.now()}`, `Executed Normalization Pipeline for: ${pipelineInput}`);
    }, 400);
  };

  // HANDLERS
  const handleApproveSoftwareReview = (revId: string, item: ReconSoftwareReviewItem) => {
    setSoftwareReviewQueue((prev) => prev.filter((r) => r.id !== revId));

    // Update raw items status
    setRawSoftwareItems((prev) =>
      prev.map((r) => (r.rawName === item.rawName ? { ...r, status: 'Approved', canonicalName: item.suggestedCanonicalName, confidence: 98 } : r))
    );

    // Add to catalog approved aliases
    setSoftwareCatalog((prev) =>
      prev.map((cat) =>
        cat.canonicalName === item.suggestedCanonicalName
          ? { ...cat, approvedAliases: [...cat.approvedAliases, item.rawName] }
          : cat
      )
    );

    // Add Audit Log
    const newLog: ReconAuditLog = {
      id: `recon-audit-${Date.now()}`,
      user: currentUser.fullName || 'Admin User',
      action: 'Alias Approval',
      beforeState: `Raw: ${item.rawName}`,
      afterState: `Approved Canonical: ${item.suggestedCanonicalName}`,
      reason: 'Administrator Manual Queue Review',
      confidence: 100,
      source: item.source,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      tenantId: currentTenant.id,
    };
    setReconAuditLogs((prev) => [newLog, ...prev]);
    addAuditEntry('APPROVE', 'ReconSoftwareReview', revId, `Approved software alias: ${item.rawName} -> ${item.suggestedCanonicalName}`);
  };

  const handleRejectSoftwareReview = (revId: string, rawName: string) => {
    setSoftwareReviewQueue((prev) => prev.filter((r) => r.id !== revId));
    setRawSoftwareItems((prev) => prev.map((r) => (r.rawName === rawName ? { ...r, status: 'Rejected' } : r)));
    addAuditEntry('REJECT', 'ReconSoftwareReview', revId, `Rejected software normalization for: ${rawName}`);
  };

  const handleResolveConflict = (conflictId: string, chosenSource: string, chosenValue: string) => {
    setIdentityConflicts((prev) => prev.filter((c) => c.id !== conflictId));

    const newLog: ReconAuditLog = {
      id: `recon-audit-${Date.now()}`,
      user: currentUser.fullName || 'Admin User',
      action: 'Conflict Resolution',
      beforeState: `Discrepancy on ${conflictId}`,
      afterState: `Accepted ${chosenSource} value: ${chosenValue}`,
      reason: 'Manual Conflict Override',
      confidence: 100,
      source: chosenSource,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      tenantId: currentTenant.id,
    };
    setReconAuditLogs((prev) => [newLog, ...prev]);
    addAuditEntry('UPDATE', 'ReconIdentityConflict', conflictId, `Resolved conflict accepting ${chosenSource}: ${chosenValue}`);
  };

  const handleRollbackMerge = (historyId: string, item: ReconMergeHistoryItem) => {
    setMergeHistory((prev) => prev.map((m) => (m.id === historyId ? { ...m, status: 'Rolled Back' } : m)));

    const newLog: ReconAuditLog = {
      id: `recon-audit-${Date.now()}`,
      user: currentUser.fullName || 'Admin User',
      action: 'CI Unmerge',
      beforeState: `Merged CI ${item.mergedCiName} into ${item.targetCiName}`,
      afterState: `Restored separate CI identity: ${item.mergedCiName}`,
      reason: 'Administrator Merge Rollback Operation',
      confidence: 100,
      source: 'System Unmerge Worker',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      tenantId: currentTenant.id,
    };
    setReconAuditLogs((prev) => [newLog, ...prev]);
    addAuditEntry('DELETE', 'ReconMergeHistory', historyId, `Unmerged CI ${item.mergedCiName} from ${item.targetCiName}`);
  };

  const handleCreateCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const newItem: ReconSoftwareCatalogItem = {
      id: `cat-sw-${Date.now()}`,
      canonicalName: newCatName,
      publisher: newCatPublisher || 'Generic Publisher',
      productFamily: newCatFamily || newCatName,
      edition: 'Standard',
      approvedAliases: [newCatName],
      rawCount: 0,
      category: 'Enterprise Software',
      tenantId: currentTenant.id,
    };

    setSoftwareCatalog((prev) => [newItem, ...prev]);
    setIsNewCatalogModalOpen(false);
    setNewCatName('');
    setNewCatPublisher('');
    setNewCatFamily('');
    addAuditEntry('CREATE', 'ReconSoftwareCatalog', newItem.id, `Created canonical software: ${newItem.canonicalName}`);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRulePattern) return;

    const newRule: ReconNormalizationRule = {
      id: `rule-${Date.now()}`,
      ruleType: newRuleType,
      pattern: newRulePattern,
      replacement: newRuleReplacement || '',
      targetCanonicalName: 'Custom Mapping',
      createdBy: currentUser.fullName || 'Admin User',
      isEnabled: true,
      tenantId: currentTenant.id,
    };

    setNormalizationRules((prev) => [newRule, ...prev]);
    setIsNewRuleModalOpen(false);
    setNewRulePattern('');
    setNewRuleReplacement('');
    addAuditEntry('CREATE', 'ReconNormalizationRule', newRule.id, `Created ${newRule.ruleType} rule: ${newRule.pattern}`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <GitMerge className="w-5 h-5 text-red-500" />
            <span>SOFTWARE NORMALIZATION & CI IDENTITY RECONCILIATION ENGINE</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Multi-Source Discovered String Normalization, Weighted Identifier Confidence Scoring & Field Data Provenance
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Tenant Isolation: {currentTenant.name}</span>
          </span>
        </div>
      </div>

      {/* Sub-Section Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-black p-1.5 border border-zinc-800 rounded font-mono text-xs max-w-full overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('configurable_engine')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'configurable_engine' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-white" />
          <span>Configurable Precedence Engine</span>
        </button>

        <button
          onClick={() => setActiveSubTab('impact_mapping')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'impact_mapping' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Network className="w-3.5 h-3.5 text-white" />
          <span>CI Impact & Blast-Radius</span>
        </button>

        <button
          onClick={() => setActiveSubTab('change_detection_drift')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'change_detection_drift' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5 text-white" />
          <span>Change Detection & Drift</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cmdb_federation')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'cmdb_federation' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-white" />
          <span>CMDB Federation Layer</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sam_advanced_engine')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'sam_advanced_engine' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-white" />
          <span>SAM Advanced Engine</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ham_advanced_engine')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'ham_advanced_engine' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Box className="w-3.5 h-3.5 text-white" />
          <span>HAM Advanced Engine</span>
        </button>

        <button
          onClick={() => setActiveSubTab('financial_advanced_engine')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'financial_advanced_engine' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-white" />
          <span>Financial & FinOps Engine</span>
        </button>

        <button
          onClick={() => setActiveSubTab('governance_itsm_advanced_engine')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'governance_itsm_advanced_engine' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Workflow className="w-3.5 h-3.5 text-white" />
          <span>Workflow, ITSM & Governance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ai_analytics_fabric_engine')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'ai_analytics_fabric_engine' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-white" />
          <span>AI / Analytics & Integration Fabric</span>
        </button>

        <button
          onClick={() => setActiveSubTab('executive_reporting_mobile_nonit_engine')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'executive_reporting_mobile_nonit_engine' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-white" />
          <span>Executive BI, Mobile & Non-IT EAM</span>
        </button>

        <button
          onClick={() => setActiveSubTab('enterprise_cmdb_datamodel_engine')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'enterprise_cmdb_datamodel_engine' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-white" />
          <span>Enterprise ITAM / CMDB Data Model</span>
        </button>

        <button
          onClick={() => setActiveSubTab('enterprise_integration_fabric_engine')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'enterprise_integration_fabric_engine' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Network className="w-3.5 h-3.5 text-white" />
          <span>Enterprise Integration Fabric</span>
        </button>

        <button
          onClick={() => setActiveSubTab('enterprise_security_governance_engine')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'enterprise_security_governance_engine' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          <span>Enterprise Security & Governance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('data_quality_scoring')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'data_quality_scoring' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          <span>CMDB Data Quality Scoring</span>
        </button>

        <button
          onClick={() => setActiveSubTab('normalization_catalog')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'normalization_catalog' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5 text-white" />
          <span>Software Normalization Catalog</span>
        </button>

        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'overview' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('software')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'software' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Software Normalization ({rawSoftwareItems.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('identity')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'identity' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Identity Reconciliation ({ciSourceRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('review')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'review' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Review Queue ({softwareReviewQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('conflicts')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
            activeSubTab === 'conflicts' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Conflicts ({identityConflicts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeSubTab === 'catalog' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Software Catalog ({softwareCatalog.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rules')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeSubTab === 'rules' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Rules ({normalizationRules.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeSubTab === 'history' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History & Audit ({reconAuditLogs.length})</span>
        </button>
      </div>

      {/* SUBSECTION: CONFIGURABLE RECONCILIATION ENGINE */}
      {activeSubTab === 'configurable_engine' && (
        <ReconciliationDashboardModule />
      )}

      {/* SUBSECTION: IMPACT MAPPING & BLAST RADIUS */}
      {activeSubTab === 'impact_mapping' && (
        <ImpactMappingDashboardModule />
      )}

      {/* SUBSECTION: CHANGE DETECTION & DRIFT */}
      {activeSubTab === 'change_detection_drift' && (
        <ChangeDetectionDashboardModule />
      )}

      {/* SUBSECTION: CMDB FEDERATION LAYER */}
      {activeSubTab === 'cmdb_federation' && (
        <FederationDashboardModule />
      )}

      {/* SUBSECTION: SAM ADVANCED ENGINE */}
      {activeSubTab === 'sam_advanced_engine' && (
        <SamAdvancedDashboardModule />
      )}

      {/* SUBSECTION: HAM ADVANCED ENGINE */}
      {activeSubTab === 'ham_advanced_engine' && (
        <HamAdvancedDashboardModule />
      )}

      {/* SUBSECTION: FINANCIAL ADVANCED ENGINE */}
      {activeSubTab === 'financial_advanced_engine' && (
        <FinancialAdvancedDashboardModule />
      )}

      {/* SUBSECTION: GOVERNANCE & ITSM ADVANCED ENGINE */}
      {activeSubTab === 'governance_itsm_advanced_engine' && (
        <GovernanceItsmDashboardModule />
      )}

      {/* SUBSECTION: AI ANALYTICS & INTEGRATION FABRIC ENGINE */}
      {activeSubTab === 'ai_analytics_fabric_engine' && (
        <AiAnalyticsDashboardModule />
      )}

      {/* SUBSECTION: EXECUTIVE REPORTING, MOBILE & NON-IT ASSETS */}
      {activeSubTab === 'executive_reporting_mobile_nonit_engine' && (
        <ExecutiveReportingMobileNonItDashboardModule />
      )}

      {/* SUBSECTION: ENTERPRISE ITAM / CMDB DATA MODEL ENGINE */}
      {activeSubTab === 'enterprise_cmdb_datamodel_engine' && (
        <EnterpriseCmdbDataModelDashboardModule />
      )}

      {/* SUBSECTION: ENTERPRISE INTEGRATION FABRIC ENGINE */}
      {activeSubTab === 'enterprise_integration_fabric_engine' && (
        <EnterpriseIntegrationDashboardModule />
      )}

      {/* SUBSECTION: ENTERPRISE SECURITY & GOVERNANCE ENGINE */}
      {activeSubTab === 'enterprise_security_governance_engine' && (
        <EnterpriseSecurityDashboardModule />
      )}

      {/* SUBSECTION: DATA QUALITY SCORING */}
      {activeSubTab === 'data_quality_scoring' && (
        <DataQualityDashboardModule />
      )}

      {/* SUBSECTION: SOFTWARE NORMALIZATION CATALOG */}
      {activeSubTab === 'normalization_catalog' && (
        <NormalizationCatalogDashboardModule />
      )}

      {/* SUBSECTION 1: OVERVIEW DASHBOARD */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-1">
              <div className="text-zinc-400 text-[10px] uppercase font-bold">Software Normalized</div>
              <div className="text-2xl font-black text-white">42,521</div>
              <div className="text-[10px] text-zinc-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-white" />
                <span>99.2% Resolution</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-1">
              <div className="text-zinc-400 text-[10px] uppercase font-bold">CIs Reconciled</div>
              <div className="text-2xl font-black text-white">8,421</div>
              <div className="text-[10px] text-zinc-400 flex items-center space-x-1">
                <Database className="w-3 h-3 text-white" />
                <span>Unified CIs</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-1">
              <div className="text-zinc-400 text-[10px] uppercase font-bold">Duplicates Prevented</div>
              <div className="text-2xl font-black text-white">1,203</div>
              <div className="text-[10px] text-zinc-400 flex items-center space-x-1">
                <GitMerge className="w-3 h-3 text-white" />
                <span>Zero Duplicate CIs</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-1">
              <div className="text-zinc-400 text-[10px] uppercase font-bold">Pending Reviews</div>
              <div className="text-2xl font-black text-red-500">{softwareReviewQueue.length}</div>
              <div className="text-[10px] text-zinc-400 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span>Confidence &lt; {confidenceThreshold}%</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-1">
              <div className="text-zinc-400 text-[10px] uppercase font-bold">Open Conflicts</div>
              <div className="text-2xl font-black text-red-500">{identityConflicts.length}</div>
              <div className="text-[10px] text-zinc-400 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span>Discrepancies</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-1">
              <div className="text-zinc-400 text-[10px] uppercase font-bold">Failed / Ambiguous</div>
              <div className="text-2xl font-black text-white">0</div>
              <div className="text-[10px] text-zinc-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-white" />
                <span>Zero Failures</span>
              </div>
            </div>
          </div>

          {/* Interactive Pipeline Tester */}
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-red-500" />
                  <span>REAL-TIME SOFTWARE NORMALIZATION PIPELINE SIMULATOR</span>
                </h3>
                <p className="text-zinc-400 text-[11px]">
                  Pass raw discovery strings through: Trim -&gt; Case -&gt; Punctuation -&gt; Separators -&gt; Vendor -&gt; Aliases -&gt; Canonical Catalog
                </p>
              </div>
            </div>

            <form onSubmit={handleRunPipelineTest} className="flex flex-col sm:flex-row items-stretch gap-3">
              <input
                type="text"
                value={pipelineInput}
                onChange={(e) => setPipelineInput(e.target.value)}
                placeholder="Enter raw discovery string e.g. MSFT OFC 365 E3 (v16.0)"
                className="flex-1 bg-black border border-zinc-800 rounded p-2.5 text-white font-mono text-xs focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={isProcessingPipeline}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>{isProcessingPipeline ? 'Processing...' : 'Run Pipeline'}</span>
              </button>
            </form>

            {pipelineResult && (
              <div className="bg-black border border-zinc-800 p-4 rounded space-y-3 font-mono">
                <div className="text-red-500 font-bold border-b border-zinc-800 pb-2 flex justify-between items-center">
                  <span>PIPELINE TRANSFORMATION TRACE</span>
                  <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] px-2 py-0.5 rounded">
                    Confidence: {pipelineResult.confidence}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px]">
                  <div className="bg-zinc-950 p-2.5 border border-zinc-900 rounded space-y-1">
                    <span className="text-zinc-500 block text-[10px]">1. Raw Discovered Input</span>
                    <span className="text-white font-bold">{pipelineResult.rawInput}</span>
                  </div>

                  <div className="bg-zinc-950 p-2.5 border border-zinc-900 rounded space-y-1">
                    <span className="text-zinc-500 block text-[10px]">2. Case & Punctuation Norm</span>
                    <span className="text-zinc-300">{pipelineResult.step3Punctuation}</span>
                  </div>

                  <div className="bg-zinc-950 p-2.5 border border-zinc-900 rounded space-y-1">
                    <span className="text-zinc-500 block text-[10px]">3. Vendor Normalization</span>
                    <span className="text-zinc-300">{pipelineResult.step5VendorNorm}</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold block">Canonical Software Identity Result</span>
                    <span className="text-white text-sm font-black flex items-center space-x-2 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>{pipelineResult.matchedCanonical}</span>
                    </span>
                    <span className="text-zinc-400 text-[10px] block mt-0.5">Match Type: {pipelineResult.matchType}</span>
                  </div>

                  <div className="text-right">
                    <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] font-bold px-3 py-1 rounded inline-block">
                      {pipelineResult.passesThreshold ? 'AUTOMATED CANONICAL MATCH' : 'QUEUED FOR MANUAL REVIEW'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Architecture Pipeline Flow Diagram */}
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg space-y-4">
            <h3 className="font-bold text-white text-sm">ISOLATED RECONCILIATION PROCESSING PIPELINE ARCHITECTURE</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-[11px] font-mono">
              <div className="bg-black border border-zinc-800 p-3 rounded space-y-1">
                <div className="text-red-500 font-bold">1. RAW DISCOVERY</div>
                <div className="text-zinc-400 text-[10px]">Agents, WMI, SSH, SNMP, Cloud APIs</div>
              </div>

              <div className="bg-black border border-zinc-800 p-3 rounded space-y-1">
                <div className="text-red-500 font-bold">2. NORMALIZATION</div>
                <div className="text-zinc-400 text-[10px]">Trim, Case, Vendor & Alias Rules</div>
              </div>

              <div className="bg-black border border-zinc-800 p-3 rounded space-y-1">
                <div className="text-red-500 font-bold">3. CANONICAL CATALOG</div>
                <div className="text-zinc-400 text-[10px]">Catalog & Approved Aliases Lookup</div>
              </div>

              <div className="bg-black border border-zinc-800 p-3 rounded space-y-1">
                <div className="text-red-500 font-bold">4. IDENTITY RECON</div>
                <div className="text-zinc-400 text-[10px]">Serial, UUID, MAC Confidence Scoring</div>
              </div>

              <div className="bg-black border border-zinc-800 p-3 rounded space-y-1">
                <div className="text-red-500 font-bold">5. AUDIT & PROVENANCE</div>
                <div className="text-zinc-400 text-[10px]">Field Provenance & Immutable Logs</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBSECTION 2: RAW DISCOVERED SOFTWARE NORMALIZATION */}
      {activeSubTab === 'software' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter raw or canonical software strings..."
                className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white w-64 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="text-zinc-400 text-[11px]">
              Note: Original raw discovered strings are strictly preserved for data auditing.
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Raw Discovered String</th>
                  <th className="p-3">Normalized String</th>
                  <th className="p-3">Canonical Software Identity</th>
                  <th className="p-3">Publisher</th>
                  <th className="p-3">Discovery Source</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {rawSoftwareItems
                  .filter(
                    (i) =>
                      i.rawName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      i.canonicalName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900">
                      <td className="p-3 font-mono text-zinc-300 font-bold">{item.rawName}</td>
                      <td className="p-3 text-zinc-400">{item.normalizedName}</td>
                      <td className="p-3 text-white font-bold flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>{item.canonicalName}</span>
                      </td>
                      <td className="p-3 text-zinc-400">{item.publisher}</td>
                      <td className="p-3 text-red-400">{item.source}</td>
                      <td className="p-3 font-bold text-white">{item.confidence}%</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            item.status === 'Normalized' || item.status === 'Approved'
                              ? 'bg-zinc-900 text-white border-zinc-700'
                              : 'bg-red-600/20 text-red-400 border-red-500/40'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBSECTION 3: IDENTITY RECONCILIATION & FIELD PROVENANCE */}
      {activeSubTab === 'identity' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Linked Source Records Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 text-white font-bold flex justify-between items-center">
              <span>MULTI-SOURCE CI RECONCILIATION & DISCOVERY RECORDS</span>
              <span className="text-zinc-400 text-[10px]">
                Strong Identifier Precedence: Serial &gt; UUID &gt; Cloud ID &gt; MAC
              </span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Canonical CI ID</th>
                  <th className="p-3">Source Engine</th>
                  <th className="p-3">Discovered Hostname</th>
                  <th className="p-3">Serial / UUID</th>
                  <th className="p-3">MAC / IP</th>
                  <th className="p-3">Manufacturer / Model</th>
                  <th className="p-3">Observed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {ciSourceRecords.map((src) => (
                  <tr key={src.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white flex items-center space-x-1.5">
                      <Database className="w-3.5 h-3.5 text-red-500" />
                      <span>{src.canonicalCiId}</span>
                    </td>
                    <td className="p-3 text-red-400 font-bold">{src.sourceType}</td>
                    <td className="p-3 font-mono text-zinc-200">{src.rawHostname}</td>
                    <td className="p-3 font-mono text-zinc-400">{src.rawSerial}</td>
                    <td className="p-3 text-zinc-400">{src.rawMac} / {src.rawIp}</td>
                    <td className="p-3 text-zinc-300">{src.manufacturer} {src.model}</td>
                    <td className="p-3 text-zinc-500">{src.observedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Field Level Data Provenance Inspector */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-red-500" />
                <span>FIELD-LEVEL DATA PROVENANCE INSPECTOR (CI-10025)</span>
              </span>
              <span className="text-zinc-500 text-[10px]">Field-level Source Attribution & Confidence</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {fieldProvenanceList.map((prov) => (
                <div key={prov.id} className="p-3 bg-black border border-zinc-800 rounded space-y-1">
                  <div className="text-zinc-500 text-[10px] uppercase font-bold">{prov.fieldName}</div>
                  <div className="text-white font-bold text-sm">{prov.value}</div>
                  <div className="text-red-400 text-[10px]">Source: {prov.source}</div>
                  <div className="text-zinc-500 text-[10px] flex justify-between">
                    <span>Observed: {prov.observedAt}</span>
                    <span className="text-white font-bold">{prov.confidence}% Conf</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBSECTION 4: REVIEW QUEUE */}
      {activeSubTab === 'review' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 text-white font-bold flex justify-between items-center">
              <span>SOFTWARE NORMALIZATION MANUAL REVIEW QUEUE ({softwareReviewQueue.length})</span>
              <span className="text-red-400">Confidence Threshold Below {confidenceThreshold}%</span>
            </div>

            {softwareReviewQueue.length === 0 ? (
              <div className="p-6 text-center text-zinc-500">Review queue is empty. All software normalized.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Raw String Discovered</th>
                    <th className="p-3">Suggested Canonical Software</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Detected At</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {softwareReviewQueue.map((rev) => (
                    <tr key={rev.id} className="hover:bg-zinc-900">
                      <td className="p-3 font-bold text-zinc-300">{rev.rawName}</td>
                      <td className="p-3 text-white font-bold">{rev.suggestedCanonicalName}</td>
                      <td className="p-3">
                        <span className="bg-zinc-900 text-white border border-zinc-700 px-2 py-0.5 rounded font-bold text-[10px]">
                          {rev.confidence}% Match
                        </span>
                      </td>
                      <td className="p-3 text-red-400">{rev.source}</td>
                      <td className="p-3 text-zinc-500">{rev.detectedAt}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleApproveSoftwareReview(rev.id, rev)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded cursor-pointer"
                        >
                          Approve Alias
                        </button>
                        <button
                          onClick={() => handleRejectSoftwareReview(rev.id, rev.rawName)}
                          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold px-3 py-1 rounded cursor-pointer"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* SUBSECTION 5: DISCREPANCY CONFLICTS */}
      {activeSubTab === 'conflicts' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 text-white font-bold flex justify-between items-center">
              <span>FIELD-LEVEL DISCREPANCY CONFLICTS ({identityConflicts.length})</span>
              <span className="text-red-500">Multi-Source Disagreement</span>
            </div>

            <div className="divide-y divide-zinc-800">
              {identityConflicts.map((conf) => (
                <div key={conf.id} className="p-4 bg-zinc-950 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white text-sm">{conf.ciName}</div>
                      <div className="text-red-500 font-bold text-xs mt-0.5">Discrepancy Field: {conf.fieldName}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                      <div className="text-zinc-500 text-[10px] uppercase font-bold">Source A: {conf.sourceAName}</div>
                      <div className="text-white font-bold text-sm">{conf.sourceAValue}</div>
                      <div className="text-zinc-500 text-[10px]">Observed: {conf.sourceAObserved}</div>
                      <button
                        onClick={() => handleResolveConflict(conf.id, conf.sourceAName, conf.sourceAValue)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 rounded cursor-pointer"
                      >
                        Accept Source A Value
                      </button>
                    </div>

                    <div className="p-3 bg-black border border-zinc-800 rounded space-y-2">
                      <div className="text-zinc-500 text-[10px] uppercase font-bold">Source B: {conf.sourceBName}</div>
                      <div className="text-white font-bold text-sm">{conf.sourceBValue}</div>
                      <div className="text-zinc-500 text-[10px]">Observed: {conf.sourceBObserved}</div>
                      <button
                        onClick={() => handleResolveConflict(conf.id, conf.sourceBName, conf.sourceBValue)}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-bold py-1.5 rounded cursor-pointer"
                      >
                        Accept Source B Value
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBSECTION 6: CANONICAL SOFTWARE CATALOG */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="font-bold text-white">CANONICAL SOFTWARE CATALOG (`recon_software_catalog`)</span>
            <button
              onClick={() => setIsNewCatalogModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Canonical Software</span>
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Publisher</th>
                  <th className="p-3">Canonical Name</th>
                  <th className="p-3">Product Family</th>
                  <th className="p-3">Edition</th>
                  <th className="p-3">Approved Aliases</th>
                  <th className="p-3">Discovered Installations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {softwareCatalog.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{cat.publisher}</td>
                    <td className="p-3 text-red-400 font-bold">{cat.canonicalName}</td>
                    <td className="p-3 text-zinc-400">{cat.productFamily}</td>
                    <td className="p-3">{cat.edition}</td>
                    <td className="p-3 text-zinc-400 max-w-xs truncate">{cat.approvedAliases.join(', ')}</td>
                    <td className="p-3 font-bold text-white">{cat.rawCount} CIs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBSECTION 7: NORMALIZATION & SCORING RULES */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Identity Matching Priority Weights */}
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg space-y-4">
            <div className="border-b border-zinc-800 pb-2 flex justify-between items-center">
              <span className="font-bold text-white">IDENTITY RECONCILIATION SCORING WEIGHTS</span>
              <span className="text-zinc-500 text-[10px]">Configurable Weight Matrix</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-black p-3 border border-zinc-800 rounded flex justify-between items-center">
                <span>Exact Serial Number</span>
                <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded">+{identityWeights.serialNumber}</span>
              </div>
              <div className="bg-black p-3 border border-zinc-800 rounded flex justify-between items-center">
                <span>Exact System UUID</span>
                <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded">+{identityWeights.systemUuid}</span>
              </div>
              <div className="bg-black p-3 border border-zinc-800 rounded flex justify-between items-center">
                <span>Exact Cloud Resource ID</span>
                <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded">+{identityWeights.cloudResourceId}</span>
              </div>
              <div className="bg-black p-3 border border-zinc-800 rounded flex justify-between items-center">
                <span>Exact Asset Tag</span>
                <span className="bg-zinc-900 border border-zinc-700 text-white font-bold px-2 py-0.5 rounded">+{identityWeights.assetTag}</span>
              </div>
              <div className="bg-black p-3 border border-zinc-800 rounded flex justify-between items-center">
                <span>Exact MAC Address</span>
                <span className="bg-zinc-900 border border-zinc-700 text-white font-bold px-2 py-0.5 rounded">+{identityWeights.macAddress}</span>
              </div>
              <div className="bg-black p-3 border border-zinc-800 rounded flex justify-between items-center">
                <span>Exact Hostname</span>
                <span className="bg-zinc-900 border border-zinc-700 text-white font-bold px-2 py-0.5 rounded">+{identityWeights.hostname}</span>
              </div>
            </div>
          </div>

          {/* Normalization Rules */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 text-white font-bold flex justify-between items-center">
              <span>SOFTWARE NORMALIZATION RULES (`recon_normalization_rules`)</span>
              <button
                onClick={() => setIsNewRuleModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>

            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Rule Type</th>
                  <th className="p-3">Regex / String Pattern</th>
                  <th className="p-3">Replacement String</th>
                  <th className="p-3">Created By</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {normalizationRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{rule.ruleType}</td>
                    <td className="p-3 font-mono text-red-400">{rule.pattern}</td>
                    <td className="p-3 text-zinc-400">{rule.replacement || '(Empty)'}</td>
                    <td className="p-3 text-zinc-400">{rule.createdBy}</td>
                    <td className="p-3">
                      <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBSECTION 8: HISTORY & MERGE ROLLBACK */}
      {activeSubTab === 'history' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Merge History with Rollback */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 text-white font-bold flex justify-between items-center">
              <span>CI MERGE HISTORY & ADMINISTRATIVE ROLLBACK (`recon_merge_history`)</span>
              <span className="text-zinc-500 text-[10px]">Reversible Identity Merges</span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Merged Secondary CI</th>
                  <th className="p-3">Target Canonical CI</th>
                  <th className="p-3">Merged By</th>
                  <th className="p-3">Merged At</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {mergeHistory.map((hist) => (
                  <tr key={hist.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{hist.mergedCiName} ({hist.mergedCiId})</td>
                    <td className="p-3 text-red-400 font-bold">{hist.targetCiName} ({hist.targetCiId})</td>
                    <td className="p-3 text-zinc-400">{hist.mergedBy}</td>
                    <td className="p-3 text-zinc-500">{hist.mergedAt}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          hist.status === 'Active' ? 'bg-zinc-900 text-white border-zinc-700' : 'bg-red-600/20 text-red-400 border-red-500/40'
                        }`}
                      >
                        {hist.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {hist.status === 'Active' && (
                        <button
                          onClick={() => handleRollbackMerge(hist.id, hist)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded cursor-pointer flex items-center space-x-1 ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Unmerge / Rollback</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Complete Audit Logs */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 text-white font-bold">
              IMMUTABLE RECONCILIATION AUDIT TRAIL (`recon_audit_logs`)
            </div>

            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">User / Actor</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Before State</th>
                  <th className="p-3">After State</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {reconAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{log.user}</td>
                    <td className="p-3 text-red-400 font-bold">{log.action}</td>
                    <td className="p-3 text-zinc-400 font-mono text-[11px] max-w-xs truncate">{log.beforeState}</td>
                    <td className="p-3 text-zinc-200 font-mono text-[11px] max-w-xs truncate">{log.afterState}</td>
                    <td className="p-3 text-zinc-400">{log.reason}</td>
                    <td className="p-3 text-zinc-500">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD CANONICAL CATALOG ITEM */}
      {isNewCatalogModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Building className="w-4 h-4 text-red-500" />
                <span>Create Canonical Software Identity</span>
              </h3>
              <button onClick={() => setIsNewCatalogModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCatalogItem} className="space-y-4">
              <div>
                <label className="block text-zinc-400 mb-1">Canonical Software Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Microsoft 365 E5"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Publisher Name</label>
                <input
                  type="text"
                  required
                  value={newCatPublisher}
                  onChange={(e) => setNewCatPublisher(e.target.value)}
                  placeholder="e.g. Microsoft Corporation"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Product Family</label>
                <input
                  type="text"
                  value={newCatFamily}
                  onChange={(e) => setNewCatFamily(e.target.value)}
                  placeholder="e.g. Microsoft 365"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewCatalogModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded cursor-pointer"
                >
                  Create Canonical Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NORMALIZATION RULE */}
      {isNewRuleModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-red-500" />
                <span>Create Software Normalization Rule</span>
              </h3>
              <button onClick={() => setIsNewRuleModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-zinc-400 mb-1">Rule Category</label>
                <select
                  value={newRuleType}
                  onChange={(e) => setNewRuleType(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                >
                  <option value="Vendor Normalization">Vendor Normalization</option>
                  <option value="Prefix Removal">Prefix Removal</option>
                  <option value="Edition Standardization">Edition Standardization</option>
                  <option value="Regex Substitution">Regex Substitution</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Pattern / Regex Expression</label>
                <input
                  type="text"
                  required
                  value={newRulePattern}
                  onChange={(e) => setNewRulePattern(e.target.value)}
                  placeholder="e.g. ^MSFT|^MS"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Replacement Target</label>
                <input
                  type="text"
                  value={newRuleReplacement}
                  onChange={(e) => setNewRuleReplacement(e.target.value)}
                  placeholder="e.g. Microsoft"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewRuleModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded cursor-pointer"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

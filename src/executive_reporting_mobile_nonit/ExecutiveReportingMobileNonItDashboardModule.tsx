import React, { useState } from 'react';
import { 
  BarChart3, FileSpreadsheet, Smartphone, ShieldCheck, 
  Download, CheckCircle2, RefreshCw, QrCode, Scan, Building, 
  Truck, Radio, Cpu, Send, Layers, Calendar, ChevronRight
} from 'lucide-react';
import { 
  ExecutiveKpiSummary, 
  ExecutiveAssetHealthRecord, 
  CustomBiReportConfig, 
  MobileFieldAuditRecord, 
  NonItEnterpriseAsset, 
  ReportingMobileNonItStats 
} from './types';
import { executiveReportingEngine } from './executiveReportingEngine';

export const ExecutiveReportingMobileNonItDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'executive_dashboards' | 'custom_bi_builder' | 'mobile_field_ops' | 'non_it_assets'
  >('executive_dashboards');

  const [kpiSummary] = useState<ExecutiveKpiSummary>(executiveReportingEngine.getKpiSummary());
  const [healthRecords] = useState<ExecutiveAssetHealthRecord[]>(executiveReportingEngine.getHealthRecords());
  const [reports, setReports] = useState<CustomBiReportConfig[]>(executiveReportingEngine.getReports());
  const [mobileAudits, setMobileAudits] = useState<MobileFieldAuditRecord[]>(executiveReportingEngine.getMobileAudits());
  const [offlineQueue, setOfflineQueue] = useState<MobileFieldAuditRecord[]>(executiveReportingEngine.getOfflineQueue());
  const [nonItAssets] = useState<NonItEnterpriseAsset[]>(executiveReportingEngine.getNonItAssets());
  const [stats, setStats] = useState<ReportingMobileNonItStats>(executiveReportingEngine.getStats());

  // BI Report Builder state
  const [reportTitle, setReportTitle] = useState('Executive Sustainability & Asset Risk Report');
  const [reportDataSource, setReportDataSource] = useState<CustomBiReportConfig['dataSource']>('Assets');
  const [reportFrequency, setReportFrequency] = useState<CustomBiReportConfig['scheduleFrequency']>('Weekly');
  const [reportFormat, setReportFormat] = useState<CustomBiReportConfig['exportFormat']>('PDF');

  // Mobile Audit state
  const [scanTagInput, setScanTagInput] = useState('AST-LPT-9901');
  const [scanStatusInput, setScanStatusInput] = useState<MobileFieldAuditRecord['auditStatus']>('Verified');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreateReport = () => {
    if (!reportTitle.trim()) return;
    executiveReportingEngine.createCustomReport(
      reportTitle,
      reportDataSource,
      ['AssetTag', 'Category', 'RiskLevel', 'Cost', 'Location'],
      reportFrequency,
      reportFormat
    );
    setReports([...executiveReportingEngine.getReports()]);
    setStats(executiveReportingEngine.getStats());
    setSuccessMsg(`Created scheduled custom BI report '${reportTitle}' (${reportFormat}).`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleMobileScan = () => {
    executiveReportingEngine.scanAndAuditAsset(scanTagInput, scanStatusInput, 'Field Tech (R. Kumar)', isOfflineMode);
    setMobileAudits([...executiveReportingEngine.getMobileAudits()]);
    setOfflineQueue([...executiveReportingEngine.getOfflineQueue()]);
    setStats(executiveReportingEngine.getStats());
    setSuccessMsg(
      isOfflineMode 
        ? `Asset '${scanTagInput}' scanned in OFFLINE mode and queued.` 
        : `Asset '${scanTagInput}' verified and synced live.`
    );
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSyncOffline = () => {
    const syncedCount = executiveReportingEngine.syncOfflineQueue();
    setMobileAudits([...executiveReportingEngine.getMobileAudits()]);
    setOfflineQueue([...executiveReportingEngine.getOfflineQueue()]);
    setStats(executiveReportingEngine.getStats());
    setSuccessMsg(`Successfully synced ${syncedCount} offline audit scans with central ITAM database.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Executive Reporting, Mobile Field Ops & Non-IT EAM Engine
            </h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              Enterprise Control v2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Executive Dashboards & KPI Packs • Custom BI Builder & Scheduled Exports • Mobile Barcode/QR Field Audits • Facilities, Fleet, OT & IoT Asset Management
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap gap-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950 font-mono text-xs">
          {(
            [
              ['executive_dashboards', 'Executive Dashboards'],
              ['custom_bi_builder', `Custom BI Builder (${reports.length})`],
              ['mobile_field_ops', `Mobile Field Ops (${mobileAudits.length})`],
              ['non_it_assets', `Non-IT Assets (${nonItAssets.length})`]
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 uppercase tracking-wider transition-colors ${
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

      {successMsg && (
        <div className="p-3 bg-red-950 border border-red-700 text-red-200 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-red-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 font-mono text-xs">
        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Total Inventory</span>
          <div className="text-xl font-bold text-white mt-1">{kpiSummary.totalAssets.toLocaleString()}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Software Compliance</span>
          <div className="text-xl font-bold text-white mt-1">{kpiSummary.softwareCompliancePercent}%</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Total IT Spend</span>
          <div className="text-xl font-bold text-white mt-1">${(kpiSummary.totalItSpendUsd / 1000000).toFixed(2)}M</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">E-Waste Recycled</span>
          <div className="text-xl font-bold text-white mt-1">{kpiSummary.eWasteQuantityKg} kg</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Scheduled Reports</span>
          <div className="text-xl font-bold text-white mt-1">{stats.scheduledReportsActive}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Offline Audit Queue</span>
          <div className="text-xl font-bold text-red-500 mt-1">{stats.offlineSyncQueueCount}</div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3 text-center">
          <span className="text-[10px] text-neutral-500 uppercase">Non-IT Enterprise Assets</span>
          <div className="text-xl font-bold text-white mt-1">{nonItAssets.length}</div>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE DASHBOARDS & KPI PACKS */}
      {activeTab === 'executive_dashboards' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white flex justify-between items-center">
              <span>Executive Health, Financial Spend & Sustainability Dashboard</span>
              <span className="text-[10px] text-red-500 font-bold">Read-Only Consolidated Analytics</span>
            </div>

            {/* Health Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {healthRecords.map(rec => (
                <div key={rec.healthId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div>
                      <span className="text-sm font-bold text-white">{rec.assetTag}</span>
                      <span className="text-[10px] text-neutral-400 block">{rec.category}</span>
                    </div>

                    <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                      rec.healthStatus === 'Critical' || rec.healthStatus === 'High-Risk'
                        ? 'bg-red-950 text-red-500 border-red-900'
                        : 'bg-black text-white border-neutral-800'
                    }`}>
                      Health: {rec.healthScorePercent}% ({rec.healthStatus})
                    </span>
                  </div>

                  <p className="text-[10px] text-neutral-300 bg-neutral-950 p-2 border border-neutral-900">
                    <strong className="text-red-500 uppercase">Top Risk Factor: </strong>
                    {rec.topRiskFactor}
                  </p>

                  <div className="flex justify-between text-[9px] text-neutral-500 pt-1">
                    <span>Dept: {rec.department}</span>
                    <span>Location: {rec.location}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial & Sustainability Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-900">
              <div className="bg-black border border-neutral-800 p-4 space-y-3">
                <span className="text-xs font-bold uppercase text-white block border-b border-neutral-900 pb-2">
                  IT Spend Breakdown ($4.85M Total)
                </span>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between items-center bg-neutral-950 p-2 border border-neutral-900">
                    <span className="text-neutral-400">Hardware Spend</span>
                    <span className="text-white font-bold">${kpiSummary.hardwareSpendUsd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-neutral-950 p-2 border border-neutral-900">
                    <span className="text-neutral-400">Software & SaaS Spend</span>
                    <span className="text-white font-bold">${kpiSummary.softwareSpendUsd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-neutral-950 p-2 border border-neutral-900">
                    <span className="text-neutral-400">Contract & Maintenance</span>
                    <span className="text-white font-bold">${(kpiSummary.totalItSpendUsd - kpiSummary.hardwareSpendUsd - kpiSummary.softwareSpendUsd).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-black border border-neutral-800 p-4 space-y-3">
                <span className="text-xs font-bold uppercase text-white block border-b border-neutral-900 pb-2">
                  Sustainability & E-Waste Metrics
                </span>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between items-center bg-neutral-950 p-2 border border-neutral-900">
                    <span className="text-neutral-400">Retired Assets</span>
                    <span className="text-white font-bold">{kpiSummary.retiredAssets} Units</span>
                  </div>
                  <div className="flex justify-between items-center bg-neutral-950 p-2 border border-neutral-900">
                    <span className="text-neutral-400">Disposed & Recycled E-Waste</span>
                    <span className="text-white font-bold">{kpiSummary.eWasteQuantityKg} kg</span>
                  </div>
                  <div className="flex justify-between items-center bg-neutral-950 p-2 border border-neutral-900">
                    <span className="text-neutral-400">Sustainable Disposal %</span>
                    <span className="text-red-500 font-bold">{kpiSummary.sustainableDisposalPercent}% Certified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM REPORT / BI BUILDER */}
      {activeTab === 'custom_bi_builder' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Builder Form */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Drag-and-Drop Custom BI Report & Scheduled Export Builder
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Report Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Data Source</label>
                <select
                  value={reportDataSource}
                  onChange={(e) => setReportDataSource(e.target.value as CustomBiReportConfig['dataSource'])}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                >
                  <option value="Assets">Assets & CIs</option>
                  <option value="CMDB">CMDB Topology</option>
                  <option value="Contracts">Contracts & Licenses</option>
                  <option value="Financials">Financial Spend</option>
                  <option value="Facilities">Non-IT Facilities</option>
                  <option value="Fleet">Non-IT Fleet</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Schedule Frequency</label>
                <select
                  value={reportFrequency}
                  onChange={(e) => setReportFrequency(e.target.value as CustomBiReportConfig['scheduleFrequency'])}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="None">Ad-hoc (No Schedule)</option>
                </select>
              </div>

              <button
                onClick={handleCreateReport}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-[10px]"
              >
                Save & Schedule Report
              </button>
            </div>
          </div>

          {/* Configured Reports List */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Active Configured BI Reports & Scheduled Export Jobs
            </div>

            <div className="space-y-3">
              {reports.map(rep => (
                <div key={rep.reportId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{rep.title}</span>
                        <span className="text-[10px] text-red-500 font-bold">[{rep.reportId}]</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Data Source: {rep.dataSource} • Schedule: {rep.scheduleFrequency}</span>
                    </div>

                    <span className="px-2 py-0.5 text-[9px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase">
                      Export Format: {rep.exportFormat}
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 text-[10px] text-neutral-300">
                    <p><strong className="text-white">Selected Fields: </strong>{rep.selectedFields.join(', ')}</p>
                    <p><strong className="text-white">Filter Expression: </strong>{rep.filterCriteria}</p>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-neutral-500 pt-1">
                    <span>Creator: {rep.createdUser} • Last Executed: {rep.lastExecuted}</span>
                    <button className="px-3 py-1 bg-black border border-neutral-800 hover:border-white text-white font-bold text-[9px] uppercase flex items-center space-x-1">
                      <Download className="w-3 h-3 text-red-500" />
                      <span>Download {rep.exportFormat} Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MOBILE / FIELD OPERATIONS */}
      {activeTab === 'mobile_field_ops' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Mobile Scanner Interface */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white flex justify-between items-center">
              <span>Mobile Field Scanner & Offline Audit Tool</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsOfflineMode(!isOfflineMode)}
                  className={`px-3 py-1 text-[9px] font-bold uppercase border ${
                    isOfflineMode
                      ? 'bg-red-950 text-red-500 border-red-900'
                      : 'bg-black text-white border-neutral-800'
                  }`}
                >
                  Mode: {isOfflineMode ? 'OFFLINE QUEUED' : 'ONLINE LIVE'}
                </button>
                {offlineQueue.length > 0 && (
                  <button
                    onClick={handleSyncOffline}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] uppercase flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Sync Queue ({offlineQueue.length})</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Scan Barcode / Asset Tag</label>
                <input
                  type="text"
                  value={scanTagInput}
                  onChange={(e) => setScanTagInput(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 uppercase block mb-1">Audit Verification Result</label>
                <select
                  value={scanStatusInput}
                  onChange={(e) => setScanStatusInput(e.target.value as MobileFieldAuditRecord['auditStatus'])}
                  className="w-full bg-black border border-neutral-800 p-2 text-white font-bold"
                >
                  <option value="Verified">Verified</option>
                  <option value="Mismatch">Mismatch</option>
                  <option value="Missing">Missing</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Moved">Moved</option>
                </select>
              </div>

              <button
                onClick={handleMobileScan}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-[10px] flex items-center justify-center space-x-1"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Simulate Field Scan</span>
              </button>
            </div>
          </div>

          {/* Field Audit Log */}
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Field Operations Audit Scan Log
            </div>

            <div className="space-y-3">
              {mobileAudits.map(aud => (
                <div key={aud.auditScanId} className="bg-black border border-neutral-800 p-4 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <div>
                      <span className="text-sm font-bold text-white">{aud.scannedTagOrBarcode}</span>
                      <span className="text-[10px] text-neutral-400 block">{aud.assetName}</span>
                    </div>

                    <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                      aud.auditStatus === 'Verified'
                        ? 'bg-black text-white border-neutral-800'
                        : 'bg-red-950 text-red-500 border-red-900'
                    }`}>
                      Status: {aud.auditStatus} {aud.isOfflineSync ? '(Offline Synced)' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-neutral-950 p-2 border border-neutral-900">
                    <div>
                      <span className="text-neutral-500 uppercase block">Expected Serial / Location</span>
                      <span className="text-white font-bold">{aud.expectedSerial} • {aud.expectedLocation}</span>
                    </div>

                    <div>
                      <span className="text-neutral-500 uppercase block">Scanned Serial / Location</span>
                      <span className="text-white font-bold">{aud.scannedSerial} • {aud.scannedLocation}</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-[9px] text-neutral-500 pt-1">
                    <span>Technician: {aud.technicianUser}</span>
                    <span>Timestamp: {aud.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NON-IT / ENTERPRISE ASSET MANAGEMENT */}
      {activeTab === 'non_it_assets' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-neutral-950 border border-neutral-800 p-5 space-y-4">
            <div className="border-b border-neutral-900 pb-2 font-bold uppercase text-white">
              Non-IT Enterprise Asset Management (Facilities, Fleet, OT & IoT)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nonItAssets.map(asset => (
                <div key={asset.nonItAssetId} className="bg-black border border-neutral-800 p-4 space-y-3">
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{asset.assetTag}</span>
                        <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-900 font-bold uppercase">
                          {asset.category}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white mt-1">{asset.name}</h3>
                      <span className="text-[10px] text-neutral-400">{asset.typeDetail}</span>
                    </div>

                    <span className="px-2 py-0.5 text-[9px] bg-black text-white border border-neutral-800 font-bold uppercase">
                      {asset.operationalStatus}
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-2 border border-neutral-900 text-[10px] space-y-1">
                    <p className="text-neutral-300"><strong className="text-white">Serial Number: </strong>{asset.serialNumber}</p>
                    <p className="text-neutral-300"><strong className="text-white">Location: </strong>{asset.location}</p>
                    <p className="text-neutral-300"><strong className="text-white">Assigned Manager: </strong>{asset.assignedManager}</p>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-neutral-500 pt-1 border-t border-neutral-900">
                    <span>Next Maint: {asset.nextMaintenanceDue}</span>
                    <span className="text-red-500 font-bold">{asset.complianceRating}</span>
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

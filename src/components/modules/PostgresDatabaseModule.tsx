import React, { useState, useEffect } from 'react';
import {
  Database,
  Shield,
  Layers,
  Lock,
  RefreshCw,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  FileCode,
  HardDrive,
  Cpu,
  KeyRound,
  DollarSign,
  Plus,
  Play,
  RotateCcw,
} from 'lucide-react';

import { TenantContextAdapter, TenantDatabaseContext } from '../../database/postgres/adapters/TenantContextAdapter';
import { PostgresRepository } from '../../database/postgres/repositories/PostgresRepository';
import { PostgresTransactionManager, TransactionStepResult } from '../../database/postgres/PostgresTransactionManager';
import { PostgresMonitoringService } from '../../database/postgres/services/PostgresMonitoringService';

import {
  NewConfigurationItem,
  NewContract,
  NewFinancialRecord,
  PostgresDbHealthMetrics,
} from '../../database/postgres/types/postgresTypes';

export const PostgresDatabaseModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tables' | 'rls' | 'migrations' | 'transactions' | 'monitoring'>('tables');

  // Tenant Context State
  const [currentTenantContext, setCurrentTenantContext] = useState<TenantDatabaseContext>(
    TenantContextAdapter.getCurrentTenantContext()
  );

  // Data
  const [cis, setCis] = useState<NewConfigurationItem[]>([]);
  const [contracts, setContracts] = useState<NewContract[]>([]);
  const [financials, setFinancials] = useState<NewFinancialRecord[]>([]);
  const [metrics, setMetrics] = useState<PostgresDbHealthMetrics>(PostgresMonitoringService.getMetrics());

  // Transaction simulation
  const [txSteps, setTxSteps] = useState<TransactionStepResult[]>([]);
  const [txLog, setTxLog] = useState<string>('');

  // Form for New CI
  const [ciForm, setCiForm] = useState({
    ciTag: 'CI-SRV-9005',
    ciType: 'Application Server',
    name: 'PostgreSQL Secondary Replica Node 02',
    status: 'Active' as const,
    owner: 'Database Reliability Team',
    location: 'Mumbai HQ DC',
    environment: 'Production' as const,
    criticality: 'Tier 1 Critical' as const,
  });

  useEffect(() => {
    loadData();
  }, [currentTenantContext]);

  const loadData = async () => {
    try {
      const ciData = await PostgresRepository.findCisByTenant(currentTenantContext);
      const contractData = await PostgresRepository.findContractsByTenant(currentTenantContext);
      const finData = await PostgresRepository.findFinancialsByTenant(currentTenantContext);

      setCis(ciData);
      setContracts(contractData);
      setFinancials(finData);
      setMetrics(PostgresMonitoringService.getMetrics());
    } catch (err: any) {
      console.error('Error loading PostgreSQL records:', err);
    }
  };

  const handleCreateCiTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxLog('Executing ACID Transaction Block on PostgreSQL Layer...');

    try {
      const res = await PostgresTransactionManager.executeInTransaction(currentTenantContext, async () => {
        return await PostgresRepository.createCi(
          {
            ciTag: ciForm.ciTag,
            ciType: ciForm.ciType,
            name: ciForm.name,
            status: ciForm.status,
            owner: ciForm.owner,
            location: ciForm.location,
            environment: ciForm.environment,
            criticality: ciForm.criticality,
            attributes: { engine: 'PostgreSQL 16.2', cores: 16, rlsEnforced: true },
            tenantId: currentTenantContext.tenantId,
            organizationId: currentTenantContext.organizationId,
            createdBy: currentTenantContext.userId,
            updatedBy: currentTenantContext.userId,
          },
          currentTenantContext
        );
      });

      setTxSteps(res.stepsExecuted);
      setTxLog(`Transaction ${res.transactionId} COMMITTED successfully! 1 Record Created.`);
      loadData();
    } catch (err: any) {
      setTxLog(`Transaction Failed & ROLLED BACK: ${err.message}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans bg-black min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-600 rounded border border-red-500 shadow-sm">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight font-mono">
                ISOLATED POSTGRESQL DATA LAYER & SYSTEM OF RECORD
              </h1>
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border border-red-500">
                ADD-ON INFRASTRUCTURE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              ACID Transactional Relational Database • Row-Level Security (RLS) • Versioned Migrations & Health Monitoring
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1.5 bg-black p-1 border border-zinc-800 rounded font-mono text-xs overflow-x-auto">
          {[
            { id: 'tables', label: 'SoR Tables', icon: Database },
            { id: 'rls', label: 'Row-Level Security (RLS)', icon: Shield },
            { id: 'migrations', label: 'SQL Migrations', icon: FileCode },
            { id: 'transactions', label: 'ACID Transactions', icon: Layers },
            { id: 'monitoring', label: 'Health & Pool', icon: Activity },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                  isActive ? 'bg-red-600 text-white font-bold border border-red-500' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tenant Context Bar */}
      <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-2">
        <div className="flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-red-500" />
          <span className="text-zinc-400">Current Tenant Context:</span>
          <span className="text-white font-bold">{currentTenantContext.tenantId}</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">Org ID:</span>
          <span className="text-white">{currentTenantContext.organizationId}</span>
        </div>

        <div className="flex items-center space-x-2 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>PostgreSQL RLS Active (app.current_tenant_id Enforced)</span>
        </div>
      </div>

      {/* TAB 1: TABLES EXPLORER */}
      {activeTab === 'tables' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Configuration Items Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center space-x-2">
                <Database className="w-4 h-4 text-red-500" />
                <span>TABLE: new_configuration_items ({cis.length} Records)</span>
              </span>
              <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                Primary Key: UUID • RLS Enforced
              </span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-black text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">CI Tag</th>
                  <th className="p-3">CI Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Environment</th>
                  <th className="p-3">Criticality</th>
                  <th className="p-3">Attributes (JSONB)</th>
                  <th className="p-3">Tenant ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {cis.map((ci) => (
                  <tr key={ci.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-red-400">{ci.ciTag}</td>
                    <td className="p-3 font-bold text-white">{ci.name}</td>
                    <td className="p-3 text-zinc-400">{ci.ciType}</td>
                    <td className="p-3 text-zinc-300">{ci.environment}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                        {ci.criticality}
                      </span>
                    </td>
                    <td className="p-3 text-[10px] text-zinc-400 font-mono truncate max-w-xs">
                      {JSON.stringify(ci.attributes)}
                    </td>
                    <td className="p-3 text-zinc-500">{ci.tenantId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Contracts Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-red-500" />
                <span>TABLE: new_contracts ({contracts.length} Records)</span>
              </span>
              <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                Numeric (15, 2) Precision Enforced
              </span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-black text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Contract #</th>
                  <th className="p-3">Vendor Name</th>
                  <th className="p-3">Contract Value</th>
                  <th className="p-3">Renewal Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Tenant ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {contracts.map((ctr) => (
                  <tr key={ctr.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{ctr.contractNumber}</td>
                    <td className="p-3 text-zinc-300">{ctr.vendorName}</td>
                    <td className="p-3 font-bold text-red-400">
                      ₹{ctr.contractValue.toLocaleString()} {ctr.currency}
                    </td>
                    <td className="p-3 text-zinc-400">{ctr.renewalDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-red-400 border border-red-500/30 font-bold text-[10px]">
                        {ctr.status}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-500">{ctr.tenantId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROW LEVEL SECURITY */}
      {activeTab === 'rls' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
            <Shield className="w-4 h-4 text-red-500" />
            <span>POSTGRESQL ROW-LEVEL SECURITY (RLS) ENFORCEMENT ENGINE</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-black border border-zinc-800 rounded space-y-2">
              <div className="font-bold text-white">Active RLS Policy Statement</div>
              <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded text-red-400 text-[11px] overflow-x-auto">
{`CREATE POLICY tenant_isolation_ci_policy ON new_configuration_items
FOR ALL
USING (tenant_id = current_setting('app.current_tenant_id', true))
WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));`}
              </pre>
            </div>

            <div className="p-4 bg-black border border-zinc-800 rounded space-y-2">
              <div className="font-bold text-white">Tenant Isolation Guarantee</div>
              <p className="text-zinc-400 text-[11px]">
                PostgreSQL prevents Organization A from querying or mutating Organization B records directly at the database engine level. Frontend or API filtering bugs cannot leak multi-tenant data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SQL MIGRATIONS */}
      {activeTab === 'migrations' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
            <FileCode className="w-4 h-4 text-red-500" />
            <span>VERSION-CONTROLLED SQL MIGRATIONS</span>
          </h3>

          <div className="space-y-3">
            {[
              { file: '001_init_new_itam_so_record.sql', title: 'Migration 001: System of Record Tables', status: 'APPLIED', date: '2026-08-11 08:00:00' },
              { file: '002_enable_rls_policies.sql', title: 'Migration 002: Row-Level Security Policies', status: 'APPLIED', date: '2026-08-11 08:05:00' },
              { file: '003_add_indexes_and_constraints.sql', title: 'Migration 003: Performance GIN & Unique Indexes', status: 'APPLIED', date: '2026-08-11 08:10:00' },
            ].map((m, idx) => (
              <div key={idx} className="p-3 bg-black border border-zinc-800 rounded flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{m.file}</div>
                  <div className="text-zinc-400 text-[10px]">{m.title}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-zinc-500 text-[10px]">{m.date}</span>
                  <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ACID TRANSACTIONS SIMULATOR */}
      {activeTab === 'transactions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
          {/* Form */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Layers className="w-4 h-4 text-red-500" />
              <span>TEST ATOMIC ACID TRANSACTION EXECUTION</span>
            </h3>

            <form onSubmit={handleCreateCiTransaction} className="space-y-3">
              <div>
                <label className="text-zinc-400 text-[10px] uppercase">CI Tag</label>
                <input
                  type="text"
                  value={ciForm.ciTag}
                  onChange={(e) => setCiForm({ ...ciForm, ciTag: e.target.value })}
                  className="w-full mt-1 bg-black text-white border border-zinc-800 focus:border-red-500 p-2 rounded text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-[10px] uppercase">CI Name</label>
                <input
                  type="text"
                  value={ciForm.name}
                  onChange={(e) => setCiForm({ ...ciForm, name: e.target.value })}
                  className="w-full mt-1 bg-black text-white border border-zinc-800 focus:border-red-500 p-2 rounded text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-[10px] uppercase">Location</label>
                <input
                  type="text"
                  value={ciForm.location}
                  onChange={(e) => setCiForm({ ...ciForm, location: e.target.value })}
                  className="w-full mt-1 bg-black text-white border border-zinc-800 focus:border-red-500 p-2 rounded text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded border border-red-500 cursor-pointer transition-colors"
              >
                Execute Transaction (BEGIN → INSERT → COMMIT)
              </button>
            </form>
          </div>

          {/* Log */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Terminal className="w-4 h-4 text-red-500" />
              <span>TRANSACTION STEP TRACE & LOG</span>
            </h3>

            <div className="space-y-2">
              {txLog && (
                <div className="p-3 bg-black border border-zinc-800 rounded text-red-400 font-bold">
                  {txLog}
                </div>
              )}

              {txSteps.map((s, idx) => (
                <div key={idx} className="p-2 bg-black border border-zinc-800 rounded flex justify-between text-[11px]">
                  <span className="text-white font-bold">{s.stepName}</span>
                  <span className="text-zinc-400">{s.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MONITORING & POOL */}
      {activeTab === 'monitoring' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1">
            <div className="text-zinc-400 text-[10px]">Database Status</div>
            <div className="text-lg font-black text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>{metrics.status}</span>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1">
            <div className="text-zinc-400 text-[10px]">Active Pool Connections</div>
            <div className="text-lg font-black text-white">
              {metrics.activeConnections} / {metrics.maxConnections}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1">
            <div className="text-zinc-400 text-[10px]">Average Query Latency</div>
            <div className="text-lg font-black text-red-400">{metrics.averageQueryLatencyMs} ms</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-1">
            <div className="text-zinc-400 text-[10px]">Backup & WAL Status</div>
            <div className="text-xs font-bold text-white truncate">{metrics.walArchiveStatus}</div>
          </div>
        </div>
      )}
    </div>
  );
};

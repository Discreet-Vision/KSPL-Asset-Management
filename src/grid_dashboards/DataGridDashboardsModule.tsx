import React, { useState } from 'react';
import { Table, BarChart3, TestTube, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

import { AgGridEnterpriseView } from './components/AgGridEnterpriseView';
import { RechartsDashboardView } from './components/RechartsDashboardView';
import { GridDashboardTestSuite, TestResult } from './tests/GridDashboardTestSuite';
import { GridFilterModel } from './types/gridDashboardTypes';

export const DataGridDashboardsModule: React.FC<{
  tenantId?: string;
  userRole?: string;
}> = ({ tenantId = 'tenant-kspl-global', userRole = 'ADMIN' }) => {
  const [activeTab, setActiveTab] = useState<'dashboards' | 'grid' | 'tests'>('dashboards');
  const [drillDownFilter, setDrillDownFilter] = useState<GridFilterModel | undefined>(undefined);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const handleDrillDownFromDashboard = (filter: GridFilterModel) => {
    setDrillDownFilter(filter);
    setActiveTab('grid');
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    const results = await GridDashboardTestSuite.runAllTests(tenantId);
    setTestResults(results);
    setIsRunningTests(false);
  };

  return (
    <div className="bg-black min-h-screen text-white font-mono p-4 space-y-4">
      {/* Module Header Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
            <h1 className="text-base font-bold text-white uppercase tracking-wider">
              ENTERPRISE AG GRID & RECHARTS DASHBOARDS MODULE
            </h1>
          </div>
          <p className="text-zinc-400 text-xs mt-1">
            Strict Monochromatic Red/Black/White • Server-Side 100k+ Row Model • Recharts Analytics
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 bg-black p-1 border border-zinc-800 rounded">
          <button
            onClick={() => setActiveTab('dashboards')}
            className={`px-3 py-1.5 text-xs font-bold uppercase rounded cursor-pointer transition-colors flex items-center space-x-1.5 ${
              activeTab === 'dashboards'
                ? 'bg-red-600 text-white border border-red-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboards</span>
          </button>

          <button
            onClick={() => setActiveTab('grid')}
            className={`px-3 py-1.5 text-xs font-bold uppercase rounded cursor-pointer transition-colors flex items-center space-x-1.5 ${
              activeTab === 'grid'
                ? 'bg-red-600 text-white border border-red-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>AG Grid (100k+)</span>
            {drillDownFilter && (
              <span className="w-2 h-2 bg-white rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 text-xs font-bold uppercase rounded cursor-pointer transition-colors flex items-center space-x-1.5 ${
              activeTab === 'tests'
                ? 'bg-red-600 text-white border border-red-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TestTube className="w-4 h-4" />
            <span>Test Suite</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'dashboards' && (
        <RechartsDashboardView tenantId={tenantId} onDrillDown={handleDrillDownFromDashboard} />
      )}

      {activeTab === 'grid' && (
        <AgGridEnterpriseView tenantId={tenantId} userRole={userRole} externalFilter={drillDownFilter} />
      )}

      {activeTab === 'tests' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase">Automated Module Verification Suite</h2>
              <p className="text-zinc-400 text-xs">Verify 100k+ row pagination, filtering, saved views & export safety</p>
            </div>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded border border-red-500 text-xs cursor-pointer disabled:opacity-50"
            >
              {isRunningTests ? 'Running Automated Verification...' : 'Run Module Tests'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              {testResults.map((t, idx) => (
                <div
                  key={idx}
                  className={`p-3 border rounded-lg flex items-center justify-between text-xs ${
                    t.passed ? 'bg-black border-zinc-800 text-zinc-200' : 'bg-red-950/30 border-red-600 text-red-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-bold text-white">{t.testName}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-zinc-400">
                    <span>{t.message}</span>
                    <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-white rounded text-[10px]">
                      {t.durationMs}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

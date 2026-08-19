import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Cpu,
  Layers,
  Database,
  Search,
  FileCheck2,
  DollarSign,
  AlertTriangle,
  Lock,
  ArrowRight,
  CheckCircle2,
  Activity,
  Globe2,
  Users,
  Building2,
  FileSpreadsheet,
  Zap,
  BarChart3,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface PublicLandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToDemo: () => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
  onNavigateToDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'itam' | 'cmdb' | 'sam' | 'security'>('all');

  const featureModules = [
    {
      id: 'asset-mgmt',
      category: 'itam',
      icon: Server,
      title: 'Hardware & Lifecycle Management',
      description: 'End-to-end asset tracking from Procurement → Stockroom → Deployment → Repair → Retirement (NIST 800-88 Data Wipe).',
    },
    {
      id: 'cmdb',
      category: 'cmdb',
      icon: Database,
      title: 'Enterprise CMDB & Graph Engine',
      description: 'Typed CI hierarchy with multi-directional relationships (runs_on, depends_on, hosted_by) and interactive Blast-Radius visualizer.',
    },
    {
      id: 'discovery',
      category: 'itam',
      icon: Search,
      title: 'Multi-Source Discovery Engine',
      description: 'Agentless SNMP/WMI/SSH scanning, native cross-platform Endpoint Agents, and multi-cloud AWS/Azure/GCP connectors.',
    },
    {
      id: 'reconciliation',
      category: 'cmdb',
      icon: Layers,
      title: 'Identification & Reconciliation (IRE)',
      description: 'Configurable precedence rules and multi-attribute duplicate detection (Serial, MAC, Hostname, UUID) ensuring a canonical CMDB.',
    },
    {
      id: 'sam',
      category: 'sam',
      icon: FileCheck2,
      title: 'Software Asset Management (SAM)',
      description: 'Effective License Position (ELP) calculations across Per-User, Per-Core, Per-CPU, SaaS seats, and Microsoft/Oracle/Adobe true-ups.',
    },
    {
      id: 'normalization',
      category: 'sam',
      icon: Cpu,
      title: 'Software Normalization Catalog',
      description: 'Automatic mapping of raw, noisy software installation strings into normalized canonical products, editions, and publishers.',
    },
    {
      id: 'contracts',
      category: 'itam',
      icon: FileSpreadsheet,
      title: 'Contracts, Vendors & Procurement',
      description: 'Purchase order workflows, vendor SLAs, contract expiration alerts, MSA/SOW attachments, and cost-center allocation.',
    },
    {
      id: 'financials',
      category: 'itam',
      icon: DollarSign,
      title: 'Financial TCO & Depreciation',
      description: 'Straight-line & declining-balance asset depreciation, total cost of ownership (TCO) modeling, chargeback, and showback reporting.',
    },
    {
      id: 'vulnerabilities',
      category: 'security',
      icon: AlertTriangle,
      title: 'CVE Vulnerability & Policy Engine',
      description: 'Automatic correlation of discovered software versions with NVD CVE vulnerability feeds, CVSS severity scoring, and remediation tasks.',
    },
    {
      id: 'itsm',
      category: 'security',
      icon: Activity,
      title: 'ITSM & Change Correlation',
      description: 'Seamless integration with Incident, Problem, and Change Management workflows to correlate asset downtime and unauthorized changes.',
    },
    {
      id: 'ai-copilot',
      category: 'all',
      icon: Sparkles,
      title: 'KSPL AI Copilot & Natural Language Reasoning',
      description: 'Query complex CMDB relationships, licensing exposure, and risk posture using natural language backed by generative AI.',
    },
    {
      id: 'audit',
      category: 'security',
      icon: Lock,
      title: 'Immutable Audit Trail & Governance',
      description: 'Append-only mutation audit logging, field-level role-based access control (RBAC), and SOC2 / ISO27001 audit readiness.',
    },
  ];

  const filteredFeatures =
    activeTab === 'all' ? featureModules : featureModules.filter((f) => f.category === activeTab || f.category === 'all');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 text-white p-2 rounded font-black font-mono tracking-wider text-sm shadow-md shadow-red-900/30">
              KSPL
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">ITAM + CMDB</span>
              <span className="text-[10px] text-zinc-400 font-mono block -mt-0.5">ENTERPRISE SAAS</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            <a href="#features" className="hover:text-red-500 transition-colors">
              Platform Features
            </a>
            <a href="#cmdb-discovery" className="hover:text-red-500 transition-colors">
              CMDB & Discovery
            </a>
            <a href="#sam-compliance" className="hover:text-red-500 transition-colors">
              SAM & Compliance
            </a>
            <a href="#pricing" className="hover:text-red-500 transition-colors">
              Editions & Pricing
            </a>
            <a href="#enterprise" className="hover:text-red-500 transition-colors">
              Security
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateToLogin}
              className="px-4 py-2 text-xs font-bold font-mono tracking-wider text-zinc-200 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded transition-all cursor-pointer"
            >
              SIGN IN
            </button>
            <button
              onClick={onNavigateToRegister}
              className="px-4 py-2 text-xs font-bold font-mono tracking-wider text-white bg-red-600 hover:bg-red-500 rounded transition-all shadow-lg shadow-red-900/40 cursor-pointer flex items-center space-x-1.5"
            >
              <span>GET STARTED</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-zinc-800 bg-gradient-to-b from-zinc-950 via-black to-zinc-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-red-600/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-mono font-bold px-3.5 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>KSPL ITAM SAAS PLATFORM 2026 RELEASE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-5xl mx-auto">
            Complete IT Asset Management & CMDB for the Modern Enterprise
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            Discover, manage, secure, and optimize every IT asset, configuration item, software license, and cloud resource across your global organization from one unified, audit-ready system of record.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNavigateToRegister}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold font-mono tracking-wider text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-xl shadow-red-900/50 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>CREATE ORGANIZATION ACCOUNT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateToDemo}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold font-mono tracking-wider text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>EXPLORE LIVE DEMO</span>
            </button>
          </div>

          {/* Interactive Hero Live Teaser Card */}
          <div className="mt-14 max-w-5xl mx-auto bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-2xl text-left relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-zinc-600" />
                <div className="w-3 h-3 rounded-full bg-zinc-600" />
                <span className="text-xs font-mono text-zinc-400 ml-2">kspl-itam-console.enterprise.local</span>
              </div>
              <span className="text-[10px] font-mono bg-red-950/80 text-red-300 px-2 py-0.5 rounded border border-red-800">
                LIVE PRODUCTION TENANT
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-black/60 p-3 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Total Discovered CIs</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">4,285</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">↑ 99.2% Agent Coverage</span>
              </div>

              <div className="bg-black/60 p-3 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">License Gap Liability</span>
                <span className="text-xl font-bold font-mono text-red-400 mt-1 block">$248,140</span>
                <span className="text-[10px] text-red-400 font-mono mt-1 block">3 Under-Licensed Apps</span>
              </div>

              <div className="bg-black/60 p-3 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">CMDB Health Score</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">98.4%</span>
                <span className="text-[10px] text-zinc-400 font-mono mt-1 block">Reconciliation Active</span>
              </div>

              <div className="bg-black/60 p-3 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Open CVE Risks</span>
                <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">12 Critical</span>
                <span className="text-[10px] text-zinc-400 font-mono mt-1 block">Auto-correlated to CIs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid Section */}
      <section id="features" className="py-20 border-b border-zinc-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase text-red-500 tracking-wider">
              UNIFIED ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
              Built for Enterprise IT Asset Governance & Compliance
            </h2>
            <p className="text-sm text-zinc-400 mt-3">
              Eliminate software audit fines, eliminate shadow IT, optimize hardware utilization, and establish an unbreakable CMDB single source of truth.
            </p>

            {/* Filter Tabs */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {[
                { id: 'all', label: 'All Capabilities' },
                { id: 'itam', label: 'Hardware & Lifecycle' },
                { id: 'cmdb', label: 'CMDB & Discovery' },
                { id: 'sam', label: 'SAM & Licensing' },
                { id: 'security', label: 'Security & CVE' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-full transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((f) => {
              const IconComp = f.icon;
              return (
                <div
                  key={f.id}
                  className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400 mb-4 group-hover:scale-105 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CMDB & Discovery Deep Dive Section */}
      <section id="cmdb-discovery" className="py-20 border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-red-500 tracking-wider">
                REAL-TIME DISCOVERY & CMDB
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-2 leading-tight">
                Automated Network Scanning, Endpoint Agents & Cloud Connectors
              </h2>
              <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
                Never rely on manual spreadsheets again. KSPL automatically scans IP ranges via SNMP, WMI, and SSH, registers endpoints with native lightweight agents, and ingests cloud instances directly from AWS, Azure, and GCP.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  'Agentless SNMP, WMI & SSH credentialed subnet scanning',
                  'Cross-platform Windows, Linux & macOS Endpoint Telemetry Agents',
                  'Multi-cloud AWS, Azure & GCP automated asset discovery',
                  'Configurable Reconciliation Engine (IRE) to eliminate duplicate CIs',
                  'Interactive Graph Visualizer with Blast-Radius impact tracing',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button
                  onClick={onNavigateToRegister}
                  className="px-6 py-3 text-xs font-bold font-mono tracking-wider text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-900/30 transition-all cursor-pointer inline-flex items-center space-x-2"
                >
                  <span>TRY AUTOMATED DISCOVERY FREE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-black border border-zinc-800 rounded-xl p-6 font-mono text-xs">
              <div className="text-zinc-500 text-[10px] uppercase mb-2 border-b border-zinc-800 pb-2">
                RECONCILIATION LOG // DISCOVERY SCAN JOB #8921
              </div>
              <div className="space-y-2 text-zinc-300">
                <p className="text-emerald-400">[00:01:12] Agentless SNMP scan completed on 10.100.0.0/24</p>
                <p>[00:01:14] Discovered 12 servers, 4 switches, 2 firewalls</p>
                <p className="text-amber-400">[00:01:15] Potential match: Hostname "srv-db-01" matches Agent CI-SRV-101</p>
                <p className="text-blue-400">[00:01:16] Executing IRE Precedence Rules: Agent OS data &gt; SNMP OS data</p>
                <p className="text-emerald-400">[00:01:18] Updated Canonical CI "prod-db-cluster-01" without duplicates</p>
                <p className="text-purple-400">[00:01:20] Correlated 2 downstream Business Services: Financial ERP, Payroll API</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Security & RBAC Section */}
      <section id="enterprise" className="py-20 border-b border-zinc-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase text-red-500 tracking-wider">
              ENTERPRISE SECURITY & GOVERNANCE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
              Multi-Tenant Isolation, RBAC & Immutable Audit Logs
            </h2>
            <p className="text-sm text-zinc-400 mt-3">
              Designed from the ground up for strict enterprise security compliance, field-level masking, and granular authorization controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <Building2 className="w-8 h-8 text-red-500 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Strict Tenant Isolation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every organization data record is logically isolated by Organization ID with strict tenant boundary enforcement across REST APIs.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <Users className="w-8 h-8 text-red-500 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Granular Role-Based Access</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Define custom roles (Super Admin, Asset Manager, IT Support, Auditor, Finance, Security) with field-level financial and PII masking.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <Lock className="w-8 h-8 text-red-500 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Immutable Audit Logging</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every asset check-in, assignment, financial modification, and policy waiver captures actor, timestamp, and field deltas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Editions Matrix */}
      <section id="pricing" className="py-20 border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase text-red-500 tracking-wider">
              PRICING & EDITIONS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
              Transparent Enterprise Licensing
            </h2>
            <p className="text-sm text-zinc-400 mt-3">
              Scale seamlessly from growing IT teams to global enterprises with flexible managed node tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-black border border-zinc-800 rounded-xl p-8 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase">STARTER</span>
                <h3 className="text-xl font-bold text-white mt-1">ITAM Growth</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-black font-mono text-white">$499</span>
                  <span className="text-xs text-zinc-400 ml-1 font-mono">/ month</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">Up to 500 managed assets & CIs</p>

                <div className="mt-6 space-y-3 pt-6 border-t border-zinc-800 text-xs text-zinc-300">
                  <p className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /><span>Hardware & Software Asset Mgmt</span></p>
                  <p className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /><span>Agentless Subnet Discovery</span></p>
                  <p className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /><span>Stockroom & Barcode QR Scanner</span></p>
                  <p className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /><span>Standard Incident / ITSM Mapping</span></p>
                </div>
              </div>

              <button
                onClick={onNavigateToRegister}
                className="mt-8 w-full py-2.5 text-xs font-bold font-mono tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded transition-all cursor-pointer"
              >
                START 14-DAY TRIAL
              </button>
            </div>

            {/* Enterprise Plan (Popular) */}
            <div className="bg-black border-2 border-red-600 rounded-xl p-8 flex flex-col justify-between relative shadow-xl shadow-red-950/40">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-mono font-black uppercase px-3 py-0.5 rounded-full tracking-wider">
                MOST POPULAR ENTERPRISE
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-red-400 uppercase">ENTERPRISE</span>
                <h3 className="text-xl font-bold text-white mt-1">ITAM + CMDB Pro</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-black font-mono text-white">$1,499</span>
                  <span className="text-xs text-zinc-400 ml-1 font-mono">/ month</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">Up to 5,000 managed assets & CIs</p>

                <div className="mt-6 space-y-3 pt-6 border-t border-zinc-800 text-xs text-zinc-300">
                  <p className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /><span>Full CMDB Graph & Blast Radius Engine</span></p>
                  <p className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /><span>SAM Effective License Position (ELP)</span></p>
                  <p className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /><span>Reconciliation & Software Normalization</span></p>
                  <p className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /><span>CVE Vulnerability & Policy Engine</span></p>
                  <p className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /><span>KSPL AI Copilot Generative Analytics</span></p>
                </div>
              </div>

              <button
                onClick={onNavigateToRegister}
                className="mt-8 w-full py-2.5 text-xs font-bold font-mono tracking-wider text-white bg-red-600 hover:bg-red-500 rounded transition-all shadow-lg shadow-red-900/50 cursor-pointer"
              >
                CREATE ENTERPRISE TENANT
              </button>
            </div>

            {/* Ultimate Plan */}
            <div className="bg-black border border-zinc-800 rounded-xl p-8 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase">GLOBAL</span>
                <h3 className="text-xl font-bold text-white mt-1">Ultimate Scale</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-black font-mono text-white">Custom</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">Unlimited assets, custom nodes & multi-tenant federation</p>

                <div className="mt-6 space-y-3 pt-6 border-t border-zinc-800 text-xs text-zinc-300">
                  <p className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /><span>Dedicated Cloud Isolation or On-Prem Hybrid</span></p>
                  <p className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /><span>Custom REST / Webhook Integration Fabric</span></p>
                  <p className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /><span>24/7 SLA & Dedicated TAM Architect</span></p>
                  <p className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /><span>Unlimited Audit Log History</span></p>
                </div>
              </div>

              <button
                onClick={onNavigateToRegister}
                className="mt-8 w-full py-2.5 text-xs font-bold font-mono tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded transition-all cursor-pointer"
              >
                CONTACT SALES
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-b from-black to-zinc-950 border-b border-zinc-800 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Ready to Take Control of Your Enterprise IT Assets?
          </h2>
          <p className="text-sm text-zinc-400 mt-4 max-w-2xl mx-auto">
            Join hundreds of enterprise infrastructure teams managing millions of CIs, laptops, servers, and software licenses with KSPL ITAM.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNavigateToRegister}
              className="w-full sm:w-auto px-8 py-3 text-xs font-bold font-mono tracking-wider text-white bg-red-600 hover:bg-red-500 rounded shadow-xl shadow-red-900/50 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>CREATE ACCOUNT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateToLogin}
              className="w-full sm:w-auto px-8 py-3 text-xs font-bold font-mono tracking-wider text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-700 rounded transition-all cursor-pointer"
            >
              <span>SIGN IN TO TENANT</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-10 border-t border-zinc-900 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 text-white p-1.5 rounded font-black font-mono tracking-wider text-xs">
              KSPL
            </div>
            <span className="text-xs font-bold text-white">KSPL ITAM Enterprise SaaS Engine</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-zinc-400">
            <a href="#features" className="hover:text-white">Capabilities</a>
            <a href="#cmdb-discovery" className="hover:text-white">CMDB Engine</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <button onClick={onNavigateToLogin} className="hover:text-white cursor-pointer">Portal Login</button>
            <button onClick={onNavigateToRegister} className="hover:text-white cursor-pointer">Register Tenant</button>
          </div>

          <div className="text-[11px] font-mono text-zinc-400">
            © {new Date().getFullYear()} KSPL Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

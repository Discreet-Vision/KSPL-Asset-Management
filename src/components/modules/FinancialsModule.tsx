import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  FileText,
  ShoppingBag,
  Building,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Layers,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Calculator,
  RefreshCw,
  Download,
  Eye,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Lock,
  BookOpen,
  PieChart,
  HardDrive,
  Cpu,
  Server,
  Zap,
} from 'lucide-react';
import {
  FinancialContract,
  ContractType,
  ContractStatus,
  FinancialPurchaseOrder,
  FinancialPOLineItem,
  POStatus,
  FinancialCostCenter,
  FinancialTransaction,
  FinancialTransactionType,
  FinancialTcoRecord,
  FinancialAssetDepreciationRecord,
  DepreciationMethod,
  FinancialVendorReference,
  FinancialAuditLog,
} from '../../types';

export const FinancialsModule: React.FC = () => {
  const { currentTenant, currentUser, addAuditEntry } = useApp();

  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'contracts'
    | 'procurement'
    | 'vendors'
    | 'cost_centers'
    | 'transactions'
    | 'tco'
    | 'depreciation'
    | 'reports'
    | 'audit'
  >('overview');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY'>('INR');

  // Exchange Rates relative to INR (base)
  const exchangeRates: Record<string, number> = {
    INR: 1.0,
    USD: 83.5,
    EUR: 90.2,
    GBP: 106.1,
    JPY: 0.55,
  };

  const currencySymbol = (curr: string) => {
    switch (curr) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return '₹';
    }
  };

  const formatMoney = (amountInINR: number) => {
    const rate = exchangeRates[selectedCurrency] || 1;
    const val = amountInINR / rate;
    return `${currencySymbol(selectedCurrency)} ${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  // ---------------- MOCK FINANCIAL DATA ----------------

  // 1. CONTRACTS DATA
  const [contracts, setContracts] = useState<FinancialContract[]>([
    {
      id: 'con-10025',
      contractNumber: 'CON-10025',
      contractName: 'Microsoft Enterprise Agreement (EA-2026)',
      contractType: 'Software Agreement',
      vendorId: 'ven-1',
      vendorName: 'Microsoft Corporation',
      startDate: '2025-01-01',
      endDate: '2026-12-31',
      renewalDate: '2026-11-30',
      contractValue: 4500000, // in INR
      currency: 'INR',
      paymentTerms: 'Annual Advance',
      costCenterId: 'cc-1',
      departmentId: 'dept-1',
      ownerName: 'Sarah Jenkins',
      status: 'Expiring Soon',
      description: 'Enterprise agreement covering 500 M365 E3 user licenses and Azure Cloud Commitments.',
      noticePeriodDays: 60,
      autoRenewal: false,
      renewalOwner: 'Sarah Jenkins',
      renewalStatus: 'In Progress',
      linkedAssetIds: ['AST-8812', 'AST-8813'],
      linkedServiceNames: ['M365 Suite', 'Azure Cloud Hosting'],
      daysRemaining: 142,
      tenantId: currentTenant.id,
    },
    {
      id: 'con-10026',
      contractNumber: 'CON-10026',
      contractName: 'Dell Hardware Support & ProSupport Plus',
      contractType: 'Hardware Contract',
      vendorId: 'ven-2',
      vendorName: 'Dell Technologies',
      startDate: '2024-06-15',
      endDate: '2027-06-15',
      renewalDate: '2027-05-15',
      contractValue: 1850000,
      currency: 'INR',
      paymentTerms: 'Net 30',
      costCenterId: 'cc-2',
      departmentId: 'dept-2',
      ownerName: 'David Miller',
      status: 'Active',
      description: '3-Year 24x7 On-site ProSupport coverage for server rack nodes and employee laptops.',
      noticePeriodDays: 30,
      autoRenewal: true,
      renewalOwner: 'David Miller',
      renewalStatus: 'Pending',
      linkedAssetIds: ['AST-9001', 'AST-9002', 'AST-9003'],
      daysRemaining: 308,
      tenantId: currentTenant.id,
    },
    {
      id: 'con-10027',
      contractNumber: 'CON-10027',
      contractName: 'Oracle Database Support Agreement',
      contractType: 'Support Contract',
      vendorId: 'ven-3',
      vendorName: 'Oracle India Pvt Ltd',
      startDate: '2023-09-01',
      endDate: '2026-08-31',
      renewalDate: '2026-08-01',
      contractValue: 3200000,
      currency: 'INR',
      paymentTerms: 'Quarterly',
      costCenterId: 'cc-3',
      departmentId: 'dept-1',
      ownerName: 'Michael Chang',
      status: 'Expiring Soon',
      description: 'Annual software updates and 24x7 premier technical support for Oracle DB 19c.',
      noticePeriodDays: 30,
      autoRenewal: false,
      renewalOwner: 'Michael Chang',
      renewalStatus: 'Pending',
      daysRemaining: 20,
      tenantId: currentTenant.id,
    },
  ]);

  // 2. PURCHASE ORDERS DATA
  const [purchaseOrders, setPurchaseOrders] = useState<FinancialPurchaseOrder[]>([
    {
      id: 'po-101',
      poNumber: 'PO-2026-10025',
      vendorId: 'ven-2',
      vendorName: 'Dell Technologies',
      poDate: '2026-07-10',
      expectedDeliveryDate: '2026-08-01',
      currency: 'INR',
      subtotal: 4850000,
      taxAmount: 873000,
      discountAmount: 123000,
      totalAmount: 5600000,
      paymentTerms: 'Net 30',
      costCenterId: 'cc-1',
      departmentId: 'dept-1',
      contractNumber: 'CON-10026',
      requesterName: 'Alex Carter',
      approverName: 'Robert Vance',
      status: 'Received',
      lineItems: [
        {
          id: 'poi-1',
          poId: 'po-101',
          itemDescription: 'Dell Latitude 7450 Business Laptop (16GB RAM, 512GB SSD)',
          quantity: 50,
          unitCost: 85000,
          totalCost: 4250000,
          linkedAssetId: 'AST-8812',
          costCenterId: 'cc-1',
        },
        {
          id: 'poi-2',
          poId: 'po-101',
          itemDescription: 'Dell Thunderbolt 4 Docking Station (WD22TB4)',
          quantity: 50,
          unitCost: 12000,
          totalCost: 600000,
          costCenterId: 'cc-1',
        },
      ],
      tenantId: currentTenant.id,
    },
    {
      id: 'po-102',
      poNumber: 'PO-2026-10026',
      vendorId: 'ven-1',
      vendorName: 'Microsoft Corporation',
      poDate: '2026-08-01',
      expectedDeliveryDate: '2026-08-15',
      currency: 'INR',
      subtotal: 1200000,
      taxAmount: 216000,
      discountAmount: 0,
      totalAmount: 1416000,
      paymentTerms: 'Immediate',
      costCenterId: 'cc-1',
      departmentId: 'dept-1',
      contractNumber: 'CON-10025',
      requesterName: 'Sarah Jenkins',
      approverName: 'Robert Vance',
      status: 'Approved',
      lineItems: [
        {
          id: 'poi-3',
          poId: 'po-102',
          itemDescription: 'Microsoft 365 E3 Subscription - 100 Additional Users',
          quantity: 100,
          unitCost: 12000,
          totalCost: 1200000,
          linkedServiceName: 'M365 Suite',
          costCenterId: 'cc-1',
        },
      ],
      tenantId: currentTenant.id,
    },
  ]);

  // 3. VENDORS REFERENCE DATA
  const [vendors] = useState<FinancialVendorReference[]>([
    {
      id: 'ven-1',
      vendorName: 'Microsoft Corporation',
      vendorType: 'Software & Cloud Vendor',
      contactPerson: 'Sanjay Gupta',
      contactEmail: 'sanjay.gupta@microsoft.com',
      address: 'Cyber City, Building 10, Gurugram, India',
      taxInfo: '07AAAAM1025R1Z5',
      paymentTerms: 'Net 30',
      preferredCurrency: 'INR',
      activeContractsCount: 2,
      totalPosCount: 12,
      totalSpendAmount: 14500000,
      tenantId: currentTenant.id,
    },
    {
      id: 'ven-2',
      vendorName: 'Dell Technologies',
      vendorType: 'Hardware Manufacturer',
      contactPerson: 'Anita Rao',
      contactEmail: 'anita.rao@dell.com',
      address: 'Outer Ring Road, Bengaluru, Karnataka, India',
      taxInfo: '29AAACD4421P1Z8',
      paymentTerms: 'Net 30',
      preferredCurrency: 'INR',
      activeContractsCount: 3,
      totalPosCount: 8,
      totalSpendAmount: 9800000,
      tenantId: currentTenant.id,
    },
    {
      id: 'ven-3',
      vendorName: 'Oracle India Pvt Ltd',
      vendorType: 'Enterprise Software',
      contactPerson: 'Ramesh Verma',
      contactEmail: 'ramesh.verma@oracle.com',
      address: 'HiTech City, Hyderabad, India',
      taxInfo: '36AAAAO8812Q1Z9',
      paymentTerms: 'Quarterly',
      preferredCurrency: 'INR',
      activeContractsCount: 1,
      totalPosCount: 4,
      totalSpendAmount: 6400000,
      tenantId: currentTenant.id,
    },
  ]);

  // 4. COST CENTERS
  const [costCenters, setCostCenters] = useState<FinancialCostCenter[]>([
    {
      id: 'cc-1',
      costCenterCode: 'IT-001',
      costCenterName: 'Information Technology Operations',
      department: 'Global IT',
      businessUnit: 'Enterprise Services',
      managerName: 'Sarah Jenkins',
      annualBudget: 20000000, // 2 Crore INR
      allocatedAmount: 14200000,
      currency: 'INR',
      status: 'Active',
      tenantId: currentTenant.id,
    },
    {
      id: 'cc-2',
      costCenterCode: 'FIN-002',
      costCenterName: 'Finance & Treasury',
      department: 'Finance',
      businessUnit: 'Corporate Operations',
      managerName: 'Robert Vance',
      annualBudget: 8000000,
      allocatedAmount: 4500000,
      currency: 'INR',
      status: 'Active',
      tenantId: currentTenant.id,
    },
    {
      id: 'cc-3',
      costCenterCode: 'ENG-003',
      costCenterName: 'Software Engineering & Cloud Platform',
      department: 'R&D',
      businessUnit: 'Product Engineering',
      managerName: 'Michael Chang',
      annualBudget: 35000000,
      allocatedAmount: 31200000,
      currency: 'INR',
      status: 'Active',
      tenantId: currentTenant.id,
    },
  ]);

  // 5. FINANCIAL TRANSACTIONS
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([
    {
      id: 'tx-1001',
      transactionDate: '2026-07-15',
      transactionType: 'Purchase',
      amount: 4250000,
      currency: 'INR',
      convertedAmountBase: 4250000,
      baseCurrency: 'INR',
      vendorName: 'Dell Technologies',
      contractNumber: 'CON-10026',
      poNumber: 'PO-2026-10025',
      linkedAssetId: 'AST-8812',
      linkedAssetName: 'Dell Latitude 7450 Batch',
      costCenterCode: 'IT-001',
      description: 'Capital asset purchase of 50 business laptops',
      sourceSystem: 'ERP (SAP S/4HANA)',
      sourceRecordRef: 'ERP-INV-99021',
      tenantId: currentTenant.id,
    },
    {
      id: 'tx-1002',
      transactionDate: '2026-06-01',
      transactionType: 'Maintenance',
      amount: 350000,
      currency: 'INR',
      convertedAmountBase: 350000,
      baseCurrency: 'INR',
      vendorName: 'Dell Technologies',
      contractNumber: 'CON-10026',
      linkedAssetId: 'AST-9001',
      linkedAssetName: 'Dell PowerEdge R750 Server',
      costCenterCode: 'IT-001',
      description: 'Annual scheduled hardware maintenance & battery backup replacement',
      sourceSystem: 'ServiceDesk ITAM',
      sourceRecordRef: 'WORK-ORDER-4402',
      tenantId: currentTenant.id,
    },
    {
      id: 'tx-1003',
      transactionDate: '2026-05-10',
      transactionType: 'Upgrade',
      amount: 180000,
      currency: 'INR',
      convertedAmountBase: 180000,
      baseCurrency: 'INR',
      vendorName: 'Dell Technologies',
      linkedAssetId: 'AST-9001',
      linkedAssetName: 'Dell PowerEdge R750 Server',
      costCenterCode: 'ENG-003',
      description: 'RAM Upgrade from 128GB to 512GB ECC DDR5',
      sourceSystem: 'Procurement',
      sourceRecordRef: 'PO-2026-00911',
      tenantId: currentTenant.id,
    },
  ]);

  // 6. TOTAL COST OF OWNERSHIP (TCO) RECORDS
  const [tcoRecords] = useState<FinancialTcoRecord[]>([
    {
      id: 'tco-1',
      targetId: 'AST-8812',
      targetName: 'Dell Latitude 7450 (LAPTOP-10025)',
      targetType: 'Asset',
      period: 'Entire Lifecycle',
      currency: 'INR',
      purchaseCost: 85000,
      maintenanceCost: 3500,
      supportCost: 5000,
      subscriptionCost: 0,
      upgradeCost: 2000,
      repairCost: 1500,
      cloudCost: 0,
      operationalCost: 4500,
      discountsAndCredits: 5000,
      totalTco: 96500,
      components: [
        { name: 'Initial Hardware Purchase Cost', category: 'Purchase', amount: 85000 },
        { name: '3-Year Dell ProSupport Plus Warranty', category: 'Support', amount: 5000 },
        { name: 'OS Configuration & Deployment', category: 'Implementation', amount: 2000 },
        { name: 'Dock & Peripheral Accessories', category: 'Upgrade', amount: 6000 },
        { name: 'Keyboard/Battery Out-of-Warranty Repair', category: 'Repair', amount: 1500 },
        { name: 'Vendor Volume Procurement Discount', category: 'Discount', amount: 5000, isCredit: true },
      ],
      calculationDate: '2026-08-11',
      tenantId: currentTenant.id,
    },
    {
      id: 'tco-2',
      targetId: 'SVC-001',
      targetName: 'Enterprise Email & Collaboration Service',
      targetType: 'Service',
      period: 'Annual',
      currency: 'INR',
      purchaseCost: 0,
      maintenanceCost: 150000,
      supportCost: 200000,
      subscriptionCost: 1200000,
      upgradeCost: 0,
      repairCost: 0,
      cloudCost: 400000,
      operationalCost: 150000,
      discountsAndCredits: 0,
      totalTco: 2100000,
      components: [
        { name: 'Microsoft 365 E3 Annual User Licenses', category: 'Subscription', amount: 1200000 },
        { name: 'Exchange Online Hybrid Infrastructure', category: 'Cloud/Hosting', amount: 400000 },
        { name: 'Premier 24x7 Vendor Technical Support', category: 'Support', amount: 200000 },
        { name: 'Admin Security Operations & Maintenance', category: 'Maintenance', amount: 150000 },
        { name: 'Email Archiving & Compliance Storage', category: 'Other Operational', amount: 150000 },
      ],
      calculationDate: '2026-08-11',
      tenantId: currentTenant.id,
    },
    {
      id: 'tco-3',
      targetId: 'APP-001',
      targetName: 'SAP S/4HANA Core ERP Application',
      targetType: 'Application',
      period: '3-Year',
      currency: 'INR',
      purchaseCost: 1500000,
      maintenanceCost: 600000,
      supportCost: 500000,
      subscriptionCost: 0,
      upgradeCost: 400000,
      repairCost: 0,
      cloudCost: 1200000,
      operationalCost: 300000,
      discountsAndCredits: 500000,
      totalTco: 4000000,
      components: [
        { name: 'Perpetual Core System License Purchase', category: 'Purchase', amount: 1500000 },
        { name: 'Implementation & Consulting Onboarding', category: 'Implementation', amount: 1200000 },
        { name: 'Annual Software Maintenance & Updates', category: 'Maintenance', amount: 600000 },
        { name: 'Managed Cloud Infrastructure Hosting', category: 'Cloud/Hosting', amount: 800000 },
        { name: 'Oracle DB Engine Runtime License', category: 'Support', amount: 400000 },
        { name: 'Partner Rebates & Credits', category: 'Discount', amount: 500000, isCredit: true },
      ],
      calculationDate: '2026-08-11',
      tenantId: currentTenant.id,
    },
  ]);

  // 7. ASSET DEPRECIATION RECORDS
  const [depreciations, setDepreciations] = useState<FinancialAssetDepreciationRecord[]>([
    {
      id: 'dep-101',
      assetId: 'AST-8812',
      assetName: 'Dell Latitude 7450 (LAPTOP-10025)',
      assetClass: 'Laptop',
      originalCost: 100000,
      salvageValue: 10000,
      usefulLifeYears: 5,
      method: 'Straight-Line',
      startRule: 'Placed-in-Service Date',
      placedInServiceDate: '2024-01-01',
      accumulatedDepreciation: 36000,
      currentBookValue: 64000,
      remainingLifeYears: 3,
      currency: 'INR',
      schedule: [
        { periodNumber: 1, periodLabel: 'Year 1 (2024)', openingBookValue: 100000, depreciationAmount: 18000, accumulatedDepreciation: 18000, closingBookValue: 82000 },
        { periodNumber: 2, periodLabel: 'Year 2 (2025)', openingBookValue: 82000, depreciationAmount: 18000, accumulatedDepreciation: 36000, closingBookValue: 64000 },
        { periodNumber: 3, periodLabel: 'Year 3 (2026)', openingBookValue: 64000, depreciationAmount: 18000, accumulatedDepreciation: 54000, closingBookValue: 46000 },
        { periodNumber: 4, periodLabel: 'Year 4 (2027)', openingBookValue: 46000, depreciationAmount: 18000, accumulatedDepreciation: 72000, closingBookValue: 28000 },
        { periodNumber: 5, periodLabel: 'Year 5 (2028)', openingBookValue: 28000, depreciationAmount: 18000, accumulatedDepreciation: 90000, closingBookValue: 10000 },
      ],
      tenantId: currentTenant.id,
    },
    {
      id: 'dep-102',
      assetId: 'AST-9001',
      assetName: 'Dell PowerEdge R750 Server (SRV-001)',
      assetClass: 'Server',
      originalCost: 450000,
      salvageValue: 50000,
      usefulLifeYears: 5,
      method: 'Declining Balance',
      decliningRate: 0.30,
      startRule: 'Commissioning Date',
      placedInServiceDate: '2024-06-01',
      accumulatedDepreciation: 202500,
      currentBookValue: 247500,
      remainingLifeYears: 3,
      currency: 'INR',
      schedule: [
        { periodNumber: 1, periodLabel: 'Year 1 (2024)', openingBookValue: 450000, depreciationAmount: 135000, accumulatedDepreciation: 135000, closingBookValue: 315000 },
        { periodNumber: 2, periodLabel: 'Year 2 (2025)', openingBookValue: 315000, depreciationAmount: 94500, accumulatedDepreciation: 229500, closingBookValue: 220500 },
        { periodNumber: 3, periodLabel: 'Year 3 (2026)', openingBookValue: 220500, depreciationAmount: 66150, accumulatedDepreciation: 295650, closingBookValue: 154350 },
        { periodNumber: 4, periodLabel: 'Year 4 (2027)', openingBookValue: 154350, depreciationAmount: 46305, accumulatedDepreciation: 341955, closingBookValue: 108045 },
        { periodNumber: 5, periodLabel: 'Year 5 (2028)', openingBookValue: 108045, depreciationAmount: 58045, accumulatedDepreciation: 400000, closingBookValue: 50000 },
      ],
      disposalData: {
        disposalDate: '2028-12-31',
        disposalMethod: 'E-Waste Certified Recycling',
        saleValue: 65000,
        disposalCost: 5000,
        gainOrLoss: 10000, // Sale (65k) - Disposal (5k) - BookValue (50k) = +10k Gain
      },
      tenantId: currentTenant.id,
    },
  ]);

  // 8. AUDIT LOGS
  const [financialAuditLogs] = useState<FinancialAuditLog[]>([
    {
      id: 'aud-1',
      timestamp: '2026-08-11 11:20:00',
      actor: currentUser.name || 'Financial Manager',
      action: 'Contract Renewed Alert Acknowledged',
      targetType: 'Contract',
      targetId: 'CON-10025',
      beforeValue: 'Days Remaining: 142',
      afterValue: 'Alert Status: In Progress',
      reason: 'Scheduled vendor negotiation call booked for Q3 true-up.',
      source: 'ITAM Financial Module',
      tenantId: currentTenant.id,
    },
    {
      id: 'aud-2',
      timestamp: '2026-08-01 09:15:00',
      actor: 'System Automation Worker',
      action: 'Monthly Asset Depreciation Recalculated',
      targetType: 'Depreciation',
      targetId: 'dep-101',
      beforeValue: 'Book Value: 82000 INR',
      afterValue: 'Book Value: 64000 INR',
      reason: 'Automated end-of-month straight-line schedule execution.',
      source: 'Depreciation Engine Job',
      tenantId: currentTenant.id,
    },
  ]);

  // Selected item for modals
  const [selectedDepreciation, setSelectedDepreciation] = useState<FinancialAssetDepreciationRecord | null>(null);

  // Modal State for New Contract
  const [isAddContractOpen, setIsAddContractOpen] = useState(false);
  const [newConNumber, setNewConNumber] = useState('CON-2026-99');
  const [newConName, setNewConName] = useState('');
  const [newConVendor, setNewConVendor] = useState('Microsoft Corporation');
  const [newConType, setNewConType] = useState<ContractType>('Software Agreement');
  const [newConVal, setNewConVal] = useState<number>(1000000);

  const handleAddContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConName) return;

    const newCon: FinancialContract = {
      id: `con-${Date.now()}`,
      contractNumber: newConNumber,
      contractName: newConName,
      contractType: newConType,
      vendorId: 'ven-1',
      vendorName: newConVendor,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '2027-12-31',
      renewalDate: '2027-11-30',
      contractValue: Number(newConVal),
      currency: 'INR',
      paymentTerms: 'Net 30',
      costCenterId: 'cc-1',
      departmentId: 'dept-1',
      ownerName: currentUser.name || 'ITAM Owner',
      status: 'Active',
      description: 'Newly recorded financial contract agreement.',
      noticePeriodDays: 30,
      autoRenewal: false,
      renewalOwner: currentUser.name || 'ITAM Owner',
      renewalStatus: 'Pending',
      daysRemaining: 365,
      tenantId: currentTenant.id,
    };

    setContracts((prev) => [newCon, ...prev]);
    setIsAddContractOpen(false);
    setNewConName('');
    addAuditEntry('CREATE', 'FinancialContract', newCon.id, `Created contract: ${newCon.contractName}`);
  };

  // CALCULATED AGGREGATES
  const totalContractSpend = contracts.reduce((acc, c) => acc + c.contractValue, 0);
  const totalPoSpend = purchaseOrders.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalOriginalAssetCost = depreciations.reduce((acc, d) => acc + d.originalCost, 0);
  const totalAccumulatedDepreciation = depreciations.reduce((acc, d) => acc + d.accumulatedDepreciation, 0);
  const totalNetBookValue = depreciations.reduce((acc, d) => acc + d.currentBookValue, 0);
  const expiringContractsCount = contracts.filter((c) => c.daysRemaining <= 60).length;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 text-white font-sans selection:bg-red-600 selection:text-white">
      {/* Header Banner - Strict Red / Black / White Theme */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-3 sm:p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-red-600 shrink-0" />
            <span>ITAM FINANCIAL MANAGEMENT LAYER</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Contract Lifecycle, Procurement, Purchase Orders, Cost Centers, TCO Engine & Asset Depreciation
          </p>
        </div>

        {/* Currency Switcher & Tenant Isolation */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex items-center space-x-1.5 bg-black border border-zinc-800 px-3 py-1.5 rounded">
            <span className="text-zinc-500 font-bold">Currency:</span>
            {(['INR', 'USD', 'EUR', 'GBP', 'JPY'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                  selectedCurrency === curr ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-white" />
            <span>Tenant: {currentTenant.name}</span>
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 bg-black p-1 border border-zinc-800 rounded font-mono text-xs overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'overview' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Financial Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'contracts' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Contracts ({contracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('procurement')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'procurement' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Purchase Orders ({purchaseOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'vendors' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Vendor Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('cost_centers')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'cost_centers' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Cost Centers</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'transactions' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Transactions</span>
        </button>

        <button
          onClick={() => setActiveTab('tco')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'tco' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>TCO Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('depreciation')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'depreciation' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Depreciation Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'reports' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Financial Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'audit' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE FINANCIAL OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Total Contract Commitments</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black text-white">{formatMoney(totalContractSpend)}</span>
                <span className="text-[10px] text-zinc-400">{contracts.length} Active</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Procurement PO Value</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black text-white">{formatMoney(totalPoSpend)}</span>
                <span className="text-[10px] text-zinc-400">{purchaseOrders.length} POs</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Original Asset Cost</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black text-white">{formatMoney(totalOriginalAssetCost)}</span>
                <span className="text-[10px] text-zinc-400">Capital Inventory</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2">
              <span className="text-zinc-500 text-[10px] uppercase font-bold block">Net Book Value (Depreciated)</span>
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-black text-red-500">{formatMoney(totalNetBookValue)}</span>
                <span className="text-[10px] text-zinc-400 font-bold">Current Asset Value</span>
              </div>
            </div>
          </div>

          {/* Expiring Contracts Alert Banner */}
          {expiringContractsCount > 0 && (
            <div className="bg-red-950/20 border border-red-900/60 p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                <div>
                  <span className="text-red-400 font-bold block">CONTRACT EXPIRATION NOTICE</span>
                  <span className="text-zinc-300 text-[11px]">
                    {expiringContractsCount} software/hardware agreements require renewal action within the next 60 days.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('contracts')}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded font-bold cursor-pointer text-xs flex items-center space-x-1"
              >
                <span>Review Renewals</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Cost Center Allocation Overview */}
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
            <span className="text-white font-bold text-sm block border-b border-zinc-800 pb-2">
              COST CENTER BUDGET & SPEND ALLOCATION
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {costCenters.map((cc) => {
                const percent = Math.min(100, Math.round((cc.allocatedAmount / cc.annualBudget) * 100));
                return (
                  <div key={cc.id} className="bg-black border border-zinc-800 p-4 rounded space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-red-500 font-bold text-[10px] block">{cc.costCenterCode}</span>
                        <span className="text-white font-bold text-xs">{cc.costCenterName}</span>
                      </div>
                      <span className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] px-2 py-0.5 rounded">
                        {cc.department}
                      </span>
                    </div>

                    <div className="text-zinc-400 text-[11px] space-y-1 pt-1">
                      <div className="flex justify-between">
                        <span>Annual Budget:</span>
                        <strong className="text-white">{formatMoney(cc.annualBudget)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Allocated Spend:</span>
                        <strong className="text-red-400">{formatMoney(cc.allocatedAmount)}</strong>
                      </div>
                    </div>

                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="text-[10px] text-zinc-500 block text-right">{percent}% Budget Utilized</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTRACT MANAGEMENT */}
      {activeTab === 'contracts' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="text-white font-bold">ENTERPRISE CONTRACTS & RENEWAL REGISTRY</span>
            <button
              onClick={() => setIsAddContractOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Contract</span>
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Contract Ref</th>
                  <th className="p-3">Contract Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Contract Value</th>
                  <th className="p-3">End Date</th>
                  <th className="p-3">Days Remaining</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {contracts.map((con) => (
                  <tr key={con.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{con.contractNumber}</td>
                    <td className="p-3 font-bold text-white">{con.contractName}</td>
                    <td className="p-3 text-red-400">{con.contractType}</td>
                    <td className="p-3 text-zinc-300">{con.vendorName}</td>
                    <td className="p-3 font-bold text-white">{formatMoney(con.contractValue)}</td>
                    <td className="p-3 text-zinc-400">{con.endDate}</td>
                    <td className="p-3 font-bold">
                      <span className={con.daysRemaining <= 60 ? 'text-red-500 font-black' : 'text-white'}>
                        {con.daysRemaining} Days
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          con.status === 'Active'
                            ? 'bg-zinc-900 text-white border-zinc-700'
                            : 'bg-red-600/20 text-red-500 border-red-500'
                        }`}
                      >
                        {con.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PROCUREMENT & PURCHASE ORDERS */}
      {activeTab === 'procurement' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex justify-between items-center">
            <span className="text-white font-bold">PURCHASE ORDERS & LINE-ITEM PROCUREMENT</span>
          </div>

          <div className="space-y-4">
            {purchaseOrders.map((po) => (
              <div key={po.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-white text-sm">{po.poNumber}</span>
                      <span className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] px-2 py-0.5 rounded font-bold">
                        {po.vendorName}
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[11px]">
                      PO Date: {po.poDate} | Delivery: {po.expectedDeliveryDate} | Contract Ref: {po.contractNumber || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-zinc-500 text-[10px] block uppercase">Total PO Value</span>
                      <span className="text-white font-black text-sm">{formatMoney(po.totalAmount)}</span>
                    </div>
                    <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] px-2.5 py-1 rounded font-bold">
                      {po.status}
                    </span>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="bg-black border border-zinc-800 rounded overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-900 text-zinc-500 text-[9px] uppercase border-b border-zinc-800">
                      <tr>
                        <th className="p-2">Line Item Description</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">Unit Cost</th>
                        <th className="p-2">Line Total</th>
                        <th className="p-2">Procurement Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-[11px] text-zinc-300">
                      {po.lineItems.map((item) => (
                        <tr key={item.id}>
                          <td className="p-2 font-bold text-white">{item.itemDescription}</td>
                          <td className="p-2 text-zinc-400">{item.quantity}</td>
                          <td className="p-2 font-bold text-white">{formatMoney(item.unitCost)}</td>
                          <td className="p-2 font-bold text-red-400">{formatMoney(item.totalCost)}</td>
                          <td className="p-2 font-bold text-zinc-400">
                            {item.linkedAssetId ? `Linked Asset: ${item.linkedAssetId}` : item.linkedServiceName ? `Service: ${item.linkedServiceName}` : 'Unlinked'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VENDOR DIRECTORY */}
      {activeTab === 'vendors' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="text-white font-bold">VENDOR RELATIONSHIPS & SPEND DIRECTORY (READ-ONLY ADAPTER)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vendors.map((v) => (
              <div key={v.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-3">
                <div>
                  <span className="text-red-500 font-bold text-[10px] block uppercase">{v.vendorType}</span>
                  <span className="text-white font-black text-sm">{v.vendorName}</span>
                </div>

                <div className="text-zinc-400 text-[11px] space-y-1 bg-black p-2.5 border border-zinc-800 rounded">
                  <div><strong>Contact:</strong> {v.contactPerson} ({v.contactEmail})</div>
                  <div><strong>Tax ID:</strong> {v.taxInfo}</div>
                  <div><strong>Payment Terms:</strong> {v.paymentTerms}</div>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-zinc-500 text-[10px]">Total Vendor Spend:</span>
                  <span className="text-white font-black">{formatMoney(v.totalSpendAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COST CENTERS */}
      {activeTab === 'cost_centers' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="text-white font-bold">COST CENTER MANAGEMENT & ALLOCATION</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Cost Center</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Business Unit</th>
                  <th className="p-3">Manager</th>
                  <th className="p-3">Annual Budget</th>
                  <th className="p-3">Allocated Spend</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {costCenters.map((cc) => (
                  <tr key={cc.id} className="hover:bg-zinc-900">
                    <td className="p-3 font-bold text-white">{cc.costCenterCode} - {cc.costCenterName}</td>
                    <td className="p-3 text-zinc-300">{cc.department}</td>
                    <td className="p-3 text-zinc-400">{cc.businessUnit}</td>
                    <td className="p-3 text-zinc-300">{cc.managerName}</td>
                    <td className="p-3 font-bold text-white">{formatMoney(cc.annualBudget)}</td>
                    <td className="p-3 font-bold text-red-400">{formatMoney(cc.allocatedAmount)}</td>
                    <td className="p-3">
                      <span className="bg-zinc-900 border border-zinc-700 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                        {cc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="text-white font-bold">FINANCIAL TRANSACTION LEDGER</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Cost Center</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Source Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-900">
                    <td className="p-3 text-zinc-400">{tx.transactionDate}</td>
                    <td className="p-3 text-red-400 font-bold">{tx.transactionType}</td>
                    <td className="p-3 font-bold text-white">{tx.description}</td>
                    <td className="p-3 text-zinc-300">{tx.vendorName}</td>
                    <td className="p-3 text-zinc-400">{tx.costCenterCode}</td>
                    <td className="p-3 font-bold text-white">{formatMoney(tx.amount)}</td>
                    <td className="p-3 text-zinc-500">{tx.sourceRecordRef}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: TCO ENGINE */}
      {activeTab === 'tco' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2">
            <h3 className="text-white font-bold text-sm flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-red-600" />
              <span>TOTAL COST OF OWNERSHIP (TCO) CALCULATION ENGINE</span>
            </h3>
            <p className="text-zinc-400 text-[11px]">
              Itemized calculation breakdown across Acquisition, Maintenance, Support, Upgrades, Repair & Operational costs.
            </p>
          </div>

          <div className="space-y-4">
            {tcoRecords.map((tco) => (
              <div key={tco.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-red-500 font-bold text-[10px] block uppercase">[{tco.targetType} LEVEL TCO]</span>
                    <span className="text-white font-black text-sm">{tco.targetName}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] px-2 py-1 rounded">
                      Period: {tco.period}
                    </span>
                    <div className="text-right">
                      <span className="text-zinc-500 text-[10px] block uppercase">Calculated Total TCO</span>
                      <span className="text-white font-black text-lg">{formatMoney(tco.totalTco)}</span>
                    </div>
                  </div>
                </div>

                {/* TCO Component Breakdown List */}
                <div className="bg-black border border-zinc-800 p-3 rounded space-y-2">
                  <span className="text-zinc-400 font-bold text-[10px] uppercase block">Calculated Itemized Components</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tco.components.map((comp, idx) => (
                      <div key={idx} className="bg-zinc-950 border border-zinc-900 p-2 rounded flex justify-between items-center">
                        <div>
                          <span className="text-white font-bold text-xs block">{comp.name}</span>
                          <span className="text-zinc-500 text-[10px]">{comp.category}</span>
                        </div>
                        <span className={`font-bold ${comp.isCredit ? 'text-white' : 'text-red-400'}`}>
                          {comp.isCredit ? `- ${formatMoney(comp.amount)}` : `+ ${formatMoney(comp.amount)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: ASSET DEPRECIATION ENGINE */}
      {activeTab === 'depreciation' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2">
            <h3 className="text-white font-bold text-sm flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span>CAPITAL ASSET DEPRECIATION ENGINE</span>
            </h3>
            <p className="text-zinc-400 text-[11px]">
              Straight-Line & Declining Balance schedule calculations with minimum salvage floor protection & disposal tracking.
            </p>
          </div>

          <div className="space-y-4">
            {depreciations.map((dep) => (
              <div key={dep.id} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-red-500 font-bold text-[10px] block uppercase">
                      [{dep.assetClass}] {dep.method} Depreciation
                    </span>
                    <span className="text-white font-black text-sm">{dep.assetName}</span>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <span className="text-zinc-500 text-[10px] block uppercase">Original Cost</span>
                      <span className="text-white font-bold">{formatMoney(dep.originalCost)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-zinc-500 text-[10px] block uppercase">Current Net Book Value</span>
                      <span className="text-red-500 font-black text-base">{formatMoney(dep.currentBookValue)}</span>
                    </div>
                  </div>
                </div>

                {/* Depreciation Schedule Table */}
                <div className="bg-black border border-zinc-800 rounded overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-900 text-zinc-500 text-[9px] uppercase border-b border-zinc-800">
                      <tr>
                        <th className="p-2">Period</th>
                        <th className="p-2">Opening Book Value</th>
                        <th className="p-2">Depreciation Amount</th>
                        <th className="p-2">Accumulated Depreciation</th>
                        <th className="p-2">Closing Book Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-[11px] text-zinc-300">
                      {dep.schedule.map((sch) => (
                        <tr key={sch.periodNumber}>
                          <td className="p-2 font-bold text-white">{sch.periodLabel}</td>
                          <td className="p-2 text-zinc-400">{formatMoney(sch.openingBookValue)}</td>
                          <td className="p-2 font-bold text-red-400">{formatMoney(sch.depreciationAmount)}</td>
                          <td className="p-2 text-zinc-400">{formatMoney(sch.accumulatedDepreciation)}</td>
                          <td className="p-2 font-bold text-white">{formatMoney(sch.closingBookValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Asset Disposal Info if present */}
                {dep.disposalData && (
                  <div className="bg-black border border-zinc-800 p-3 rounded flex justify-between items-center text-[11px]">
                    <div>
                      <span className="text-red-500 font-bold block uppercase text-[9px]">ASSET DISPOSAL RECORD</span>
                      <span className="text-white font-bold">Method: {dep.disposalData.disposalMethod} ({dep.disposalData.disposalDate})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-500 text-[10px] block">Calculated Disposal Gain/Loss</span>
                      <span className="text-white font-black">{formatMoney(dep.disposalData.gainOrLoss)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: FINANCIAL REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg space-y-3">
            <span className="text-white font-bold text-sm block border-b border-zinc-800 pb-2">
              FINANCIAL LAYER REPORTS & DATA EXPORTS
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Contract Renewal & Notice Report', desc: 'Summary of all expiring contracts within 90-day alert windows.' },
                { title: 'Procurement Line Item Audit', desc: 'Complete breakdown of purchase order line items mapped to ITAM assets.' },
                { title: 'Total Cost of Ownership (TCO) Matrix', desc: 'Multi-year TCO roll-up across hardware, software, cloud, and services.' },
                { title: 'Asset Depreciation & Net Book Value Schedule', desc: 'IRS / IAS compliant straight-line and declining balance schedules.' },
                { title: 'Cost Center Budget vs Spend Report', desc: 'Departmental budget allocation variance analysis.' },
                { title: 'Vendor Financial Concentration Report', desc: 'Total spend and contract volume aggregated by vendor.' },
              ].map((rep, idx) => (
                <div key={idx} className="bg-black border border-zinc-800 p-4 rounded-lg space-y-2">
                  <span className="text-white font-bold text-xs block">{rep.title}</span>
                  <p className="text-zinc-400 text-[10px] leading-relaxed">{rep.desc}</p>
                  <div className="pt-2 flex space-x-2">
                    <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>Export PDF</span>
                    </button>
                    <button className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg">
            <span className="text-white font-bold">FINANCIAL LAYER IMMUTABLE AUDIT LOGS</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Reason / Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {financialAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900">
                    <td className="p-3 text-zinc-400">{log.timestamp}</td>
                    <td className="p-3 font-bold text-white">{log.actor}</td>
                    <td className="p-3 text-red-400 font-bold">{log.action}</td>
                    <td className="p-3 text-zinc-300">{log.targetType} ({log.targetId})</td>
                    <td className="p-3 text-zinc-400">{log.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD CONTRACT MODAL */}
      {isAddContractOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg max-w-lg w-full space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="font-bold text-sm text-white">RECORD NEW FINANCIAL CONTRACT</span>
              <button
                onClick={() => setIsAddContractOpen(false)}
                className="text-zinc-500 hover:text-white font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddContract} className="space-y-3">
              <div>
                <label className="text-zinc-400 text-[10px] block uppercase font-bold mb-1">Contract Number</label>
                <input
                  type="text"
                  value={newConNumber}
                  onChange={(e) => setNewConNumber(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-zinc-400 text-[10px] block uppercase font-bold mb-1">Contract Name</label>
                <input
                  type="text"
                  value={newConName}
                  onChange={(e) => setNewConName(e.target.value)}
                  placeholder="e.g. Adobe VIP Enterprise Agreement"
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 text-[10px] block uppercase font-bold mb-1">Vendor</label>
                  <select
                    value={newConVendor}
                    onChange={(e) => setNewConVendor(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.vendorName}>
                        {v.vendorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 text-[10px] block uppercase font-bold mb-1">Contract Type</label>
                  <select
                    value={newConType}
                    onChange={(e) => setNewConType(e.target.value as ContractType)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  >
                    <option value="Software Agreement">Software Agreement</option>
                    <option value="Hardware Contract">Hardware Contract</option>
                    <option value="Maintenance Contract">Maintenance Contract</option>
                    <option value="Support Contract">Support Contract</option>
                    <option value="Cloud Contract">Cloud Contract</option>
                    <option value="Master Service Agreement (MSA)">Master Service Agreement (MSA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 text-[10px] block uppercase font-bold mb-1">Contract Value (INR)</label>
                <input
                  type="number"
                  value={newConVal}
                  onChange={(e) => setNewConVal(Number(e.target.value))}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddContractOpen(false)}
                  className="bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold px-4 py-2 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded cursor-pointer"
                >
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

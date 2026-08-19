import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserPlus,
  Laptop,
  Monitor,
  KeyRound,
  Smartphone,
  Server,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  HelpCircle,
  FileText,
  Building,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

export const EmployeeSelfServiceModule: React.FC = () => {
  const {
    currentUser,
    configurationItems,
    softwareLicenses,
    selfServiceRequests,
    createSelfServiceRequest,
    cancelSelfServiceRequest,
    itsmTickets,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'my-assets' | 'catalog' | 'my-requests'>('my-assets');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [selectedAssetForIssue, setSelectedAssetForIssue] = useState<any>(null);

  // Form State
  const [requestItemType, setRequestItemType] = useState<any>('Laptop');
  const [requestTitle, setRequestTitle] = useState('');
  const [justification, setJustification] = useState('');
  const [urgency, setUrgency] = useState<'Standard' | 'Urgent'>('Standard');

  // Issue Form State
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issuePriority, setIssuePriority] = useState('P3 - Medium');

  // Filter user's assets
  const myHardware = configurationItems.filter(
    (ci) => ci.ownerUserId === currentUser.id || ci.ownerUserName === currentUser.name
  );

  const myRequests = selfServiceRequests.filter(
    (r) => r.requestedBy === currentUser.name || r.department === currentUser.departmentId
  );

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle) return;

    createSelfServiceRequest({
      itemType: requestItemType,
      title: requestTitle,
      requestedBy: currentUser.name,
      department: currentUser.departmentId || 'IT Engineering',
      urgency,
    });

    setIsRequestModalOpen(false);
    setRequestTitle('');
    setJustification('');
    setActiveTab('my-requests');
  };

  const handleReportIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReportIssueModalOpen(false);
    setIssueTitle('');
    setIssueDescription('');
    alert(`Incident Ticket created successfully for ${selectedAssetForIssue?.name || 'Asset'}. IT Support notified!`);
  };

  const catalogItems = [
    {
      type: 'Laptop',
      title: 'Developer Workstation (MacBook Pro M3 Max / ThinkPad X1)',
      category: 'Laptops',
      icon: Laptop,
      badge: 'Popular',
      desc: 'High-performance laptop for software engineering and cloud ops.',
    },
    {
      type: 'Monitor',
      title: '34" Curved 4K USB-C Docking Monitor',
      category: 'Monitors',
      icon: Monitor,
      badge: 'Stock Available',
      desc: 'Ergonomic dual-input display with built-in 90W PD docking station.',
    },
    {
      type: 'Software License',
      title: 'Adobe Creative Cloud Enterprise Seat',
      category: 'SaaS',
      icon: KeyRound,
      badge: 'Auto-Provision',
      desc: 'Full suite including Photoshop, Illustrator, Premiere Pro, and Figma.',
    },
    {
      type: 'Software License',
      title: 'JetBrains All Products Pack + GitHub Copilot',
      category: 'SaaS',
      icon: KeyRound,
      badge: 'Developer',
      desc: 'IntelliJ, PyCharm, WebStorm & AI Code Completion license.',
    },
    {
      type: 'Mobile Device',
      title: 'Enterprise iPhone 15 Pro / Samsung S24 Ultra',
      category: 'Mobile',
      icon: Smartphone,
      badge: 'Approval Needed',
      desc: 'Managed corporate mobile phone with MDM container & secure eSIM.',
    },
    {
      type: 'Desktop',
      title: 'Cloud AI Development Sandbox (AWS EC2 / GPU)',
      category: 'Cloud',
      icon: Server,
      badge: 'Cloud On-Demand',
      desc: 'Dedicated high-RAM Linux instance with pre-configured NVIDIA CUDA.',
    },
  ];

  const filteredCatalog = catalogItems.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans">
      {/* Header Profile Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-5 border border-zinc-800 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-bold text-lg font-mono">
            {currentUser.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight">{currentUser.name}</h1>
              <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center space-x-3">
              <span>Email: {currentUser.email}</span>
              <span>•</span>
              <span>Tenant: Global Enterprise Corp</span>
            </p>
          </div>
        </div>

        {/* Quick Stats & Navigation */}
        <div className="flex items-center space-x-2 bg-black p-1 border border-zinc-800 rounded font-mono text-xs">
          <button
            onClick={() => setActiveTab('my-assets')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'my-assets' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            My Assets ({myHardware.length})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'catalog' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Request Catalog
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'my-requests' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active Requests ({myRequests.length})
          </button>
        </div>
      </div>

      {/* TAB 1: MY ASSIGNED ASSETS */}
      {activeTab === 'my-assets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono tracking-wider text-zinc-300 uppercase flex items-center space-x-2">
              <Laptop className="w-4 h-4 text-red-500" />
              <span>Assigned Hardware & Mobile Devices</span>
            </h2>
            <button
              onClick={() => {
                setRequestItemType('Laptop');
                setIsRequestModalOpen(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono px-3 py-1.5 rounded flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Request New Device</span>
            </button>
          </div>

          {myHardware.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 font-mono text-xs">
              <Laptop className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-300 font-bold">No Hardware Assets Currently Direct-Assigned</p>
              <p className="mt-1">Browse the Service Catalog to submit a hardware request.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myHardware.map((item) => (
                <div key={item.id} className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-4 rounded-lg flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-white font-mono">{item.name}</span>
                      <span className="bg-green-600/20 text-green-400 border border-green-500/30 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                        {item.lifecycleState}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-zinc-400 font-mono">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Asset Tag:</span>
                        <span className="text-white font-bold">{item.assetTag}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Serial #:</span>
                        <span className="text-zinc-300">{item.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Model:</span>
                        <span className="text-zinc-300">{item.manufacturer} {item.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">OS:</span>
                        <span className="text-zinc-300">{item.operatingSystem || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Health Score:</span>
                        <span className="text-emerald-400 font-bold">{item.healthScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedAssetForIssue(item);
                        setIssueTitle(`Issue with ${item.name}`);
                        setIsReportIssueModalOpen(true);
                      }}
                      className="text-[11px] font-mono text-red-400 hover:text-red-300 flex items-center space-x-1 cursor-pointer"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Report Issue</span>
                    </button>
                    <button
                      onClick={() => {
                        setRequestItemType(item.category === 'Hardware' ? 'Laptop' : 'Repair');
                        setRequestTitle(`Return / Replacement Request: ${item.name}`);
                        setIsRequestModalOpen(true);
                      }}
                      className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Return / Swap</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Software Access Section */}
          <div className="pt-4 space-y-4">
            <h2 className="text-sm font-bold font-mono tracking-wider text-zinc-300 uppercase flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-red-500" />
              <span>Assigned Software & SaaS Subscriptions</span>
            </h2>

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Application / Product</th>
                    <th className="p-3">Publisher</th>
                    <th className="p-3">License Model</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {softwareLicenses.map((lic) => (
                    <tr key={lic.id} className="hover:bg-zinc-900">
                      <td className="p-3 font-bold text-white flex items-center space-x-2">
                        <KeyRound className="w-3.5 h-3.5 text-red-500" />
                        <span>{lic.productName}</span>
                      </td>
                      <td className="p-3">{lic.publisher}</td>
                      <td className="p-3">{lic.metric}</td>
                      <td className="p-3">
                        <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                          Active Entitlement
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
            <div className="text-xs font-mono text-zinc-400">
              Select an approved hardware model, SaaS license, or cloud sandbox to submit a request.
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 flex-wrap font-mono text-xs">
              {['All', 'Laptops', 'Monitors', 'SaaS', 'Mobile', 'Cloud'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-4 rounded-lg flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded bg-zinc-900 text-red-500">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px] font-mono px-2 py-0.5 rounded">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-3 font-sans">{item.title}</h3>
                    <p className="text-xs text-zinc-400 font-mono mt-1 leading-relaxed">{item.desc}</p>
                  </div>

                  <button
                    onClick={() => {
                      setRequestItemType(item.type);
                      setRequestTitle(`Request for ${item.title}`);
                      setIsRequestModalOpen(true);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-mono py-2 rounded flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Request Item</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MY REQUESTS & LIVE PROGRESS TRACKER */}
      {activeTab === 'my-requests' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-black border-b border-zinc-800 text-zinc-400 font-bold flex justify-between">
              <span>MY ACTIVE & COMPLETED SERVICE REQUESTS ({myRequests.length})</span>
              <span className="text-red-400 font-bold">Live Workflow Sync Enabled</span>
            </div>

            <div className="divide-y divide-zinc-800">
              {myRequests.map((req) => (
                <div key={req.id} className="p-4 bg-zinc-950 hover:bg-zinc-900/50 transition-colors space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{req.requestNumber}</span>
                        <span className="text-zinc-400">•</span>
                        <span className="text-zinc-300 font-bold">{req.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Item: <span className="text-zinc-300">{req.itemType}</span> | Requested By: <span className="text-zinc-300">{req.requestedBy}</span> | Date: {req.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        req.status === 'Completed'
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                          : req.status === 'Rejected'
                          ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {req.status}
                      </span>

                      {req.status === 'Submitted' && (
                        <button
                          onClick={() => cancelSelfServiceRequest(req.id)}
                          className="text-[11px] text-zinc-500 hover:text-red-400 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Progress Steps Bar */}
                  <div className="pt-2">
                    <div className="grid grid-cols-4 gap-2 text-[10px]">
                      {['Submitted', 'Manager Approved', 'IT Approved', 'Fulfilling'].map((stepName, stepIdx) => {
                        const stepOrder = ['Submitted', 'Manager Approved', 'IT Approved', 'Fulfilling', 'Completed'];
                        const currentIdx = stepOrder.indexOf(req.status);
                        const isDone = currentIdx >= stepIdx;
                        const isCurrent = currentIdx === stepIdx;

                        return (
                          <div key={stepName} className="space-y-1">
                            <div className={`h-1.5 rounded-full ${
                              isDone ? 'bg-emerald-500' : isCurrent ? 'bg-amber-500 animate-pulse' : 'bg-zinc-800'
                            }`} />
                            <div className={`truncate font-bold ${
                              isDone ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-zinc-600'
                            }`}>
                              {stepName}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REQUEST ITEM MODAL */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-red-500" />
                <span>Submit Self-Service IT Request</span>
              </h3>
              <button onClick={() => setIsRequestModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-zinc-400 mb-1">Item Category</label>
                <select
                  value={requestItemType}
                  onChange={(e) => setRequestItemType(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                >
                  <option value="Laptop">Laptop / Workstation</option>
                  <option value="Monitor">Monitor & Accessories</option>
                  <option value="Software License">Software / SaaS License</option>
                  <option value="SaaS Account">SaaS Account Access</option>
                  <option value="Mobile Device">Mobile Device</option>
                  <option value="Repair">Hardware Repair / Swap</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Request Title</label>
                <input
                  type="text"
                  required
                  value={requestTitle}
                  onChange={(e) => setRequestTitle(e.target.value)}
                  placeholder="e.g. Need MacBook Pro M3 for Mobile App Development"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Business Justification</label>
                <textarea
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explain why this hardware or software is required for your role..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Urgency Level</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      checked={urgency === 'Standard'}
                      onChange={() => setUrgency('Standard')}
                      className="accent-red-600"
                    />
                    <span className="text-zinc-300">Standard (3-5 Days)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      checked={urgency === 'Urgent'}
                      onChange={() => setUrgency('Urgent')}
                      className="accent-red-600"
                    />
                    <span className="text-red-400 font-bold">Urgent (Expedited)</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT ISSUE MODAL */}
      {isReportIssueModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>Report Issue for {selectedAssetForIssue?.name}</span>
              </h3>
              <button onClick={() => setIsReportIssueModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 mb-1">Issue Summary</label>
                <input
                  type="text"
                  required
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Priority Level</label>
                <select
                  value={issuePriority}
                  onChange={(e) => setIssuePriority(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                >
                  <option value="P1 - Critical">P1 - Critical (System Down / Work Stopped)</option>
                  <option value="P2 - High">P2 - High (Severe Impact)</option>
                  <option value="P3 - Medium">P3 - Medium (Standard Issue)</option>
                  <option value="P4 - Low">P4 - Low (General Inquiry)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe error messages, hardware malfunction, or symptoms..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsReportIssueModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Incident Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

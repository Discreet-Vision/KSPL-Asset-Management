import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Ticket,
  GitMerge,
  UserPlus,
  CheckCircle2,
  Clock,
  Send,
  X,
  Database,
  Plus,
} from 'lucide-react';

export const ItsmWorkflowsModule: React.FC = () => {
  const {
    itsmTickets,
    workflowInstances,
    workflowDefinitions,
    approveWorkflowStep,
    selfServiceRequests,
    createSelfServiceRequest,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'itsm' | 'workflows' | 'selfservice'>('itsm');

  // Self Service Form
  const [isSelfModalOpen, setIsSelfModalOpen] = useState(false);
  const [itemType, setItemType] = useState<any>('Laptop');
  const [requestTitle, setRequestTitle] = useState('');

  const handleSelfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle) return;
    createSelfServiceRequest({
      itemType: itemType,
      title: requestTitle,
      requestedBy: currentUser.name,
      department: currentUser.departmentId,
      urgency: 'Standard',
    });
    setIsSelfModalOpen(false);
    setRequestTitle('');
  };

  return (
    <div className="p-6 space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <GitMerge className="w-5 h-5 text-red-500" />
            <span>ITSM INTEGRATION, WORKFLOW AUTOMATION & SELF-SERVICE</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Incidents & Changes Linked to CIs, Multi-Stage Workflow Approvals, Employee Portal
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 bg-black p-1 border border-zinc-800 rounded font-mono text-xs">
          <button
            onClick={() => setActiveTab('itsm')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'itsm' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            ITSM Tickets ({itsmTickets.length})
          </button>
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'workflows' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active Workflows ({workflowInstances.length})
          </button>
          <button
            onClick={() => setActiveTab('selfservice')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'selfservice' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Self-Service Catalog
          </button>
        </div>
      </div>

      {/* TAB 1: ITSM TICKETS LINKED TO CIS */}
      {activeTab === 'itsm' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
          <div className="p-3 bg-black border-b border-zinc-800 text-zinc-400 font-bold flex justify-between">
            <span>ITSM INCIDENTS, PROBLEMS & CHANGES LINKED TO CMDB CIS</span>
            <span className="text-white">ServiceNow / Jira Service Mgmt Integration</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
              <tr>
                <th className="p-3">Ticket # / Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Target CMDB CI</th>
                <th className="p-3">Assigned To</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {itsmTickets.map((tkt) => (
                <tr key={tkt.id} className="hover:bg-zinc-900">
                  <td className="p-3">
                    <div className="font-bold text-white">{tkt.title}</div>
                    <div className="text-[10px] text-zinc-500">{tkt.ticketNumber}</div>
                  </td>
                  <td className="p-3 font-bold text-white">{tkt.type}</td>
                  <td className="p-3">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {tkt.priority}
                    </span>
                  </td>
                  <td className="p-3 text-red-400 font-bold">{tkt.relatedCiName}</td>
                  <td className="p-3 text-zinc-300">{tkt.assignedTo}</td>
                  <td className="p-3">
                    <span className="bg-black border border-zinc-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {tkt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: ACTIVE WORKFLOWS */}
      {activeTab === 'workflows' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="border-b border-zinc-800 pb-2 font-bold text-white text-sm">
              ACTIVE MULTI-STAGE WORKFLOW INSTANCES & APPROVAL QUEUE
            </div>

            <div className="space-y-3">
              {workflowInstances.map((inst) => (
                <div key={inst.id} className="p-4 bg-black border border-zinc-800 rounded space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-sm">{inst.workflowName}</div>
                      <div className="text-zinc-400 text-[11px]">
                        Target Entity: <span className="text-white font-bold">{inst.entityName}</span> | Initiated By: {inst.initiatedBy}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-1 rounded">
                        Step {inst.currentStepNumber} of {inst.totalSteps}
                      </span>
                      {inst.status !== 'Completed' && (
                        <button
                          onClick={() => approveWorkflowStep(inst.id)}
                          className="bg-black hover:bg-zinc-900 border border-red-500 text-red-400 hover:text-white font-bold text-[10px] px-3 py-1 rounded cursor-pointer"
                        >
                          Approve Next Stage →
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="bg-red-600 h-full"
                      style={{ width: `${(inst.currentStepNumber / inst.totalSteps) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SELF SERVICE CATALOG */}
      {activeTab === 'selfservice' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">EMPLOYEE SELF-SERVICE ASSET & SOFTWARE REQUEST PORTAL</h3>
              <p className="text-zinc-400 text-[11px] mt-0.5">Request laptops, software licenses, SaaS accounts, or hardware repairs.</p>
            </div>

            <button
              onClick={() => setIsSelfModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded flex items-center space-x-2 border border-red-500 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Request</span>
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Request # / Title</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Requested By</th>
                  <th className="p-3">Urgency</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {selfServiceRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-zinc-900">
                    <td className="p-3">
                      <div className="font-bold text-white">{req.title}</div>
                      <div className="text-[10px] text-zinc-500">{req.requestNumber}</div>
                    </td>
                    <td className="p-3 font-bold text-white">{req.itemType}</td>
                    <td className="p-3 text-zinc-300">{req.requestedBy}</td>
                    <td className="p-3 text-zinc-400">{req.urgency}</td>
                    <td className="p-3">
                      <span className="bg-black border border-red-500 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded">
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Self Service Request */}
      {isSelfModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono text-xs">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-black border-b border-zinc-800 flex justify-between items-center text-white font-bold">
              <span>SUBMIT SELF-SERVICE REQUEST</span>
              <button onClick={() => setIsSelfModalOpen(false)} className="cursor-pointer hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSelfSubmit} className="p-4 space-y-3">
              <div>
                <label className="text-zinc-400 block mb-1">Item Category *</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as any)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none cursor-pointer"
                >
                  <option value="Laptop">Laptop / Workstation</option>
                  <option value="Desktop">Desktop Computer</option>
                  <option value="Monitor">Monitor / Display</option>
                  <option value="Software License">Software License Seat</option>
                  <option value="SaaS Account">SaaS Account Access</option>
                  <option value="Repair">Hardware Repair Request</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Request Justification / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Request 16-inch MacBook Pro for iOS Engineering"
                  value={requestTitle}
                  onChange={(e) => setRequestTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSelfModalOpen(false)}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded border border-red-500 cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

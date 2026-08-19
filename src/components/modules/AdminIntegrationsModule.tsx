import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiLayerModule } from './ApiLayerModule';
import {
  Settings,
  Plug,
  Users,
  Building,
  Shield,
  CheckCircle2,
  RefreshCw,
  Plus,
  Code,
} from 'lucide-react';

export const AdminIntegrationsModule: React.FC = () => {
  const { integrations, toggleIntegration, allUsers, setShowUserManagementModal, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'integrations' | 'rbac' | 'tenants' | 'api_layer'>('api_layer');

  const isAdmin =
    currentUser?.role === 'SOFTWARE_SUPER_ADMIN' ||
    currentUser?.role === 'Software Super Admin' ||
    currentUser?.role === 'CLIENT_ADMIN' ||
    currentUser?.role === 'Client Admin' ||
    currentUser?.role === 'CLIENT_SUPER_ADMIN' ||
    currentUser?.role === 'Super Admin' ||
    (currentUser as any)?.isAdmin === true ||
    (currentUser as any)?.isSuperAdmin === true;

  return (
    <div className="p-6 space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <Plug className="w-5 h-5 text-red-500" />
            <span>ENTERPRISE CONNECTOR MARKETPLACE, RBAC & MULTI-TENANCY</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Bidirectional ServiceNow, Workday, Okta, Intune, Jamf & Splunk Connectors
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 bg-black p-1 border border-zinc-800 rounded font-mono text-xs">
          <button
            onClick={() => setActiveTab('api_layer')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center space-x-1 ${
              activeTab === 'api_layer' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>API Gateway (GraphQL & REST)</span>
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'integrations' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Connectors ({integrations.length})
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('rbac')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                activeTab === 'rbac' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              RBAC User Roles ({allUsers.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('tenants')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'tenants' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Tenants & Masking
          </button>
        </div>
      </div>

      {/* TAB 1: INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {integrations.map((ing) => (
            <div key={ing.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-black border border-zinc-800 rounded font-bold text-red-500 text-sm">
                    {ing.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{ing.name}</h3>
                    <span className="text-zinc-500 text-[10px]">{ing.type}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleIntegration(ing.id)}
                  className={`px-3 py-1 rounded text-[10px] font-bold border cursor-pointer transition-colors ${
                    ing.status === 'Active'
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {ing.status === 'Active' ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <p className="text-zinc-400 text-xs">{ing.description}</p>

              <div className="p-3 bg-black border border-zinc-800 rounded text-[11px] space-y-1 text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Last Successful Sync:</span>
                  <span className="text-white font-bold">{ing.lastSync}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Records Processed:</span>
                  <span className="text-red-400 font-bold">{ing.recordsSynced.toLocaleString()} Items</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: RBAC & USERS */}
      {activeTab === 'rbac' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
          <div className="p-3 bg-black border-b border-zinc-800 text-zinc-400 font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span>ENTERPRISE ROLE-BASED ACCESS CONTROL (RBAC) & DIRECTORY</span>
              <p className="text-[10px] text-zinc-500 font-normal">Field-Level Data Masking & Tenant Scopes Enforced</p>
            </div>
            <button
              onClick={() => setShowUserManagementModal(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors self-start sm:self-auto"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage Roles, Matrix & Provision Users</span>
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase">
              <tr>
                <th className="p-3">User Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Department</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {allUsers.map((usr) => (
                <tr key={usr.id} className="hover:bg-zinc-900">
                  <td className="p-3 font-bold text-white">{usr.name}</td>
                  <td className="p-3 text-zinc-400">{usr.email}</td>
                  <td className="p-3">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {usr.role}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-300">{usr.departmentId}</td>
                  <td className="p-3">
                    <span className="bg-black border border-zinc-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: TENANTS & MASKING */}
      {activeTab === 'tenants' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 space-y-4 font-mono text-xs">
          <div className="border-b border-zinc-800 pb-3 font-bold text-white text-sm">
            MULTI-TENANT ARCHITECTURE & SENSITIVE DATA CLASSIFICATION MASKING
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-black border border-zinc-800 rounded space-y-2">
              <div className="font-bold text-white">Default Enterprise Tenant</div>
              <div className="text-zinc-400">ID: tenant-kspl-global-01</div>
              <div className="text-zinc-400">Data Isolation: Logical schema partition</div>
              <div className="text-red-400 font-bold">Encrypted at rest with AWS KMS / GCP KMS</div>
            </div>

            <div className="p-4 bg-black border border-zinc-800 rounded space-y-2">
              <div className="font-bold text-white">Field-Level Data Masking Rules</div>
              <div className="text-zinc-400">• Hardware Serial Numbers: Masked for Vendor Users</div>
              <div className="text-zinc-400">• Software License Keys: Hidden for Non-Admin Roles</div>
              <div className="text-zinc-400">• Financial Purchase Costs: Masked for Field Technicians</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: API GATEWAY (GRAPHQL, REST & WEBHOOKS) */}
      {activeTab === 'api_layer' && <ApiLayerModule />}
    </div>
  );
};

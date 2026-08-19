import React, { useState } from 'react';
import { 
  Server, Laptop, Network, AppWindow, Key, CloudRain, 
  Cloud, Box, HardDrive, Workflow, Plus, Search, Filter, 
  CheckCircle2, AlertCircle, ChevronRight, ChevronDown, Layers, ShieldCheck
} from 'lucide-react';
import { BaseCi, MainCiClass, SubCiType } from './types';
import { CI_CLASS_REGISTRY, INITIAL_CI_SEED_DATA, validateCiAttributes, mapDiscoverySourceToCiClass } from './ciClassRegistry';

export const CiHierarchyModule: React.FC = () => {
  const [ciList, setCiList] = useState<BaseCi[]>(INITIAL_CI_SEED_DATA);
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'create' | 'stats' | 'schemas'>('hierarchy');
  const [selectedClass, setSelectedClass] = useState<MainCiClass | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<SubCiType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCi, setSelectedCi] = useState<BaseCi | null>(INITIAL_CI_SEED_DATA[0] || null);

  // Form State
  const [formClass, setFormClass] = useState<MainCiClass>('Hardware');
  const [formType, setFormType] = useState<SubCiType>('Server');
  const [formBase, setFormBase] = useState({
    name: '',
    status: 'Active' as const,
    description: '',
    owner: 'IT Operations',
    environment: 'Production' as const,
    location: 'Ashburn Datacenter',
    tenantId: 'tenant-kspl-global',
    discoverySource: 'Manual Entry' as const
  });
  const [formTypeAttributes, setFormTypeAttributes] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const availableTypesForForm = CI_CLASS_REGISTRY.filter(c => c.classKey === formClass);
  const currentSchema = CI_CLASS_REGISTRY.find(c => c.classKey === formClass && c.typeKey === formType);

  const handleClassChange = (newClass: MainCiClass) => {
    setFormClass(newClass);
    const firstType = CI_CLASS_REGISTRY.find(c => c.classKey === newClass)?.typeKey || 'Server';
    setFormType(firstType);
    setFormTypeAttributes({});
    setValidationErrors([]);
  };

  const handleTypeAttributeChange = (key: string, value: any) => {
    setFormTypeAttributes(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateCi = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    if (!formBase.name.trim()) {
      setValidationErrors(['Base CI Name is required.']);
      return;
    }

    const { valid, errors } = validateCiAttributes(formType, formTypeAttributes);
    if (!valid) {
      setValidationErrors(errors);
      return;
    }

    const newCi: BaseCi = {
      id: `ci-gen-${Date.now()}`,
      name: formBase.name,
      ciClass: formClass,
      ciType: formType,
      status: formBase.status,
      description: formBase.description,
      owner: formBase.owner,
      environment: formBase.environment,
      location: formBase.location,
      tenantId: formBase.tenantId,
      discoverySource: formBase.discoverySource,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      typeAttributes: formTypeAttributes
    };

    setCiList([newCi, ...ciList]);
    setSelectedCi(newCi);
    setSuccessMessage(`Configuration Item '${newCi.name}' classified and saved successfully.`);
    setTimeout(() => setSuccessMessage(null), 4000);

    // Reset Form
    setFormBase({
      name: '',
      status: 'Active',
      description: '',
      owner: 'IT Operations',
      environment: 'Production',
      location: 'Ashburn Datacenter',
      tenantId: 'tenant-kspl-global',
      discoverySource: 'Manual Entry'
    });
    setFormTypeAttributes({});
    setActiveTab('hierarchy');
  };

  const filteredCis = ciList.filter(ci => {
    const matchesClass = selectedClass === 'ALL' || ci.ciClass === selectedClass;
    const matchesType = selectedType === 'ALL' || ci.ciType === selectedType;
    const matchesQuery = 
      ci.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ci.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ci.owner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesType && matchesQuery;
  });

  const getIcon = (typeKey: SubCiType) => {
    switch (typeKey) {
      case 'Server': return <Server className="w-4 h-4 text-red-500" />;
      case 'Laptop': return <Laptop className="w-4 h-4 text-white" />;
      case 'Network Device': return <Network className="w-4 h-4 text-red-500" />;
      case 'Application': return <AppWindow className="w-4 h-4 text-white" />;
      case 'License': return <Key className="w-4 h-4 text-red-500" />;
      case 'SaaS': return <CloudRain className="w-4 h-4 text-white" />;
      case 'Virtual Machine': return <Cloud className="w-4 h-4 text-red-500" />;
      case 'Container': return <Box className="w-4 h-4 text-white" />;
      case 'Storage': return <HardDrive className="w-4 h-4 text-red-500" />;
      case 'Logical Service': return <Workflow className="w-4 h-4 text-white" />;
      default: return <Layers className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="bg-black text-white p-6 font-sans border border-red-900 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-red-900 pb-4 mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-600 animate-pulse" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">Typed CI Class Hierarchy Engine</h1>
            <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 border border-red-800 font-mono">
              CMDB Schema 2026.8
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Hierarchical Inheritance Model • Dynamic Attributes & Validation • Non-Destructive CI Schema Registry
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mt-4 md:mt-0 border border-neutral-800 p-1 bg-neutral-950">
          {(['hierarchy', 'create', 'stats', 'schemas'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {tab === 'hierarchy' ? 'CI Registry & Tree' : tab === 'create' ? '+ Create Typed CI' : tab === 'stats' ? 'Class Stats' : 'Attribute Schemas'}
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 p-3 bg-red-950 border border-red-700 text-red-200 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-red-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TAB 1: CI Registry & Tree View */}
      {activeTab === 'hierarchy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          {/* Left Panel: Class Tree & Filters */}
          <div className="lg:col-span-4 bg-neutral-950 border border-neutral-800 p-4 space-y-4">
            <div className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-2 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-red-600" />
                <span>Class Hierarchy Filter</span>
              </span>
              <span className="text-[10px] text-neutral-500">{ciList.length} CIs Total</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search CI Name, ID, Owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-neutral-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Class Filter Buttons */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase text-neutral-500 mb-1">Select Main Class</div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => { setSelectedClass('ALL'); setSelectedType('ALL'); }}
                  className={`px-2 py-1 text-[11px] uppercase border text-left ${selectedClass === 'ALL' ? 'bg-red-600 border-red-500 text-white font-bold' : 'bg-black border-neutral-800 text-neutral-400 hover:text-white'}`}
                >
                  All Classes
                </button>
                {(['Hardware', 'Software', 'Cloud', 'Service'] as MainCiClass[]).map(cls => (
                  <button
                    key={cls}
                    onClick={() => { setSelectedClass(cls); setSelectedType('ALL'); }}
                    className={`px-2 py-1 text-[11px] uppercase border text-left ${selectedClass === cls ? 'bg-red-600 border-red-500 text-white font-bold' : 'bg-black border-neutral-800 text-neutral-400 hover:text-white'}`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* CI Item List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredCis.map(ci => (
                <div
                  key={ci.id}
                  onClick={() => setSelectedCi(ci)}
                  className={`p-3 border cursor-pointer transition-colors ${
                    selectedCi?.id === ci.id ? 'bg-neutral-900 border-red-600' : 'bg-black border-neutral-900 hover:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {getIcon(ci.ciType)}
                      <span className="font-bold text-white text-xs">{ci.name}</span>
                    </div>
                    <span className="text-[9px] bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.5 uppercase">
                      {ci.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                    <span>{ci.ciClass} &gt; {ci.ciType}</span>
                    <span className="text-neutral-500">{ci.tenantId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Selected CI Detail Inspector */}
          <div className="lg:col-span-8 bg-neutral-950 border border-neutral-800 p-5">
            {selectedCi ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b border-neutral-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      {getIcon(selectedCi.ciType)}
                      <h2 className="text-base font-bold text-white uppercase">{selectedCi.name}</h2>
                      <span className="text-[10px] bg-black border border-neutral-800 text-neutral-400 px-2 py-0.5">
                        {selectedCi.id}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-xs mt-1">{selectedCi.description}</p>
                  </div>

                  <div className="text-right text-[10px] text-neutral-500">
                    <div>Created: {selectedCi.createdAt}</div>
                    <div>Discovery: <span className="text-red-400">{selectedCi.discoverySource}</span></div>
                  </div>
                </div>

                {/* Base Common Properties */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-red-500 mb-3 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                    <span>Base Configuration Item Properties</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-black border border-neutral-800 p-3 text-[11px]">
                    <div><span className="text-neutral-500">Class:</span> <div className="text-white font-bold">{selectedCi.ciClass}</div></div>
                    <div><span className="text-neutral-500">Type:</span> <div className="text-white font-bold">{selectedCi.ciType}</div></div>
                    <div><span className="text-neutral-500">Environment:</span> <div className="text-white">{selectedCi.environment}</div></div>
                    <div><span className="text-neutral-500">Location:</span> <div className="text-white">{selectedCi.location}</div></div>
                    <div><span className="text-neutral-500">Owner:</span> <div className="text-white">{selectedCi.owner}</div></div>
                    <div><span className="text-neutral-500">Tenant ID:</span> <div className="text-white">{selectedCi.tenantId}</div></div>
                    <div><span className="text-neutral-500">Status:</span> <div className="text-red-400 font-bold">{selectedCi.status}</div></div>
                    <div><span className="text-neutral-500">Discovery:</span> <div className="text-white">{selectedCi.discoverySource}</div></div>
                  </div>
                </div>

                {/* Class-Specific Dynamic Properties */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-white mb-3 flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-white" />
                    <span>Class-Specific Attributes ({selectedCi.ciType})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(selectedCi.typeAttributes).map(([key, value]) => (
                      <div key={key} className="bg-black border border-neutral-900 p-3">
                        <div className="text-[10px] text-neutral-500 uppercase">{key}</div>
                        <div className="text-white font-mono text-xs mt-0.5">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-500">Select a Configuration Item to inspect details.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Dynamic CI Creation Form */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateCi} className="space-y-6 font-mono text-xs max-w-4xl mx-auto bg-neutral-950 border border-neutral-800 p-6">
          <div className="border-b border-neutral-900 pb-3">
            <h2 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-red-600" />
              <span>Dynamic Typed CI Classifier & Form</span>
            </h2>
            <p className="text-neutral-400 text-[11px] mt-1">
              Select class and type to dynamically load specific attribute schemas and validation rules.
            </p>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-red-950 border border-red-700 text-red-200 text-xs space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>Class Attribute Validation Failed:</span>
              </div>
              <ul className="list-disc list-inside pl-2 space-y-0.5">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step 1: Class & Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black border border-neutral-800 p-4">
            <div>
              <label className="block text-neutral-400 text-[10px] uppercase mb-1">1. Main CI Class</label>
              <select
                value={formClass}
                onChange={(e) => handleClassChange(e.target.value as MainCiClass)}
                className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-red-600"
              >
                <option value="Hardware">Hardware Class</option>
                <option value="Software">Software Class</option>
                <option value="Cloud">Cloud Infrastructure Class</option>
                <option value="Service">Logical Service Class</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 text-[10px] uppercase mb-1">2. Specialized CI Sub-Type</label>
              <select
                value={formType}
                onChange={(e) => {
                  setFormType(e.target.value as SubCiType);
                  setFormTypeAttributes({});
                  setValidationErrors([]);
                }}
                className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-white focus:outline-none focus:border-red-600"
              >
                {availableTypesForForm.map(def => (
                  <option key={def.typeKey} value={def.typeKey}>
                    {def.label} ({def.typeKey})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Base Common Properties */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-white border-b border-neutral-900 pb-1">
              3. Base Common CI Attributes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">CI Name / Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. srv-app-prod-02 or M365 Subscription"
                  value={formBase.name}
                  onChange={(e) => setFormBase({ ...formBase, name: e.target.value })}
                  className="w-full bg-black border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Owner Team / Person</label>
                <input
                  type="text"
                  value={formBase.owner}
                  onChange={(e) => setFormBase({ ...formBase, owner: e.target.value })}
                  className="w-full bg-black border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Environment</label>
                <select
                  value={formBase.environment}
                  onChange={(e) => setFormBase({ ...formBase, environment: e.target.value as any })}
                  className="w-full bg-black border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Development">Development</option>
                  <option value="DR">DR</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 text-[10px] uppercase mb-1">Status</label>
                <select
                  value={formBase.status}
                  onChange={(e) => setFormBase({ ...formBase, status: e.target.value as any })}
                  className="w-full bg-black border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-red-600"
                >
                  <option value="Active">Active</option>
                  <option value="In Maintenance">In Maintenance</option>
                  <option value="Decommissioned">Decommissioned</option>
                  <option value="Provisioning">Provisioning</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Type-Specific Attributes */}
          {currentSchema && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase text-red-500 border-b border-neutral-900 pb-1 flex items-center justify-between">
                <span>4. Type-Specific Attributes ({currentSchema.label})</span>
                <span className="text-[10px] text-neutral-500 font-normal">{currentSchema.description}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black border border-neutral-800 p-4">
                {currentSchema.attributes.map(attr => (
                  <div key={attr.key}>
                    <label className="block text-neutral-400 text-[10px] uppercase mb-1">
                      {attr.label} {attr.required && <span className="text-red-500">*</span>}
                    </label>

                    {attr.type === 'select' ? (
                      <select
                        value={formTypeAttributes[attr.key] || ''}
                        onChange={(e) => handleTypeAttributeChange(attr.key, e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-red-600"
                      >
                        <option value="">Select Option...</option>
                        {attr.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={attr.type === 'number' ? 'number' : attr.type === 'date' ? 'date' : 'text'}
                        placeholder={attr.placeholder}
                        value={formTypeAttributes[attr.key] || ''}
                        onChange={(e) => handleTypeAttributeChange(attr.key, attr.type === 'number' ? Number(e.target.value) : e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-white focus:outline-none focus:border-red-600"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-900">
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider transition-colors"
            >
              Save & Classify CI Record
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Class Breakdown Statistics */}
      {activeTab === 'stats' && (
        <div className="space-y-6 font-mono text-xs">
          <h2 className="text-sm font-bold uppercase text-white mb-2">Configuration Item Class Metrics & Distribution</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['Hardware', 'Software', 'Cloud', 'Service'] as MainCiClass[]).map(cls => {
              const count = ciList.filter(c => c.ciClass === cls).length;
              return (
                <div key={cls} className="bg-neutral-950 border border-neutral-800 p-4">
                  <div className="text-neutral-500 text-[10px] uppercase">{cls} Class Total</div>
                  <div className="text-2xl font-bold text-white mt-1">{count}</div>
                  <div className="text-[10px] text-red-500 mt-2">
                    {Math.round((count / Math.max(ciList.length, 1)) * 100)}% of total CIs
                  </div>
                </div>
              );
            })}
          </div>

          {/* Breakdown Table */}
          <div className="bg-neutral-950 border border-neutral-800 p-4">
            <div className="text-xs font-bold uppercase text-white mb-3">CI Sub-Type Breakdown Matrix</div>
            <table className="w-full text-left text-neutral-300">
              <thead>
                <tr className="border-b border-neutral-800 text-[10px] uppercase text-neutral-500">
                  <th className="py-2">Sub-Type</th>
                  <th className="py-2">Main Class</th>
                  <th className="py-2">Registered Count</th>
                  <th className="py-2">Primary Discovery Method</th>
                </tr>
              </thead>
              <tbody>
                {CI_CLASS_REGISTRY.map(reg => {
                  const subCount = ciList.filter(c => c.ciType === reg.typeKey).length;
                  return (
                    <tr key={reg.typeKey} className="border-b border-neutral-900">
                      <td className="py-2 font-bold text-white flex items-center space-x-2">
                        {getIcon(reg.typeKey)}
                        <span>{reg.label}</span>
                      </td>
                      <td className="py-2 text-neutral-400">{reg.classKey}</td>
                      <td className="py-2 font-bold text-red-400">{subCount}</td>
                      <td className="py-2 text-neutral-500">{reg.classKey === 'Hardware' ? 'SNMP / WMI / Agent' : reg.classKey === 'Cloud' ? 'Cloud Provider API' : 'SaaS / Connector'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Attribute Schema Inspector */}
      {activeTab === 'schemas' && (
        <div className="space-y-6 font-mono text-xs">
          <h2 className="text-sm font-bold uppercase text-white">Registered CI Class Attribute Schemas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CI_CLASS_REGISTRY.map(schema => (
              <div key={schema.typeKey} className="bg-neutral-950 border border-neutral-800 p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                  <div className="flex items-center space-x-2">
                    {getIcon(schema.typeKey)}
                    <span className="font-bold text-white">{schema.label}</span>
                  </div>
                  <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5">
                    {schema.classKey}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-neutral-500">Type-Specific Attributes:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {schema.attributes.map(attr => (
                      <span key={attr.key} className="bg-black border border-neutral-800 text-neutral-300 px-2 py-0.5 text-[10px]">
                        {attr.label} ({attr.type})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

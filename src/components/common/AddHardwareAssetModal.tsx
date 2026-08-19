import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CILifecycleState } from '../../types';
import {
  HardDrive,
  X,
  Plus,
  CheckCircle2,
  Building2,
  User,
  Calendar,
  DollarSign,
  Tag,
  Cpu,
  Layers,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

interface AddHardwareAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded?: (newAssetTag: string) => void;
}

export const AddHardwareAssetModal: React.FC<AddHardwareAssetModalProps> = ({
  isOpen,
  onClose,
  onAssetAdded,
}) => {
  const { addConfigurationItem, locations, departments, allUsers } = useApp();

  const generateDefaultTag = () => `HW-${Math.floor(1000 + Math.random() * 9000)}`;
  const generateDefaultSerial = () => `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const [formData, setFormData] = useState({
    name: '',
    assetTag: generateDefaultTag(),
    serialNumber: generateDefaultSerial(),
    category: 'Hardware',
    ciClassName: 'Hardware - Laptop',
    manufacturer: 'Apple',
    model: 'MacBook Pro 16 M3 Max',
    hostname: '',
    ipAddress: '10.100.4.15',
    macAddress: '00:1A:2B:3C:4D:5E',
    locationName: locations[0]?.name || 'NYC Headquarters - DC-1',
    departmentName: departments[0]?.name || 'DevOps & Infrastructure',
    ownerUserName: '',
    lifecycleState: 'In Stock' as CILifecycleState,
    purchaseDate: new Date().toISOString().substring(0, 10),
    cost: 2999,
    cpuCores: '16 Cores',
    ramGb: '64 GB',
    storageGb: '1024 GB NVMe',
    operatingSystem: 'macOS Sonoma 14.4',
    notes: 'Provisioned via Hardware Asset Manager',
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [createdAssetTag, setCreatedAssetTag] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'ciClassName') {
      let presetManufacturer = formData.manufacturer;
      let presetModel = formData.model;
      let presetName = formData.name;
      let presetOs = formData.operatingSystem;
      let presetTag = formData.assetTag;
      let presetCost = formData.cost;

      if (value === 'Hardware - Printer / MFP') {
        presetManufacturer = 'HP Inc.';
        presetModel = 'LaserJet Pro MFP 4101fdw';
        presetName = presetName || 'HP LaserJet Pro Office Printer';
        presetOs = 'HP JetDirect Embedded Firmware (v2024.08)';
        presetTag = `PRN-${Math.floor(1000 + Math.random() * 9000)}`;
        presetCost = 699;
      } else if (value === 'Hardware - Network Switch') {
        presetManufacturer = 'Cisco Systems';
        presetModel = 'Catalyst 9300 48-Port PoE+ Switch';
        presetName = presetName || 'Cisco Core Switch 48P';
        presetOs = 'Cisco IOS-XE 17.9.4';
        presetTag = `SW-${Math.floor(1000 + Math.random() * 9000)}`;
        presetCost = 3499;
      } else if (value === 'Hardware - Network Router / Firewall') {
        presetManufacturer = 'Fortinet';
        presetModel = 'FortiGate 100F Security Gateway';
        presetName = presetName || 'FortiGate Edge Firewall';
        presetOs = 'FortiOS 7.4.3';
        presetTag = `FW-${Math.floor(1000 + Math.random() * 9000)}`;
        presetCost = 2899;
      } else if (value === 'Hardware - Wireless Access Point') {
        presetManufacturer = 'Aruba Networks';
        presetModel = 'AP-555 Wi-Fi 6 Enterprise AP';
        presetName = presetName || 'Floor 2 Wi-Fi AP';
        presetOs = 'ArubaOS 10.4';
        presetTag = `AP-${Math.floor(1000 + Math.random() * 9000)}`;
        presetCost = 849;
      }

      setFormData((prev) => ({
        ...prev,
        ciClassName: value,
        manufacturer: presetManufacturer,
        model: presetModel,
        name: presetName,
        operatingSystem: presetOs,
        assetTag: presetTag,
        cost: presetCost,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Asset Name is required.');
      return;
    }
    if (!formData.assetTag.trim()) {
      setErrorMsg('Asset Tag is required.');
      return;
    }

    try {
      const newCi = addConfigurationItem({
        name: formData.name.trim(),
        assetTag: formData.assetTag.trim(),
        serialNumber: formData.serialNumber.trim() || generateDefaultSerial(),
        category: 'Hardware',
        ciClassName: formData.ciClassName,
        manufacturer: formData.manufacturer.trim(),
        model: formData.model.trim(),
        hostname: formData.hostname.trim() || `${formData.assetTag.toLowerCase()}.internal.net`,
        ipAddress: formData.ipAddress,
        macAddress: formData.macAddress,
        locationName: formData.locationName,
        departmentName: formData.departmentName,
        ownerUserName: formData.ownerUserName || undefined,
        lifecycleState: formData.lifecycleState,
        purchaseDate: formData.purchaseDate,
        cost: formData.cost,
        environment: 'Production',
        criticality: 'High',
        cpuCores: formData.cpuCores,
        ramGb: formData.ramGb,
        storageGb: formData.storageGb,
        operatingSystem: formData.operatingSystem,
      });

      setCreatedAssetTag(newCi.assetTag);
      setIsSuccess(true);
      setErrorMsg('');

      if (onAssetAdded) {
        onAssetAdded(newCi.assetTag);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create hardware asset.');
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setCreatedAssetTag('');
    setFormData({
      name: '',
      assetTag: generateDefaultTag(),
      serialNumber: generateDefaultSerial(),
      category: 'Hardware',
      ciClassName: 'Hardware - Laptop',
      manufacturer: 'Dell',
      model: 'XPS 15 Developer Edition',
      hostname: '',
      ipAddress: '10.100.4.88',
      macAddress: '00:1A:2B:99:88:77',
      locationName: locations[0]?.name || 'NYC Headquarters - DC-1',
      departmentName: departments[0]?.name || 'DevOps & Infrastructure',
      ownerUserName: '',
      lifecycleState: 'In Stock',
      purchaseDate: new Date().toISOString().substring(0, 10),
      cost: 2199,
      cpuCores: '14 Cores',
      ramGb: '32 GB',
      storageGb: '1000 GB NVMe',
      operatingSystem: 'Ubuntu 24.04 LTS',
      notes: 'Provisioned via Hardware Asset Manager',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-3xl w-full p-6 space-y-6 shadow-2xl font-mono text-xs text-zinc-300 my-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-500">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>PROVISION NEW HARDWARE ASSET</span>
                <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                  LIVE DB SAVE
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Register a new physical endpoint, server, or networking device into the active CMDB inventory.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="bg-zinc-900/90 border border-emerald-500/30 rounded-xl p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Hardware Asset Created Successfully!</h3>
              <p className="text-xs text-zinc-400">
                Asset <span className="text-red-400 font-bold">{createdAssetTag}</span> is now active in the CMDB inventory and tracked for life-cycle operations.
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-4">
              <button
                onClick={handleReset}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Asset</span>
              </button>

              <button
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-lg cursor-pointer"
              >
                Done & View Inventory
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-950/80 border border-red-800 text-red-300 p-3 rounded-lg text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* Section 1: Basic Asset Identity */}
            <div className="space-y-3 bg-zinc-900/60 p-4 border border-zinc-800/80 rounded-lg">
              <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-zinc-800 pb-2">
                <Tag className="w-3.5 h-3.5" />
                <span>1. Asset Identity & Class</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">
                    Asset Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. MacBook Pro 16 M3 Max - Executive"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white font-bold focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">
                    Asset Tag <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="assetTag"
                    required
                    value={formData.assetTag}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-red-400 font-bold focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Class / Type</label>
                  <select
                    name="ciClassName"
                    value={formData.ciClassName}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white font-bold focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="Hardware - Printer / MFP">Hardware - Printer / Multifunction Peripheral (MFP)</option>
                    <option value="Hardware - Laptop">Hardware - Laptop / Notebook</option>
                    <option value="Hardware - Desktop">Hardware - Desktop / Workstation</option>
                    <option value="Hardware - Server">Hardware - Rack Server / Blade</option>
                    <option value="Hardware - Network Switch">Hardware - Network Switch (PoE / Core / Aggregation)</option>
                    <option value="Hardware - Network Router / Firewall">Hardware - Router / Firewall Security Appliance</option>
                    <option value="Hardware - Wireless Access Point">Hardware - Wi-Fi Access Point (AP)</option>
                    <option value="Hardware - Monitor">Hardware - External Display / Monitor</option>
                    <option value="Hardware - Mobile">Hardware - Mobile Phone / Tablet</option>
                    <option value="Hardware - Peripheral">Hardware - Docking Station / Peripheral</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    placeholder="e.g. Apple, Dell, Lenovo"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Model</label>
                  <input
                    type="text"
                    name="model"
                    placeholder="e.g. MacBook Pro 16"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Lifecycle & Ownership */}
            <div className="space-y-3 bg-zinc-900/60 p-4 border border-zinc-800/80 rounded-lg">
              <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-zinc-800 pb-2">
                <User className="w-3.5 h-3.5" />
                <span>2. Lifecycle Stage, Location & Assignment</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Lifecycle Stage</label>
                  <select
                    name="lifecycleState"
                    value={formData.lifecycleState}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white font-bold focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="Requested">Requested</option>
                    <option value="Approved">Approved</option>
                    <option value="Ordered">Ordered</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Deployed">Deployed</option>
                    <option value="In Repair">In Repair</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Assigned User</label>
                  <select
                    name="ownerUserName"
                    value={formData.ownerUserName}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="">Unassigned (In Stockroom)</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Primary Location</label>
                  <select
                    name="locationName"
                    value={formData.locationName}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Serial Number</label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Purchase Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Acquisition Cost ($)</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Hardware Specifications */}
            <div className="space-y-3 bg-zinc-900/60 p-4 border border-zinc-800/80 rounded-lg">
              <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-zinc-800 pb-2">
                <Cpu className="w-3.5 h-3.5" />
                <span>3. Hardware Specs & Operating System</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">CPU Cores</label>
                  <input
                    type="text"
                    name="cpuCores"
                    placeholder="e.g. 16 Cores"
                    value={formData.cpuCores}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">RAM</label>
                  <input
                    type="text"
                    name="ramGb"
                    placeholder="e.g. 64 GB"
                    value={formData.ramGb}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Storage</label>
                  <input
                    type="text"
                    name="storageGb"
                    placeholder="e.g. 1024 GB NVMe"
                    value={formData.storageGb}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">OS Platform</label>
                  <input
                    type="text"
                    name="operatingSystem"
                    placeholder="e.g. macOS / Windows 11 Pro"
                    value={formData.operatingSystem}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold px-4 py-2 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg cursor-pointer flex items-center space-x-2 shadow-lg shadow-red-950/50"
              >
                <Plus className="w-4 h-4" />
                <span>Save Hardware Asset to CMDB</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

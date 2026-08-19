import React, { useState } from 'react';
import { 
  Database, HardDrive, ShieldCheck, FileText, UploadCloud, Download, 
  Trash2, Lock, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw,
  FolderKey, FileCheck, Layers, Server, ShieldAlert, Eye, Key
} from 'lucide-react';

interface AttachmentRecord {
  attachment_id: string;
  tenant_id: string;
  entity_type: string;
  entity_id: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  checksum: string;
  category: string;
  uploaded_by: string;
  provider: string;
  status: string;
  uploaded_at: string;
}

export const ObjectStorageModule: React.FC = () => {
  const [provider, setProvider] = useState<'s3' | 'minio'>('s3');
  const [activeTab, setActiveTab] = useState<'attachments' | 'upload' | 'quota' | 'settings'>('attachments');
  
  // Upload form state
  const [selectedEntity, setSelectedEntity] = useState('Contract');
  const [entityId, setEntityId] = useState('CTR-DELL-8821');
  const [category, setCategory] = useState('Contract');
  const [simulatedFile, setSimulatedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');

  // Sample attachments list
  const [attachments, setAttachments] = useState<AttachmentRecord[]>([
    {
      attachment_id: "ATT-900112A",
      tenant_id: "tenant-kspl-global",
      entity_type: "Contract",
      entity_id: "CTR-DELL-8821",
      original_filename: "Dell_ProSupport_Master_Contract_2026.pdf",
      mime_type: "application/pdf",
      file_size: 2458000,
      checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      category: "Contract",
      uploaded_by: "usr-legal-admin",
      provider: "AWS_S3",
      status: "AVAILABLE",
      uploaded_at: "2026-08-10T11:20:00Z"
    },
    {
      attachment_id: "ATT-900113B",
      tenant_id: "tenant-kspl-global",
      entity_type: "Warranty",
      entity_id: "AST-8001",
      original_filename: "Server_001_Dell_Warranty_Certificate.pdf",
      mime_type: "application/pdf",
      file_size: 1204000,
      checksum: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      category: "Warranty Document",
      uploaded_by: "usr-hardware-tech",
      provider: "AWS_S3",
      status: "AVAILABLE",
      uploaded_at: "2026-08-10T12:05:00Z"
    },
    {
      attachment_id: "ATT-900114C",
      tenant_id: "tenant-kspl-global",
      entity_type: "Disposal",
      entity_id: "DSP-2026-09",
      original_filename: "E-Waste_Destruction_Certificate_Signed.pdf",
      mime_type: "application/pdf",
      file_size: 3100000,
      checksum: "315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3",
      category: "Disposal Certificate",
      uploaded_by: "usr-compliance-officer",
      provider: "MINIO",
      status: "AVAILABLE",
      uploaded_at: "2026-08-11T04:15:00Z"
    }
  ]);

  const handleSimulatedUpload = () => {
    if (!simulatedFile) {
      setUploadErrorMsg("Please select a document or attachment file first.");
      return;
    }

    setUploadErrorMsg('');
    setUploadSuccessMsg('');
    setIsUploading(true);

    const ext = simulatedFile.name.split('.').pop()?.toLowerCase() || '';
    if (['exe', 'bat', 'sh', 'cmd', 'dll'].includes(ext)) {
      setIsUploading(false);
      setUploadErrorMsg(`Security Violation: Executable file format .${ext} is strictly prohibited.`);
      return;
    }

    setTimeout(() => {
      const newRec: AttachmentRecord = {
        attachment_id: `ATT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        tenant_id: "tenant-kspl-global",
        entity_type: selectedEntity,
        entity_id: entityId,
        original_filename: simulatedFile.name,
        mime_type: simulatedFile.type || "application/pdf",
        file_size: simulatedFile.size,
        checksum: "a4f89021b33918274f88290e229381710928a3820194881726a112009281aef1",
        category: category,
        uploaded_by: "usr-admin",
        provider: provider === 's3' ? 'AWS_S3' : 'MINIO',
        status: "AVAILABLE",
        uploaded_at: new Date().toISOString()
      };

      setAttachments(prev => [newRec, ...prev]);
      setIsUploading(false);
      setUploadSuccessMsg(`Attachment ${newRec.original_filename} successfully uploaded and secured with SHA-256 checksum.`);
      setSimulatedFile(null);
    }, 800);
  };

  const handleDeleteAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.attachment_id !== id));
  };

  const totalBytes = attachments.reduce((sum, a) => sum + a.file_size, 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="p-6 bg-black text-white min-h-screen font-sans border border-red-950 rounded-xl space-y-6">
      {/* Top Banner strictly in RED / BLACK / WHITE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-red-900/60 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-950/80 border border-red-600/40 rounded-lg text-red-500 shadow-lg shadow-red-950/50">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wide text-white uppercase font-mono">
                S3-Compatible Attachment Storage Vault
              </h1>
              <span className="px-2 py-0.5 bg-red-900/40 text-red-400 border border-red-600/30 text-[10px] font-mono font-bold rounded">
                ISOLATED SUBSYSTEM
              </span>
            </div>
            <p className="text-xs text-red-300/80 mt-0.5">
              Multi-Tenant Isolated Storage • AWS S3 & MinIO • Cryptographic SHA-256 Verification
            </p>
          </div>
        </div>

        {/* Provider Switcher */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex bg-zinc-950 border border-red-900/80 rounded-lg p-1">
            <button
              onClick={() => setProvider('s3')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                provider === 's3' 
                  ? 'bg-red-600 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              AWS S3
            </button>
            <button
              onClick={() => setProvider('minio')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                provider === 'minio' 
                  ? 'bg-red-600 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              MinIO (On-Prem)
            </button>
          </div>
        </div>
      </div>

      {/* Quota & Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-zinc-950 border border-red-900/50 rounded-xl space-y-1">
          <span className="text-zinc-500 uppercase text-[10px] block">Storage Used</span>
          <div className="text-lg font-bold text-white flex items-center justify-between">
            <span>{totalMB} MB</span>
            <span className="text-red-500 text-xs">/ 100 GB</span>
          </div>
          <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-red-950 mt-2">
            <div className="bg-red-600 h-full w-[2%]" />
          </div>
        </div>

        <div className="p-4 bg-zinc-950 border border-red-900/50 rounded-xl space-y-1">
          <span className="text-zinc-500 uppercase text-[10px] block">Total Attachments</span>
          <span className="text-lg font-bold text-red-400 block">{attachments.length} Documents</span>
          <span className="text-[10px] text-zinc-500 block">SHA-256 Checksums Verified</span>
        </div>

        <div className="p-4 bg-zinc-950 border border-red-900/50 rounded-xl space-y-1">
          <span className="text-zinc-500 uppercase text-[10px] block">Tenant Storage Scope</span>
          <span className="text-lg font-bold text-white block truncate">tenant-kspl-global</span>
          <span className="text-[10px] text-red-400 flex items-center gap-1 mt-0.5">
            <Lock className="w-3 h-3 text-red-500" /> Server-Enforced Path Isolation
          </span>
        </div>

        <div className="p-4 bg-zinc-950 border border-red-900/50 rounded-xl space-y-1">
          <span className="text-zinc-500 uppercase text-[10px] block">Security & Executable Guard</span>
          <span className="text-lg font-bold text-red-500 block">ACTIVE</span>
          <span className="text-[10px] text-zinc-500 block">.EXE / .BAT / .SH Blocked</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-red-900/60 space-x-6 text-sm font-mono">
        {[
          { id: 'attachments', label: 'Attachment Vault', icon: FileText },
          { id: 'upload', label: 'Secure File Upload', icon: UploadCloud },
          { id: 'quota', label: 'Storage Quota & Analytics', icon: Layers },
          { id: 'settings', label: 'S3 / MinIO Configuration', icon: Server }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2.5 font-semibold transition-colors border-b-2 ${
                active 
                  ? 'border-red-600 text-red-500' 
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: ATTACHMENT VAULT */}
      {activeTab === 'attachments' && (
        <div className="bg-zinc-950 border border-red-900/50 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-red-900/40 flex justify-between items-center font-mono text-xs">
            <span className="text-white font-bold uppercase">Enterprise ITAM Documents & Evidence Records</span>
            <span className="text-zinc-500">Showing {attachments.length} attachments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-zinc-300">
              <thead className="bg-black text-red-400 uppercase text-[10px] border-b border-red-900/60">
                <tr>
                  <th className="p-3">Attachment ID</th>
                  <th className="p-3">Entity Reference</th>
                  <th className="p-3">Filename</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-950">
                {attachments.map((item) => (
                  <tr key={item.attachment_id} className="hover:bg-red-950/20 transition-colors">
                    <td className="p-3 font-bold text-white">{item.attachment_id}</td>
                    <td className="p-3">
                      <span className="text-red-400 font-bold">[{item.entity_type}]</span> {item.entity_id}
                    </td>
                    <td className="p-3 text-white max-w-xs truncate">{item.original_filename}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-red-950 border border-red-800 text-red-300 rounded text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3">{(item.file_size / (1024 * 1024)).toFixed(2)} MB</td>
                    <td className="p-3 text-red-500 font-bold">{item.provider}</td>
                    <td className="p-3 text-right space-x-2">
                      <button 
                        onClick={() => alert(`Generating short-lived pre-signed download URL for ${item.original_filename}...`)}
                        className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border border-red-700 text-white rounded text-[10px] font-bold inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 text-red-400" />
                        Download
                      </button>
                      <button 
                        onClick={() => handleDeleteAttachment(item.attachment_id)}
                        className="p-1 hover:text-red-500 text-zinc-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: SECURE UPLOAD FORM */}
      {activeTab === 'upload' && (
        <div className="p-6 bg-zinc-950 border border-red-900/50 rounded-xl space-y-6 max-w-2xl font-mono text-xs">
          <div className="border-b border-red-900/40 pb-3">
            <h3 className="text-base font-bold text-white uppercase">Upload ITAM Attachment or Evidence Document</h3>
            <p className="text-zinc-400 mt-1">Upload contracts, warranties, disposal certificates, or asset photos securely to S3/MinIO.</p>
          </div>

          {uploadErrorMsg && (
            <div className="p-3 bg-red-950 border border-red-600 text-red-300 rounded flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{uploadErrorMsg}</span>
            </div>
          )}

          {uploadSuccessMsg && (
            <div className="p-3 bg-black border border-red-700 text-white rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 uppercase text-[10px] mb-1">Target Entity Type</label>
              <select 
                value={selectedEntity} 
                onChange={e => setSelectedEntity(e.target.value)}
                className="w-full bg-black border border-red-900/80 rounded px-3 py-2 text-white"
              >
                <option value="Contract">Contract</option>
                <option value="Invoice">Invoice</option>
                <option value="Warranty">Warranty</option>
                <option value="Disposal">Disposal Record</option>
                <option value="Asset">Hardware Asset</option>
                <option value="Compliance">Compliance Evidence</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 uppercase text-[10px] mb-1">Target Entity Reference ID</label>
              <input 
                type="text" 
                value={entityId} 
                onChange={e => setEntityId(e.target.value)}
                placeholder="e.g. CTR-DELL-8821 or AST-8001"
                className="w-full bg-black border border-red-900/80 rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-400 uppercase text-[10px] mb-1">Document Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-black border border-red-900/80 rounded px-3 py-2 text-white"
              >
                <option value="Contract">Contract</option>
                <option value="Warranty Document">Warranty Document</option>
                <option value="Disposal Certificate">Disposal Certificate</option>
                <option value="Asset Photo">Asset Photo</option>
                <option value="Audit Evidence">Audit Evidence</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 uppercase text-[10px] mb-1">Select File (PDF, DOCX, PNG, WEBP)</label>
              <input 
                type="file" 
                onChange={e => e.target.files?.[0] && setSimulatedFile(e.target.files[0])}
                className="w-full bg-black border border-red-900/80 rounded p-2 text-zinc-300"
              />
            </div>

            <button
              onClick={handleSimulatedUpload}
              disabled={isUploading}
              className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white font-bold uppercase rounded transition-colors flex justify-center items-center gap-2"
            >
              {isUploading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <UploadCloud className="w-4 h-4" />}
              {isUploading ? "Uploading & Generating Checksum..." : `Upload to ${provider.toUpperCase()}`}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: STORAGE QUOTA & ANALYTICS */}
      {activeTab === 'quota' && (
        <div className="p-6 bg-zinc-950 border border-red-900/50 rounded-xl space-y-6 font-mono text-xs">
          <h3 className="text-base font-bold text-white uppercase border-b border-red-900/40 pb-3">
            Tenant Storage Quota & Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-black border border-red-900/60 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-red-500 uppercase">Usage By Category</h4>
              <div className="space-y-2 text-zinc-300">
                <div className="flex justify-between p-2 bg-zinc-950 rounded border border-red-950">
                  <span>Contracts</span>
                  <span className="font-bold text-white">2.45 MB</span>
                </div>
                <div className="flex justify-between p-2 bg-zinc-950 rounded border border-red-950">
                  <span>Warranties</span>
                  <span className="font-bold text-white">1.20 MB</span>
                </div>
                <div className="flex justify-between p-2 bg-zinc-950 rounded border border-red-950">
                  <span>Disposal Certificates</span>
                  <span className="font-bold text-white">3.10 MB</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-black border border-red-900/60 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-red-500 uppercase">Security & Integrity Audit</h4>
              <ul className="space-y-2 text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500" />
                  <span>All attachments verified with SHA-256 digests.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500" />
                  <span>Objects isolated inside <code className="text-red-400">tenants/tenant-kspl-global/</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500" />
                  <span>Pre-signed download links expire after 3600 seconds.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 bg-zinc-950 border border-red-900/50 rounded-xl space-y-6 font-mono text-xs max-w-2xl">
          <h3 className="text-base font-bold text-white uppercase border-b border-red-900/40 pb-3">
            S3 / MinIO Connection Parameters
          </h3>

          <div className="space-y-3 text-zinc-300">
            <div className="p-3 bg-black border border-red-900/60 rounded flex justify-between">
              <span className="text-zinc-500">STORAGE_PROVIDER</span>
              <span className="font-bold text-red-400">{provider.toUpperCase()}</span>
            </div>
            <div className="p-3 bg-black border border-red-900/60 rounded flex justify-between">
              <span className="text-zinc-500">S3_ENDPOINT</span>
              <span className="font-bold text-white">
                {provider === 's3' ? 'https://s3.amazonaws.com' : 'http://minio.internal:9000'}
              </span>
            </div>
            <div className="p-3 bg-black border border-red-900/60 rounded flex justify-between">
              <span className="text-zinc-500">S3_BUCKET</span>
              <span className="font-bold text-white">enterprise-itam-attachments-vault</span>
            </div>
            <div className="p-3 bg-black border border-red-900/60 rounded flex justify-between">
              <span className="text-zinc-500">S3_USE_PATH_STYLE</span>
              <span className="font-bold text-red-500">{provider === 'minio' ? 'true' : 'false'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectStorageModule;

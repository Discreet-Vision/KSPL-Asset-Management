import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfigurationItem, CILifecycleState } from '../../types';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  ArrowRight,
  RefreshCw,
  Sliders,
  Database,
  Check,
  AlertCircle,
  HelpCircle,
  Layers,
  Sparkles,
} from 'lucide-react';

interface BulkAssetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (count: number) => void;
}

// Target Asset Schema fields available for mapping
interface TargetField {
  key: keyof Omit<ConfigurationItem, 'id' | 'healthScore' | 'riskScore' | 'lastDiscovered'>;
  label: string;
  required: boolean;
  sampleValue: string;
}

const TARGET_FIELDS: TargetField[] = [
  { key: 'assetTag', label: 'Asset Tag', required: true, sampleValue: 'AST-2026-901' },
  { key: 'name', label: 'Asset Name', required: true, sampleValue: 'MacBook Pro 16 M3 Max' },
  { key: 'category', label: 'Category', required: false, sampleValue: 'Hardware' },
  { key: 'manufacturer', label: 'Manufacturer', required: false, sampleValue: 'Apple' },
  { key: 'model', label: 'Model', required: false, sampleValue: 'A2991' },
  { key: 'serialNumber', label: 'Serial Number', required: false, sampleValue: 'C02G3910MD6R' },
  { key: 'cost', label: 'Cost ($)', required: false, sampleValue: '3499' },
  { key: 'purchaseDate', label: 'Purchase Date', required: false, sampleValue: '2026-01-15' },
  { key: 'lifecycleState', label: 'Lifecycle State', required: false, sampleValue: 'In Stock' },
  { key: 'locationName', label: 'Location Name', required: false, sampleValue: 'HQ - San Francisco' },
  { key: 'ownerUserName', label: 'Assigned User Name', required: false, sampleValue: 'Sarah Jenkins' },
  { key: 'ipAddress', label: 'IP Address', required: false, sampleValue: '10.200.4.52' },
  { key: 'macAddress', label: 'MAC Address', required: false, sampleValue: '3C:22:FB:91:00:1A' },
  { key: 'osVersion', label: 'OS / Firmware Version', required: false, sampleValue: 'macOS Sonoma 14.4' },
];

export const BulkAssetImportModal: React.FC<BulkAssetImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const { configurationItems, bulkAddConfigurationItems, currentTenant } = useApp();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [delimiter, setDelimiter] = useState<string>(',');

  // Parsed structure
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({}); // csvHeader -> targetKey

  // Validation results
  const [processedAssets, setProcessedAssets] = useState<{
    data: Omit<ConfigurationItem, 'id' | 'healthScore' | 'riskScore' | 'lastDiscovered'>;
    status: 'valid' | 'warning' | 'invalid';
    messages: string[];
    originalIndex: number;
  }[]>([]);

  // Import State
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importedCount, setImportedCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Simple RFC 4180 CSV parser handling quotes
  const parseCsvText = (rawText: string, sep: string = ',') => {
    const text = String(rawText || '');
    const lines: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let insideQuote = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === sep && !insideQuote) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !insideQuote) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        if (currentRow.some((field) => field && field.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }

    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some((field) => field && field.length > 0)) {
        lines.push(currentRow);
      }
    }

    return lines;
  };

  // Process raw CSV string into headers and rows
  const handleProcessCsvString = (rawText: string, fName: string = 'pasted_data.csv') => {
    const text = String(rawText || '');
    if (!text.trim()) return;

    // Detect delimiter
    let detectedSep = delimiter;
    if (text.includes('\t') && !text.includes(',')) detectedSep = '\t';
    else if (text.includes(';') && !text.includes(',')) detectedSep = ';';
    setDelimiter(detectedSep);

    const parsed = parseCsvText(text, detectedSep);
    if (parsed.length < 2) {
      alert('CSV file must contain at least a header row and one data row.');
      return;
    }

    const headers = parsed[0].map((h) => h.replace(/^[\uFEFF\s]+|[\s]+$/g, ''));
    const rows = parsed.slice(1);

    setCsvHeaders(headers);
    setCsvRows(rows);
    setFileName(fName);

    // Auto-map headers
    const initialMapping: Record<string, string> = {};
    headers.forEach((h) => {
      const cleanHeader = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      const match = TARGET_FIELDS.find((f) => {
        const cleanKey = f.key.toLowerCase();
        const cleanLabel = f.label.toLowerCase().replace(/[^a-z0-9]/g, '');
        return (
          cleanHeader === cleanKey ||
          cleanHeader === cleanLabel ||
          cleanHeader.includes(cleanKey) ||
          cleanHeader.includes(cleanLabel) ||
          (cleanHeader.includes('tag') && f.key === 'assetTag') ||
          (cleanHeader.includes('serial') && f.key === 'serialNumber') ||
          ((cleanHeader.includes('cost') || cleanHeader.includes('price')) && f.key === 'cost') ||
          (cleanHeader.includes('user') && f.key === 'ownerUserName') ||
          (cleanHeader.includes('loc') && f.key === 'locationName')
        );
      });

      if (match) {
        initialMapping[h] = match.key;
      } else {
        initialMapping[h] = 'ignore';
      }
    });

    setColumnMapping(initialMapping);
    setActiveStep(2);
  };

  // Handle File Input Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvRawText(content);
      handleProcessCsvString(content, file.name);
    };
    reader.readAsText(file);
  };

  // Load Preset Sample CSV for Instant Admin Testing
  const handleLoadSampleCsv = () => {
    const sampleCsv = `assetTag,name,category,manufacturer,model,serialNumber,cost,purchaseDate,lifecycleState,locationName,ownerUserName,ipAddress
AST-2026-801,Dell PowerEdge R760 Server,Hardware,Dell Technologies,PowerEdge R760,CN-0X9812-3001,8450,2026-02-10,In Stock,HQ - San Francisco Data Center,,10.10.40.12
AST-2026-802,Cisco Catalyst 9300 Switch,Hardware,Cisco Systems,Catalyst 9300 48P,FOC2419L80A,4200,2026-01-20,In Use,Branch Office - New York,David Miller,10.10.10.1
AST-2026-803,Lenovo ThinkPad X1 Carbon Gen 12,Hardware,Lenovo,ThinkPad X1 Gen12,PF-491029X,2150,2026-03-01,In Use,HQ - San Francisco,Elena Rostova,
AST-2026-804,Apple iPad Pro 12.9 M2,Hardware,Apple,iPad Pro 12.9 6th Gen,DMPZF012Q80,1299,2026-02-15,In Stock,HQ - San Francisco,,
AST-2026-805,Palo Alto PA-3220 Firewall,Infrastructure,Palo Alto Networks,PA-3220,012903810293,12500,2025-11-10,In Use,HQ - San Francisco Data Center,,10.10.0.1`;

    setCsvRawText(sampleCsv);
    handleProcessCsvString(sampleCsv, 'kspl_sample_hardware_inventory.csv');
  };

  // Download Standard CSV Template
  const handleDownloadTemplate = () => {
    const headers = TARGET_FIELDS.map((f) => f.key).join(',');
    const sampleRow1 = TARGET_FIELDS.map((f) => `"${f.sampleValue}"`).join(',');
    const sampleRow2 = `AST-2026-902,HP EliteBook 840 G10,Hardware,HP,EliteBook 840,5CG34109XY,1850,2026-02-01,In Stock,HQ - San Francisco,,10.200.5.12,00:50:56:A1:B2:C3,Windows 11 Pro`;

    const csvContent = `${headers}\n${sampleRow1}\n${sampleRow2}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KSPL_ITAM_Import_Template.csv`;
    link.click();
  };

  // Step 2 -> Step 3: Run Validation & Mapping
  const handleValidateAndProceed = () => {
    const existingTags = new Set(
      (configurationItems || []).map((c) => (c.assetTag ? c.assetTag.toLowerCase() : ''))
    );

    const processed = csvRows.map((row, idx) => {
      const itemData: any = {
        tenantId: currentTenant.id,
        ciClassId: 'class-hardware-server',
        ciClassName: 'Hardware Asset',
        category: 'Hardware',
        lifecycleState: 'In Stock' as CILifecycleState,
        locationId: 'loc-1',
        locationName: 'HQ - Primary Warehouse',
        departmentId: 'dept-1',
        departmentName: 'IT Infrastructure',
        discoverySource: 'Import',
        dataClassification: 'Internal',
        costCenterId: 'cc-101',
        manufacturer: 'Unspecified',
        model: 'Standard Issue',
        customAttributes: {},
      };

      // Apply Mappings
      csvHeaders.forEach((header, colIdx) => {
        const targetField = columnMapping[header];
        if (targetField && targetField !== 'ignore') {
          const val = row[colIdx] ? row[colIdx].trim() : '';
          if (targetField === 'cost') {
            itemData.cost = parseFloat(val) || 0;
          } else {
            itemData[targetField] = val;
          }
        }
      });

      const messages: string[] = [];
      let status: 'valid' | 'warning' | 'invalid' = 'valid';

      // Fallbacks
      if (!itemData.name) {
        itemData.name = `Imported Asset #${idx + 1}`;
        status = 'warning';
        messages.push('Missing name (auto-assigned default)');
      }

      if (!itemData.assetTag) {
        itemData.assetTag = `AST-IMP-${Date.now().toString().slice(-4)}-${idx + 1}`;
        status = 'warning';
        messages.push('Missing Asset Tag (generated AST-IMP tag)');
      } else if (existingTags.has(itemData.assetTag.toLowerCase())) {
        itemData.assetTag = `${itemData.assetTag}-DUP${idx + 1}`;
        status = 'warning';
        messages.push('Duplicate Tag found in database (auto-suffixed)');
      }

      if (!itemData.serialNumber) {
        itemData.serialNumber = `SN-UNK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      }

      return {
        data: itemData as Omit<ConfigurationItem, 'id' | 'healthScore' | 'riskScore' | 'lastDiscovered'>,
        status,
        messages,
        originalIndex: idx,
      };
    });

    setProcessedAssets(processed);
    setActiveStep(3);
  };

  // Step 3 -> Step 4: Execute Batch Commit
  const handleExecuteImport = () => {
    setIsImporting(true);
    setImportProgress(10);

    const validItems = processedAssets.map((p) => p.data);

    // Simulate realistic streaming commit
    setTimeout(() => {
      setImportProgress(50);
      setTimeout(() => {
        const created = bulkAddConfigurationItems(validItems);
        setImportProgress(100);
        setIsImporting(false);
        setImportedCount(created.length);
        setActiveStep(4);
        if (onImportComplete) {
          onImportComplete(created.length);
        }
      }, 400);
    }, 300);
  };

  // Reset modal state
  const handleReset = () => {
    setActiveStep(1);
    setCsvRawText('');
    setFileName('');
    setCsvHeaders([]);
    setCsvRows([]);
    setColumnMapping({});
    setProcessedAssets([]);
    setImportProgress(0);
    setImportedCount(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans text-zinc-900">
      <div className="bg-white border border-zinc-300 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-zinc-900 text-white flex justify-between items-center border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-500">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  BULK ASSET CSV IMPORT ENGINE
                </h2>
                <span className="bg-zinc-800 text-red-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-zinc-700">
                  RFC 4180
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Parse CSV data, map column headers, validate inventory schema, and register hardware CIs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Bar */}
        <div className="bg-zinc-100 border-b border-zinc-300 px-6 py-3 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center space-x-6">
            <div className={`flex items-center space-x-2 ${activeStep === 1 ? 'text-red-600 font-bold' : activeStep > 1 ? 'text-emerald-700 font-bold' : 'text-zinc-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeStep === 1 ? 'bg-red-600 text-white' : activeStep > 1 ? 'bg-emerald-600 text-white' : 'bg-zinc-300 text-zinc-700'}`}>
                1
              </span>
              <span>1. Upload / Paste CSV</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />

            <div className={`flex items-center space-x-2 ${activeStep === 2 ? 'text-red-600 font-bold' : activeStep > 2 ? 'text-emerald-700 font-bold' : 'text-zinc-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeStep === 2 ? 'bg-red-600 text-white' : activeStep > 2 ? 'bg-emerald-600 text-white' : 'bg-zinc-300 text-zinc-700'}`}>
                2
              </span>
              <span>2. Column Mapping</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />

            <div className={`flex items-center space-x-2 ${activeStep === 3 ? 'text-red-600 font-bold' : activeStep > 3 ? 'text-emerald-700 font-bold' : 'text-zinc-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeStep === 3 ? 'bg-red-600 text-white' : activeStep > 3 ? 'bg-emerald-600 text-white' : 'bg-zinc-300 text-zinc-700'}`}>
                3
              </span>
              <span>3. Validate Data</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />

            <div className={`flex items-center space-x-2 ${activeStep === 4 ? 'text-emerald-600 font-bold' : 'text-zinc-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeStep === 4 ? 'bg-emerald-600 text-white' : 'bg-zinc-300 text-zinc-700'}`}>
                4
              </span>
              <span>4. Results</span>
            </div>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="text-zinc-700 hover:text-zinc-900 font-bold text-xs flex items-center space-x-1 cursor-pointer hover:underline"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download Template .CSV</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ================= STEP 1: UPLOAD OR PASTE ================= */}
          {activeStep === 1 && (
            <div className="space-y-6 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Drag & Drop File Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-300 hover:border-red-500 bg-zinc-50 hover:bg-red-50/20 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="p-3 bg-red-100 border border-red-200 rounded-full text-red-600 shadow-sm">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 text-sm">
                      Click to upload or drag & drop CSV file
                    </p>
                    <p className="text-xs text-zinc-500 font-mono mt-1">
                      Supports .csv format up to 5,000 rows
                    </p>
                  </div>
                </div>

                {/* Instant Sample Loader Banner */}
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border border-zinc-800 rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-red-500" />
                      <h3 className="font-bold text-sm tracking-tight">Need a quick demo test?</h3>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      Instantly load 5 pre-configured enterprise hardware asset records (Dell PowerEdge, Cisco Switches, Lenovo Laptops, Palo Alto Firewalls) to test column mapping and inventory import.
                    </p>
                  </div>

                  <button
                    onClick={handleLoadSampleCsv}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs font-mono flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Load Sample Enterprise Inventory CSV</span>
                  </button>
                </div>
              </div>

              {/* Paste Raw CSV Area */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-mono text-xs">
                  <label className="font-bold text-zinc-700 uppercase tracking-wider">
                    Or Paste Raw CSV Data Text
                  </label>
                  <span className="text-zinc-500">First line must be header row</span>
                </div>
                <textarea
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  placeholder={`assetTag,name,category,manufacturer,model,serialNumber,cost\nAST-901,Dell Server,Hardware,Dell,PowerEdge R750,SN-091231,7500`}
                  rows={6}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 font-mono text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              {csvRawText.trim().length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleProcessCsvString(csvRawText, 'pasted_data.csv')}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-6 rounded-lg text-xs font-mono flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <span>Parse CSV & Proceed to Column Mapping</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 2: COLUMN MAPPING ================= */}
          {activeStep === 2 && (
            <div className="space-y-6 font-sans">
              <div className="flex justify-between items-center bg-zinc-100 p-3 border border-zinc-300 rounded-lg font-mono text-xs">
                <div>
                  <span className="font-bold text-zinc-900">Loaded File:</span>{' '}
                  <span className="text-red-600 font-bold">{fileName}</span> ({csvRows.length} Data Rows, {csvHeaders.length} Columns)
                </div>

                <div className="flex items-center space-x-2">
                  <label className="font-bold text-zinc-700">Delimiter:</label>
                  <select
                    value={delimiter}
                    onChange={(e) => {
                      setDelimiter(e.target.value);
                      handleProcessCsvString(csvRawText, fileName);
                    }}
                    className="bg-white border border-zinc-300 rounded px-2 py-1 text-xs font-bold"
                  >
                    <option value=",">Comma (,)</option>
                    <option value="\t">Tab (\t)</option>
                    <option value=";">Semicolon (;)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-zinc-900 text-sm flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-red-600" />
                  <span>Map CSV Columns to ITAM Asset Fields</span>
                </h3>

                <div className="border border-zinc-300 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-zinc-900 text-white uppercase text-[10px]">
                      <tr>
                        <th className="p-3">CSV Header Column</th>
                        <th className="p-3">Sample First Row Data</th>
                        <th className="p-3">Map To Target Field</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 bg-white">
                      {csvHeaders.map((header, idx) => {
                        const sampleVal = csvRows[0]?.[idx] || 'N/A';
                        const currentMapped = columnMapping[header] || 'ignore';

                        return (
                          <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                            <td className="p-3 font-bold text-zinc-900 flex items-center space-x-2">
                              <FileText className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{header}</span>
                            </td>
                            <td className="p-3 text-zinc-600 truncate max-w-xs font-sans">
                              {sampleVal}
                            </td>
                            <td className="p-3">
                              <select
                                value={currentMapped}
                                onChange={(e) => {
                                  setColumnMapping({
                                    ...columnMapping,
                                    [header]: e.target.value,
                                  });
                                }}
                                className={`w-full p-2 border rounded-lg text-xs font-bold focus:outline-none cursor-pointer ${
                                  currentMapped !== 'ignore'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                    : 'bg-zinc-50 border-zinc-300 text-zinc-500'
                                }`}
                              >
                                <option value="ignore">-- Skip / Ignore Column --</option>
                                {TARGET_FIELDS.map((field) => (
                                  <option key={field.key} value={field.key}>
                                    {field.label} {field.required ? '*' : ''}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold rounded-lg text-xs font-mono cursor-pointer"
                >
                  Back
                </button>

                <button
                  onClick={handleValidateAndProceed}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-6 rounded-lg text-xs font-mono flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <span>Validate Records & Preview</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: DATA VALIDATION & PREVIEW ================= */}
          {activeStep === 3 && (
            <div className="space-y-6 font-sans">
              {/* Validation Summary Bar */}
              <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center space-x-3 text-emerald-900">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-base">
                      {processedAssets.filter((a) => a.status === 'valid').length} Valid
                    </div>
                    <div className="text-[10px] text-emerald-700">Ready to commit directly</div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center space-x-3 text-amber-900">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold text-base">
                      {processedAssets.filter((a) => a.status === 'warning').length} Warnings
                    </div>
                    <div className="text-[10px] text-amber-700">Auto-resolved / suffixed</div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-100 border border-zinc-300 rounded-lg flex items-center space-x-3 text-zinc-900">
                  <Database className="w-6 h-6 text-red-600 shrink-0" />
                  <div>
                    <div className="font-bold text-base">{processedAssets.length} Total</div>
                    <div className="text-[10px] text-zinc-600">Assets queued for commit</div>
                  </div>
                </div>
              </div>

              {/* Data Table Preview */}
              <div className="space-y-2">
                <h3 className="font-bold text-zinc-900 text-sm flex items-center justify-between">
                  <span>Asset Inventory Validation Preview</span>
                  <span className="text-xs font-mono text-zinc-500">
                    Showing {processedAssets.length} parsed records
                  </span>
                </h3>

                <div className="border border-zinc-300 rounded-xl overflow-hidden shadow-sm max-h-80 overflow-y-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-zinc-900 text-white uppercase text-[10px] sticky top-0">
                      <tr>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Asset Tag</th>
                        <th className="p-2.5">Asset Name</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Make / Model</th>
                        <th className="p-2.5">Serial Number</th>
                        <th className="p-2.5 text-right">Cost ($)</th>
                        <th className="p-2.5">Validation Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 bg-white">
                      {processedAssets.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-2.5">
                            {row.status === 'valid' ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center w-fit space-x-1">
                                <Check className="w-3 h-3" />
                                <span>Valid</span>
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center w-fit space-x-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Adjusted</span>
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-bold text-zinc-900">{row.data.assetTag}</td>
                          <td className="p-2.5 text-zinc-800 font-sans font-medium">{row.data.name}</td>
                          <td className="p-2.5 text-zinc-600">{row.data.category}</td>
                          <td className="p-2.5 text-zinc-600">
                            {row.data.manufacturer} {row.data.model}
                          </td>
                          <td className="p-2.5 text-zinc-600">{row.data.serialNumber}</td>
                          <td className="p-2.5 text-right font-bold text-zinc-900">
                            ${row.data.cost ? row.data.cost.toLocaleString() : '0'}
                          </td>
                          <td className="p-2.5 text-[10px] text-zinc-500 font-sans">
                            {row.messages.length > 0 ? (
                              <span className="text-amber-700 font-mono">{row.messages.join('; ')}</span>
                            ) : (
                              <span className="text-emerald-600 font-mono">Schema OK</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold rounded-lg text-xs font-mono cursor-pointer"
                >
                  Back to Column Mapping
                </button>

                <button
                  onClick={handleExecuteImport}
                  disabled={isImporting || processedAssets.length === 0}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg text-xs font-mono flex items-center space-x-2 transition-colors cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Importing Assets ({importProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Commit & Import {processedAssets.length} Assets</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: IMPORT COMPLETED SUMMARY ================= */}
          {activeStep === 4 && (
            <div className="py-8 text-center space-y-6 font-sans">
              <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-zinc-900 tracking-tight">
                  BULK CSV IMPORT COMPLETED SUCCESSFULLY!
                </h3>
                <p className="text-xs text-zinc-600 font-mono max-w-md mx-auto">
                  Registered <span className="text-red-600 font-bold">{importedCount} new assets</span> into the KSPL ITAM platform database.
                </p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 max-w-lg mx-auto text-left font-mono text-xs space-y-2">
                <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                  <span className="text-zinc-500">Tenant Target:</span>
                  <span className="font-bold text-zinc-900">{currentTenant.name}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                  <span className="text-zinc-500">Source CSV File:</span>
                  <span className="font-bold text-zinc-900">{fileName}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                  <span className="text-zinc-500">Items Created:</span>
                  <span className="font-bold text-emerald-600">{importedCount} Records</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Audit Log Record:</span>
                  <span className="font-bold text-zinc-800">aud-bulk-{Date.now().toString().slice(-6)}</span>
                </div>
              </div>

              <div className="flex justify-center space-x-3 pt-4 font-mono text-xs">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Import Another CSV File
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-lg"
                >
                  Close & View Inventory Table
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

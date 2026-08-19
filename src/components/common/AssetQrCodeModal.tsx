import React, { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { ConfigurationItem } from '../../types';
import {
  QrCode,
  X,
  Printer,
  Download,
  Copy,
  Check,
  Tag,
  HardDrive,
  Info,
  Sliders,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  Building,
  User,
  MapPin,
  Barcode
} from 'lucide-react';

interface AssetQrCodeModalProps {
  asset: ConfigurationItem | null;
  allAssets?: ConfigurationItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset?: (asset: ConfigurationItem) => void;
}

export const AssetQrCodeModal: React.FC<AssetQrCodeModalProps> = ({
  asset,
  allAssets = [],
  isOpen,
  onClose,
  onSelectAsset,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<ConfigurationItem | null>(asset);
  const [payloadType, setPayloadType] = useState<'assetTag' | 'json' | 'url'>('assetTag');
  const [qrSize, setQrSize] = useState<number>(180);
  const [copied, setCopied] = useState<boolean>(false);
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [batchCategoryFilter, setBatchCategoryFilter] = useState<string>('all');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync prop asset if changed
  React.useEffect(() => {
    if (asset) {
      setSelectedAsset(asset);
    }
  }, [asset]);

  if (!isOpen) return null;

  const safeAllAssets = allAssets || [];

  const currentAsset = selectedAsset || safeAllAssets[0];
  if (!currentAsset && !isBatchMode) return null;

  // Compute QR Payload string
  const getQrPayload = (item: ConfigurationItem) => {
    if (payloadType === 'json') {
      return JSON.stringify({
        assetTag: item.assetTag,
        id: item.id,
        name: item.name,
        serialNumber: item.serialNumber,
        category: item.category,
        model: item.model,
        manufacturer: item.manufacturer,
        location: item.locationName,
      });
    }
    if (payloadType === 'url') {
      return `https://kspl-itam.internal/assets/${item.assetTag}`;
    }
    return item.assetTag;
  };

  const currentPayload = currentAsset ? getQrPayload(currentAsset) : '';

  // Copy to clipboard
  const handleCopyPayload = () => {
    if (!currentPayload) return;
    navigator.clipboard.writeText(currentPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download PNG
  const handleDownloadPNG = () => {
    if (!currentAsset) return;
    const canvas = document.getElementById(`qr-canvas-${currentAsset.id}`) as HTMLCanvasElement;
    if (!canvas) return;

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `QR_${currentAsset.assetTag}_${currentAsset.serialNumber}.png`;
    link.click();
  };

  // Download SVG
  const handleDownloadSVG = () => {
    if (!currentAsset) return;
    const svgElement = document.getElementById(`qr-svg-${currentAsset.id}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = svgUrl;
    link.download = `QR_${currentAsset.assetTag}.svg`;
    link.click();
  };

  // Trigger Print Label
  const handlePrint = () => {
    window.print();
  };

  const filteredBatchAssets = safeAllAssets.filter((item) => {
    if (batchCategoryFilter === 'all') return true;
    return item.category === batchCategoryFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 font-sans text-zinc-900 overflow-y-auto">
      {/* Hidden printable wrapper */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-qr-section, #printable-qr-section * {
            visibility: visible;
          }
          #printable-qr-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Modal Window */}
      <div className="bg-white border border-zinc-300 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="p-3 sm:p-4 bg-zinc-100 border-b border-zinc-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 no-print">
          <div className="flex items-start space-x-2.5">
            <div className="p-2 bg-red-600/10 border border-red-500/20 rounded-lg text-red-600 shrink-0 mt-0.5">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight flex flex-wrap items-center gap-1.5">
                <span>ASSET QR CODE & IDENTIFIER GENERATOR</span>
                <span className="bg-zinc-200 text-zinc-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-zinc-300 shrink-0">
                  ISO/IEC 18004
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-600 font-mono line-clamp-1 sm:line-clamp-none">
                Unique inventory tracking tag, high-density matrix barcode, and printable asset sticker labels
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto space-x-2 font-mono text-xs shrink-0">
            {/* Mode Switcher */}
            <div className="flex items-center bg-zinc-200 p-0.5 rounded border border-zinc-300">
              <button
                onClick={() => setIsBatchMode(false)}
                className={`px-2.5 sm:px-3 py-1 rounded text-[11px] sm:text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  !isBatchMode ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Single Asset Label
              </button>
              <button
                onClick={() => setIsBatchMode(true)}
                className={`px-2.5 sm:px-3 py-1 rounded text-[11px] sm:text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  isBatchMode ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Batch Tag Sheet ({safeAllAssets.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-lg transition-colors cursor-pointer ml-auto"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {!isBatchMode ? (
            /* ================= SINGLE ASSET QR MODE ================= */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Asset Selection & QR Controls */}
              <div className="md:col-span-5 space-y-4 sm:space-y-5 font-mono text-xs">
                {/* Asset Picker Dropdown */}
                {safeAllAssets.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-zinc-600 font-bold text-[11px] uppercase tracking-wider block">
                      Select Target Asset ({safeAllAssets.length} Total)
                    </label>
                    <select
                      value={currentAsset?.id || ''}
                      onChange={(e) => {
                        const found = safeAllAssets.find((a) => a.id === e.target.value);
                        if (found) {
                          setSelectedAsset(found);
                          if (onSelectAsset) onSelectAsset(found);
                        }
                      }}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 sm:p-2.5 text-zinc-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-zinc-400 cursor-pointer truncate"
                    >
                      {safeAllAssets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.assetTag} - {a.name} ({a.category})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Payload Type Selection */}
                <div className="space-y-1">
                  <label className="text-zinc-600 font-bold text-[11px] uppercase tracking-wider block">
                    QR Encoding Payload Format
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-300">
                    <button
                      onClick={() => setPayloadType('assetTag')}
                      className={`py-1.5 px-1 rounded text-[10px] sm:text-[11px] font-bold text-center cursor-pointer transition-colors whitespace-nowrap truncate ${
                        payloadType === 'assetTag'
                          ? 'bg-white text-zinc-900 shadow-sm border border-zinc-300'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      Asset Tag
                    </button>
                    <button
                      onClick={() => setPayloadType('json')}
                      className={`py-1.5 px-1 rounded text-[10px] sm:text-[11px] font-bold text-center cursor-pointer transition-colors whitespace-nowrap truncate ${
                        payloadType === 'json'
                          ? 'bg-white text-zinc-900 shadow-sm border border-zinc-300'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      JSON Metadata
                    </button>
                    <button
                      onClick={() => setPayloadType('url')}
                      className={`py-1.5 px-1 rounded text-[10px] sm:text-[11px] font-bold text-center cursor-pointer transition-colors whitespace-nowrap truncate ${
                        payloadType === 'url'
                          ? 'bg-white text-zinc-900 shadow-sm border border-zinc-300'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      Direct URL
                    </button>
                  </div>
                </div>

                {/* QR Size Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-600 font-bold text-[11px] uppercase tracking-wider">
                    <span>Matrix Density / Size</span>
                    <span className="text-zinc-900">{qrSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="280"
                    step="20"
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-800"
                  />
                </div>

                {/* Raw Encoded Payload Box */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-zinc-600 font-bold text-[11px] uppercase tracking-wider">
                      Encoded Payload Text
                    </label>
                    <button
                      onClick={handleCopyPayload}
                      className="text-[11px] text-zinc-700 hover:text-zinc-900 flex items-center space-x-1 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={currentPayload}
                    rows={3}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 font-mono text-[11px] text-zinc-800 focus:outline-none resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handlePrint}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-3 sm:px-4 rounded-lg flex items-center justify-center space-x-2 text-xs transition-colors cursor-pointer shadow-md"
                  >
                    <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Print Thermal Asset Sticker Tag</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleDownloadPNG}
                      className="bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 font-bold py-2 px-2 sm:px-3 rounded-lg flex items-center justify-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Download PNG</span>
                    </button>
                    <button
                      onClick={handleDownloadSVG}
                      className="bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 font-bold py-2 px-2 sm:px-3 rounded-lg flex items-center justify-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Download SVG</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Physical Asset Sticker Label Preview */}
              <div className="md:col-span-7 flex flex-col items-center justify-center bg-zinc-50 border border-zinc-300 rounded-xl p-3 sm:p-6 relative overflow-hidden max-w-full">
                <div className="text-center mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 bg-zinc-200 px-2.5 py-1 rounded border border-zinc-300">
                    Physical Sticker Label Preview
                  </span>
                </div>

                {/* Printable Asset Tag Card Container */}
                <div
                  id="printable-qr-section"
                  className="bg-white border-2 border-zinc-900 rounded-lg p-3 sm:p-5 shadow-lg max-w-full sm:max-w-md w-full font-mono text-zinc-900 space-y-3 sm:space-y-4 relative"
                >
                  {/* Tag Header */}
                  <div className="border-b-2 border-zinc-900 pb-2 flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-600 truncate">
                        PROPERTY OF ENTERPRISE ITAM
                      </div>
                      <div className="text-xs sm:text-sm font-black text-zinc-900 tracking-tight uppercase truncate">
                        {currentAsset.name}
                      </div>
                    </div>
                    <span className="bg-zinc-900 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
                      {currentAsset.category}
                    </span>
                  </div>

                  {/* Tag Body: QR Code + Asset Spec */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                    {/* SVG QR Code */}
                    <div className="bg-white p-2 border border-zinc-300 rounded flex flex-col items-center justify-center shadow-inner shrink-0 max-w-full overflow-hidden">
                      <div className="max-w-[160px] sm:max-w-none">
                        <QRCodeSVG
                          id={`qr-svg-${currentAsset.id}`}
                          value={currentPayload}
                          size={qrSize}
                          level="H"
                          includeMargin={false}
                          className="max-w-full h-auto"
                        />
                      </div>
                      {/* Hidden canvas for PNG export */}
                      <div className="hidden">
                        <QRCodeCanvas
                          id={`qr-canvas-${currentAsset.id}`}
                          value={currentPayload}
                          size={300}
                          level="H"
                        />
                      </div>
                    </div>

                    {/* Meta Specifications */}
                    <div className="flex-1 space-y-1.5 text-[11px] w-full min-w-0">
                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase font-bold">ASSET TAG NUMBER</div>
                        <div className="text-xs sm:text-sm font-black text-zinc-900 tracking-wider truncate">
                          {currentAsset.assetTag}
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase font-bold">SERIAL NUMBER</div>
                        <div className="font-bold text-zinc-800 text-[10px] truncate">
                          {currentAsset.serialNumber}
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase font-bold">MAKE & MODEL</div>
                        <div className="text-[10px] text-zinc-800 truncate">
                          {currentAsset.manufacturer} {currentAsset.model}
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase font-bold">LOCATION / OWNER</div>
                        <div className="text-[10px] text-zinc-800 truncate">
                          {currentAsset.locationName} {currentAsset.ownerUserName ? `(${currentAsset.ownerUserName})` : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barcode Visual Line Footer */}
                  <div className="border-t border-zinc-300 pt-2 flex flex-col items-center space-y-1">
                    <div className="w-full h-6 sm:h-8 bg-zinc-900 flex items-center justify-around px-2 rounded-sm overflow-hidden">
                      {/* Barcode-like visual stripes */}
                      {Array.from({ length: 36 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="h-full bg-white"
                          style={{
                            width: `${(idx % 4) + 1}px`,
                            marginRight: `${(idx % 3) + 1}px`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between w-full text-[7px] sm:text-[8px] font-bold text-zinc-500 uppercase tracking-wider gap-1 truncate">
                      <span>KSPL-ITAM-VERIFIED</span>
                      <span className="hidden sm:inline">DO NOT REMOVE TAG</span>
                      <span className="truncate">{currentAsset.assetTag}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= BATCH MULTI-LABEL PRINT MODE ================= */
            <div className="space-y-4 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-100 p-3 border border-zinc-300 rounded-lg no-print">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-zinc-700 whitespace-nowrap text-xs">Filter Category:</span>
                  <select
                    value={batchCategoryFilter}
                    onChange={(e) => setBatchCategoryFilter(e.target.value)}
                    className="bg-white border border-zinc-300 rounded px-2 py-1 font-bold text-xs focus:outline-none cursor-pointer truncate max-w-[180px]"
                  >
                    <option value="all">All Categories ({safeAllAssets.length})</option>
                    <option value="Hardware">Hardware Only</option>
                    <option value="Software">Software Licenses</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Cloud">Cloud Resources</option>
                  </select>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-2">
                  <span className="text-zinc-600 text-[11px] whitespace-nowrap">
                    Showing {filteredBatchAssets.length} Labels
                  </span>
                  <button
                    onClick={handlePrint}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-1.5 px-3 sm:px-4 rounded flex items-center space-x-1.5 cursor-pointer text-xs shrink-0"
                  >
                    <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Print Batch Sheet</span>
                  </button>
                </div>
              </div>

              {/* Printable Grid of Labels */}
              <div id="printable-qr-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredBatchAssets.map((item) => {
                  const tagPayload = getQrPayload(item);
                  return (
                    <div
                      key={item.id}
                      className="bg-white border-2 border-zinc-900 rounded-lg p-2.5 sm:p-3 shadow text-zinc-900 space-y-2 relative font-mono text-[10px]"
                    >
                      <div className="border-b border-zinc-900 pb-1 flex justify-between items-center gap-2">
                        <span className="font-black uppercase tracking-wider text-zinc-700 truncate">
                          {item.name}
                        </span>
                        <span className="bg-zinc-900 text-white text-[8px] font-bold px-1 rounded shrink-0">
                          {item.assetTag}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="bg-white p-1 border border-zinc-300 rounded shrink-0">
                          <QRCodeSVG value={tagPayload} size={70} level="M" />
                        </div>

                        <div className="flex-1 space-y-1 min-w-0">
                          <div>
                            <div className="text-[8px] text-zinc-500 font-bold">SERIAL</div>
                            <div className="font-bold text-zinc-900 truncate">{item.serialNumber}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-zinc-500 font-bold">MODEL</div>
                            <div className="text-zinc-800 truncate">{item.model}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-zinc-500 font-bold">LOCATION</div>
                            <div className="text-zinc-800 truncate">{item.locationName}</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-[7px] text-center text-zinc-500 border-t border-zinc-200 pt-1 font-bold uppercase truncate">
                        PROPERTY OF ENTERPRISE ITAM • DO NOT REMOVE
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-zinc-100 border-t border-zinc-300 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono text-xs text-zinc-600 no-print">
          <div className="flex items-center space-x-2 text-center sm:text-left">
            <Info className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="text-[10px] sm:text-xs">Compatible with Zebra, Dymo, Avery 5160, and optical scanners</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold rounded-lg transition-colors cursor-pointer text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

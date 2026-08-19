import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AssetQrCodeModal } from '../common/AssetQrCodeModal';
import {
  QrCode,
  CheckCircle2,
  PackageCheck,
  Wifi,
  WifiOff,
  Search,
  Camera,
  RefreshCw,
  X,
  HardDrive,
  Printer,
} from 'lucide-react';

export const MobileOpsModule: React.FC = () => {
  const { configurationItems, updateConfigurationItem } = useApp();

  const [scannedTag, setScannedTag] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Pick random CI or tag
      const randomCi = configurationItems[Math.floor(Math.random() * configurationItems.length)];
      if (randomCi) {
        setScannedTag(randomCi.assetTag);
        setScanResult(randomCi);
      }
      setIsScanning(false);
    }, 1200);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedTag) return;
    const found = configurationItems.find(
      (c) =>
        c.assetTag.toLowerCase() === scannedTag.toLowerCase() ||
        c.serialNumber.toLowerCase() === scannedTag.toLowerCase()
    );
    setScanResult(found || null);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 text-white font-sans max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-zinc-950 p-3 sm:p-4 border border-zinc-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-red-500" />
            <span>FIELD TECHNICIAN & STOCKROOM MOBILE OPS</span>
          </h1>
          <p className="text-zinc-400 mt-1">
            Barcode / QR Scanner Simulation, Quick Stockroom Audit, and Offline Sync Engine
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-2 rounded flex items-center space-x-1.5 border border-red-500 cursor-pointer shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Batch QR Tag Generator</span>
          </button>

          <div className="flex items-center space-x-2 bg-black p-2 border border-zinc-800 rounded">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-white font-bold">Online (Synced)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-400">Offline (2 Queued)</span>
              </>
            )}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className="ml-2 text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-white cursor-pointer"
            >
              Toggle Network
            </button>
          </div>
        </div>
      </div>

      {/* Scanner Interface Block */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 space-y-6 font-mono text-xs">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-black border-2 border-dashed border-red-500 rounded-lg mx-auto flex items-center justify-center">
            {isScanning ? (
              <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
            ) : (
              <Camera className="w-8 h-8 text-red-500" />
            )}
          </div>
          <h2 className="text-base font-bold text-white">Optical Barcode / QR Asset Tag Scanner</h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            Point camera or trigger simulator to instantly resolve CMDB record, verify lifecycle state, and execute stockroom check-in/out.
          </p>

          <button
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg border border-red-500 cursor-pointer shadow-lg transition-transform active:scale-95"
          >
            {isScanning ? 'Simulating Camera Laser Scan...' : 'Trigger Barcode Scan'}
          </button>
        </div>

        {/* Manual Asset Tag Input */}
        <form onSubmit={handleManualSearch} className="flex items-center space-x-2 max-w-md mx-auto pt-2">
          <input
            type="text"
            placeholder="Or type Asset Tag (e.g. TAG-SRV-1001)"
            value={scannedTag}
            onChange={(e) => setScannedTag(e.target.value)}
            className="flex-1 bg-black border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-red-500"
          />
          <button
            type="submit"
            className="bg-black hover:bg-zinc-900 border border-zinc-800 text-white font-bold px-4 py-2 rounded cursor-pointer"
          >
            Lookup
          </button>
        </form>

        {/* Resolved Scan Result Card */}
        {scanResult && (
          <div className="bg-black border border-red-500/50 rounded-lg p-4 space-y-4 max-w-lg mx-auto">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-2">
              <div>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  ASSET RESOLVED
                </span>
                <h3 className="text-base font-black text-white mt-1">{scanResult.name}</h3>
                <div className="text-zinc-400 text-[11px]">
                  Tag: <span className="text-white font-bold">{scanResult.assetTag}</span> | Serial: {scanResult.serialNumber}
                </div>
              </div>

              <button onClick={() => setScanResult(null)} className="text-zinc-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-zinc-300">
              <div>Class: <span className="text-white font-bold">{scanResult.ciClassName}</span></div>
              <div>State: <span className="text-red-400 font-bold">{scanResult.lifecycleState}</span></div>
              <div>Location: <span className="text-white">{scanResult.locationName}</span></div>
              <div>Owner: <span className="text-white">{scanResult.ownerUserName || 'Unassigned'}</span></div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="bg-black hover:bg-zinc-900 border border-zinc-800 text-white font-bold px-3 py-2 rounded text-center cursor-pointer flex items-center space-x-1"
                title="Print Asset QR Tag"
              >
                <QrCode className="w-3.5 h-3.5 text-red-500" />
                <span>Print QR Tag</span>
              </button>

              <button
                onClick={() => {
                  updateConfigurationItem(scanResult.id, { lifecycleState: 'In Stock' });
                  setScanResult({ ...scanResult, lifecycleState: 'In Stock' });
                }}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold py-2 rounded text-center cursor-pointer"
              >
                Mark In Stock
              </button>

              <button
                onClick={() => {
                  updateConfigurationItem(scanResult.id, { lifecycleState: 'Deployed' });
                  setScanResult({ ...scanResult, lifecycleState: 'Deployed' });
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-center border border-red-500 cursor-pointer"
              >
                Deploy Asset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <AssetQrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        asset={scanResult}
        allAssets={configurationItems}
        onSelectAsset={(a) => setScanResult(a)}
      />
    </div>
  );
};

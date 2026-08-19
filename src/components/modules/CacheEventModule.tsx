import React, { useState, useEffect } from 'react';
import {
  Database,
  Radio,
  Activity,
  Layers,
  Zap,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Lock,
  Clock,
  Shield,
  Server,
  Cpu,
  BarChart2,
  Send,
  FileText,
  Sliders,
  Box,
} from 'lucide-react';

import { RedisCacheAdapter } from '../../events/adapters/RedisCacheAdapter';
import { KafkaEventBusAdapter } from '../../events/adapters/KafkaEventBusAdapter';
import { DiscoveryEventProducer } from '../../events/producers/DiscoveryEventProducer';
import { AssetEventProducer } from '../../events/producers/AssetEventProducer';
import { TelemetryEventProducer } from '../../events/producers/TelemetryEventProducer';
import { DeadLetterQueueService } from '../../events/services/DeadLetterQueueService';
import { CacheEventTestSuite, TestResult } from '../../events/tests/CacheEventTestSuite';

import {
  RedisClusterHealth,
  KafkaClusterHealth,
  DeadLetterEventRecord,
  StandardEventEnvelope,
} from '../../events/types/cacheEventTypes';

export const CacheEventModule: React.FC = () => {
  const tenantId = 'tenant-kspl-global';

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<'redis' | 'kafka' | 'dlq' | 'simulator' | 'tests'>('redis');

  // Cluster State
  const [redisHealth, setRedisHealth] = useState<RedisClusterHealth | null>(null);
  const [kafkaHealth, setKafkaHealth] = useState<KafkaClusterHealth | null>(null);
  const [dlqEvents, setDlqEvents] = useState<DeadLetterEventRecord[]>([]);

  // Simulator State
  const [selectedEventType, setSelectedEventType] = useState<'asset.discovered' | 'asset.updated' | 'asset.retired' | 'telemetry.received'>('asset.discovered');
  const [simulatedAssetId, setSimulatedAssetId] = useState('ASSET-10025');
  const [simulationMsg, setSimulationMsg] = useState<string | null>(null);

  // Lock Simulator
  const [lockStatus, setLockStatus] = useState<string | null>(null);

  // Test Runner State
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const redisAdapter = new RedisCacheAdapter();
  const kafkaAdapter = new KafkaEventBusAdapter();

  useEffect(() => {
    loadClusterData();
  }, []);

  const loadClusterData = async () => {
    try {
      const rHealth = await redisAdapter.clusterHealth();
      const kHealth = await kafkaAdapter.clusterHealth();
      const dlqList = DeadLetterQueueService.getDeadLetterEvents(tenantId);

      setRedisHealth(rHealth);
      setKafkaHealth(kHealth);
      setDlqEvents(dlqList);
    } catch (err) {
      console.error('Cluster data load error:', err);
    }
  };

  const handleAcquireLock = async () => {
    const acquired = await redisAdapter.acquireLock({
      lockKey: 'cmdb-graph-sync',
      tenantId,
      ownerId: 'ui-admin-session-1',
      ttlMs: 10000,
    });

    if (acquired) {
      setLockStatus('Acquired lock "cmdb-graph-sync" for tenant-kspl-global (TTL 10s).');
    } else {
      setLockStatus('Lock acquisition rejected. Lock already held by another worker.');
    }
  };

  const handleReleaseLock = async () => {
    const released = await redisAdapter.releaseLock('cmdb-graph-sync', 'ui-admin-session-1', tenantId);
    if (released) {
      setLockStatus('Successfully released lock "cmdb-graph-sync".');
    } else {
      setLockStatus('Lock release failed or lock not owned by this session.');
    }
  };

  const handleInvalidateCache = async () => {
    const deleted = await redisAdapter.invalidatePrefix('asset:', tenantId);
    setSimulationMsg(`Invalidated ${deleted} cached keys with namespace "itam:${tenantId}:asset:*".`);
    loadClusterData();
  };

  const handleEmitSimulatedEvent = async () => {
    try {
      if (selectedEventType === 'asset.discovered') {
        await DiscoveryEventProducer.publishDiscoveredAsset(
          simulatedAssetId,
          'Dell Latitude 7440',
          '192.168.1.105',
          'A4:88:99:11:22:33',
          tenantId
        );
        setSimulationMsg(`Emitted 'asset.discovered' for ${simulatedAssetId} to Kafka topic 'itam.discovery.events'.`);
      } else if (selectedEventType === 'asset.updated') {
        await AssetEventProducer.publishAssetUpdated(simulatedAssetId, { status: 'IN_MAINTENANCE' }, tenantId);
        setSimulationMsg(`Emitted 'asset.updated' for ${simulatedAssetId} to Kafka topic 'itam.asset.events'.`);
      } else if (selectedEventType === 'asset.retired') {
        await AssetEventProducer.publishAssetRetired(simulatedAssetId, 'Hardware EOL Reached', tenantId);
        setSimulationMsg(`Emitted 'asset.retired' for ${simulatedAssetId} to Kafka topic 'itam.asset.events'. Triggered workflow.`);
      } else if (selectedEventType === 'telemetry.received') {
        await TelemetryEventProducer.publishTelemetryReceived(simulatedAssetId, 'cpu_usage', 88.5, tenantId);
        setSimulationMsg(`Emitted 'telemetry.received' metric for ${simulatedAssetId} to Kafka topic 'itam.telemetry.events'.`);
      }

      loadClusterData();
    } catch (err: any) {
      setSimulationMsg(`Event emission error: ${err.message}`);
    }
  };

  const handleReplayDlq = async (dlqId: string) => {
    await DeadLetterQueueService.replayDeadLetterEvent(dlqId, tenantId);
    setSimulationMsg(`Replayed failed event DLQ record ID: ${dlqId}.`);
    loadClusterData();
  };

  const handleDiscardDlq = async (dlqId: string) => {
    await DeadLetterQueueService.discardDeadLetterEvent(dlqId, tenantId);
    setSimulationMsg(`Discarded DLQ record ID: ${dlqId}.`);
    loadClusterData();
  };

  const handleRunTests = async () => {
    const results = await CacheEventTestSuite.runAllTests(tenantId);
    setTestResults(results);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-white font-sans bg-black min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-950 p-4 border border-zinc-800 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-600 rounded border border-red-500 shadow-sm">
            <Radio className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight font-mono">
                ITAM CACHE & EVENT STREAMING LAYER
              </h1>
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border border-red-500">
                REDIS 7.2 + KAFKA 3.6
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              High-Speed Application Cache • Distributed Locks • Rate Limiting • Event Streaming • Idempotent Consumers • DLQ
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-black p-1 border border-zinc-800 rounded font-mono text-xs overflow-x-auto">
          {[
            { id: 'redis', label: 'Redis Cache', icon: Database },
            { id: 'kafka', label: 'Kafka Event Bus', icon: Radio },
            { id: 'dlq', label: 'Dead Letter Queue', icon: AlertTriangle },
            { id: 'simulator', label: 'Producer Simulator', icon: Send },
            { id: 'tests', label: 'Test Suite', icon: Play },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                  isActive ? 'bg-red-600 text-white font-bold border border-red-500' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Status Bar */}
      <div className="bg-zinc-950 p-3 border border-zinc-800 rounded-lg flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-2">
        <div className="flex items-center space-x-3 text-zinc-400">
          <span className="flex items-center space-x-1">
            <Database className="w-3.5 h-3.5 text-red-500" />
            <span>Redis Cache Engine:</span>
            <strong className="text-white">ONLINE ({redisHealth?.hitRatePercentage}% Hit Rate)</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="flex items-center space-x-1">
            <Radio className="w-3.5 h-3.5 text-blue-500" />
            <span>Kafka Event Broker:</span>
            <strong className="text-white">ONLINE ({kafkaHealth?.activeTopicsCount} Topics)</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Tenant Namespacing: <strong className="text-green-400">Enforced (itam:{tenantId}:*)</strong></span>
        </div>
      </div>

      {/* TAB 1: REDIS CACHE */}
      {activeTab === 'redis' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Redis Metrics KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold">Cache Hit Rate</span>
              <div className="text-2xl font-black text-green-400">{redisHealth?.hitRatePercentage}%</div>
              <div className="text-[10px] text-zinc-400">Sub-millisecond Latency</div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold">Connected Clients</span>
              <div className="text-2xl font-black text-white">{redisHealth?.connectedClients}</div>
              <div className="text-[10px] text-zinc-400">Worker Connection Pool</div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold">Memory Usage</span>
              <div className="text-2xl font-black text-blue-400">
                {redisHealth ? Math.round(redisHealth.usedMemoryBytes / 1024) : 0} <span className="text-xs text-zinc-500 font-normal">KB</span>
              </div>
              <div className="text-[10px] text-zinc-400">Max 512 MB Limit</div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold">Active Namespaces</span>
              <div className="text-2xl font-black text-red-400">{redisHealth?.activeNamespacesCount}</div>
              <div className="text-[10px] text-zinc-400">Tenant Isolated Keys</div>
            </div>
          </div>

          {/* Redis Controls Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distributed Lock Manager */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-red-500" />
                <span>REDIS DISTRIBUTED LOCK MANAGER</span>
              </h3>

              <div className="space-y-2">
                <p className="text-zinc-400 text-[11px]">
                  Prevents race conditions & duplicate execution during scheduled CMDB graph sync or reconciliation jobs.
                </p>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={handleAcquireLock}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded cursor-pointer"
                  >
                    Acquire Lock
                  </button>
                  <button
                    onClick={handleReleaseLock}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-3 py-1.5 rounded cursor-pointer"
                  >
                    Release Lock
                  </button>
                </div>

                {lockStatus && (
                  <div className="p-2.5 bg-black border border-zinc-800 rounded text-zinc-200 text-[11px]">
                    {lockStatus}
                  </div>
                )}
              </div>
            </div>

            {/* Cache Invalidation Control */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
                <Trash2 className="w-4 h-4 text-amber-500" />
                <span>EVENT-BASED CACHE INVALIDATION</span>
              </h3>

              <div className="space-y-2">
                <p className="text-zinc-400 text-[11px]">
                  Flushes stale namespaced cache entries when assets or CIs are modified.
                </p>

                <button
                  onClick={handleInvalidateCache}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded cursor-pointer"
                >
                  Invalidate Asset Cache Prefix
                </button>

                {simulationMsg && (
                  <div className="p-2.5 bg-black border border-zinc-800 rounded text-green-400 text-[11px]">
                    {simulationMsg}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KAFKA EVENT BUS */}
      {activeTab === 'kafka' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Active Topics */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
              <Radio className="w-4 h-4 text-blue-500" />
              <span>KAFKA 3.6 TOPICS & CONSUMER GROUPS ORCHESTRATION</span>
            </h3>

            <div className="space-y-2">
              {[
                { name: 'itam.discovery.events', partitions: 4, consumers: 'DiscoveryEventConsumer', desc: 'High-volume subnet scan & agent discovery streams' },
                { name: 'itam.asset.events', partitions: 4, consumers: 'AssetEventConsumer', desc: 'Asset state changes, updates & retirement triggers' },
                { name: 'itam.telemetry.events', partitions: 8, consumers: 'TelemetryEventConsumer', desc: 'Time-series telemetry metric point ingestion' },
                { name: 'itam.workflow.events', partitions: 2, consumers: 'WorkflowEventConsumer', desc: 'Automated ITSM and disposal workflow triggers' },
              ].map((topic, idx) => (
                <div key={idx} className="p-3 bg-black border border-zinc-800 rounded flex items-center justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span>{topic.name}</span>
                    </div>
                    <div className="text-zinc-400 text-[10px] mt-0.5">{topic.desc}</div>
                  </div>

                  <div className="flex items-center space-x-4 text-zinc-400">
                    <span>Partitions: <strong className="text-white">{topic.partitions}</strong></span>
                    <span>Group: <strong className="text-blue-400">{topic.consumers}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEAD LETTER QUEUE */}
      {activeTab === 'dlq' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="font-bold text-white text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>DEAD LETTER QUEUE (DLQ) FAILED EVENT STORE</span>
            </h3>

            <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold">
              {dlqEvents.filter((d) => d.status === 'QUEUED').length} Unhandled Failures
            </span>
          </div>

          <div className="space-y-3">
            {dlqEvents.map((dlq) => (
              <div key={dlq.dlqId} className="p-4 bg-black border border-zinc-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${dlq.status === 'QUEUED' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                      {dlq.status}
                    </span>
                    <span className="font-bold text-white">{dlq.originalEvent.eventType}</span>
                  </div>

                  <span className="text-zinc-500 text-[10px]">Consumer: {dlq.failedConsumerName}</span>
                </div>

                <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded text-red-400 text-[11px]">
                  <strong>Failure Reason:</strong> {dlq.failureReason}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-500 text-[10px]">Attempts: {dlq.attemptCount} | Event ID: {dlq.originalEvent.eventId}</span>

                  {dlq.status === 'QUEUED' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReplayDlq(dlq.dlqId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded cursor-pointer text-[10px]"
                      >
                        Replay Event
                      </button>
                      <button
                        onClick={() => handleDiscardDlq(dlq.dlqId)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-3 py-1 rounded cursor-pointer text-[10px]"
                      >
                        Discard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCER SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center space-x-2">
            <Send className="w-4 h-4 text-red-500" />
            <span>KAFKA EVENT PRODUCER & SIMULATION TOOL</span>
          </h3>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-zinc-400">Event Type:</span>
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value as any)}
                  className="bg-black text-white border border-zinc-800 rounded px-3 py-1.5 text-xs focus:outline-none"
                >
                  <option value="asset.discovered">asset.discovered</option>
                  <option value="asset.updated">asset.updated</option>
                  <option value="asset.retired">asset.retired</option>
                  <option value="telemetry.received">telemetry.received</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-zinc-400">Target Asset ID:</span>
                <input
                  type="text"
                  value={simulatedAssetId}
                  onChange={(e) => setSimulatedAssetId(e.target.value)}
                  className="bg-black text-white border border-zinc-800 rounded px-3 py-1.5 text-xs w-36 focus:outline-none"
                />
              </div>

              <button
                onClick={handleEmitSimulatedEvent}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded cursor-pointer w-full sm:w-auto"
              >
                Emit Kafka Event
              </button>
            </div>

            {simulationMsg && (
              <div className="p-3 bg-black border border-zinc-800 rounded text-green-400 text-xs">
                {simulationMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: TEST SUITE */}
      {activeTab === 'tests' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="font-bold text-white text-xs flex items-center space-x-2">
              <Play className="w-4 h-4 text-red-500" />
              <span>AUTOMATED CACHE & EVENT LAYER TEST SUITE</span>
            </h3>

            <button
              onClick={handleRunTests}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded border border-red-500 cursor-pointer"
            >
              Run All 7 Tests
            </button>
          </div>

          <div className="space-y-2">
            {testResults.map((t, idx) => (
              <div key={idx} className="p-3 bg-black border border-zinc-800 rounded flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{t.testName}</div>
                  <div className="text-zinc-400 text-[10px]">{t.message}</div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-zinc-500 text-[10px]">{t.durationMs}ms</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${t.passed ? 'bg-red-600 text-white' : 'bg-zinc-800 text-red-400'}`}>
                    {t.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            ))}

            {testResults.length === 0 && (
              <div className="text-zinc-500 text-center py-8">Click "Run All 7 Tests" to verify Redis, Kafka, Idempotency & DLQ layer.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * AI-Driven CI Relationship Suggester & Network Topology Inference Engine
 * Analyzes Server Naming Conventions, IP Subnet Proximity, and Architectural Tiers
 * to automatically propose logical 'connects-to', 'depends-on', and 'runs-on' relationships.
 */

import { GoogleGenAI } from '@google/genai';

export interface CiSuggestionInput {
  id: string;
  name: string;
  ciClassId?: string;
  ciClassName?: string;
  category?: string;
  ipAddress?: string;
  locationId?: string;
  locationName?: string;
  departmentName?: string;
  manufacturer?: string;
  model?: string;
}

export interface ExistingRelationshipInput {
  id?: string;
  sourceCiId: string;
  targetCiId: string;
  type?: string;
  relationshipType?: string;
}

export interface CiRelationshipProposal {
  id: string;
  sourceCiId: string;
  sourceCiName: string;
  sourceCiClass: string;
  sourceCiCategory: string;
  sourceIp: string;

  targetCiId: string;
  targetCiName: string;
  targetCiClass: string;
  targetCiCategory: string;
  targetIp: string;

  relationshipType: 'connects_to' | 'depends_on' | 'runs_on' | 'hosted_by';
  confidenceScore: number; // 0 - 100
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  
  reasoning: string;
  detectionEvidence: {
    namingPatternMatch: string;
    networkProximity: string;
    architecturalRole: string;
    subnetDelta?: number;
  };
  suggestedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

/**
 * Calculate IPv4 octet distance and subnet matching
 */
function evaluateNetworkProximity(ipA?: string, ipB?: string): { isSameSubnet: boolean; isAdjacentSubnet: boolean; delta: number; label: string } {
  if (!ipA || !ipB) {
    return { isSameSubnet: false, isAdjacentSubnet: false, delta: 999, label: 'Unspecified IP / DHCP' };
  }

  const partsA = ipA.trim().split('.').map(Number);
  const partsB = ipB.trim().split('.').map(Number);

  if (partsA.length !== 4 || partsB.length !== 4 || partsA.some(isNaN) || partsB.some(isNaN)) {
    return { isSameSubnet: false, isAdjacentSubnet: false, delta: 999, label: 'Non-IPv4 / Hostname' };
  }

  const sameCidr24 = partsA[0] === partsB[0] && partsA[1] === partsB[1] && partsA[2] === partsB[2];
  const sameCidr16 = partsA[0] === partsB[0] && partsA[1] === partsB[1];
  const delta = Math.abs(partsA[3] - partsB[3]);

  if (sameCidr24) {
    return {
      isSameSubnet: true,
      isAdjacentSubnet: false,
      delta,
      label: `Same Subnet (${partsA[0]}.${partsA[1]}.${partsA[2]}.0/24, Δ ${delta} IPs)`,
    };
  } else if (sameCidr16 && Math.abs(partsA[2] - partsB[2]) <= 2) {
    return {
      isSameSubnet: false,
      isAdjacentSubnet: true,
      delta: Math.abs(partsA[2] - partsB[2]) * 256 + delta,
      label: `Adjacent VLAN Subnets (${partsA[0]}.${partsA[1]}.${partsA[2]}.0/24 ↔ ${partsB[0]}.${partsB[1]}.${partsB[2]}.0/24)`,
    };
  }

  return {
    isSameSubnet: false,
    isAdjacentSubnet: false,
    delta: 999,
    label: `Routable WAN / Remote Subnets (${partsA[0]}.${partsA[1]}.x.x ↔ ${partsB[0]}.${partsB[1]}.x.x)`,
  };
}

/**
 * Heuristic Pattern Engine for Server Naming Conventions
 */
export function analyzeServerNamingAndTopology(
  cis: CiSuggestionInput[],
  existingRels: ExistingRelationshipInput[] = []
): CiRelationshipProposal[] {
  const proposals: CiRelationshipProposal[] = [];
  const existingSet = new Set<string>();

  existingRels.forEach((r) => {
    existingSet.add(`${r.sourceCiId}:${r.targetCiId}`);
    existingSet.add(`${r.targetCiId}:${r.sourceCiId}`); // bi-directional suppression for already linked items
  });

  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Compare every pair of CIs
  for (let i = 0; i < cis.length; i++) {
    for (let j = 0; j < cis.length; j++) {
      if (i === j) continue;

      const source = cis[i];
      const target = cis[j];

      // Skip if already related
      const relKey = `${source.id}:${target.id}`;
      if (existingSet.has(relKey)) continue;

      const sName = (source.name || '').toLowerCase();
      const tName = (target.name || '').toLowerCase();
      const sClass = (source.ciClassName || source.category || '').toLowerCase();
      const tClass = (target.ciClassName || target.category || '').toLowerCase();
      const net = evaluateNetworkProximity(source.ipAddress, target.ipAddress);

      let matched = false;
      let relType: 'connects_to' | 'depends_on' | 'runs_on' | 'hosted_by' = 'connects_to';
      let confidence = 50;
      let reason = '';
      let namingMatch = '';
      let roleDesc = '';

      // PATTERN 1: Web / Frontend connects to Application / Backend
      const isWebSource = /web|frontend|fe-|ui-|portal|ingress|nginx|apache|http/i.test(sName);
      const isAppTarget = /app|backend|api|srv|service|worker|microservice|core/i.test(tName);
      if (isWebSource && isAppTarget && !/db|database|sql/i.test(tName)) {
        matched = true;
        relType = 'connects_to';
        confidence = 88;
        namingMatch = `Prefix Match: [${source.name}] (Web Tier) → [${target.name}] (App Tier)`;
        roleDesc = 'Multi-Tier Web Ingress to Application Gateway Flow';
        reason = `Server naming convention demonstrates that Web Frontend '${source.name}' routes client traffic to Application Service '${target.name}'.`;
      }

      // PATTERN 2: App / API / Microservice depends on Database
      const isAppSource = /app|backend|api|srv|service|worker|microservice|auth|payment|order/i.test(sName);
      const isDbTarget = /db|database|postgres|mysql|oracle|mongo|redis|sql|mssql|cassandra/i.test(tName) || /database/i.test(tClass);
      if (!matched && isAppSource && isDbTarget) {
        matched = true;
        relType = 'depends_on';
        confidence = 94;
        namingMatch = `Tier Dependency: [${source.name}] (App Tier) → [${target.name}] (Database Tier)`;
        roleDesc = 'Transactional Data Persistence & Storage Dependency';
        reason = `Application Server '${source.name}' logically queries and persists state to Database cluster node '${target.name}'.`;
      }

      // PATTERN 3: App / Microservice depends on Redis / Memcached / Cache
      const isCacheTarget = /redis|cache|memcached|valkey/i.test(tName);
      if (!matched && isAppSource && isCacheTarget) {
        matched = true;
        relType = 'depends_on';
        confidence = 91;
        namingMatch = `Caching Layer: [${source.name}] → [${target.name}] (Redis/Cache)`;
        roleDesc = 'High-Speed In-Memory Caching & Session Storage';
        reason = `Service '${source.name}' connects to in-memory caching instance '${target.name}' for low-latency session and query caching.`;
      }

      // PATTERN 4: Load Balancer / Reverse Proxy connects to Web / App nodes
      const isLbSource = /lb|alb|nlb|haproxy|f5|traefik|loadbalancer/i.test(sName);
      const isNodeTarget = /web|app|srv|node|vm/i.test(tName);
      if (!matched && isLbSource && isNodeTarget) {
        matched = true;
        relType = 'connects_to';
        confidence = 96;
        namingMatch = `Load Balancer Target: [${source.name}] → [${target.name}]`;
        roleDesc = 'Upstream Load Balancer Pool Distribution';
        reason = `Load Balancer '${source.name}' distributes inbound requests across pool member '${target.name}'.`;
      }

      // PATTERN 5: Kubernetes Worker Node connects to Master / Control Plane
      const isK8sWorker = /k8s-node|k8s-worker|worker-\d+|kube-node/i.test(sName);
      const isK8sMaster = /k8s-master|k8s-control|control-plane|kube-master/i.test(tName);
      if (!matched && isK8sWorker && isK8sMaster) {
        matched = true;
        relType = 'connects_to';
        confidence = 97;
        namingMatch = `Kubernetes Topology: [${source.name}] (Node) → [${target.name}] (Control Plane)`;
        roleDesc = 'Kubernetes Kubelet API & Control Plane Communication';
        reason = `Kubernetes worker agent '${source.name}' registers and reports pod state to API control plane '${target.name}'.`;
      }

      // PATTERN 6: Virtual Machine / Container runs on Hypervisor
      const isVmSource = /vm-|guest|container|pod|docker|vhost/i.test(sName);
      const isHypervisorTarget = /esxi|hyperv|proxmox|kvm|host-node|vsphere|hypervisor/i.test(tName) || /hypervisor/i.test(tClass);
      if (!matched && isVmSource && isHypervisorTarget) {
        matched = true;
        relType = 'runs_on';
        confidence = 95;
        namingMatch = `Hypervisor Virtualization: [${source.name}] (VM) → [${target.name}] (Host)`;
        roleDesc = 'Virtual Compute Workload Hosted on Physical Hypervisor';
        reason = `Virtual Machine instance '${source.name}' runs on hypervisor host '${target.name}'.`;
      }

      // PATTERN 7: Network Switch / ToR Switch connects to Server / Storage
      const isSwitchSource = /switch|sw-|tor-|cisco|arista|juniper/i.test(sName) || /switch|router|network/i.test(sClass);
      const isServerTarget = /srv|server|db|storage|san|nas|node/i.test(tName);
      if (!matched && isSwitchSource && isServerTarget) {
        matched = true;
        relType = 'connects_to';
        confidence = 92;
        namingMatch = `Top-of-Rack Fabric: [${source.name}] (Switch) → [${target.name}] (Host)`;
        roleDesc = 'Physical Layer 2/3 Ethernet Port Trunking';
        reason = `Access Switch '${source.name}' provides uplinks and network access to server '${target.name}'.`;
      }

      // PATTERN 8: Enterprise Domain & Directory Service Dependency (Active Directory / LDAP / DNS)
      const isDirectoryTarget = /dc-|ad-|ldap|dns|activedirectory|domaincontroller/i.test(tName);
      if (!matched && (isAppSource || isWebSource) && isDirectoryTarget) {
        matched = true;
        relType = 'depends_on';
        confidence = 89;
        namingMatch = `Identity / Domain Dependency: [${source.name}] → [${target.name}] (Directory/DNS)`;
        roleDesc = 'Domain Authentication & Name Resolution Service';
        reason = `Server '${source.name}' relies on Domain Controller / DNS server '${target.name}' for Kerberos/LDAP identity and host resolution.`;
      }

      // PATTERN 9: Matching Environment & Subsystem Cluster Prefix (e.g. `prod-crm-app01` and `prod-crm-db01`)
      if (!matched) {
        const sPrefix = sName.split(/[-_.]/)[0];
        const tPrefix = tName.split(/[-_.]/)[0];
        const sMiddle = sName.split(/[-_.]/)[1];
        const tMiddle = tName.split(/[-_.]/)[1];

        if (sPrefix && tPrefix && sPrefix === tPrefix && sPrefix.length >= 3 && sMiddle && tMiddle && sMiddle === tMiddle) {
          matched = true;
          relType = 'connects_to';
          confidence = 82;
          namingMatch = `Cluster Namespace Match: '${sPrefix}-${sMiddle}-*'`;
          roleDesc = 'Collocated Subsystem Service Cluster Pair';
          reason = `Servers '${source.name}' and '${target.name}' share identical service namespace prefix '${sPrefix}-${sMiddle}' indicating intra-cluster connectivity.`;
        }
      }

      // If matched, apply Network Proximity Score Adjustments
      if (matched) {
        if (net.isSameSubnet) {
          confidence = Math.min(99, confidence + 6);
          reason += ` Confirmed via high network proximity on subnet ${net.label}.`;
        } else if (net.isAdjacentSubnet) {
          confidence = Math.min(96, confidence + 3);
          reason += ` Confirmed via adjacent VLAN network proximity: ${net.label}.`;
        }

        // Same location boost
        if (source.locationId && target.locationId && source.locationId === target.locationId) {
          confidence = Math.min(99, confidence + 2);
        }

        const confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' =
          confidence >= 85 ? 'HIGH' : confidence >= 70 ? 'MEDIUM' : 'LOW';

        proposals.push({
          id: `prop-${Date.now()}-${i}-${j}`,
          sourceCiId: source.id,
          sourceCiName: source.name,
          sourceCiClass: source.ciClassName || source.category || 'Enterprise Server',
          sourceCiCategory: source.category || 'Hardware',
          sourceIp: source.ipAddress || '10.20.4.' + (10 + i),

          targetCiId: target.id,
          targetCiName: target.name,
          targetCiClass: target.ciClassName || target.category || 'Enterprise Server',
          targetCiCategory: target.category || 'Hardware',
          targetIp: target.ipAddress || '10.20.4.' + (20 + j),

          relationshipType: relType,
          confidenceScore: confidence,
          confidenceLevel,
          reasoning: reason,
          detectionEvidence: {
            namingPatternMatch: namingMatch,
            networkProximity: net.label,
            architecturalRole: roleDesc,
            subnetDelta: net.delta !== 999 ? net.delta : undefined,
          },
          suggestedAt: now,
          status: 'PENDING',
        });
      }
    }
  }

  // Sort descending by confidence
  return proposals.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Hybrid AI Suggester with optional Gemini inference fallback
 */
export async function generateAiCiRelationshipSuggestions(
  cis: CiSuggestionInput[],
  existingRels: ExistingRelationshipInput[] = []
): Promise<CiRelationshipProposal[]> {
  // First run deterministic heuristic AI pattern analyzer
  const heuristicProposals = analyzeServerNamingAndTopology(cis, existingRels);

  // If Gemini API key is available, we can augment with deep LLM insights
  if (process.env.GEMINI_API_KEY && cis.length > 1) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a Principal Enterprise CMDB Architect.
Analyze the following server inventory list (Hostnames, IPs, Classes):
${JSON.stringify(
  cis.slice(0, 15).map((c) => ({ id: c.id, name: c.name, ip: c.ipAddress, class: c.ciClassName, category: c.category })),
  null,
  2
)}

Existing Relationships:
${JSON.stringify(
  existingRels.slice(0, 10).map((r) => ({ source: r.sourceCiId, target: r.targetCiId, type: r.relationshipType || r.type })),
  null,
  2
)}

Propose any additional high-confidence logical relationships (connects_to, depends_on, runs_on) between these assets based on naming conventions and IP proximity.
Return purely a valid JSON array of objects matching:
[
  {
    "sourceCiId": string,
    "targetCiId": string,
    "relationshipType": "connects_to" | "depends_on" | "runs_on",
    "confidenceScore": number (70-98),
    "reasoning": string
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any, idx: number) => {
            const sCi = cis.find((c) => c.id === item.sourceCiId);
            const tCi = cis.find((c) => c.id === item.targetCiId);
            if (sCi && tCi && sCi.id !== tCi.id) {
              const alreadyExists = heuristicProposals.some(
                (p) => p.sourceCiId === sCi.id && p.targetCiId === tCi.id
              );
              if (!alreadyExists) {
                const net = evaluateNetworkProximity(sCi.ipAddress, tCi.ipAddress);
                heuristicProposals.push({
                  id: `prop-gemini-${Date.now()}-${idx}`,
                  sourceCiId: sCi.id,
                  sourceCiName: sCi.name,
                  sourceCiClass: sCi.ciClassName || sCi.category || 'Enterprise Server',
                  sourceCiCategory: sCi.category || 'Hardware',
                  sourceIp: sCi.ipAddress || '10.20.4.10',
                  targetCiId: tCi.id,
                  targetCiName: tCi.name,
                  targetCiClass: tCi.ciClassName || tCi.category || 'Enterprise Server',
                  targetCiCategory: tCi.category || 'Hardware',
                  targetIp: tCi.ipAddress || '10.20.4.15',
                  relationshipType: item.relationshipType || 'connects_to',
                  confidenceScore: item.confidenceScore || 86,
                  confidenceLevel: item.confidenceScore >= 85 ? 'HIGH' : 'MEDIUM',
                  reasoning: item.reasoning || `Gemini AI inferred semantic connectivity between ${sCi.name} and ${tCi.name}.`,
                  detectionEvidence: {
                    namingPatternMatch: `Gemini Semantic Reasoning: [${sCi.name}] → [${tCi.name}]`,
                    networkProximity: net.label,
                    architecturalRole: 'AI Model Inferred Application Topology',
                  },
                  suggestedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  status: 'PENDING',
                });
              }
            }
          });
        }
      }
    } catch (err) {
      console.warn('Gemini API relationship inference fallback to local AI heuristics:', err);
    }
  }

  return heuristicProposals.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

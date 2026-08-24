import crypto from 'crypto';
import { normalizeMacAddress, normalizeSerialNumber } from './discoveryIdentity';
type Observation = Record<string, unknown> & { id: string; tenantId: string; timestamp: string; sourceMethod: string; hostname?: string; serialNumber?: string; macAddress?: string; rawAttributes: Record<string, unknown> };
type Job = { id: string; tenantId: string; targetCidr: string; protocols: string[]; status: 'PENDING'|'RUNNING'|'COMPLETED'|'COMPLETED_WITH_ERRORS'|'FAILED'|'CANCELLED'; startTime: string; devicesScanned: number; devicesFound: number; newCis: number; updatedCis: number; logs: string[] };
const jobs = new Map<string, Job>(); const observations = new Map<string, Observation>(); const agents = new Map<string, Record<string, unknown>>(); const enrollment = new Map<string, { tenantId: string; expiresAt: number; revoked: boolean }>();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
const now = () => new Date().toISOString();
export const issueEnrollmentToken = (tenantId: string) => { const token = crypto.randomBytes(32).toString('base64url'); enrollment.set(token, { tenantId, expiresAt: Date.now() + 15 * 60_000, revoked: false }); return token; };
export const validateEnrollmentToken = (token?: string, tenantId?: string) => { const e = token && enrollment.get(token); return !!e && !e.revoked && e.expiresAt > Date.now() && (!tenantId || e.tenantId === tenantId); };
export const executeAgentlessSweep = (o: { cidr: string; protocols: string[]; tenantId?: string; credentialsRef?: string }) => { if (!o.tenantId) throw new Error('Tenant context is required'); const record: Job = { id: id('scan'), tenantId: o.tenantId, targetCidr: o.cidr, protocols: o.protocols, status: 'PENDING', startTime: now(), devicesScanned: 0, devicesFound: 0, newCis: 0, updatedCis: 0, logs: ['[DISCOVERY] Scan queued; awaiting an enrolled scanner upload.'] }; jobs.set(record.id, record); return record; };
export const getDiscoveryResults = (tenantId?: string) => [...observations.values()].filter(x => !tenantId || x.tenantId === tenantId);
export const getDiscoveryJobs = (tenantId?: string) => [...jobs.values()].filter(x => !tenantId || x.tenantId === tenantId);
export const getEndpointAgents = (tenantId?: string) => [...agents.values()].filter(x => !tenantId || x.tenantId === tenantId);
export const testAgentlessIp = (_ip?: string, _protocols?: string[]) => ({ success: false, error: 'Browser/API probes are disabled. Run connectivity checks from an enrolled scanner.' });
export const ingestAgentHeartbeat = (payload: any) => {
  const tenantId = payload.tenantId || payload.tenant_id;
  const hardware = payload.hardware || {};
  const operatingSystem = payload.operating_system || {};
  const primaryNetwork = Array.isArray(payload.network) ? payload.network.find((entry: any) => entry?.ip_addresses?.length) || payload.network[0] : {};
  const os = payload.osType || payload.os_type || operatingSystem.name;
  if (!tenantId || !payload.hostname || !os) throw new Error('tenantId, hostname and osType are required');

  const normalized = {
    ...payload,
    tenantId,
    osType: os,
    osName: payload.osName || operatingSystem.name,
    osVersion: payload.osVersion || operatingSystem.version,
    agentId: payload.agentId || payload.agent_id,
    serialNumber: normalizeSerialNumber(payload.serialNumber || payload.serial_number || hardware.serial_number),
    manufacturer: payload.manufacturer || hardware.manufacturer,
    model: payload.model || hardware.model,
    systemUuid: payload.systemUuid || payload.system_uuid || hardware.system_uuid,
    cpuModel: payload.cpuModel || payload.cpu_model || hardware.cpu_model,
    cpuCores: payload.cpuCores || payload.cpu_cores || hardware.cpu_cores,
    memoryTotalGb: payload.memoryTotalGb || (payload.memoryTotalBytes ? Number((payload.memoryTotalBytes / 1073741824).toFixed(2)) : hardware.ram_total_bytes ? Number((hardware.ram_total_bytes / 1073741824).toFixed(2)) : undefined),
    diskTotalGb: payload.diskTotalGb || (payload.diskTotalBytes ? Number((payload.diskTotalBytes / 1073741824).toFixed(2)) : hardware.disk_total_bytes ? Number((hardware.disk_total_bytes / 1073741824).toFixed(2)) : undefined),
    installedSoftware: payload.installedSoftware || payload.software || [],
    installedSoftwareCount: payload.installedSoftwareCount || payload.installedSoftware?.length || payload.software?.length || 0,
    ipAddress: payload.ipAddress || primaryNetwork?.ip_addresses?.find((ip: string) => !ip.includes(':')),
    macAddress: normalizeMacAddress(payload.macAddress || primaryNetwork?.mac_address),
    rawAttributes: payload,
  };
  const agentId = normalized.agentId || id('agent');
  const observation: Observation = { ...normalized, id: id('observation'), tenantId, timestamp: now(), sourceMethod: 'Endpoint Agent', rawAttributes: payload };
  observations.set(observation.id, observation);
  agents.set(agentId, { ...normalized, agentId, tenantId, lastHeartbeat: now(), status: 'ONLINE' });
  return { success: true, agentId, candidateId: observation.id, candidate: observation };
};
export const ingestScannerResult = (tenantId: string, scanId: string, result: any) => { const job = jobs.get(scanId); if (!job || job.tenantId !== tenantId) throw new Error('Scan not found for tenant'); const observation: Observation = { ...result, serialNumber: normalizeSerialNumber(result.serialNumber || result.serial_number), macAddress: normalizeMacAddress(result.macAddress || result.mac_address), id: id('observation'), tenantId, timestamp: now(), sourceMethod: result.sourceMethod || 'Agentless Network', rawAttributes: result.rawAttributes || result }; observations.set(observation.id, observation); job.status = result.error ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED'; job.devicesScanned++; if (!result.error) job.devicesFound++; job.logs.push(`[DISCOVERY] target=${String(result.ipAddress || result.target || 'unknown')} status=${result.error ? 'ERROR' : 'SUCCESS'}`); return observation; };
/** Generates a self-contained collector.  It reports success only after the API accepts the inventory. */
export const generateWindowsPowerShellScript = (serverUrl = '', enrollmentToken = '', tenantId = 'tenant-client-1') => `<# KSPL ITAM Windows Discovery Agent #>
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$ServerUrl = '${serverUrl.replace(/'/g, "''").replace(/\/$/, '')}'
$EnrollmentToken = '${enrollmentToken.replace(/'/g, "''")}'
$TenantId = '${tenantId.replace(/'/g, "''")}'
if ([string]::IsNullOrWhiteSpace($ServerUrl) -or [string]::IsNullOrWhiteSpace($EnrollmentToken)) {
  throw 'This agent must be downloaded from KSPL after generating an enrollment token.'
}

Write-Host 'KSPL ITAM Windows Endpoint Discovery Agent' -ForegroundColor Cyan
Write-Host '[1/4] Collecting operating system, hardware, disk, and network inventory...'
$os = Get-CimInstance Win32_OperatingSystem
$computer = Get-CimInstance Win32_ComputerSystem
$bios = Get-CimInstance Win32_BIOS
$computerProduct = Get-CimInstance Win32_ComputerSystemProduct
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$disks = @(Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3')
$adapter = Get-CimInstance Win32_NetworkAdapterConfiguration -Filter 'IPEnabled=True' | Select-Object -First 1

Write-Host '[2/4] Reading installed software registries...'
$registryPaths = @(
  'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
  'HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
  'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
)
$software = @($registryPaths |
  ForEach-Object { Get-ItemProperty $_ -ErrorAction SilentlyContinue } |
  Where-Object { $_.DisplayName } |
  ForEach-Object {
    # Registry uninstall entries do not consistently expose every optional
    # property.  Read their property bag so strict error handling cannot stop
    # the entire endpoint collector on a missing InstallDate/Version/Publisher.
    $props = $_.PSObject.Properties
    @{
      name = $props['DisplayName'].Value
      version = if ($props['DisplayVersion']) { $props['DisplayVersion'].Value } else { $null }
      publisher = if ($props['Publisher']) { $props['Publisher'].Value } else { $null }
      installDate = if ($props['InstallDate']) { $props['InstallDate'].Value } else { $null }
    }
  } |
  Sort-Object name -Unique
)
$totalDisk = [math]::Round((($disks | Measure-Object -Property Size -Sum).Sum / 1GB), 2)
$freeDisk = [math]::Round((($disks | Measure-Object -Property FreeSpace -Sum).Sum / 1GB), 2)
$totalRam = [math]::Round($computer.TotalPhysicalMemory / 1GB, 2)
$freeRam = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
$serialNumber = if ($bios.SerialNumber -and $bios.SerialNumber -notmatch '^(Default String|To Be Filled By O\.E\.M\.|None|Unknown)$') { $bios.SerialNumber.Trim() } elseif ($computerProduct.IdentifyingNumber -and $computerProduct.IdentifyingNumber -notmatch '^(Default String|To Be Filled By O\.E\.M\.|None|Unknown)$') { $computerProduct.IdentifyingNumber.Trim() } else { $null }
$payload = @{
  tenantId = $TenantId; agentId = "win-$($bios.SerialNumber)-$env:COMPUTERNAME"; hostname = $env:COMPUTERNAME
  osType = 'Windows'; osName = $os.Caption; osVersion = "$($os.Version) (Build $($os.BuildNumber))"
  serialNumber = $serialNumber; systemUuid = $computerProduct.UUID; manufacturer = $computer.Manufacturer; model = $computer.Model
  ipAddress = @($adapter.IPAddress | Where-Object { $_ -notlike '*:*' } | Select-Object -First 1)[0]; macAddress = $adapter.MACAddress
  cpuModel = $cpu.Name; cpuCores = $cpu.NumberOfCores; memoryTotalGb = $totalRam
  memoryUsagePct = if ($totalRam) { [math]::Round((($totalRam - $freeRam) / $totalRam) * 100, 1) } else { 0 }
  diskTotalGb = $totalDisk; diskFreeGb = $freeDisk; installedSoftware = $software; installedSoftwareCount = $software.Count
  agentVersion = '2.5.1-windows'; collectedAt = (Get-Date).ToUniversalTime().ToString('o')
}
Write-Host "[3/4] Sending $($software.Count) installed applications and hardware inventory to $ServerUrl..."
$headers = @{ 'X-Agent-Enrollment-Token' = $EnrollmentToken; 'Content-Type' = 'application/json' }
try {
  if (-not (Test-NetConnection -ComputerName ([uri]$ServerUrl).Host -Port ([uri]$ServerUrl).Port -InformationLevel Quiet -WarningAction SilentlyContinue)) {
    throw "Cannot reach KSPL at $ServerUrl. Connect to the organisation network/VPN and confirm that the server firewall permits TCP port $([uri]$ServerUrl).Port."
  }
  $response = Invoke-RestMethod -Uri "$ServerUrl/api/discovery/agent/heartbeat" -Method Post -Headers $headers -Body ($payload | ConvertTo-Json -Depth 6) -TimeoutSec 30
  if (-not $response.success) { throw 'The server did not confirm inventory ingestion.' }
  Write-Host "[4/4] SUCCESS: Inventory accepted. Agent ID: $($response.agentId); Candidate ID: $($response.candidateId)" -ForegroundColor Green
} catch {
  Write-Error "Inventory was not accepted by KSPL: $($_.Exception.Message)"
  exit 1
}
`;
export const generateLinuxBashScript = (serverUrl = '', enrollmentToken = '', tenantId = 'tenant-client-1') => `#!/usr/bin/env bash
# KSPL ITAM Linux Discovery Agent — collects local machine facts only.
set -euo pipefail
SERVER_URL='${serverUrl.replace(/'/g, "'\\''").replace(/\/$/, '')}'
ENROLLMENT_TOKEN='${enrollmentToken.replace(/'/g, "'\\''")}'
TENANT_ID='${tenantId.replace(/'/g, "'\\''")}'
[ -n "$SERVER_URL" ] && [ -n "$ENROLLMENT_TOKEN" ] || { echo 'Missing enrollment configuration.' >&2; exit 1; }
json_escape() { sed -e 's/\\\\/\\\\\\\\/g' -e 's/"/\\\\"/g' -e ':a;N;$!ba;s/\\n/\\\\n/g'; }
read_os() { . /etc/os-release 2>/dev/null || true; printf '%s' "\${PRETTY_NAME:-\$(uname -s)}"; }
first_ipv4() { ip -4 -o addr show scope global 2>/dev/null | awk 'NR==1 {split($4,a,"/"); print a[1]}'; }
first_mac() { ip -o link show 2>/dev/null | awk '/link\/ether/ {print $17; exit}'; }
HOSTNAME=$(hostname -f 2>/dev/null || hostname)
SERIAL=$(cat /sys/class/dmi/id/product_serial 2>/dev/null || true)
MANUFACTURER=$(cat /sys/class/dmi/id/sys_vendor 2>/dev/null || true)
MODEL=$(cat /sys/class/dmi/id/product_name 2>/dev/null || true)
UUID=$(cat /sys/class/dmi/id/product_uuid 2>/dev/null || true)
OS_NAME=$(read_os); OS_VERSION=$(uname -r); IP=$(first_ipv4); MAC=$(first_mac)
CPU=$(lscpu 2>/dev/null | awk -F: '/Model name/ {gsub(/^ +/,"",$2); print $2; exit}')
CORES=$(nproc 2>/dev/null || echo 0); RAM_BYTES=$(awk '/MemTotal/ {print $2*1024}' /proc/meminfo 2>/dev/null || echo 0)
DISK_BYTES=$(lsblk -bdn -o SIZE,TYPE 2>/dev/null | awk '$2=="disk" {sum+=$1} END {print sum+0}')
SOFTWARE=$( (command -v dpkg-query >/dev/null && dpkg-query -W -f='\${binary:Package} \${Version}\\n' 2>/dev/null || rpm -qa 2>/dev/null || true) | head -n 500 | while IFS= read -r x; do printf '"%s",' "$(printf '%s' "$x" | json_escape)"; done | sed 's/,$//')
PAYLOAD=$(printf '{"tenantId":"%s","agentId":"linux-%s","hostname":"%s","osType":"Linux","osName":"%s","osVersion":"%s","serialNumber":"%s","systemUuid":"%s","manufacturer":"%s","model":"%s","ipAddress":"%s","macAddress":"%s","cpuModel":"%s","cpuCores":%s,"memoryTotalBytes":%s,"diskTotalBytes":%s,"installedSoftware":[%s],"collectedAt":"%s"}' \
  "$TENANT_ID" "$(hostname | json_escape)" "$(printf '%s' "$HOSTNAME" | json_escape)" "$(printf '%s' "$OS_NAME" | json_escape)" "$(printf '%s' "$OS_VERSION" | json_escape)" "$(printf '%s' "$SERIAL" | json_escape)" "$(printf '%s' "$UUID" | json_escape)" "$(printf '%s' "$MANUFACTURER" | json_escape)" "$(printf '%s' "$MODEL" | json_escape)" "$IP" "$MAC" "$(printf '%s' "$CPU" | json_escape)" "$CORES" "$RAM_BYTES" "$DISK_BYTES" "$SOFTWARE" "$(date -u +%Y-%m-%dT%H:%M:%SZ)")
curl --fail --silent --show-error --connect-timeout 15 -X POST "$SERVER_URL/api/discovery/agent/heartbeat" -H 'Content-Type: application/json' -H "X-Agent-Enrollment-Token: $ENROLLMENT_TOKEN" --data "$PAYLOAD"
`;

export const generateMacOsScript = (serverUrl = '', enrollmentToken = '', tenantId = 'tenant-client-1') => `#!/bin/bash
# KSPL ITAM macOS Discovery Agent — collects local machine facts only.
set -euo pipefail
SERVER_URL='${serverUrl.replace(/'/g, "'\\''").replace(/\/$/, '')}'
ENROLLMENT_TOKEN='${enrollmentToken.replace(/'/g, "'\\''")}'
TENANT_ID='${tenantId.replace(/'/g, "'\\''")}'
[ -n "$SERVER_URL" ] && [ -n "$ENROLLMENT_TOKEN" ] || { echo 'Missing enrollment configuration.' >&2; exit 1; }
escape() { /usr/bin/sed -e 's/\\\\/\\\\\\\\/g' -e 's/"/\\\\"/g'; }
HOSTNAME=$(scutil --get ComputerName 2>/dev/null || hostname)
SERIAL=$(system_profiler SPHardwareDataType 2>/dev/null | awk -F': ' '/Serial Number/ {print $2; exit}')
MODEL=$(sysctl -n hw.model); OS_NAME=$(sw_vers -productName); OS_VERSION=$(sw_vers -productVersion)
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)
MAC=$(networksetup -getmacaddress en0 2>/dev/null | awk '{print $3}' || true)
CPU=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || sysctl -n machdep.cpu.brand_string 2>/dev/null || true)
CORES=$(sysctl -n hw.physicalcpu); RAM=$(sysctl -n hw.memsize); DISK=$(df -k / | awk 'NR==2 {print $2*1024}')
PAYLOAD=$(printf '{"tenantId":"%s","agentId":"mac-%s","hostname":"%s","osType":"macOS","osName":"%s","osVersion":"%s","serialNumber":"%s","manufacturer":"Apple","model":"%s","ipAddress":"%s","macAddress":"%s","cpuModel":"%s","cpuCores":%s,"memoryTotalBytes":%s,"diskTotalBytes":%s,"collectedAt":"%s"}' "$TENANT_ID" "$(hostname)" "$(printf '%s' "$HOSTNAME" | escape)" "$OS_NAME" "$OS_VERSION" "$SERIAL" "$MODEL" "$IP" "$MAC" "$(printf '%s' "$CPU" | escape)" "$CORES" "$RAM" "$DISK" "$(date -u +%Y-%m-%dT%H:%M:%SZ)")
curl --fail --silent --show-error --connect-timeout 15 -X POST "$SERVER_URL/api/discovery/agent/heartbeat" -H 'Content-Type: application/json' -H "X-Agent-Enrollment-Token: $ENROLLMENT_TOKEN" --data "$PAYLOAD"
`;
export const generateIosMobileConfig = (_serverUrl = '') => '<!-- Enroll through your MDM integration; no inventory is fabricated. -->';

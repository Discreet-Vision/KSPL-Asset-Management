import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { extractSnmpSerialNumber, normalizeMacAddress } from './discoveryIdentity';

const execFileAsync = promisify(execFile);

type SnmpValue = { type: string; value: string };
type PrinterSupply = { id: string; description: string; type?: string; level?: number; maxCapacity?: number; remainingPct?: number };

export type PrinterSnmpPoll = {
  telemetry: Record<string, unknown>;
  rawOids: Record<string, SnmpValue>;
  observations: number;
  warning?: string;
};

const isIpv4 = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.split('.').length === 4 &&
  value.split('.').every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);

const getOidValue = (oids: Record<string, SnmpValue>, oid: string) => oids[oid]?.value?.trim();

function getSnmpManufacturer(systemDescription?: string, systemObjectId?: string): string | undefined {
  if (/\bHP\b|Hewlett[- ]Packard/i.test(systemDescription || '') || /^1\.3\.6\.1\.4\.1\.11(?:\.|$)/.test(systemObjectId || '')) return 'HP';
  if (/\bXerox\b/i.test(systemDescription || '')) return 'Xerox';
  if (/\bRicoh\b/i.test(systemDescription || '')) return 'Ricoh';
  if (/\bBrother\b/i.test(systemDescription || '')) return 'Brother';
  if (/\bEpson\b/i.test(systemDescription || '')) return 'Epson';
  return undefined;
}

function parsePrinterDescription(systemDescription?: string) {
  const parts = systemDescription?.split(';').map((part) => part.trim()).filter(Boolean) || [];
  const model = parts[0];
  const firmwareVersion = parts.find((part) => /^V[\d.]+/i.test(part))?.match(/^([^\s]+)/)?.[1];
  const engineFirmwareVersion = parts.find((part) => /^Engine\s/i.test(part));
  const nicFirmwareVersion = parts.find((part) => /^NIC\s/i.test(part));
  return {
    model,
    firmwareVersion,
    engineFirmwareVersion,
    nicFirmwareVersion,
  };
}

/** Maps standard Printer-MIB prtMarkerSupplies table rows into display-safe data. */
function extractPrinterSupplies(oids: Record<string, SnmpValue>): PrinterSupply[] {
  const rows = new Map<string, Partial<PrinterSupply>>();
  for (const [oid, observation] of Object.entries(oids)) {
    const match = oid.match(/^\.1\.3\.6\.1\.2\.1\.43\.11\.1\.1\.([4-9])\.(\d+)\.(\d+)$/);
    if (!match) continue;
    const [, column, deviceIndex, supplyIndex] = match;
    const id = `${deviceIndex}.${supplyIndex}`;
    const row = rows.get(id) || { id };
    const numeric = Number(observation.value);
    if (column === '5') row.type = observation.value;
    if (column === '6') row.description = observation.value;
    if (column === '8' && Number.isFinite(numeric)) row.maxCapacity = numeric;
    if (column === '9' && Number.isFinite(numeric)) row.level = numeric;
    rows.set(id, row);
  }
  return [...rows.values()].map((row) => ({
    id: row.id!,
    description: row.description || `Supply ${row.id}`,
    ...(row.type ? { type: row.type } : {}),
    ...(row.level !== undefined ? { level: row.level } : {}),
    ...(row.maxCapacity !== undefined ? { maxCapacity: row.maxCapacity } : {}),
    ...(row.level !== undefined && row.maxCapacity && row.level >= 0 && row.maxCapacity > 0
      ? { remainingPct: Math.max(0, Math.min(100, Math.round((row.level / row.maxCapacity) * 100))) }
      : {}),
  }));
}

/**
 * Resolve the SNMP walk executable path.
 * Priority: SNMPWALK_PATH env → bundled ../SnmpWalk/snmpwalk.exe → system PATH (snmpwalk / snmpwalk.exe).
 */
function resolveSnmpExecutable(): string {
  // 1. Explicit env override
  if (process.env.SNMPWALK_PATH) {
    const p = process.env.SNMPWALK_PATH;
    if (fs.existsSync(p)) return p;
    throw new Error(`SNMPWALK_PATH is set to "${p}" but that file does not exist.`);
  }

  // 2. Bundled path next to project
  const bundled = path.resolve(process.cwd(), '..', 'SnmpWalk', 'snmpwalk.exe');
  if (fs.existsSync(bundled)) return bundled;

  // 3. System PATH lookup
  const candidates = process.platform === 'win32' ? ['snmpwalk.exe', 'snmpwalk'] : ['snmpwalk'];
  const searchDirs = process.env.PATH?.split(path.delimiter) || [];
  for (const name of candidates) {
    for (const dir of searchDirs) {
      const full = path.join(dir, name);
      if (fs.existsSync(full)) return full;
    }
  }

  throw new Error(
    'SNMP walk executable not found. Install snmpwalk (e.g. Net-SNMP) and set SNMPWALK_PATH to its location, ' +
    'or place snmpwalk.exe in the ../SnmpWalk/ directory relative to the project root.'
  );
}

/**
 * Detects whether the executable at `executable` is (most likely) the
 * proprietary "OID=,Type=,Value=" style tool or a standard Net-SNMP style
 * binary, based on the filename only (best-effort, used only to choose the
 * right CLI flags — output parsing itself is format-agnostic, see below).
 */
function isCustomWindowsTool(executable: string): boolean {
  const base = path.basename(executable).toLowerCase();
  return base === 'snmpwalk.exe' && executable.toLowerCase().includes(`${path.sep}snmpwalk${path.sep}`.toLowerCase());
}

/**
 * Parses SNMP walk output into a map of OID -> { type, value }.
 * Supports two common output shapes:
 *
 *   1. Custom/Windows-tool style:
 *      OID=.1.3.6.1.2.1.1.1.0, Type=OctetString, Value=HP LaserJet
 *
 *   2. Standard Net-SNMP style:
 *      iso.3.6.1.2.1.1.1.0 = STRING: "HP LaserJet"
 *      SNMPv2-MIB::sysDescr.0 = STRING: "HP LaserJet"
 *
 * Net-SNMP's "iso." prefix is normalized to a leading dot ("."), and
 * "SNMPv2-MIB::name.N" style names are left as-is under their symbolic key
 * since we can't reliably map every symbolic name back to a numeric OID
 * without a full MIB database.
 */
function parseSnmpOutput(stdout: string): Record<string, SnmpValue> {
  const rawOids: Record<string, SnmpValue> = {};

  // SnmpSoft may print a complete walk on one physical line.  Parse each
  // OID record instead of assuming a newline between observations.
  const customRecordRe = /OID=([^,]+),\s*Type=([^,]+),\s*Value=(.*?)(?=\s+OID=|$)/gi;
  // e.g. `iso.3.6.1.2.1.1.1.0 = STRING: "HP LaserJet"` or
  //      `SNMPv2-MIB::sysDescr.0 = STRING: "HP LaserJet"` or
  //      `IF-MIB::ifPhysAddress.1 = Hex-STRING: 00 1B 63 84 45 E6`
  const netSnmpLineRe = /^([^\s=]+)\s*=\s*([A-Za-z][\w-]*)\s*:\s*(.*)$/;

  for (const rawLine of stdout.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const customRecords = [...line.matchAll(customRecordRe)];
    if (customRecords.length) {
      for (const record of customRecords) {
        rawOids[record[1].trim()] = { type: record[2].trim(), value: record[3].trim() };
      }
      continue;
    }

    const netSnmpMatch = line.match(netSnmpLineRe);
    if (netSnmpMatch) {
      let oid = netSnmpMatch[1].trim();
      // Normalize numeric "iso.3.6.1..." to dotted-numeric ".3.6.1..."
      if (oid.toLowerCase().startsWith('iso.')) {
        oid = `.${oid.slice(4)}`;
      }
      let value = netSnmpMatch[3].trim();
      // Strip surrounding quotes Net-SNMP adds around STRING values.
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      rawOids[oid] = { type: netSnmpMatch[2].trim(), value };
      continue;
    }
  }

  return rawOids;
}

/**
 * Runs the administrator-installed SNMP client on the local network, never in
 * a browser. The executable path and credentials are configurable via env;
 * no SNMP credentials or device values are kept in source code.
 */
export async function pollPrinterSnmp(ipAddress: unknown): Promise<PrinterSnmpPoll> {
  if (!isIpv4(ipAddress)) throw new Error('A valid IPv4 printer address is required.');

  const executable = resolveSnmpExecutable();
  const version = process.env.SNMP_VERSION || '1';
  const timeoutSeconds = process.env.SNMP_TIMEOUT_SECONDS || '15';
  const community = process.env.SNMP_COMMUNITY || 'public';

  const useCustomFlags = isCustomWindowsTool(executable);
  const args = useCustomFlags
    ? [
        `-r:${ipAddress}`,
        `-v:${version}`,
        `-t:${timeoutSeconds}`,
        ...(version === '1' || version === '2c' ? [`-c:${community}`] : []),
      ]
    : [
        // Standard Net-SNMP flags: -O n forces numeric OIDs so output is
        // easier to parse and matches the dotted-numeric format elsewhere
        // in this module.
        '-O', 'n',
        `-v`, version,
        `-t`, timeoutSeconds,
        ...(version === '1' || version === '2c' ? ['-c', community] : []),
        ipAddress,
        '.1', // walk from the root of the MIB tree
      ];

  let stdout = '';
  let stderr = '';
  try {
    ({ stdout, stderr } = await execFileAsync(executable, args, {
      windowsHide: true,
      timeout: (Number(timeoutSeconds) + 5) * 1000,
      maxBuffer: 2 * 1024 * 1024,
    }));
  } catch (error: any) {
    // Some SNMP tools emit useful partial walk output before timing out.
    stdout = String(error?.stdout || '');
    stderr = String(error?.stderr || error?.message || '');
  }

  const rawOids = parseSnmpOutput(stdout);
  const observations = Object.keys(rawOids).length;

  if (!observations) {
    const detail = stderr.trim() ? ` ${stderr.trim()}` : '';
    throw new Error(
      `SNMP returned no observations for ${ipAddress}.${detail} ` +
      `Check that the device at ${ipAddress} has SNMP enabled and the community string "${community}" is correct. ` +
      `If the device responded but this error persists, the SNMP tool's output format may not be recognized — ` +
      `raw stdout was: ${stdout.slice(0, 500) || '(empty)'}`
    );
  }

  const systemDescription =
    getOidValue(rawOids, '.1.3.6.1.2.1.1.1.0') ?? getOidValue(rawOids, 'SNMPv2-MIB::sysDescr.0');
  const systemObjectId =
    getOidValue(rawOids, '.1.3.6.1.2.1.1.2.0') ?? getOidValue(rawOids, 'SNMPv2-MIB::sysObjectID.0');
  const manufacturer = getSnmpManufacturer(systemDescription, systemObjectId);
  const printerIdentity = parsePrinterDescription(systemDescription);
  const supplies = extractPrinterSupplies(rawOids);
  const supplyPercent = (pattern: RegExp) => supplies.find((supply) => pattern.test(supply.description))?.remainingPct;
  const serialNumber = extractSnmpSerialNumber(rawOids, systemDescription);
  const macRaw =
    getOidValue(rawOids, '.1.3.6.1.2.1.2.2.1.6.1') ?? getOidValue(rawOids, 'IF-MIB::ifPhysAddress.1');
  const mac = normalizeMacAddress(macRaw);
  const linkSpeed =
    getOidValue(rawOids, '.1.3.6.1.2.1.2.2.1.5.1') ?? getOidValue(rawOids, 'IF-MIB::ifSpeed.1');
  const hostname = getOidValue(rawOids, '.1.3.6.1.2.1.1.5.0') ?? getOidValue(rawOids, 'SNMPv2-MIB::sysName.0');
  const totalPages =
    getOidValue(rawOids, '.1.3.6.1.2.1.43.10.2.1.4.1.1') ??
    getOidValue(rawOids, 'Printer-MIB::prtMarkerLifeCount.1.1');
  const printerMibObservations = Object.entries(rawOids)
    .filter(([oid]) => oid.startsWith('.1.3.6.1.2.1.43.'))
    .map(([oid, observation]) => ({ oid, type: observation.type, value: observation.value }));

  // Printer-MIB standard OIDs. Values are populated only if the device returns
  // them; vendor-specific counters remain available in rawOids for mapping.
  const telemetry: Record<string, unknown> = {
    snmp: { oids: rawOids, systemDescription },
    // sysDescr is the device-reported platform/model description.  Preserve it
    // separately so the CMDB can create a useful hardware record even when a
    // vendor does not expose a serial number through SNMP.
    ...(systemDescription ? { systemDescription } : {}),
    ...(printerIdentity.model ? { model: printerIdentity.model } : {}),
    ...(printerIdentity.firmwareVersion ? { firmwareVersion: printerIdentity.firmwareVersion } : {}),
    ...(printerIdentity.engineFirmwareVersion ? { engineFirmwareVersion: printerIdentity.engineFirmwareVersion } : {}),
    ...(printerIdentity.nicFirmwareVersion ? { nicFirmwareVersion: printerIdentity.nicFirmwareVersion } : {}),
    ...(manufacturer ? { manufacturer } : {}),
    ...(serialNumber ? { 'S/N': serialNumber, serialNumber } : {}),
    ...(hostname ? { hostname } : {}),
    ...(mac ? { macAddress: mac } : {}),
    ...(linkSpeed ? { linkSpeedBps: Number(linkSpeed) || linkSpeed } : {}),
    ...(totalPages ? { totalPagesPrinted: totalPages } : {}),
    ...(supplies.length ? { snmpConsumables: supplies } : {}),
    ...(printerMibObservations.length ? { snmpPrinterMibObservations: printerMibObservations } : {}),
    ...(supplyPercent(/\bblack\b|\bmono(?:chrome)?\b|\btoner\b/i) !== undefined ? { tonerBlackLevelPct: supplyPercent(/\bblack\b|\bmono(?:chrome)?\b|\btoner\b/i) } : {}),
    ...(supplyPercent(/\bcyan\b/i) !== undefined ? { tonerCyanLevelPct: supplyPercent(/\bcyan\b/i) } : {}),
    ...(supplyPercent(/\bmagenta\b/i) !== undefined ? { tonerMagentaLevelPct: supplyPercent(/\bmagenta\b/i) } : {}),
    ...(supplyPercent(/\byellow\b/i) !== undefined ? { tonerYellowLevelPct: supplyPercent(/\byellow\b/i) } : {}),
    ...(supplyPercent(/\bdrum\b|photoconductor/i) !== undefined ? { drumUnitLifePct: supplyPercent(/\bdrum\b|photoconductor/i) } : {}),
    ...(supplyPercent(/\bfuser\b/i) !== undefined ? { fuserLifePct: supplyPercent(/\bfuser\b/i) } : {}),
  };

  return {
    telemetry,
    rawOids,
    observations,
    ...(stdout.includes('%Failed to get value') || /No Such (Object|Instance)/i.test(stdout)
      ? { warning: 'The device returned a partial SNMP walk; returned OIDs were saved.' }
      : {}),
  };
}

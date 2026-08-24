/**
 * Identity values collected by discovery are untrusted input.  In particular,
 * an interface MAC address must never be promoted to a hardware serial number.
 */
const PLACEHOLDER_SERIAL = /^(?:default string|to be filled by o\.?e\.?m\.?|none|unknown|not specified|system serial number)$/i;
const MAC_ADDRESS = /^(?:[0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i;
const MAC_WITHOUT_SEPARATORS = /^[0-9a-f]{12}$/i;
const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export function normalizeMacAddress(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const raw = value.trim().replace(/^0x/i, '');
  const compact = raw.replace(/[.\s:-]/g, '');
  if (!MAC_ADDRESS.test(raw) && !MAC_WITHOUT_SEPARATORS.test(compact)) return undefined;
  return compact.match(/.{2}/g)?.join(':').toUpperCase();
}

export function normalizeSerialNumber(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const serial = value.trim().replace(/^['\"]|['\"]$/g, '');
  if (!serial || serial.length > 128 || PLACEHOLDER_SERIAL.test(serial)) return undefined;
  if (/\b(?:hardware\s+)?mac(?:\s+address)?\b/i.test(serial)) return undefined;
  if (normalizeMacAddress(serial) || MAC_WITHOUT_SEPARATORS.test(serial) || UUID.test(serial)) return undefined;
  if (!/^[\x20-\x7E]+$/.test(serial)) return undefined;
  return serial;
}

type SnmpValue = { type: string; value: string };

/** Returns a serial only from serial-bearing OIDs or an explicit S/N label. */
export function extractSnmpSerialNumber(oids: Record<string, SnmpValue>, systemDescription?: string): string | undefined {
  const preferredOids = [
    '.1.3.6.1.2.1.43.5.1.1.17.1', // Printer-MIB::prtGeneralSerialNumber.1
    'Printer-MIB::prtGeneralSerialNumber.1',
  ];
  for (const oid of preferredOids) {
    const serial = normalizeSerialNumber(oids[oid]?.value);
    if (serial) return serial;
  }

  // ENTITY-MIB entPhysicalSerialNum values are the standard source for
  // switches, routers and servers.  Any populated physical component can be
  // returned, but only the serial value itself is accepted.
  for (const [oid, item] of Object.entries(oids)) {
    if (/^(?:\.1\.3\.6\.1\.2\.1\.47\.1\.1\.1\.1\.11\.\d+|ENTITY-MIB::entPhysicalSerialNum\.\d+)$/i.test(oid)) {
      const serial = normalizeSerialNumber(item.value);
      if (serial) return serial;
    }
  }

  // A system description is a fallback only when the device explicitly calls
  // the value a serial number; never infer a serial from arbitrary text.
  const labeled = typeof systemDescription === 'string'
    // Many printers, including HP Laser MFP devices, publish `S/N ABC123`
    // rather than `S/N: ABC123`.  The value is still explicitly labelled,
    // so whitespace is a valid separator here.
    ? systemDescription.match(/\b(?:serial\s*(?:number|no\.?|#)?|s\/?n)\s*(?:[:=#]\s*|\s+)([^;,\s]+)/i)?.[1]
    : undefined;
  return normalizeSerialNumber(labeled);
}

import assert from 'node:assert/strict';
import { extractSnmpSerialNumber, normalizeMacAddress, normalizeSerialNumber } from './discoveryIdentity';

assert.equal(normalizeSerialNumber('C0:18:03:A2:F5:DB'), undefined);
assert.equal(normalizeSerialNumber('Hardware MAC Address: C0:18:03:A2:F5:DB'), undefined);
assert.equal(normalizeSerialNumber('CN-0X9812-3001'), 'CN-0X9812-3001');
assert.equal(normalizeMacAddress('c0-18-03-a2-f5-db'), 'C0:18:03:A2:F5:DB');
assert.equal(extractSnmpSerialNumber({
  '.1.3.6.1.2.1.43.5.1.1.17.1': { type: 'STRING', value: 'VNB3A12345' },
  '.1.3.6.1.2.1.2.2.1.6.1': { type: 'Hex-STRING', value: 'C0 18 03 A2 F5 DB' },
}), 'VNB3A12345');
assert.equal(extractSnmpSerialNumber({
  '.1.3.6.1.2.1.2.2.1.6.1': { type: 'Hex-STRING', value: 'C0 18 03 A2 F5 DB' },
}, 'Hardware MAC Address: C0:18:03:A2:F5:DB'), undefined);
assert.equal(extractSnmpSerialNumber({}, 'HP Laser MFP 131; S/N INBFR2G00J'), 'INBFR2G00J');

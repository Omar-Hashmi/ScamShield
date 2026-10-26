const test = require('node:test');
const assert = require('node:assert/strict');
process.env.JWT_SECRET = 'test-secret';

const { buildSubmission, detectInputType, validateText, validateUrl, validatePhone, isBlockedHost } = require('../src/validators/scanValidators');
const { sniffImage } = require('../src/utils/fileSignature');
const { normalizeResult } = require('../src/services/analysisClient');

const rejects = (fn, field) => assert.throws(fn, (e) => e.name === 'ValidationError' && field in e.fieldErrors);

test('detects input type', () => {
  assert.equal(detectInputType({ phone: '+92 300 1234567' }), 'phone');
  assert.equal(detectInputType({ text: 'bit.ly/abc123' }), 'url');
  assert.equal(detectInputType({ text: 'Your account is blocked, send OTP now' }), 'text');
  assert.equal(detectInputType({ inputType: 'text' }), 'text');
  assert.equal(detectInputType({}, { path: 'x' }), 'image');
  rejects(() => detectInputType({ inputType: 'image' }), 'image');
  rejects(() => detectInputType({ inputType: 'banana' }), 'inputType');
  rejects(() => detectInputType({ inputType: 'text' }, { path: 'x' }), 'inputType');
});

test('text validation', () => {
  assert.equal(validateText('  hello scam \u0000 ').payload.text, 'hello scam');
  rejects(() => validateText('  '), 'text');
  rejects(() => validateText('a'.repeat(5001)), 'text');
  assert.ok(validateText('x'.repeat(200)).label.endsWith('…'));
});

test('url validation', () => {
  assert.equal(validateUrl('bit.ly/abc').payload.scheme_assumed, true);
  assert.equal(validateUrl('https://example.com/a?b=1').payload.hostname, 'example.com');
  assert.equal(validateUrl('hxxps://evil[.]com/login').payload.hostname, 'evil.com');
  assert.equal(validateUrl('https://paypal.com@evil.example/x').payload.has_credentials, true);
  assert.equal(validateUrl('https://xn--pypal-4ve.com').payload.is_punycode, true);
  assert.equal(validateUrl('https://paypal.com@evil.example/x').content.includes('paypal.com@'), false);
  for (const bad of ['', 'javascript:alert(1)', 'ftp://example.com', 'file:///etc/passwd', 'http://localhost:3000',
    'http://127.0.0.1/', 'http://192.168.1.5/', 'http://[::1]/', 'http://2130706433/', 'http://intranet/', 'two words.com'])
    rejects(() => validateUrl(bad), 'url');
  assert.equal(isBlockedHost('8.8.8.8'), false);
});

test('phone validation', () => {
  const p = validatePhone('0300 1234567');
  assert.equal(p.payload.e164, '+923001234567');
  assert.equal(p.payload.country, 'PK');
  assert.equal(validatePhone('+1 (415) 555-2671').payload.country, 'US');
  assert.equal(validatePhone('8484').payload.kind, 'short_code');
  assert.ok(!p.label.includes('123456'));
  for (const bad of ['', 'abc', '12', '+999', '1234567890123456789012345678901234']) rejects(() => validatePhone(bad), 'phone');
});

test('image signatures', () => {
  assert.equal(sniffImage(Buffer.from('89504e470d0a1a0a0000', 'hex')), 'image/png');
  assert.equal(sniffImage(Buffer.from('ffd8ffe000104a46', 'hex')), 'image/jpeg');
  assert.equal(sniffImage(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 ')])), 'image/webp');
  assert.equal(sniffImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')), null);
  assert.equal(sniffImage(Buffer.from('GIF89a......')), null);
});

test('normalizeResult bounds untrusted output', () => {
  const r = normalizeResult({ verdict: 'scam', risk_score: 140.4, confidence: 2, reasons: ['a', 5, 'b'], extracted_text: 'secret' });
  assert.deepEqual([r.verdict, r.riskScore, r.confidence, r.reasons], ['scam', 100, 1, ['a', 'b']]);
  assert.equal('extracted_text' in r, false);
  assert.equal(normalizeResult({ verdict: 'hax' }).verdict, 'unknown');
  assert.equal(normalizeResult({}).riskScore, null);
});

test('buildSubmission follows auto-detected type and hashes without storing raw values', async () => {
  const a = await buildSubmission({ text: 'bit.ly/abc' });
  assert.equal(a.inputType, 'url');
  const b = await buildSubmission({ inputType: 'phone', phone: '+92 300 1234567' });
  assert.equal(b.inputType, 'phone');
  assert.match(b.hash, /^[0-9a-f]{64}$/);
  assert.equal(b.hash.includes('923001234567'), false);
  assert.equal(a.hashSource, undefined);
});

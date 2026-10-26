const net = require('net');
const { parsePhoneNumberFromString } = require('libphonenumber-js/min');
const cfg = require('../config/scanConfig');
const { fail } = require('./errors');
const { hashString, hashFile } = require('../utils/hash');
const { sniffImageFile } = require('../utils/fileSignature');

const INPUT_TYPES = ['text', 'url', 'image', 'phone'];

// ---------------------------------------------------------------- type detection
// Uses the client's `inputType` when it is valid, otherwise works it out from what was sent.
function detectInputType(body = {}, file) {
  const declared = String(body.inputType || '').toLowerCase();

  if (file) {
    if (declared && declared !== 'auto' && declared !== 'image') {
      fail('inputType', 'A screenshot was attached, but the submission type is not "image".');
    }
    return 'image';
  }
  if (declared === 'image') fail('image', 'Please attach a screenshot to scan.');
  if (INPUT_TYPES.includes(declared)) return declared;
  if (declared && declared !== 'auto') fail('inputType', 'Unknown submission type.');

  // auto-detect from the single value sent
  const value = String(body.text ?? body.url ?? body.phone ?? body.content ?? '').trim();
  if (/^[+()\d\s.-]{3,24}$/.test(value) && (value.match(/\d/g) || []).length >= 3) return 'phone';
  if (!/\s/.test(value) && (/^(https?|hxxps?):\/\//i.test(value) || /^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(value))) return 'url';
  return 'text';
}

// ---------------------------------------------------------------- text
function validateText(raw) {
  // eslint-disable-next-line no-control-regex
  const text = String(raw ?? '').normalize('NFC').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  if (text.length < cfg.minTextLength) fail('text', `Please paste at least ${cfg.minTextLength} characters of the message.`);
  if (text.length > cfg.maxTextLength) fail('text', `That message is too long. The limit is ${cfg.maxTextLength} characters.`);

  return {
    inputType: 'text',
    payload: { text },
    label: text.replace(/\s+/g, ' ').slice(0, 60) + (text.length > 60 ? '…' : ''),
    length: text.length,
    hashSource: text,
    content: text,
    meta: {},
  };
}

// ---------------------------------------------------------------- URL
function isBlockedHost(host) {
  const h = host.replace(/^\[|\]$/g, '').toLowerCase();
  if (h === 'localhost' || /\.(localhost|local|internal|lan|home\.arpa)$/.test(h)) return true;
  const family = net.isIP(h);
  if (family === 4) {
    const [a, b] = h.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  if (family === 6) return h === '::' || h === '::1' || /^f[cd]/.test(h) || /^fe[89ab]/.test(h) || h.startsWith('::ffff:');
  return false;
}

// Undo the "defanged" style security people paste: hxxps://evil[.]com
const refang = (s) => s.replace(/^hxxp/i, 'http').replace(/\[\.\]|\(\.\)/g, '.');

function validateUrl(raw) {
  const input = refang(String(raw ?? '').trim());
  if (!input) fail('url', 'Please enter the link you want to check.');
  if (input.length > cfg.maxUrlLength) fail('url', `That link is too long. The limit is ${cfg.maxUrlLength} characters.`);
  if (/\s/.test(input)) fail('url', 'A link cannot contain spaces. Paste only the link.');

  // "name:" counts as a scheme unless digits follow (host:port).
  const hasScheme = /^[a-z][a-z0-9+.-]*:(?!\d)/i.test(input);
  if (hasScheme && !/^https?:\/\//i.test(input)) fail('url', 'Only http:// and https:// links can be checked.');

  let u;
  try {
    u = new URL(hasScheme ? input : `http://${input}`);
  } catch {
    fail('url', 'That does not look like a valid link.');
  }

  const host = u.hostname.toLowerCase();
  if (isBlockedHost(host)) fail('url', 'Links to local or private network addresses cannot be checked.');
  const isIp = net.isIP(host.replace(/^\[|\]$/g, '')) !== 0;
  if (!isIp && !host.includes('.')) fail('url', 'A link needs a full domain, for example example.com.');

  return {
    inputType: 'url',
    payload: {
      url: u.href,
      original: input,
      hostname: host,
      scheme_assumed: !hasScheme,
      has_credentials: Boolean(u.username || u.password), // e.g. https://paypal.com@evil.example - a phishing trick
      is_punycode: host.split('.').some((l) => l.startsWith('xn--')),
      is_ip_host: isIp,
    },
    label: host,
    length: u.href.length,
    hashSource: u.href,
    // Never persist embedded credentials, even when content retention is on.
    content: (() => { const c = new URL(u.href); c.username = ''; c.password = ''; return c.href; })(),
    meta: { hostname: host, schemeAssumed: !hasScheme, isIpHost: isIp },
  };
}

// ---------------------------------------------------------------- phone
function validatePhone(raw) {
  const input = String(raw ?? '').trim();
  if (!input) fail('phone', 'Please enter the phone number.');
  if (input.length > 32 || !/^[+\d\s().-]+$/.test(input)) fail('phone', 'Use digits only, with an optional + and country code.');
  const digits = input.replace(/\D/g, '');

  // SMS short codes (e.g. 8484) are common in local scams and are not dialable numbers.
  if (!input.startsWith('+') && digits.length >= 3 && digits.length <= 6) {
    return {
      inputType: 'phone',
      payload: { phone: digits, kind: 'short_code', e164: null, country: null, is_valid: null },
      label: digits,
      length: digits.length,
      hashSource: digits,
      content: digits,
      meta: { kind: 'short_code' },
    };
  }

  const parsed = parsePhoneNumberFromString(input, cfg.defaultPhoneRegion);
  if (!parsed || !parsed.isPossible()) {
    fail('phone', 'That does not look like a valid phone number. Include the country code, e.g. +92 300 1234567.');
  }
  const national = parsed.nationalNumber;
  return {
    inputType: 'phone',
    payload: {
      phone: parsed.number,
      kind: 'number',
      e164: parsed.number,
      country: parsed.country || null,
      is_valid: parsed.isValid(),
    },
    label: `+${parsed.countryCallingCode} ${'•'.repeat(Math.max(national.length - 2, 0))}${national.slice(-2)}`,
    length: parsed.number.length,
    hashSource: parsed.number,
    content: parsed.number,
    meta: { kind: 'number', country: parsed.country || null, isValid: parsed.isValid() },
  };
}

// ---------------------------------------------------------------- image
async function validateImage(file) {
  if (!file) fail('image', 'Please attach a screenshot to scan.');
  if (!file.size) fail('image', 'That file is empty.');
  const mime = await sniffImageFile(file.path);
  if (!mime) fail('image', 'Unsupported or damaged image. Upload a JPG, PNG or WebP screenshot.');

  return {
    inputType: 'image',
    payload: { mimeType: mime, extension: cfg.imageExtensions[mime], size: file.size },
    label: 'Screenshot',
    length: file.size,
    hashSource: null,
    hash: await hashFile(file.path),
    content: null, // image bytes are never stored in MongoDB
    meta: { mimeType: mime, bytes: file.size },
  };
}

// ---------------------------------------------------------------- entry point
// Returns a normalised submission: { inputType, payload, label, length, hash, content, meta }.
async function buildSubmission(body = {}, file) {
  const inputType = detectInputType(body, file);
  // Prefer the field matching the type, but accept the value from any single field so auto-detect works.
  const value = body[inputType] ?? body.content ?? body.text ?? body.url ?? body.phone;
  let s;
  if (inputType === 'text') s = validateText(value);
  else if (inputType === 'url') s = validateUrl(value);
  else if (inputType === 'phone') s = validatePhone(value);
  else s = await validateImage(file);

  s.hash = s.hash || hashString(`${s.inputType}:${s.hashSource}`);
  delete s.hashSource;
  return s;
}

module.exports = { buildSubmission, detectInputType, validateText, validateUrl, validatePhone, validateImage, isBlockedHost, INPUT_TYPES };

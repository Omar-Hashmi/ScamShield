// Central place for every limit used by the submission module.
// Values come from .env (see .env.example) with safe defaults.
const os = require('os');
const path = require('path');

const int = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
const bool = (value, fallback = false) =>
  value === undefined ? fallback : ['1', 'true', 'yes'].includes(String(value).toLowerCase());

module.exports = {
  // ---- Text / URL / phone ----
  minTextLength: 3,
  maxTextLength: int(process.env.SCAN_MAX_TEXT_CHARS, 5000),
  maxUrlLength: 2048,
  defaultPhoneRegion: (process.env.DEFAULT_PHONE_REGION || 'PK').toUpperCase(),

  // ---- Screenshots ----
  maxImageBytes: int(process.env.SCAN_MAX_IMAGE_MB, 5) * 1024 * 1024,
  // Declared MIME types accepted by the upload filter. The real type is re-checked from file bytes.
  allowedImageMimes: new Set(['image/jpeg', 'image/png', 'image/webp']),
  imageExtensions: { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' },
  tempDir: process.env.SCAN_TEMP_DIR || path.join(os.tmpdir(), 'scamshield-uploads'),
  tempMaxAgeMs: int(process.env.SCAN_TEMP_MAX_AGE_MIN, 15) * 60 * 1000,

  // ---- Privacy ----
  // false => store only a short label, a keyed hash and metadata. true => also store the submitted content.
  retainContent: bool(process.env.SCAN_RETAIN_CONTENT, false),
  retentionDays: int(process.env.SCAN_RETENTION_DAYS, 90),

  // ---- Rate limit (per signed-in user) ----
  rateLimitMax: int(process.env.SCAN_RATE_LIMIT_MAX, 40),
  rateLimitWindowMs: int(process.env.SCAN_RATE_LIMIT_WINDOW_MIN, 15) * 60 * 1000,

  // ---- Python FastAPI inference service ----
  ai: {
    baseUrl: (process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, ''),
    timeoutMs: int(process.env.AI_TIMEOUT_MS, 30000),
    internalKey: process.env.AI_INTERNAL_KEY || '',
  },
};

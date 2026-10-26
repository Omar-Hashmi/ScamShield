const fs = require('fs');
const cfg = require('../config/scanConfig');

// Raised for any problem talking to the FastAPI service. `publicMessage` is safe to show to users;
// upstream response bodies are never forwarded (they could leak internals or echo submitted content).
class AnalysisError extends Error {
  constructor(code, publicMessage, upstreamStatus) {
    super(`${code}${upstreamStatus ? ` (${upstreamStatus})` : ''}`);
    this.name = 'AnalysisError';
    this.code = code;
    this.publicMessage = publicMessage;
    this.httpStatus = code === 'timeout' ? 504 : 502;
  }
}

async function post(path, init) {
  let res;
  try {
    res = await fetch(`${cfg.ai.baseUrl}${path}`, {
      method: 'POST',
      ...init,
      headers: { ...(cfg.ai.internalKey ? { 'X-Internal-Key': cfg.ai.internalKey } : {}), ...init.headers },
      signal: AbortSignal.timeout(cfg.ai.timeoutMs),
    });
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new AnalysisError('timeout', 'The analysis took too long. Please try again in a moment.');
    }
    throw new AnalysisError('unreachable', 'The analysis service is not available right now. Please try again shortly.');
  }
  if (!res.ok) throw new AnalysisError('upstream_error', 'The analysis service could not process this submission.', res.status);
  const data = await res.json().catch(() => null);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new AnalysisError('invalid_response', 'The analysis service returned an unexpected response.');
  }
  return data;
}

const json = (body) => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

// Sends one validated submission to FastAPI and returns its raw JSON.
//   text  -> POST /analyze/text   { scan_id, text }
//   url   -> POST /analyze/url    { scan_id, url, hostname, ... }
//   phone -> POST /analyze/phone  { scan_id, phone, kind, e164, country, is_valid }
//   image -> POST /analyze/image  multipart: file + scan_id
async function analyze(submission, { scanId, filePath }) {
  const { inputType, payload } = submission;

  if (inputType === 'image') {
    const bytes = await fs.promises.readFile(filePath);
    const form = new FormData();
    form.append('scan_id', scanId);
    form.append('file', new Blob([bytes], { type: payload.mimeType }), `screenshot.${payload.extension}`);
    return post('/analyze/image', { body: form });
  }
  return post(`/analyze/${inputType}`, json({ scan_id: scanId, ...payload }));
}

const VERDICTS = ['safe', 'suspicious', 'scam'];
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const num = (v) => (v === null || v === undefined || v === '' ? NaN : Number(v));

// Accepts snake_case or camelCase from Python and returns a bounded, predictable shape.
// Fields such as OCR text are deliberately not copied into MongoDB.
function normalizeResult(raw) {
  const score = num(raw.risk_score ?? raw.riskScore);
  const conf = num(raw.confidence);
  const signals = raw.signals && typeof raw.signals === 'object' && !Array.isArray(raw.signals) ? raw.signals : null;
  return {
    verdict: VERDICTS.includes(raw.verdict) ? raw.verdict : 'unknown',
    riskScore: Number.isFinite(score) ? clamp(Math.round(score), 0, 100) : null,
    confidence: Number.isFinite(conf) ? clamp(conf, 0, 1) : null,
    language: typeof raw.language === 'string' ? raw.language.slice(0, 16) : null,
    reasons: Array.isArray(raw.reasons)
      ? raw.reasons.filter((r) => typeof r === 'string').slice(0, 10).map((r) => r.slice(0, 300))
      : [],
    signals: signals && JSON.stringify(signals).length <= 8192 ? signals : null,
  };
}

module.exports = { analyze, normalizeResult, AnalysisError };

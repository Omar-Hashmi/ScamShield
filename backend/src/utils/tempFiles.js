const fs = require('fs');
const path = require('path');
const cfg = require('../config/scanConfig');

const SUFFIX = '.upload';

exports.ensureTempDir = () => fs.mkdirSync(cfg.tempDir, { recursive: true, mode: 0o700 });

exports.removeFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Temp file cleanup failed:', err.code);
  }
};

// Safety net: delete anything left behind by a crash or killed process.
async function sweepStale() {
  let names;
  try {
    names = await fs.promises.readdir(cfg.tempDir);
  } catch {
    return;
  }
  const cutoff = Date.now() - cfg.tempMaxAgeMs;
  for (const name of names) {
    if (!name.endsWith(SUFFIX)) continue;
    const full = path.join(cfg.tempDir, name);
    try {
      const stat = await fs.promises.stat(full);
      if (stat.isFile() && stat.mtimeMs < cutoff) await fs.promises.unlink(full);
    } catch {
      /* file vanished meanwhile - fine */
    }
  }
}

exports.startTempSweeper = () => {
  exports.ensureTempDir();
  sweepStale();
  setInterval(sweepStale, Math.min(cfg.tempMaxAgeMs, 5 * 60 * 1000)).unref();
};

exports.TEMP_SUFFIX = SUFFIX;

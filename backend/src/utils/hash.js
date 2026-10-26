const crypto = require('crypto');
const fs = require('fs');

// Keyed hash (HMAC) so short values such as phone numbers can't be brute-forced from a database leak.
const key = () => process.env.SCAN_HASH_KEY || process.env.JWT_SECRET || 'dev-only-key';

exports.hashString = (value) => crypto.createHmac('sha256', key()).update(String(value)).digest('hex');

exports.hashFile = (filePath) =>
  new Promise((resolve, reject) => {
    const h = crypto.createHmac('sha256', key());
    fs.createReadStream(filePath)
      .on('error', reject)
      .on('data', (chunk) => h.update(chunk))
      .on('end', () => resolve(h.digest('hex')));
  });

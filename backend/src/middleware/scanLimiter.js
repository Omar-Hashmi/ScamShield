const rateLimit = require('express-rate-limit');
const cfg = require('../config/scanConfig');

// Per signed-in user (runs after `protect`), so shared networks don't block each other.
module.exports = rateLimit({
  windowMs: cfg.rateLimitWindowMs,
  max: cfg.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user.id),
  message: { message: 'You have submitted a lot of scans. Please wait a few minutes and try again.' },
});

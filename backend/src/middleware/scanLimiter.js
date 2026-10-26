const rateLimit = require('express-rate-limit');
const cfg = require('../config/scanConfig');

// Signed-in scans are limited per user; anonymous scans are limited per client IP.
module.exports = rateLimit({
  windowMs: cfg.rateLimitWindowMs,
  max: cfg.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user ? `user:${req.user.id}` : `ip:${req.ip}`,
  message: { message: 'You have submitted a lot of scans. Please wait a few minutes and try again.' },
});

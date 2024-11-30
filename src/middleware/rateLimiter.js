const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: false,
  keyGenerator: (req) => {
    const forwardedFor = req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    return forwardedFor || req.ip;
  }
});

module.exports = apiLimiter;
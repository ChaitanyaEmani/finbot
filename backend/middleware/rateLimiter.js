import rateLimit from 'express-rate-limit';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true,
});

// AI/Chat endpoint rate limiter
export const aiLimiter = rateLimit({
  windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
  max: parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS) || 10,
  message: {
    status: 'error',
    message: 'Too many AI requests, please wait a moment before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Transaction rate limiter
export const transactionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: {
    status: 'error',
    message: 'Too many transaction requests, please slow down.'
  },
});
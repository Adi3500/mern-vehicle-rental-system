const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');

/**
 * General API rate limiter.
 * Configurable via .env: RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX
 */
exports.apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) =>
        next(new AppError('Too many requests from this IP. Please try again later.', 429)),
});

/**
 * Stricter limiter for auth endpoints (login / register).
 */
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) =>
        next(new AppError('Too many authentication attempts. Please try again in 15 minutes.', 429)),
});

/**
 * Very strict limiter for password-reset endpoints.
 */
exports.passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) =>
        next(new AppError('Too many password reset attempts. Please try again in 1 hour.', 429)),
});
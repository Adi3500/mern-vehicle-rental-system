/**
 * Wraps an async route handler so thrown errors are forwarded to
 * Express's next(err) without try/catch boilerplate.
 *
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware
 */
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// ── Specific error handlers ───────────────────────────────────────────────────

const handleCastErrorDB = (err) =>
    new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return new AppError(`Duplicate value for field '${field}': "${value}". Please use a different value.`, 400);
};

const handleValidationErrorDB = (err) => {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new AppError(`Validation error: ${messages.join('. ')}`, 400);
};

const handleJWTError = () =>
    new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
    new AppError('Your token has expired. Please log in again.', 401);

const handleMulterError = (err) =>
    new AppError(`File upload error: ${err.message}`, 400);

// ── Response helpers ─────────────────────────────────────────────────────────

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    // Programming or unknown error: log and send generic message
    logger.error('UNHANDLED ERROR 💥', err);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again later.',
    });
};

// ── Global error handler ─────────────────────────────────────────────────────

module.exports = (err, req, res, _next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    logger.error(`${err.statusCode} — ${err.message} [${req.method} ${req.originalUrl}]`);

    if (process.env.NODE_ENV === 'development') {
        return sendErrorDev(err, res);
    }

    // Production: map known Mongoose / JWT errors to AppError instances
    let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'MulterError') error = handleMulterError(error);

    sendErrorProd(error, res);
};
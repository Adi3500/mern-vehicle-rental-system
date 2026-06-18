const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;
const path = require('path');

const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
    ),
    transports: [
        // Console — colorized in dev
        new transports.Console({
            format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
        }),
        // Error log file
        new transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
        }),
        // Combined log file
        new transports.File({
            filename: path.join('logs', 'combined.log'),
        }),
    ],
    exceptionHandlers: [
        new transports.File({ filename: path.join('logs', 'exceptions.log') }),
    ],
});

module.exports = logger;
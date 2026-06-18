require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = require('./App');
const { connectDB, disconnectDB } = require('./config/database');
const logger = require('./utils/logger');

// ── Ensure log directory exists ───────────────────────────────────────────────
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// ── Uncaught exception / unhandled rejection safety nets ─────────────────────
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION 💥 Shutting down...');
    logger.error(err.name, err.message);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION 💥 Shutting down...');
    logger.error(err.name, err.message);
    server.close(() => process.exit(1));
});

// ── Graceful shutdown on SIGTERM (e.g. Docker / Kubernetes) ──────────────────
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(async() => {
        await disconnectDB();
        logger.info('Process terminated.');
    });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

let server;

(async() => {
    await connectDB();

    server = app.listen(PORT, () => {
        logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        logger.info(`📖 API Docs: http://localhost:${PORT}/api-docs`);
        logger.info(`❤️  Health:   http://localhost:${PORT}/health`);
    });
})();